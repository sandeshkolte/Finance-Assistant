"use client";

/**
 * app/dashboard/page.tsx
 *
 * Stack: Next.js 16 App Router · Tailwind CSS · Lucide React · Recharts 3
 *        clsx · tailwind-merge
 *
 * Wired to /api/dashboard response:
 *   { transactions, categoryBreakdown, monthlySummary,
 *     subscriptions, burn, netWorth, insights }
 */

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  RefreshCcw,
  TrendingDown,
  Wallet,
  Repeat2,
  Flame,
  AlertTriangle,
  Lightbulb,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Leaf,
  Target,
  type LucideProps,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  type TooltipProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { UploadStatement } from "@/components/UploadStatement";
import ConnectBank from "@/components/ConnectBank";

// ─── domain types (mirror your Prisma schema) ─────────────────────────────────

interface Transaction {
  id: string;
  amount: number | string;
  category: string;
  date: string | Date;
  merchant: string;
  accountId: string;
  createdAt?: string | Date;
}

interface CategoryBreakdownItem {
  name: string;
  value: number;
}

interface MonthlySummaryItem {
  month: string;
  income: number;
  expense: number;
}

interface Subscription {
  merchant: string;
  amount: number;
  category?: string;
}

interface BurnRate {
  daily: number;
  spent: number;
  projected: number;
}

export type InsightType = "anomaly" | "warning" | "tip" | "forecast" | "carbon" | "goal";

interface Account {
  id: string;
  bankName: string;
  accountType: string;
  balance: number | string;
}

interface Insight {
  type: InsightType;
  title: string;
  description: string;
  value?: string;
}

interface DashboardData {
  user: { name: string; plan?: string };
  accounts: Account[]; // Added accounts
  transactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];
  monthlySummary: MonthlySummaryItem[];
  subscriptions: Subscription[];
  burn: BurnRate | null;
  netWorth: number | string;
  insights: Insight[];
  hasConnectedBank: boolean;
}

