/**
 * app/api/ai-insights/route.ts
 *
 * Uses Google Gemini 2.0 Flash — FREE tier:
 *   • 15 requests/minute
 *   • 1,000,000 tokens/day
 *   • No credit card required
 *
 * Setup:
 *   1. Go to https://aistudio.google.com/apikey
 *   2. Create a free API key (takes 30 seconds)
 *   3. Add to .env.local:  GEMINI_API_KEY=AIza...
 *
 * How it works:
 *   - /api/dashboard already calls generateInsights() for rule-based insights
 *   - This route receives those base insights + raw summary and asks Gemini
 *     to rewrite them with richer, more natural language
 *   - Falls back to the raw rule-based insights if Gemini fails
 */

import { NextResponse } from "next/server";
import { generateInsights } from "@/lib/insights";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: Request) {
  const { summary } = await req.json();

  // ── Step 1: always generate rule-based insights as a baseline ────────────
  const baseInsights = generateInsights(
    summary.recentTransactions ?? [],
    summary.subscriptions ?? []
  );

  // ── Step 2: try to enrich with Gemini ────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // No key set → return rule-based insights directly (still useful!)
    return NextResponse.json({ insights: baseInsights, source: "rule-based" });
  }

  const prompt = `You are a world-class financial coach and environmental sustainability expert. I will give you a user's spending summary and pre-detected insights. Your job is to rewrite each insight's "description" to be highly actionable, encouraging, and human.

Tone Guidelines:
- "Daily Safe-to-Spend": Sound like a supportive coach helping them stay within budget while moving toward their savings goal.
- "Carbon Footprint": Sound like an environmental ally. Frame the "offset" as a positive step toward a greener life.
- "General Insights": Be warm, data-driven, and proactive.

Rules:
- Keep the same "type", "title", and "value" fields exactly as-is.
- Rewrite "description" — make it warmer, more specific, and action-oriented.
- Use actual numbers from the spending data.
- Return ONLY a raw JSON array. No markdown, no backticks, no preamble.

Spending summary:
${JSON.stringify(summary, null, 2)}

Base insights to enrich:
${JSON.stringify(baseInsights, null, 2)}

Return the enriched JSON array only.`;


  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text());
      return NextResponse.json({ insights: baseInsights, source: "rule-based-fallback" });
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();

    const enriched = JSON.parse(clean);
    return NextResponse.json({ insights: enriched, source: "gemini" });

  } catch (err) {
    console.error("Gemini parse/fetch error:", err);
    // Graceful fallback — rule-based insights are returned, UI never breaks
    return NextResponse.json({ insights: baseInsights, source: "rule-based-fallback" });
  }
}
