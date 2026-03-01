import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { setuClient } from "@/lib/setu";
import { prisma } from "@/lib/db";
import { saveTransactions } from "@/lib/saveTransactions";

export async function POST(req: Request) {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkId = clerkUser.id;
    const { consentId } = await req.json();

    try {
        // 1. Create a data session with retry logic
        // Sometimes the redirect happens faster than the consent is finalized.
        let session = null;
        let sessionAttempts = 0;
        const maxSessionAttempts = 5;

        while (sessionAttempts < maxSessionAttempts) {
            try {
                session = await setuClient.fetchFinancialData(consentId);
                break; // Success
            } catch (err: any) {
                const isNotReady = err.response?.data?.errorMsg === "Consent artefact not ready";
                if (isNotReady && sessionAttempts < maxSessionAttempts - 1) {
                    console.log(`Consent not ready yet, retrying... (${sessionAttempts + 1})`);
                    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s
                    sessionAttempts++;
                } else {
                    throw err; // Real error or ran out of retries
                }
            }
        }

        if (!session) throw new Error("Could not create data session.");
        const sessionId = session.id;

        // 2. Poll for session completion (Sandbox is usually fast)
        let sessionData = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            sessionData = await setuClient.getSessionData(sessionId);
            if (sessionData.status === "COMPLETED") break;
            if (sessionData.status === "FAILED") throw new Error("Setu session failed");

            // Wait 2 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        if (!sessionData || sessionData.status !== "COMPLETED") {
            throw new Error("Data fetch timed out. Please try again in a moment.");
        }

        // 3. User setup
        const user = await prisma.user.upsert({
            where: { clerkId },
            update: {},
            create: {
                clerkId,
                email: clerkUser.emailAddresses[0]?.emailAddress ?? "no-email@example.com",
                name: clerkUser.firstName || clerkUser.username || "User",
            }
        });

        // 4. Process real account and transaction data
        // Flexible detection for Setu v2 structure (fips/fiData)
        const fiData = sessionData.fips || sessionData.payload?.fiData || sessionData.data?.fiData || sessionData.fiData || [];

        console.log(`Sync Progress: Status=${sessionData.status}, FIPsFound=${fiData.length}`);

        for (const fip of fiData) {
            const bankName = fip.fipId || fip.fipID || "Bank Account";

            // Loop through accounts (Setu v2 often uses 'accounts' instead of 'data' inside the FIP)
            const accountList = fip.accounts || fip.data || [];

            for (const accountData of accountList) {
                // The actual bank data can be in 'data' or 'decryptedData'
                const decrypted = accountData.data?.account || accountData.decryptedData?.account;
                if (!decrypted) continue;

                const summary = decrypted.summary;
                const transactions = decrypted.transactions?.transaction || [];
                const externalId = decrypted.maskedAccNumber || decrypted.maskedAccNo || decrypted.linkedAccRef || consentId;

                const account = await prisma.account.upsert({
                    where: { externalAccountId: externalId },
                    update: {
                        lastSyncCursor: sessionId,
                        balance: parseFloat(summary.currentBalance || "0")
                    },
                    create: {
                        userId: user.id,
                        bankName: bankName,
                        accountType: summary.type || "SAVINGS",
                        balance: parseFloat(summary.currentBalance || "0"),
                        provider: "setu",
                        externalAccountId: externalId,
                        accessToken: consentId,
                    }
                });

                // Format Setu transactions to match our saveTransactions logic
                const formattedTransactions = transactions.map((t: any) => {
                    // 1. Extract Merchant Name from Narration (Name is after the 3rd slash)
                    // Example: "ATM/CR/310541486006/Ishaan Swaminathan/DTWE/52686177" -> "Ishaan Swaminathan"
                    const parts = (t.narration || "").split("/");
                    const merchantName = parts.length >= 4 ? parts[3].trim() : (t.narration || "Transaction");

                    // 2. Set Categorization hints (using Mode + Type)
                    // We'll pass it as a custom string to our formatCategory logic
                    const categoryHint = `${t.mode || ""} ${t.type || ""}`.toLowerCase();

                    return {
                        transaction_id: t.txnId || `setu_${Date.now()}_${Math.random()}`,
                        // Direct use of CREDIT/DEBIT type for sign
                        amount: parseFloat(t.amount) * (t.type === "DEBIT" ? -1 : 1),
                        name: merchantName,
                        category: categoryHint, // Pass mode/type hint to the formatter
                        date: t.transactionTimestamp || t.valueDate || new Date().toISOString(),
                    };
                });

                console.log(`Successfully synced ${formattedTransactions.length} transactions for account: ${externalId}`);
                await saveTransactions(formattedTransactions, account.id);
            }
        }

        console.log("Sync complete!");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Sync Route Error:", error.response?.data || error.message);

        // If we get an InvalidRequest for the data range, let's log the actual consent status
        if (consentId) {
            try {
                const status = await setuClient.getConsentStatus(consentId);
                console.log("Actual Authorized FIDataRange:", status.FIDataRange);
            } catch (sErr) {
                console.error("Could not fetch consent details for debugging");
            }
        }

        const errorMessage = error.response?.data?.error?.message || error.message;
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
