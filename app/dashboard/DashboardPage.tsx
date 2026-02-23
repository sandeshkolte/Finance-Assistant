// "use client";

// /**
//  * app/dashboard/page.tsx
//  *
//  * Stack: Next.js 16 App Router · Tailwind CSS · Lucide React · Recharts 3
//  *        Radix UI · clsx · tailwind-merge
//  *
//  * Wired to your /api/dashboard response shape:
//  *   { transactions, categoryBreakdown, monthlySummary,
//  *     subscriptions, burn, netWorth, insights }
//  *
//  * Companion AI route lives at the bottom (app/api/ai-insights/route.ts)
//  */

// import { useState, useEffect, useMemo, useCallback, Key, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react";
// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge";
// import {
//   LayoutDashboard, ArrowLeftRight, BarChart3, Sparkles,
//   RefreshCcw, TrendingUp, TrendingDown, Wallet,
//   Repeat2, Flame, AlertTriangle, Info, Lightbulb,
//   LineChart, ChevronLeft, ChevronRight, Search, X,
// } from "lucide-react";
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   AreaChart, Area, XAxis, YAxis, CartesianGrid,
//   BarChart, Bar,
// } from "recharts";

// // ─── utils ────────────────────────────────────────────────────────────────────
// const cn = (...inputs: (string | undefined)[]) => twMerge(clsx(inputs));

// const fmt = (n: any) =>
//   "$" + Math.abs(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const fcat = (s: any) =>
//   (s || "other").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

// const PALETTE = [
//   "#10d9a0", "#38bdf8", "#a78bfa",
//   "#fb923c", "#f43f5e", "#facc15", "#34d399",
// ];

// const CAT_ICONS = {
//   food_drink: "🍔", transport: "🚗", entertainment: "🎬",
//   utilities: "⚡", shopping: "🛍️", health: "💊",
//   travel: "✈️", income: "💵",
// };
// const catIcon = (cat: any) => CAT_ICONS[(cat || "").toLowerCase().replace(/\s+/g, "_") as keyof typeof CAT_ICONS] ?? "💳";

// // ─── shadcn-style card primitives (Radix-free, Tailwind only) ─────────────────
// function Card({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
//   return (
//     <div className={cn("rounded-2xl border border-white/[0.07] bg-[#0e1420] overflow-hidden", className)} style={style}>
//       {children}
//     </div>
//   );
// }
// function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
//   return <div className={cn("px-6 pt-5 pb-0", className)}>{children}</div>;
// }
// function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
//   return <div className={cn("px-6 py-5", className)}>{children}</div>;
// }

// // ─── Pill badge ───────────────────────────────────────────────────────────────
// function Badge({ children, color = "#10d9a0" }: { children: React.ReactNode; color?: string }) {
//   return (
//     <span
//       className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium border"
//       style={{ color, borderColor: `${color}40`, background: `${color}14` }}
//     >
//       {children}
//     </span>
//   );
// }

// // ─── Stat card ────────────────────────────────────────────────────────────────
// function StatCard({ label, value, sub, icon: Icon, accent = "#10d9a0", delay = 0 }: { label: string; value: string | number; sub?: string; icon?: React.ComponentType<{ size: number; style?: React.CSSProperties }>; accent?: string; delay?: number }) {
//   return (
//     <Card
//       className="relative animate-fade-up"
//       style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
//     >
//       {/* glow blob */}
//       <div
//         className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-[0.12]"
//         style={{ background: accent }}
//       />
//       <CardContent>
//         <div className="flex items-start justify-between">
//           <div>
//             <p className="text-[11px] font-mono tracking-widest uppercase text-slate-500 mb-2">{label}</p>
//             <p className="text-2xl font-bold tracking-tight text-slate-100">{value}</p>
//             {sub && <p className="mt-1 text-[12px] font-mono text-slate-600">{sub}</p>}
//           </div>
//           {Icon && (
//             <div
//               className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl"
//               style={{ background: `${accent}1a` }}
//             >
//               <Icon size={16} style={{ color: accent }} />
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Custom recharts tooltip ──────────────────────────────────────────────────
// function ChartTip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: { category?: string; month?: string }; name?: string; value?: number }> }) {
//   if (!active || !payload?.length) return null;
//   const p = payload[0];
//   return (
//     <div className="rounded-xl border border-white/10 bg-[#1a2235] px-3.5 py-2.5 text-xs font-mono shadow-xl">
//       <p className="text-slate-400 mb-1">
//         {p.payload?.category ? fcat(p.payload.category) : p.payload?.month ?? p.name}
//       </p>
//       <p className="font-bold" style={{ color: PALETTE[0] }}>{fmt(p.value)}</p>
//     </div>
//   );
// }

