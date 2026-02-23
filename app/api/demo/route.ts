import { NextResponse } from "next/server";
import { generateInsights } from "@/lib/insights";
import { detectSubscriptions } from "@/lib/subscriptionDetector";
import { groupByCategory, monthlySummary } from "@/lib/analytics";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: Request) {
    try {
        const { fileData, mimeType, filename } = await req.json();

        if (!fileData) return NextResponse.json({ error: "No file data provided" }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "Gemini API key missing" }, { status: 500 });

        const isPdf = mimeType === "application/pdf";

        const prompt = `You are a financial data extractor. I will provide you with a bank statement (${isPdf ? "PDF" : "Text"}).
Extract all individual transactions and return them as a JSON array of objects.
Each object MUST have:
- date (ISO 8601 format, e.g., "2024-02-21")
- amount (positive for expense, negative for income)
- merchant (the merchant or description)
- category (e.g. food, travel, shops, transportation, entertainment)

Rules:
- Be extremely accurate with dates and amounts.
- If it's a credit (income), amount must be NEGATIVE.
- If it's a debit (expense), amount must be POSITIVE.
- Return ONLY the raw JSON array. No markdown.
`;

        const contents = [
            {
                parts: [
                    { text: prompt },
                    isPdf
                        ? { inline_data: { mime_type: "application/pdf", data: fileData } }
                        : { text: fileData }
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

        if (!aiRes.ok) {
            const error = await aiRes.text();
            console.error("Gemini Error:", error);
            throw new Error("Gemini extraction failed");
        }

        const aiData = await aiRes.json();
        const rawJson = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
        const transactions = JSON.parse(rawJson.replace(/```json|```/g, "").trim());

        // Process data for the dashboard (Demo Mode)
        // We mock the DB-like structure expected by our lib functions
        const mockTxns = transactions.map((t: any, i: number) => ({
            ...t,
            id: `demo-${i}`,
            accountId: "demo-acc",
        }));

        const subscriptions = detectSubscriptions(mockTxns);
        const insights = generateInsights(mockTxns, subscriptions);

        // Add a demo-specific insight
        insights.unshift({
            type: "goal",
            title: "Demo Mode Active",
            description: "This is a secure, anonymous preview of your data. No data has been saved to our servers.",
        });

        const categories = groupByCategory(mockTxns);
        const summary = monthlySummary(mockTxns);

        // Simple net worth mock for demo
        const netWorth = mockTxns.filter((t: any) => t.amount < 0).reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

        return NextResponse.json({
            user: { name: "Guest User", plan: "Demo" },
            transactions: mockTxns,
            categoryBreakdown: Object.entries(categories).map(([name, value]) => ({ name, value })),
            monthlySummary: summary,
            subscriptions,
            insights,
            netWorth,
            burn: {
                spent: mockTxns.filter((t: any) => t.amount > 0).reduce((s: number, t: any) => s + t.amount, 0),
                daily: 0, // Simplified for demo
                projected: 0,
            }
        });

    } catch (err: any) {
        console.error("Demo processing error:", err);
        return NextResponse.json({ error: "Failed to process statement: " + err.message }, { status: 500 });
    }
}
