/**
 * lib/insights.ts
 *
 * Zero-cost, rule-based financial insight engine.
 * Called inside your existing /api/dashboard route:
 *   insights: generateInsights(allTransactions, detectSubscriptions(allTransactions))
 *
 * Also consumed by /api/ai-insights which enriches these with Gemini narration.
 */

export type InsightType = "anomaly" | "warning" | "tip" | "forecast" | "carbon" | "goal";

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  value?: string;
}

interface InsightTransaction {
  id: string;
  amount: any; // Using any to handle both number and Prisma Decimal
  category: string;
  date: string | Date;
  merchant: string;
  accountId: string;
}

interface Subscription {
  merchant: string;
  amount: number;
  category?: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fcat = (s: string) =>
  (s || "other").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function currentMonthTxns(txns: InsightTransaction[]): InsightTransaction[] {
  const now = new Date();
  return txns.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

function lastMonthTxns(txns: InsightTransaction[]): InsightTransaction[] {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return txns.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
  });
}

function groupByMerchant(txns: InsightTransaction[]): Record<string, number[]> {
  return txns.reduce((acc, t) => {
    acc[t.merchant] = acc[t.merchant] ?? [];
    acc[t.merchant].push(Number(t.amount));
    return acc;
  }, {} as Record<string, number[]>);
}

function groupByCategory(txns: InsightTransaction[]): Record<string, number> {
  return txns.reduce((acc, t) => {
    const amount = Number(t.amount);
    acc[t.category] = (acc[t.category] ?? 0) + amount;
    return acc;
  }, {} as Record<string, number>);
}

function average(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ─── individual detectors ────────────────────────────────────────────────────

/** Flag any single transaction that is ≥ 2.5× the merchant's own average */
function detectAnomalies(txns: InsightTransaction[]): Insight[] {
  const insights: Insight[] = [];
  const byMerchant = groupByMerchant(txns);

  for (const [merchant, amounts] of Object.entries(byMerchant)) {
    if (amounts.length < 2) continue;
    const avg = average(amounts);
    const max = Math.max(...amounts);
    if (max >= avg * 2.5) {
      insights.push({
        type: "anomaly",
        title: `Unusual charge at ${merchant}`,
        description: `Your largest transaction at ${merchant} was ${fmt(max)}, which is ${(max / avg).toFixed(1)}× your usual ${fmt(avg)} average there.`,
        value: `${fmt(max)} charged`,
      });
    }
  }
  return insights.slice(0, 2); // cap at 2 anomalies
}

/** Warn if any category this month is > 40 % of total spend */
function detectOverspend(txns: InsightTransaction[]): Insight[] {
  const insights: Insight[] = [];
  const thisMonth = currentMonthTxns(txns);
  const totalSpent = thisMonth.reduce((s, t) => s + Number(t.amount), 0);
  if (!totalSpent) return [];

  const byCat = groupByCategory(thisMonth);
  for (const [cat, amount] of Object.entries(byCat)) {
    const pct = (amount / totalSpent) * 100;
    if (pct >= 40) {
      insights.push({
        type: "warning",
        title: `${fcat(cat)} dominates your spend`,
        description: `${fcat(cat)} accounts for ${pct.toFixed(0)}% of your spending this month (${fmt(amount)} of ${fmt(totalSpent)} total).`,
        value: `${pct.toFixed(0)}% of budget`,
      });
    }
  }
  return insights.slice(0, 2);
}

/** Warn if subscriptions exceed 20 % of this month's spend */
function detectSubscriptionCreep(
  txns: InsightTransaction[],
  subscriptions: Subscription[]
): Insight | null {
  if (!subscriptions.length) return null;
  const thisMonth = currentMonthTxns(txns);
  const totalSpent = thisMonth.reduce((s, t) => s + Number(t.amount), 0);
  const subTotal = subscriptions.reduce((s, x) => s + Number(x.amount ?? 0), 0);
  const pct = totalSpent ? (subTotal / totalSpent) * 100 : 0;

  if (pct >= 20) {
    return {
      type: "warning",
      title: "Subscription costs are high",
      description: `Your ${subscriptions.length} recurring subscriptions total ${fmt(subTotal)}/mo — that's ${pct.toFixed(0)}% of your monthly spend. Consider auditing unused services.`,
      value: `${fmt(subTotal)}/mo`,
    };
  }
  return null;
}

/** Month-over-month spend change */
function detectMoMChange(txns: InsightTransaction[]): Insight | null {
  const thisTotal = currentMonthTxns(txns).reduce((s, t) => s + Number(t.amount), 0);
  const lastTotal = lastMonthTxns(txns).reduce((s, t) => s + Number(t.amount), 0);
  if (!lastTotal || !thisTotal) return null;

  const change = ((thisTotal - lastTotal) / lastTotal) * 100;
  const abs = Math.abs(change);
  if (abs < 5) return null; // not worth surfacing small swings

  return {
    type: change > 0 ? "warning" : "tip",
    title: change > 0 ? "Spending up vs last month" : "Spending down vs last month",
    description: `You've spent ${fmt(thisTotal)} so far this month vs ${fmt(lastTotal)} last month — a ${abs.toFixed(0)}% ${change > 0 ? "increase" : "decrease"}.`,
    value: `${change > 0 ? "+" : ""}${change.toFixed(0)}% MoM`,
  };
}

/** Highlight top merchant this month */
function topMerchantTip(txns: InsightTransaction[]): Insight | null {
  const thisMonth = currentMonthTxns(txns);
  if (!thisMonth.length) return null;
  const byMerchant = groupByMerchant(thisMonth);
  const [merchant, amounts] = Object.entries(byMerchant)
    .map(([m, a]) => [m, a] as [string, number[]])
    .sort((a, b) => b[1].reduce((s, v) => s + v, 0) - a[1].reduce((s, v) => s + v, 0))[0];

  const total = amounts.reduce((s, v) => s + v, 0);
  const pct = (total / thisMonth.reduce((s, t) => s + Number(t.amount), 0)) * 100;

  return {
    type: "tip",
    title: `${merchant} is your top merchant`,
    description: `You've made ${amounts.length} transaction${amounts.length > 1 ? "s" : ""} at ${merchant} this month totalling ${fmt(total)} (${pct.toFixed(0)}% of monthly spend).`,
    value: `${amounts.length}× · ${fmt(total)}`,
  };
}

/** Burn-rate forecast */
function forecastBurn(txns: InsightTransaction[]): Insight | null {
  const now = new Date();
  const daysPassed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const thisTotal = currentMonthTxns(txns).reduce((s, t) => s + Number(t.amount), 0);
  if (!thisTotal || daysPassed < 3) return null;

  const daily = thisTotal / daysPassed;
  const projected = daily * daysInMonth;
  const lastTotal = lastMonthTxns(txns).reduce((s, t) => s + Number(t.amount), 0);

  if (!lastTotal) return null;
  const overUnder = projected - lastTotal;

  return {
    type: overUnder > 0 ? "forecast" : "tip",
    title: "Projected end-of-month spend",
    description: `At your current daily rate of ${fmt(daily)}/day you're on track to spend ${fmt(projected)} this month — ${fmt(Math.abs(overUnder))} ${overUnder > 0 ? "more" : "less"} than last month's ${fmt(lastTotal)}.`,
    value: `${fmt(projected)} projected`,
  };
}

/** 
 * Safe-to-Spend: Calculates how much the user can spend daily after 
 * accounting for known bills and a 20% savings target.
 */
function detectSafeToSpend(txns: InsightTransaction[], subscriptions: Subscription[]): Insight | null {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  const thisMonthTxns = currentMonthTxns(txns);

  // Estimate monthly income from last month's negative transactions (credits)
  const lastMonth = lastMonthTxns(txns);
  const estIncome = Math.abs(lastMonth.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Number(t.amount), 0));

  if (estIncome < 500) return null; // Not enough data

  const savingsTarget = estIncome * 0.20;
  const subTotal = subscriptions.reduce((s, x) => s + Number(x.amount ?? 0), 0);
  const alreadySpent = thisMonthTxns.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);

  const remainingDisposable = estIncome - savingsTarget - subTotal - alreadySpent;
  const dailySafe = Math.max(0, remainingDisposable / daysLeft);

  return {
    type: "goal",
    title: "Daily Safe-to-Spend",
    description: `After setting aside ${fmt(savingsTarget)} for savings and covering your bills, you can safely spend ${fmt(dailySafe)} per day for the rest of the month.`,
    value: `${fmt(dailySafe)}/day`,
  };
}

