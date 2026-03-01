import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Setu Webhook Handler
 * Documentation: https://docs.setu.co/data/account-aggregator/api-integration#notifications-flow
 */
export async function POST(req: Request) {
    try {
        const payload = await req.json();
        console.log("Setu Webhook Received:", JSON.stringify(payload, null, 2));

        const { type, data, consentId, dataSessionId } = payload;

        switch (type) {
            case "CONSENT_STATUS_UPDATE":
                console.log(`Consent ${consentId} is now ${data.status}`);
                // Optional: Update a 'consentStatus' field in your DB
                break;

            case "SESSION_STATUS_UPDATE":
            case "FI_DATA_READY":
                console.log(`Data status update for session ${dataSessionId}: ${data.status}`);
                if (data.status === "COMPLETED") {
                    console.log("FI data is now ready to be fetched for all accounts.");
                    // In a production background flow, you would trigger the data sync here.
                }
                break;

            default:
                console.log("Unhandled webhook type:", type);
        }

        // Always return 200 OK to Setu
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Webhook Error:", error.message);
        // Even on error, we usually return 200 to Setu so they don't keep retrying 
        // unless it's a transient failure.
        return NextResponse.json({ success: true });
    }
}
