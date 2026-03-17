import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { setuClient } from "@/lib/setu";
import { prisma } from "@/lib/db";

export async function POST() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = clerkUser.id;
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "no-email@example.com";
    const name = clerkUser.firstName || clerkUser.username || "User";

    const user = await prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: {
            clerkId,
            email,
            name,
        }
    });

    try {
        const consentRequest = await setuClient.createConsentRequest(user.id);

        // In Setu AA sandbox, the response includes a redirect URL
        return NextResponse.json({
            url: consentRequest.url,
            id: consentRequest.id
        });
    } catch (error: any) {
        const detail = error.response?.data ?? error.message;
        console.error("Create consent error:", detail);
        return NextResponse.json({ error: detail }, { status: 500 });
    }
}