const CARBON_MAP: Record<string, number> = {
  "travel": 0.45,
  "transportation": 0.35,
  "gas stations": 0.60,
  "food and drink": 0.15,
  "groceries": 0.12,
  "electronics": 0.25,
  "shops": 0.18,
  "clothing and apparel": 0.22,
  "utilities": 0.40,
};

/** 
 * Carbon Credit: Estimates CO2 impact based on spending categories.
 */
function detectCarbonImpact(txns: InsightTransaction[]): Insight | null {
  const thisMonth = currentMonthTxns(txns);
  if (!thisMonth.length) return null;

  let totalKg = 0;
  for (const t of thisMonth) {
    const amount = Number(t.amount);
    if (amount <= 0) continue;

    const cat = (t.category || "other").toLowerCase();
    const factor = CARBON_MAP[cat] ?? 0.10;
    totalKg += amount * factor;
  }

  return {
    type: "carbon",
    title: "Carbon Footprint Alert",
    description: `Your spending this month has an estimated impact of ${totalKg.toFixed(1)}kg of CO2. Consider a ${fmt(totalKg * 0.05)} carbon offset to your 'Green Savings' account to neutralize this.`,
    value: `${totalKg.toFixed(0)}kg CO2`,
  };
}


// ─── main export ──────────────────────────────────────────────────────────────

export function generateInsights(
  transactions: any[],
  subscriptions: Subscription[] = []
): Insight[] {
  const insights: Insight[] = [
    ...detectAnomalies(transactions),
    ...detectOverspend(transactions),
  ];

  const subCreep = detectSubscriptionCreep(transactions, subscriptions);
  if (subCreep) insights.push(subCreep);

  const mom = detectMoMChange(transactions);
  if (mom) insights.push(mom);

  const top = topMerchantTip(transactions);
  if (top) insights.push(top);

  const target = detectSafeToSpend(transactions, subscriptions);
  if (target) insights.push(target);

  const carbon = detectCarbonImpact(transactions);
  if (carbon) insights.push(carbon);

  const burn = forecastBurn(transactions);
  if (burn) insights.push(burn);

  // Always return at least something
  if (!insights.length) {
    insights.push({
      type: "tip",
      title: "Keep tracking your spending",
      description: "You don't have enough transaction history yet for deep insights. Come back after a few more weeks of data.",
    });
  }

  return insights;
}