// // ─── AI Insights panel ────────────────────────────────────────────────────────
// const INSIGHT_META = {
//   anomaly:  { icon: AlertTriangle, color: "#f43f5e", label: "Anomaly"  },
//   warning:  { icon: AlertTriangle, color: "#fb923c", label: "Warning"  },
//   tip:      { icon: Lightbulb,     color: "#10d9a0", label: "Tip"      },
//   forecast: { icon: LineChart,     color: "#38bdf8", label: "Forecast" },
// };

// function InsightCard({ insight, delay = 0 }) {
//   const meta = INSIGHT_META[insight.type] ?? INSIGHT_META.tip;
//   const Icon = meta.icon;
//   return (
//     <div
//       className="rounded-xl border p-4 animate-fade-up"
//       style={{
//         borderColor: `${meta.color}25`,
//         background: `${meta.color}08`,
//         animationDelay: `${delay}s`,
//         animationFillMode: "both",
//       }}
//     >
//       <div className="flex gap-3">
//         <div
//           className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
//           style={{ background: `${meta.color}20` }}
//         >
//           <Icon size={13} style={{ color: meta.color }} />
//         </div>
//         <div className="min-w-0">
//           <div className="flex flex-wrap items-center gap-2 mb-1.5">
//             <span className="text-sm font-semibold text-slate-200">{insight.title}</span>
//             <Badge color={meta.color}>{meta.label}</Badge>
//           </div>
//           <p className="text-[13px] leading-relaxed text-slate-400">{insight.description}</p>
//           {insight.value && (
//             <div className="mt-2">
//               <Badge color={meta.color}>{insight.value}</Badge>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function AIInsightsPanel({ transactions, categoryBreakdown, burn, subscriptions }) {
//   const [insights, setInsights] = useState(null);
//   const [loading,  setLoading]  = useState(false);
//   const [error,    setError]    = useState(null);

//   const run = useCallback(async () => {
//     if (!transactions?.length) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/ai-insights", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           summary: {
//             totalTransactions: transactions.length,
//             totalSpent: transactions.reduce((s: any, t: { amount: any; }) => s + t.amount, 0),
//             categoryBreakdown,
//             burnRate: burn,
//             subscriptionCount: subscriptions?.length ?? 0,
//             topMerchants: Object.entries(
//               transactions.reduce((acc: { [x: string]: any; }, t: { merchant: string | number; amount: any; }) => {
//                 acc[t.merchant] = (acc[t.merchant] ?? 0) + t.amount;
//                 return acc;
//               }, {})
//             )
//               .sort((a, b) => b[1] - a[1])
//               .slice(0, 5),
//             recentTransactions: transactions.slice(0, 12).map((t: { merchant: any; amount: any; category: any; date: any; }) => ({
//               merchant: t.merchant,
//               amount:   t.amount,
//               category: t.category,
//               date:     t.date,
//             })),
//           },
//         }),
//       });
//       const data = await res.json();
//       setInsights(data.insights);
//     } catch {
//       setError("Could not load AI insights — check your /api/ai-insights route.");
//     } finally {
//       setLoading(false);
//     }
//   }, [transactions, categoryBreakdown, burn, subscriptions]);

//   useEffect(() => { run(); }, []);

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between py-1">
//           <div className="flex items-center gap-3">
//             <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
//               <Sparkles size={15} className="text-emerald-400" />
//             </div>
//             <div>
//               <h3 className="font-bold text-slate-100 text-[15px]">AI Financial Insights</h3>
//               <p className="text-[11px] font-mono text-slate-600">Powered by Claude · live analysis</p>
//             </div>
//           </div>
//           <button
//             onClick={run}
//             disabled={loading}
//             className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] font-mono text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-50"
//           >
//             <RefreshCcw size={11} className={loading ? "animate-spin" : ""} />
//             {loading ? "Analysing…" : "Refresh"}
//           </button>
//         </div>
//       </CardHeader>

