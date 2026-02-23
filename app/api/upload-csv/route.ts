import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { saveTransactions } from "@/lib/saveTransactions";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: Request) {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { filename, fileData, mimeType } = await req.json();

    if (!fileData) return NextResponse.json({ error: "No file data provided" }, { status: 400 });

    const dbUser = await prisma.user.findUnique({
        where: { clerkId },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. Find or create a Manual Account
    let account = await prisma.account.findFirst({
        where: { userId: dbUser.id, bankName: "Manual Import" },
    });

    if (!account) {
        account = await prisma.account.create({
            data: {
                userId: dbUser.id,
                bankName: "Manual Import",
                accountType: "manual",
                balance: 0,
            },
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "AI Parsing not configured (GEMINI_API_KEY missing)" }, { status: 500 });
    }

    const isPdf = mimeType === "application/pdf";
    const prompt = `You are a data extraction expert. I will provide you with a bank statement (${isPdf ? "PDF" : "Text"}). 
Extract all transactions and return them as a JSON array of objects.
Each object MUST have:
- date (ISO 8601 format, e.g., "2024-02-21")
- amount (positive for expense, negative for income)
- name (the merchant or description)
- category (best guess if not provided)

Rules:
- Be extremely accurate with dates and amounts.
- Return ONLY the raw JSON array. No markdown, no backticks.
`;

    try {
        const contents = [
            {
                parts: [
                    { text: prompt },
                    isPdf
                        ? { inline_data: { mime_type: "application/pdf", data: fileData } }
                        : { text: fileData.slice(0, 15000) }
                ]
            }
        ];

        const aiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
            }),
        });

        if (!aiRes.ok) throw new Error("Gemini extraction failed");

        const data = await aiRes.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
        const transactions = JSON.parse(rawJson.replace(/```json|```/g, "").trim());

        // 3. Save to DB
        await saveTransactions(transactions, account.id);

        return NextResponse.json({
            success: true,
            count: transactions.length,
            accountName: account.bankName
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to parse statement: " + error.message }, { status: 500 });
    }
}
