/**
 * lib/analytics.ts
 *
 * Standard Transaction Sign Convention:
 *   - Positive amount = money OUT (expense/debit)
 *   - Negative amount = money IN  (income/credit)
 */

// ─── Category → clean display name ──────────────────────────────
const CATEGORY_MAPPING: Record<string, string> = {
  // Food
  "food and drink": "Food & Drink",
  "restaurants": "Food & Drink",
  "groceries": "Food & Drink",
  "coffee shop": "Food & Drink",
  "fast food": "Food & Drink",

  // Transport
  "travel": "Travel",
  "airlines and aviation": "Travel",
  "car service": "Transport",
  "taxi": "Transport",
  "ride share": "Transport",
  "public transportation": "Transport",
  "gas stations": "Transport",
  "parking": "Transport",

  // Shopping
  "shops": "Shopping",
  "shopping": "Shopping",
  "clothing and apparel": "Shopping",
  "electronics": "Shopping",
  "supermarkets and groceries": "Shopping",
  "department stores": "Shopping",
  "online marketplaces": "Shopping",
  "personal care": "Personal Care",
  "pharmacies": "Health",

  // Entertainment
  "recreation": "Entertainment",
  "entertainment": "Entertainment",
  "arts and entertainment": "Entertainment",
  "gyms and fitness centers": "Entertainment",
  "sports": "Entertainment",
  "music": "Entertainment",
  "video games": "Entertainment",
  "casinos and gambling": "Entertainment",

  // Bills & Utilities
  "service": "Utilities",
  "utilities": "Utilities",
  "telecommunication services": "Utilities",
  "cable": "Utilities",
  "internet services": "Utilities",
  "insurance": "Utilities",
  "rent": "Utilities",

  // Health
  "healthcare": "Health",
  "health": "Health",
  "medical": "Health",
  "dentists": "Health",
  "hospitals": "Health",
  "doctors": "Health",
  "mental health": "Health",

  // Finance
  "payment": "Payments",
  "transfer": "Transfers",
  "transfer out": "Transfers",
  "transfer in": "Income",
  "payroll": "Income",
  "income": "Income",
  "credit card": "Payments",
  "bank fees": "Bank Fees",
  "interest": "Bank Fees",
  "atm": "Bank Fees",
  "wire transfer": "Transfers",

  // Other
  "education": "Education",
  "home improvement": "Home",
  "religious": "Community",
  "charity": "Community",
  "government": "Government",
  "taxes": "Tax",
  "child care": "Family",
  "pet supplies": "Pets",
};

export function formatCategory(transaction: { category?: string }): string {
  const raw = (transaction.category ?? "other").toLowerCase().trim();
  return CATEGORY_MAPPING[raw] ?? capitalise(transaction.category ?? "Other");
}

function capitalise(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── groupByCategory ──────────────────────────────────────────────────────────

export function groupByCategory(transactions: any[]) {
  const result: Record<string, number> = {};

  for (const t of transactions) {
    const amount = Number(t.amount);
    // Skip income / negative amounts (credits) — only group expenses
    if (amount <= 0) continue;

    const cat = formatCategory(t);
    result[cat] = (result[cat] ?? 0) + amount;
  }

  return Object.entries(result)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // highest spend first
}

// ─── monthlySummary ───────────────────────────────────────────────────────────

export function monthlySummary(transactions: any[]) {
  const map: Record<string, { income: number; expense: number }> = {};

  for (const t of transactions) {
    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
    });

    if (!map[month]) map[month] = { income: 0, expense: 0 };

    const amount = Number(t.amount);
    // Standard convention: positive = expense (debit), negative = income (credit)
    if (amount > 0) {
      map[month].expense += amount;
    } else {
      map[month].income += Math.abs(amount);
    }
  }

  // Sort chronologically
  const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return Object.entries(map)
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
}