//       <CardContent className="pt-4">
//         {loading && (
//           <div className="flex items-center gap-3 text-slate-500 text-sm font-mono py-4">
//             <RefreshCcw size={14} className="animate-spin text-emerald-500" />
//             Claude is analysing your spending patterns…
//           </div>
//         )}
//         {error && (
//           <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
//             <AlertTriangle size={14} />
//             {error}
//           </div>
//         )}
//         {insights && !loading && (
//           <div className="grid gap-3">
//             {insights.map((ins: unknown, i: Key | null | undefined) => (
//               <InsightCard key={i} insight={ins} delay={i * 0.07} />
//             ))}
//           </div>
//         )}
//         {!insights && !loading && !error && (
//           <p className="text-slate-600 text-sm font-mono py-2">No insights yet — click Refresh.</p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Subscriptions panel ──────────────────────────────────────────────────────
// function SubscriptionsPanel({ subscriptions }) {
//   if (!subscriptions?.length) return null;
//   const total = subscriptions.reduce((s: any, x: { amount: any; }) => s + (x.amount ?? 0), 0);

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between py-1">
//           <div className="flex items-center gap-2">
//             <Repeat2 size={16} className="text-amber-400" />
//             <h3 className="font-bold text-slate-100 text-[15px]">Recurring Subscriptions</h3>
//           </div>
//           <Badge color="#fb923c">{fmt(total)}/mo</Badge>
//         </div>
//       </CardHeader>
//       <CardContent className="pt-4">
//         <div className="grid gap-2">
//           {subscriptions.map((sub: { category: any; merchant: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; amount: any; }, i: Key | null | undefined) => (
//             <div
//               key={i}
//               className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]"
//             >
//               <div className="flex items-center gap-3">
//                 <span className="text-xl">{catIcon(sub.category)}</span>
//                 <div>
//                   <p className="text-sm font-semibold text-slate-200">{sub.merchant}</p>
//                   <p className="text-[11px] font-mono text-slate-600">{fcat(sub.category)}</p>
//                 </div>
//               </div>
//               <p className="font-mono font-bold text-amber-400 text-sm">{fmt(sub.amount)}</p>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Nav tab ──────────────────────────────────────────────────────────────────
// function NavTab({ active, onClick, icon: Icon, label }) {
//   return (
//     <button
//       onClick={onClick}
//       className={cn(
//         "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
//         active
//           ? "bg-emerald-500 text-[#030a0a]"
//           : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
//       )}
//     >
//       <Icon size={13} />
//       {label}
//     </button>
//   );
// }

// // ─── Main page ────────────────────────────────────────────────────────────────
// const PAGE_SIZE = 15;
// const TABS = [
//   { id: "overview",      icon: LayoutDashboard, label: "Overview"      },
//   { id: "transactions",  icon: ArrowLeftRight,  label: "Transactions"  },
//   { id: "analytics",     icon: BarChart3,       label: "Analytics"     },
//   { id: "insights",      icon: Sparkles,        label: "Insights"      },
// ];

// export default function DashboardPage() {
//   const [data,    setData]    = useState(null);
//   const [tab,     setTab]     = useState("overview");
//   const [search,  setSearch]  = useState("");
//   const [sort,    setSort]    = useState("date");
//   const [page,    setPage]    = useState(1);
//   const [syncing, setSyncing] = useState(false);

//   useEffect(() => {
//     fetch("/api/dashboard").then((r) => r.json()).then(setData);
//   }, []);

//   useEffect(() => { setPage(1); }, [search]);

//   const totalSpent = useMemo(
//     () => data?.transactions.reduce((s: any, t: { amount: any; }) => s + t.amount, 0) ?? 0,
//     [data]
//   );

//   const filtered = useMemo(() => {
//     if (!data) return [];
//     return data.transactions.filter((t: { merchant: string; }) =>
//       t.merchant.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [data, search]);

//   const sorted = useMemo(
//     () =>
//       [...filtered].sort((a, b) =>
//         sort === "amount"
//           ? b.amount - a.amount
//           : new Date(b.date).getTime() - new Date(a.date).getTime()
//       ),
//     [filtered, sort]
//   );

//   const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
//   const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const handleSync = async () => {
//     setSyncing(true);
//     await fetch("/api/plaid/sync", { method: "POST" }).catch(() => {});
//     const fresh = await fetch("/api/dashboard").then((r) => r.json());
//     setData(fresh);
//     setSyncing(false);
//   };

//   // ── loading ──────────────────────────────────────────────────────────────
//   if (!data) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
//         <style>{`
//           @keyframes spin { to { transform: rotate(360deg); } }
//           .animate-spin { animation: spin 1s linear infinite; }
//         `}</style>
//         <div className="text-center">
//           <RefreshCcw size={28} className="animate-spin text-emerald-500 mx-auto mb-4" />
//           <p className="font-mono text-sm text-slate-500">Loading your finances…</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#080c14] text-slate-100">