// ─── utils ────────────────────────────────────────────────────────────────────

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function fmt(n: number | string | null | undefined): string {
  const val = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return (
    "₹" +
    Math.abs(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Plaid returns categories in several formats depending on how your
 * groupByCategory util serialises them:
 *   - "Food and Drink"        (Title Case, Plaid primary)
 *   - "food_and_drink"        (snake_case after your util)
 *   - "Food And Drink"        (Title Case with 'And')
 *   - "food_drink"            (abbreviated snake_case)
 *
 * normaliseCat converts all of these to a consistent lookup key.
 */
function normaliseCat(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .replace(/\band\b/g, "")   // remove " and " joins
    .replace(/[\s-]+/g, "_")   // spaces/hyphens → underscore
    .replace(/_+/g, "_")       // collapse multiple underscores
    .replace(/^_|_$/g, "");    // trim leading/trailing underscores
}

// Plaid primary category → display label
const PLAID_CAT_MAP: Record<string, string> = {
  food_drink: "Food & Drink",
  food: "Food & Drink",
  restaurants: "Food & Drink",
  groceries: "Food & Drink",
  travel: "Travel",
  transportation: "Transport",
  transport: "Transport",
  shops: "Shopping",
  shopping: "Shopping",
  recreation: "Entertainment",
  entertainment: "Entertainment",
  service: "Utilities",
  utilities: "Utilities",
  healthcare: "Health",
  health: "Health",
  medical: "Health",
  payment: "Payments",
  transfer: "Transfers",
  income: "Income",
  bank_fees: "Bank Fees",
  community: "Community",
  tax: "Tax",
};

const CAT_ICONS: Record<string, string> = {
  food_drink: "🍔",
  food: "🍔",
  restaurants: "🍔",
  groceries: "🛒",
  transport: "🚗",
  transportation: "🚗",
  travel: "✈️",
  entertainment: "🎬",
  recreation: "🎬",
  utilities: "⚡",
  service: "⚡",
  shopping: "🛍️",
  shops: "🛍️",
  health: "💊",
  healthcare: "💊",
  medical: "💊",
  income: "💵",
  payment: "💳",
  transfer: "🔄",
  bank_fees: "🏦",
  community: "🏘️",
  tax: "🧾",
};

const PALETTE: string[] = [
  "#10d9a0",
  "#38bdf8",
  "#a78bfa",
  "#fb923c",
  "#f43f5e",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

function catIcon(cat: string | null | undefined): string {
  const key = normaliseCat(cat);
  return CAT_ICONS[key] ?? "💳";
}

function fcat(cat: string | null | undefined): string {
  const key = normaliseCat(cat);
  return (
    PLAID_CAT_MAP[key] ??
    // fallback: prettify whatever string we got
    (cat ?? "Other")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function catColor(cat: string | null | undefined): string {
  const key = normaliseCat(cat);
  const keys = Object.keys(CAT_ICONS);
  const idx = keys.indexOf(key);
  return PALETTE[idx >= 0 ? idx % PALETTE.length : 6] ?? PALETTE[0];
}

// ─── primitive components ─────────────────────────────────────────────────────

interface WithChildren {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}

function Card({ className, children, style }: WithChildren) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-[#05080d] overflow-hidden",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children }: WithChildren) {
  return <div className={cn("px-6 pt-5 pb-0", className)}>{children}</div>;
}

function CardContent({ className, children }: WithChildren) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

interface BadgeProps {
  children: ReactNode;
  color?: string;
}

function Badge({ children, color = "#10d9a0" }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium border"
      style={{ color, borderColor: `${color}40`, background: `${color}14` }}
    >
      {children}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ComponentType<LucideProps>;
  accent?: string;
  delay?: number;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "#000000",
  delay = 0,
}: StatCardProps) {
  return (
    <Card
      className="relative animate-fade-up"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-[0.12]"
        style={{ background: accent }}
      />
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-mono tracking-widest uppercase text-slate-500 mb-2">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-100">{value}</p>
            {sub && (
              <p className="mt-1 text-[12px] font-mono text-slate-600">{sub}</p>
            )}
          </div>
          {Icon && (
            <div
              className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${accent}1a` }}
            >
              <Icon size={16} style={{ color: accent }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ChartTooltip ─────────────────────────────────────────────────────────────

function ChartTip(props: TooltipProps<ValueType, NameType>) {
  const { active, payload } = props as TooltipProps<ValueType, NameType> & {
    payload?: Array<{ value: number; name: string; payload: Record<string, unknown> }>;
  };
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const label =
    (p.payload as Record<string, unknown>)?.category != null
      ? fcat((p.payload as Record<string, string>).category)
      : ((p.payload as Record<string, unknown>)?.month as string | undefined) ??
      (p.name as string | undefined) ??
      "";

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a2235] px-3.5 py-2.5 text-xs font-mono shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold" style={{ color: PALETTE[0] }}>
        {fmt(p.value as number)}
      </p>
    </div>
  );
}

// ─── InsightCard ──────────────────────────────────────────────────────────────

const INSIGHT_META: Record<
  InsightType,
  { icon: React.ComponentType<LucideProps>; color: string; label: string }
> = {
  anomaly: { icon: AlertTriangle, color: "#f43f5e", label: "Anomaly" },
  warning: { icon: AlertTriangle, color: "#fb923c", label: "Warning" },
  tip: { icon: Lightbulb, color: "#10d9a0", label: "Tip" },
  forecast: { icon: LineChart, color: "#38bdf8", label: "Forecast" },
  carbon: { icon: Leaf, color: "#22c55e", label: "Eco Impact" },
  goal: { icon: Target, color: "#a855f7", label: "Goal" },
};

interface InsightCardProps {
  insight: Insight;
  delay?: number;
}

function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  const meta = INSIGHT_META[insight.type] ?? INSIGHT_META.tip;
  const Icon = meta.icon;

  return (
    <div
      className="rounded-xl border p-4 animate-fade-up"
      style={{
        borderColor: `${meta.color}25`,
        background: `${meta.color}08`,
        animationDelay: `${delay}s`,
        animationFillMode: "both",
      }}
    >
      <div className="flex gap-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${meta.color}20` }}
        >
          <Icon size={13} style={{ color: meta.color }} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-slate-200">
              {insight.title}
            </span>
            <Badge color={meta.color}>{meta.label}</Badge>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-400">
            {insight.description}
          </p>
          {insight.value && (
            <div className="mt-2">
              <Badge color={meta.color}>{insight.value}</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AIInsightsPanel ──────────────────────────────────────────────────────────

interface AIInsightsPanelProps {
  transactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];
  burn: BurnRate | null;
  subscriptions: Subscription[];
}

function AIInsightsPanel({
  transactions,
  categoryBreakdown,
  burn,
  subscriptions,
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (): Promise<void> => {
    if (!transactions?.length) return;
    setLoading(true);
    setError(null);

    const merchantTotals = transactions.reduce<Record<string, number>>(
      (acc, t) => {
        acc[t.merchant] = (acc[t.merchant] ?? 0) + Number(t.amount);
        return acc;
      },
      {}
    );

    const topMerchants = Object.entries(merchantTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: {
            totalTransactions: transactions.length,
            totalSpent: transactions.reduce((s, t) => s + Number(t.amount), 0),
            categoryBreakdown,
            burnRate: burn,
            subscriptionCount: subscriptions?.length ?? 0,
            topMerchants,
            recentTransactions: transactions.slice(0, 12).map((t) => ({
              merchant: t.merchant,
              amount: t.amount,
              category: t.category,
              date: t.date,
            })),
          },
        }),
      });

      const data = (await res.json()) as { insights: Insight[] };
      setInsights(data.insights);
    } catch {
      setError(
        "Could not load AI insights — check your /api/ai-insights route."
      );
    } finally {
      setLoading(false);
    }
  }, [transactions, categoryBreakdown, burn, subscriptions]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10">
              <Sparkles size={15} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-[15px]">
                AI Financial Insights
              </h3>
              <p className="text-[11px] font-mono text-slate-600">
                Powered by Gemini · live analysis
              </p>
            </div>
          </div>
          <button
            onClick={() => void run()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black px-3 py-1.5 text-[12px] font-mono text-slate-400 transition hover:border-purple-500/40 hover:text-purple-400 disabled:opacity-50"
          >
            <RefreshCcw size={11} className={loading ? "animate-spin" : ""} />
            {loading ? "Analysing…" : "Refresh"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {loading && (
          <div className="flex items-center gap-3 text-slate-500 text-sm font-mono py-4">
            <RefreshCcw size={14} className="animate-spin text-purple-500" />
            Gemini is analysing your spending patterns…
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/[0.08] px-4 py-3 text-sm text-purple-400">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
        {insights && !loading && (
          <div className="grid gap-3">
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} delay={i * 0.07} />
            ))}
          </div>
        )}
        {!insights && !loading && !error && (
          <p className="text-slate-600 text-sm font-mono py-2">
            No insights yet — click Refresh.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── SubscriptionsPanel ───────────────────────────────────────────────────────

interface SubscriptionsPanelProps {
  subscriptions: Subscription[];
}

function SubscriptionsPanel({ subscriptions }: SubscriptionsPanelProps) {
  if (!subscriptions?.length) return null;
  const total = subscriptions.reduce((s, x) => s + (x.amount ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Repeat2 size={16} className="text-amber-400" />
            <h3 className="font-bold text-slate-100 text-[15px]">
              Recurring Subscriptions
            </h3>
          </div>
          <Badge color="#fb923c">{fmt(total)}/mo</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-2">
          {subscriptions.map((sub, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{catIcon(sub.category)}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {sub.merchant}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">
                    {fcat(sub.category)}
                  </p>
                </div>
              </div>
              <p className="font-mono font-bold text-amber-400 text-sm">
                {fmt(sub.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── NavTab ───────────────────────────────────────────────────────────────────

interface NavTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<LucideProps>;
  label: string;
}

function NavTab({ active, onClick, icon: Icon, label }: NavTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
        active
          ? "bg-purple-500 text-[#030a0a]"
          : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ─── tab config ───────────────────────────────────────────────────────────────

type TabId = "overview" | "transactions" | "analytics" | "insights";

interface TabConfig {
  id: TabId;
  icon: React.ComponentType<LucideProps>;
  label: string;
}

const TABS: TabConfig[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "transactions", icon: ArrowLeftRight, label: "Transactions" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
  { id: "insights", icon: Sparkles, label: "Insights" },
];

const PAGE_SIZE = 15;

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [page, setPage] = useState<number>(1);
  const [syncing, setSyncing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    const r = await fetch("/api/dashboard");
    const d = await r.json() as DashboardData;
    if (process.env.NODE_ENV === "development") {
      console.log("[dashboard] raw API shape:", {
        categoryBreakdown: d.categoryBreakdown?.slice(0, 3),
        monthlySummary: d.monthlySummary?.slice(0, 3),
        sampleTransaction: d.transactions?.[0],
      });
    }
    setData(d);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => { setPage(1); }, [search]);

  const totalSpent = useMemo<number>(
    () => data?.transactions?.reduce((s, t) => s + Number(t.amount), 0) ?? 0,
    [data]
  );

  // Normalise monthlySummary — your util may return { month, total } or { month, amount }
  const monthlySummary = useMemo(
    () =>
      (data?.monthlySummary ?? []).map((m) => ({
        month: m.month,
        income: m.income ?? 0,
        expense: m.expense ?? 0,
      })),
    [data]
  );

  // Normalise categoryBreakdown — ensure total is always a number
  const categoryBreakdown = useMemo(
    () =>
      (data?.categoryBreakdown ?? []).filter((c) => (c.value ?? 0) > 0),
    [data]
  );

  const filtered = useMemo<Transaction[]>(() => {
    if (!data) return [];
    return data.transactions.filter((t) =>
      t.merchant.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const sorted = useMemo<Transaction[]>(
    () =>
      [...filtered].sort((a, b) =>
        sort === "amount"
          ? Number(b.amount) - Number(a.amount)
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filtered, sort]
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSync = async (): Promise<void> => {
    setSyncing(true);
    await fetch("/api/bank/sync", { method: "POST" }).catch(() => { });
    const fresh = await fetch("/api/dashboard").then(
      (r) => r.json() as Promise<DashboardData>
    );
    setData(fresh);
    setSyncing(false);
  };


  // ── loading state ─────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .animate-spin   { animation: spin 1s linear infinite; }
        `}</style>
        <div className="text-center">
          <RefreshCcw
            size={28}
            className="animate-spin text-purple-500 mx-auto mb-4"
          />
          <p className="font-mono text-sm text-slate-500">
            Loading your finances…
          </p>
        </div>
      </div>
    );
  }

  const { user } = useUser();

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .animate-spin     { animation: spin 1s linear infinite; }
        .animate-fade-up  { animation: fadeUp 0.45s ease both; }
      `}</style>

      {/* ── header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-screen-xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500 text-[#030a0a]">
              <Wallet size={15} />
            </div>
            <span className="text-[17px] font-bold tracking-tight">FinanceAI</span>
          </div>

          <nav className="flex gap-1 rounded-full border border-white/[0.07] bg-black p-1">
            {TABS.map((t) => (
              <NavTab
                key={t.id}
                active={tab === t.id}
                onClick={() => setTab(t.id)}
                icon={t.icon}
                label={t.label}
              />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {data.hasConnectedBank && (
              <>
                <ConnectBank />
                <UploadStatement onSuccess={loadData} />
                <button
                  onClick={() => void handleSync()}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black px-3.5 py-2 text-[12px] font-mono text-slate-400 transition hover:border-purple-500/40 hover:text-purple-400 disabled:opacity-50"
                >
                  <RefreshCcw size={12} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Syncing…" : "Sync Bank"}
                </button>
              </>
            )}

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-8">

        {!data.hasConnectedBank ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 mb-6">
              <Wallet size={32} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Connect your finances
            </h1>
            <p className="max-w-md text-slate-400 mb-8 leading-relaxed">
              Link your Indian bank account securely through the Account Aggregator network or upload a bank statement to unlock powerful AI insights and start tracking your spending.
            </p>
            <div className="flex flex-col  items-center gap-4">
              <ConnectBank />
              <div className="text-slate-500 text-sm font-mono px-2">OR</div>
              <UploadStatement onSuccess={loadData} />
            </div>
          </div>
        ) : (
          <>
            {/* ══ OVERVIEW ═══════════════════════════════════════════════════════ */}
            {tab === "overview" && (
              <div className="animate-fade-up">
                <div className="mb-8">
                  <p className="text-[11px] font-mono tracking-widest uppercase text-slate-600 mb-1.5">
                    Dashboard
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, <span className="text-purple-400">{user?.firstName || user?.fullName || "User"}</span>
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
                  <StatCard
                    label="Bank Balance"
                    value={fmt(data.netWorth)}
                    sub={`${data.accounts?.length || 0} account(s)`}
                    icon={Wallet}
                    accent="#10d9a0"
                    delay={0}
                  />
                  <StatCard
                    label="Total Spent"
                    value={fmt(totalSpent)}
                    sub={`${data.transactions.length} transactions`}
                    icon={TrendingDown}
                    accent="#f43f5e"
                    delay={0.07}
                  />
                  <StatCard
                    label="Daily Burn"
                    value={`${fmt(data.burn?.daily ?? 0)}/day`}
                    sub={`~${fmt(data.burn?.projected ?? 0)} projected`}
                    icon={Flame}
                    accent="#fb923c"
                    delay={0.14}
                  />
                  <StatCard
                    label="Subscriptions"
                    value={`${data.subscriptions?.length ?? 0} active`}
                    sub={`${fmt(
                      data.subscriptions?.reduce((s, x) => s + (x.amount ?? 0), 0) ?? 0
                    )}/mo`}
                    icon={Repeat2}
                    accent="#a78bfa"
                    delay={0.21}
                  />
                </div>


                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <p className="text-sm font-semibold text-slate-300 py-1">
                        Spending by Category
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={44}
                            paddingAngle={3}
                          >
                            {categoryBreakdown?.map((_, i) => (
                              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                        {categoryBreakdown?.map((c, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500"
                          >
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: PALETTE[i % PALETTE.length] }}
                            />
                            {fcat(c.name)}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <p className="text-sm font-semibold text-slate-300 py-1">
                        Monthly Spending
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data.monthlySummary}>
                          <defs>
                            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10d9a0" stopOpacity={0.22} />
                              <stop offset="95%" stopColor="#10d9a0" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.04)"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: "#4a5568", fontSize: 11, fontFamily: "monospace" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#4a5568", fontSize: 11, fontFamily: "monospace" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) => `₹${v}`}
                          />
                          <Tooltip content={<ChartTip />} />
                          <Area
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            fill="#ef444420"
                          />

                          <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10d9a0"
                            fill="#10d9a020"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {data.burn && (
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Flame size={15} className="text-amber-400" />
                          <span className="text-sm font-semibold text-slate-200">
                            Burn Rate — Month Progress
                          </span>
                        </div>
                        <Badge color="#fb923c">
                          {fmt(data.burn.projected)} projected
                        </Badge>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              100,
                              ((data.burn.spent ?? 0) / (data.burn.projected ?? 1)) * 100
                            )}%`,
                            background: "linear-gradient(90deg,#10d9a0,#fb923c)",
                          }}
                        />
                      </div>
                      <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-600">
                        <span>Spent: {fmt(data.burn.spent)}</span>
                        <span>Daily avg: {fmt(data.burn.daily)}</span>
                        <span>Projected: {fmt(data.burn.projected)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ══ TRANSACTIONS ═══════════════════════════════════════════════════ */}
            {tab === "transactions" && (
              <div className="animate-fade-up">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-[22px] font-bold tracking-tight">
                    Transactions{" "}
                    <span className="text-sm font-mono font-normal text-slate-600">
                      ({filtered.length})
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                      />
                      <input
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Search merchant…"
                        className="h-9 w-52 rounded-xl border border-white/[0.08] bg-black pl-8 pr-3 text-[12px] font-mono text-slate-300 placeholder-slate-600 outline-none transition focus:border--500/40"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                    {(["date", "amount"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className={cn(
                          "rounded-lg border px-3.5 py-1.5 text-[12px] font-mono transition",
                          sort === s
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                            : "border-white/[0.08] text-slate-500 hover:border-purple-500/30 hover:text-purple-400"
                        )}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <Card>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.07]">
                        {["Merchant", "Category", "Date", "Amount"].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3.5 text-left text-[10px] font-mono tracking-widest uppercase text-slate-600"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{catIcon(t.category)}</span>
                              <span className="text-sm font-semibold text-slate-200">
                                {t.merchant}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge color={catColor(t.category)}>
                              {fcat(t.category)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[12px] text-slate-500">
                            {new Date(t.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className={cn(
                            "px-5 py-3.5 font-mono text-sm font-bold",
                            Number(t.amount) > 0 ? "text-emerald-500" : "text-rose-500"
                          )}>
                            {Number(t.amount) > 0 ? "+" : "−"}{fmt(t.amount)}
                          </td>
                        </tr>
                      ))}
                      {!paginated.length && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-10 text-center font-mono text-sm text-slate-600"
                          >
                            No transactions match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[12px] text-slate-600">
                    Page {page} of {totalPages || 1} · {sorted.length} results
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:border-purple-500/40 hover:text-purple-400 disabled:opacity-25"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p =
                        Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg border text-[12px] font-mono transition",
                            p === page
                              ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                              : "border-white/[0.08] text-slate-500 hover:border-purple-500/30 hover:text-purple-400"
                          )}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:border-purple-500/40 hover:text-purple-400 disabled:opacity-25"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ANALYTICS ══════════════════════════════════════════════════════ */}
            {tab === "analytics" && (
              <div className="animate-fade-up">
                <h2 className="mb-6 text-[22px] font-bold tracking-tight">Analytics</h2>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-6">
                  {categoryBreakdown.map((c, i) => {
                    const pct = Math.round((c.value / totalSpent) * 100);
                    return (
                      <Card key={i}>
                        <CardContent>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-2xl">{catIcon(c.name)}</span>
                            <span className="font-mono text-[11px] text-slate-600">
                              {pct}%
                            </span>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-300 mb-1">
                            {fcat(c.name)}
                          </p>
                          <p
                            className="font-mono text-xl font-bold mb-3"
                            style={{ color: PALETTE[i % PALETTE.length] }}
                          >
                            {fmt(c.value)}
                          </p>
                          <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: PALETTE[i % PALETTE.length],
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <p className="text-sm font-semibold text-slate-300 py-1">
                      Full Category Breakdown
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={categoryBreakdown.map((c) => ({
                          ...c,
                          name: fcat(c.name),
                        }))}
                        barSize={28}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.04)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#4a5568", fontSize: 11, fontFamily: "monospace" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#4a5568", fontSize: 11, fontFamily: "monospace" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `$${v}`}
                        />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {categoryBreakdown.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <SubscriptionsPanel subscriptions={data.subscriptions} />
              </div>
            )}

            {/* ══ INSIGHTS ═══════════════════════════════════════════════════════ */}
            {tab === "insights" && (
              <div className="animate-fade-up">
                <div className="mb-6">
                  <h2 className="text-[22px] font-bold tracking-tight">
                    AI Insights{" "}
                    <span className="text-purple-400">✦</span>
                  </h2>
                  <p className="mt-1 font-mono text-[12px] text-slate-600">
                    Claude analyses your real bank transaction data in real-time
                  </p>
                </div>
                <AIInsightsPanel
                  transactions={data.transactions}
                  categoryBreakdown={categoryBreakdown}
                  burn={data.burn}
                  subscriptions={data.subscriptions}
                />
              </div>
            )}

          </>
        )}

      </main>
    </div>
  );
}