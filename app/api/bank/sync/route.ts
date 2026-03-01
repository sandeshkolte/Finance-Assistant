import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { fetchTransactionsSync } from "@/lib/bank-fetch";
import { saveTransactions } from "@/lib/saveTransactions";
import { decrypt } from "@/lib/encryption";

export async function POST() {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkId = clerkUser.id;
    const user = await prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: {
            clerkId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? "no-email@example.com",
            name: clerkUser.firstName || clerkUser.username || "User",
        },
        include: { accounts: true },
    });

    for (const account of user.accounts) {
        if (!account.accessToken) continue;

        try {
            const decryptedToken = account.provider === "plaid"
                ? decrypt(account.accessToken)
                : account.accessToken;

            const { added, nextCursor } = await fetchTransactionsSync(
                account.provider,
                decryptedToken,
                account.lastSyncCursor ?? undefined
            );

            await saveTransactions(added, account.id);

            await prisma.account.update({
                where: { id: account.id },
                data: { lastSyncCursor: nextCursor },
            });
        } catch (error) {
            console.error(`Sync failed for account ${account.id}:`, error);
        }
    }

    return NextResponse.json({ success: true });
}