//       {/* ── global animations ── */}
//       <style>{`
//         @keyframes spin    { to { transform: rotate(360deg); } }
//         @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
//         .animate-spin      { animation: spin 1s linear infinite; }
//         .animate-fade-up   { animation: fadeUp 0.45s ease both; }
//       `}</style>

//       {/* ── header ── */}
//       <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080c14]/90 backdrop-blur-xl">
//         <div className="mx-auto flex h-[62px] max-w-screen-xl items-center justify-between px-6">

//           {/* logo */}
//           <div className="flex items-center gap-2.5">
//             <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-[#030a0a]">
//               <Wallet size={15} />
//             </div>
//             <span className="text-[17px] font-bold tracking-tight">FinanceAI</span>
//           </div>

//           {/* tabs */}
//           <nav className="flex gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1">
//             {TABS.map((t) => (
//               <NavTab
//                 key={t.id}
//                 active={tab === t.id}
//                 onClick={() => setTab(t.id)}
//                 icon={t.icon}
//                 label={t.label}
//               />
//             ))}
//           </nav>

//           {/* actions */}
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleSync}
//               disabled={syncing}
//               className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[12px] font-mono text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-50"
//             >
//               <RefreshCcw size={12} className={syncing ? "animate-spin" : ""} />
//               {syncing ? "Syncing…" : "Sync Plaid"}
//             </button>
//             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-xs font-bold text-[#030a0a]">
//               {(data.user?.name?.[0] ?? "U")}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto max-w-screen-xl px-6 py-8">

//         {/* ══ OVERVIEW ═══════════════════════════════════════════════════════ */}
//         {tab === "overview" && (
//           <div className="animate-fade-up">
//             <div className="mb-8">
//               <p className="text-[11px] font-mono tracking-widest uppercase text-slate-600 mb-1.5">Dashboard</p>
//               <h1 className="text-3xl font-bold tracking-tight">
//                 Welcome back<span className="text-emerald-400">.</span>
//               </h1>
//             </div>

//             {/* stat cards */}
//             <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
//               <StatCard label="Net Worth"     value={fmt(data.netWorth)}              sub="all accounts"                  icon={Wallet}       accent="#10d9a0" delay={0}    />
//               <StatCard label="Total Spent"   value={fmt(totalSpent)}                 sub={`${data.transactions.length} txns`} icon={TrendingDown} accent="#f43f5e" delay={0.07} />
//               <StatCard label="Daily Burn"    value={fmt(data.burn?.daily ?? 0)}      sub={`~${fmt(data.burn?.projected ?? 0)} projected`} icon={Flame}  accent="#fb923c" delay={0.14} />
//               <StatCard label="Subscriptions" value={`${data.subscriptions?.length ?? 0} active`} sub={fmt(data.subscriptions?.reduce((s: any, x: { amount: any; }) => s + (x.amount ?? 0), 0) ?? 0) + "/mo"} icon={Repeat2} accent="#a78bfa" delay={0.21} />
//             </div>

//             {/* charts row */}
//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">

//               {/* pie */}
//               <Card>
//                 <CardHeader><p className="text-sm font-semibold text-slate-300 py-1">Spending by Category</p></CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <PieChart>
//                       <Pie data={data.categoryBreakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={3}>
//                         {data.categoryBreakdown.map((_: any, i: Key | null | undefined) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
//                       </Pie>
//                       <Tooltip content={<ChartTip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
//                     {data.categoryBreakdown.map((c: { category: any; }, i: Key | null | undefined) => (
//                       <span key={i} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
//                         <span className="inline-block h-2 w-2 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
//                         {fcat(c.category)}
//                       </span>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* area */}
//               <Card>
//                 <CardHeader><p className="text-sm font-semibold text-slate-300 py-1">Monthly Spending</p></CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <AreaChart data={data.monthlySummary ?? []}>
//                       <defs>
//                         <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%"  stopColor="#10d9a0" stopOpacity={0.22} />
//                           <stop offset="95%" stopColor="#10d9a0" stopOpacity={0}    />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
//                       <XAxis dataKey="month" tick={{ fill:"#4a5568", fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} />
//                       <YAxis tick={{ fill:"#4a5568", fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
//                       <Tooltip content={<ChartTip />} />
//                       <Area type="monotone" dataKey="amount" stroke="#10d9a0" strokeWidth={2.5} fill="url(#ag)" />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* burn rate bar */}
//             {data.burn && (
//               <Card>
//                 <CardContent>
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <Flame size={15} className="text-amber-400" />
//                       <span className="text-sm font-semibold text-slate-200">Burn Rate — Month Progress</span>
//                     </div>
//                     <Badge color="#fb923c">{fmt(data.burn.projected)} projected</Badge>
//                   </div>
//                   <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
//                     <div
//                       className="h-full rounded-full transition-all duration-700"
//                       style={{
//                         width: `${Math.min(100, ((data.burn.spent ?? 0) / (data.burn.projected ?? 1)) * 100)}%`,
//                         background: "linear-gradient(90deg,#10d9a0,#fb923c)",
//                       }}
//                     />
//                   </div>
//                   <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-600">
//                     <span>Spent: {fmt(data.burn.spent)}</span>
//                     <span>Daily avg: {fmt(data.burn.daily)}</span>
//                     <span>Projected: {fmt(data.burn.projected)}</span>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         )}

//         {/* ══ TRANSACTIONS ═══════════════════════════════════════════════════ */}
//         {tab === "transactions" && (
//           <div className="animate-fade-up">
//             <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
//               <h2 className="text-[22px] font-bold tracking-tight">
//                 Transactions{" "}
//                 <span className="text-sm font-mono font-normal text-slate-600">({filtered.length})</span>
//               </h2>
//               <div className="flex items-center gap-2">
//                 {/* search */}
//                 <div className="relative">
//                   <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
//                   <input
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search merchant…"
//                     className="h-9 w-52 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 text-[12px] font-mono text-slate-300 placeholder-slate-600 outline-none transition focus:border-emerald-500/40"
//                   />
//                   {search && (
//                     <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
//                       <X size={11} />
//                     </button>
//                   )}
//                 </div>
//                 {/* sort */}
//                 {["date", "amount"].map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => setSort(s)}
//                     className={cn(
//                       "rounded-lg border px-3.5 py-1.5 text-[12px] font-mono transition",
//                       sort === s
//                         ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
//                         : "border-white/[0.08] text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400"
//                     )}
//                   >
//                     {s.charAt(0).toUpperCase() + s.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <Card>
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="border-b border-white/[0.07]">
//                     {["Merchant", "Category", "Date", "Amount"].map((h) => (
//                       <th key={h} className="px-5 py-3.5 text-left text-[10px] font-mono tracking-widest uppercase text-slate-600">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginated.map((t) => (
//                     <tr key={t.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.025]">
//                       <td className="px-5 py-3.5">
//                         <div className="flex items-center gap-2.5">
//                           <span className="text-lg">{catIcon(t.category)}</span>
//                           <span className="text-sm font-semibold text-slate-200">{t.merchant}</span>
//                         </div>
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <Badge color={PALETTE[Object.keys(CAT_ICONS).indexOf(t.category?.toLowerCase()?.replace(/\s+/g, "_")) % PALETTE.length] ?? "#94a3b8"}>
//                           {fcat(t.category)}
//                         </Badge>
//                       </td>
//                       <td className="px-5 py-3.5 font-mono text-[12px] text-slate-500">
//                         {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                       </td>
//                       <td className="px-5 py-3.5 font-mono text-sm font-bold text-slate-200">
//                         −{fmt(t.amount)}
//                       </td>
//                     </tr>
//                   ))}
//                   {!paginated.length && (
//                     <tr>
//                       <td colSpan={4} className="py-10 text-center font-mono text-sm text-slate-600">
//                         No transactions match your search.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </Card>

//             {/* pagination */}
//             <div className="mt-4 flex items-center justify-between">
//               <span className="font-mono text-[12px] text-slate-600">
//                 Page {page} of {totalPages || 1} · {sorted.length} results
//               </span>
//               <div className="flex items-center gap-1.5">
//                 <button
//                   onClick={() => setPage((p) => p - 1)}
//                   disabled={page === 1}
//                   className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-25"
//                 >
//                   <ChevronLeft size={14} />
//                 </button>
//                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                   const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
//                   return (
//                     <button
//                       key={p}
//                       onClick={() => setPage(p)}
//                       className={cn(
//                         "flex h-8 w-8 items-center justify-center rounded-lg border text-[12px] font-mono transition",
//                         p === page
//                           ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
//                           : "border-white/[0.08] text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400"
//                       )}
//                     >
//                       {p}
//                     </button>
//                   );
//                 })}
//                 <button
//                   onClick={() => setPage((p) => p + 1)}
//                   disabled={page >= totalPages}
//                   className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-25"
//                 >
//                   <ChevronRight size={14} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ══ ANALYTICS ══════════════════════════════════════════════════════ */}
//         {tab === "analytics" && (
//           <div className="animate-fade-up">
//             <h2 className="mb-6 text-[22px] font-bold tracking-tight">Analytics</h2>

//             {/* category tiles */}
//             <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-6">
//               {data.categoryBreakdown.map((c: { total: number; category: any; }, i: Key | null | undefined) => {
//                 const pct = Math.round((c.total / totalSpent) * 100);
//                 return (
//                   <Card key={i}>
//                     <CardContent>
//                       <div className="flex justify-between items-start mb-3">
//                         <span className="text-2xl">{catIcon(c.category)}</span>
//                         <span className="font-mono text-[11px] text-slate-600">{pct}%</span>
//                       </div>
//                       <p className="text-[13px] font-semibold text-slate-300 mb-1">{fcat(c.category)}</p>
//                       <p className="font-mono text-xl font-bold mb-3" style={{ color: PALETTE[i % PALETTE.length] }}>
//                         {fmt(c.total)}
//                       </p>
//                       <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
//                         <div
//                           className="h-full rounded-full transition-all duration-700"
//                           style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }}
//                         />
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>

//             {/* bar chart */}
//             <Card className="mb-6">
//               <CardHeader><p className="text-sm font-semibold text-slate-300 py-1">Full Category Breakdown</p></CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={240}>
//                   <BarChart data={data.categoryBreakdown.map((c: { category: any; }) => ({ ...c, name: fcat(c.category) }))} barSize={28}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
//                     <XAxis dataKey="name" tick={{ fill:"#4a5568", fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} />
//                     <YAxis tick={{ fill:"#4a5568", fontSize:11, fontFamily:"monospace" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
//                     <Tooltip content={<ChartTip />} />
//                     <Bar dataKey="total" radius={[6, 6, 0, 0]}>
//                       {data.categoryBreakdown.map((_: any, i: Key | null | undefined) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             <SubscriptionsPanel subscriptions={data.subscriptions} />
//           </div>
//         )}

//         {/* ══ INSIGHTS ═══════════════════════════════════════════════════════ */}
//         {tab === "insights" && (
//           <div className="animate-fade-up">
//             <div className="mb-6">
//               <h2 className="text-[22px] font-bold tracking-tight">
//                 AI Insights <span className="text-emerald-400">✦</span>
//               </h2>
//               <p className="mt-1 font-mono text-[12px] text-slate-600">
//                 Claude analyses your real Plaid transaction data in real-time
//               </p>
//             </div>
//             <AIInsightsPanel
//               transactions={data.transactions}
//               categoryBreakdown={data.categoryBreakdown}
//               burn={data.burn}
//               subscriptions={data.subscriptions}
//             />
//           </div>
//         )}

//       </main>
//     </div>
//   );
// }


// /* ═══════════════════════════════════════════════════════════════════════════════
//    COMPANION ROUTE  →  app/api/ai-insights/route.ts
//    Copy this into a new file. Add ANTHROPIC_API_KEY to your .env.local
//    npm install @anthropic-ai/sdk
// ═══════════════════════════════════════════════════════════════════════════════

// import { NextResponse } from "next/server";
// import Anthropic from "@anthropic-ai/sdk";

// const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY automatically

// export async function POST(req: Request) {
//   const { summary } = await req.json();

//   const message = await anthropic.messages.create({
//     model: "claude-sonnet-4-6",
//     max_tokens: 1024,
//     messages: [
//       {
//         role: "user",
//         content: `You are a sharp personal finance analyst. Analyse this spending data and return ONLY a JSON array. No preamble, no markdown fences — raw JSON array only.

// Each object must have:
// - "type": "anomaly" | "warning" | "tip" | "forecast"
// - "title": max 8 words
// - "description": 1-2 sentences with specific numbers from the data
// - "value": optional short badge string e.g. "$240 overspent" or "+18% vs last month"

// Rules:
// - anomaly  → unusually high single charge or merchant
// - warning  → category overspend, burn rate alert, subscription creep
// - tip      → actionable saving opportunity
// - forecast → projected spend trajectory

// Spending data:
// ${JSON.stringify(summary, null, 2)}

// Return 4-6 insights. Raw JSON array only.`,
//       },
//     ],
//   });

//   const raw   = message.content[0].type === "text" ? message.content[0].text : "[]";
//   const clean = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();

//   return NextResponse.json({ insights: JSON.parse(clean) });
// }
// */
