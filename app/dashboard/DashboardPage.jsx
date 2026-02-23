// "use client";

// /**
//  * DashboardPage.jsx
//  *
//  * Drop this into:  app/dashboard/page.tsx  (rename to .tsx and add types as needed)
//  *
//  * Dependencies already in your project:
//  *   recharts, @clerk/nextjs
//  *
//  * New dependency for the AI panel (Claude API is called via your own route):
//  *   Nothing extra — AI calls go through /api/ai-insights (see bottom of file for the
//  *   companion route you need to create).
//  */

// import { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   AreaChart, Area, XAxis, YAxis, CartesianGrid,
//   BarChart, Bar,
// } from "recharts";

// // ─── design tokens ────────────────────────────────────────────────────────────
// const T = {
//   bg:       "#080c14",
//   surface:  "#0e1420",
//   border:   "rgba(255,255,255,0.07)",
//   muted:    "#4a5568",
//   subtle:   "#94a3b8",
//   text:     "#e8edf5",
//   accent:   "#00d4aa",   // teal-green — money feels like teal
//   warn:     "#f59e0b",
//   danger:   "#f43f5e",
//   info:     "#38bdf8",
//   fonts: {
//     display: "'Clash Display', 'Sora', sans-serif",
//     mono:    "'JetBrains Mono', 'DM Mono', monospace",
//     body:    "'Sora', sans-serif",
//   },
// };

// const PALETTE = ["#00d4aa","#38bdf8","#a78bfa","#f59e0b","#f43f5e","#34d399","#fb923c"];

// // ─── tiny helpers ─────────────────────────────────────────────────────────────
// const fmt  = (n) => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// const fcat = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
// const ICONS = { food_drink:"🍔", transport:"🚗", entertainment:"🎬", utilities:"⚡", shopping:"🛍️", health:"💊", travel:"✈️", income:"💵", other:"💳" };
// const icon  = (cat) => ICONS[(cat||"").toLowerCase().replace(/\s/g,"_")] ?? "💳";

// // ─── sub-components ───────────────────────────────────────────────────────────

// function Pill({ color, children }) {
//   return (
//     <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontFamily: T.fonts.mono, whiteSpace: "nowrap" }}>
//       {children}
//     </span>
//   );
// }

// function StatCard({ label, value, sub, accent = T.accent, delay = 0 }) {
//   return (
//     <div style={{
//       background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18,
//       padding: "22px 26px", position: "relative", overflow: "hidden",
//       animation: `fadeUp 0.5s ${delay}s both`,
//     }}>
//       <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background: accent, opacity:0.08, filter:"blur(28px)", pointerEvents:"none" }} />
//       <div style={{ fontSize:11, color: T.muted, fontFamily: T.fonts.mono, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
//       <div style={{ fontSize:26, fontWeight:700, fontFamily: T.fonts.display, color: T.text, lineHeight:1, marginBottom:4 }}>{value}</div>
//       {sub && <div style={{ fontSize:12, color: T.muted, fontFamily: T.fonts.mono }}>{sub}</div>}
//     </div>
//   );
// }

// const ChartTip = ({ active, payload }) => {
//   if (!active || !payload?.length) return null;
//   const p = payload[0];
//   return (
//     <div style={{ background:"#1a2235", border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", fontFamily: T.fonts.mono, fontSize:12, color: T.text }}>
//       <div style={{ color: T.subtle, marginBottom:2 }}>{p.payload?.category || p.payload?.month || p.name}</div>
//       <div style={{ color: T.accent, fontWeight:700 }}>{fmt(p.value)}</div>
//     </div>
//   );
// };

// // ─── AI Insights Panel ────────────────────────────────────────────────────────

// function InsightBadge({ type }) {
//   const map = { anomaly:[T.danger,"⚠︎"], warning:[T.warn,"◈"], tip:[T.accent,"◉"], forecast:[T.info,"◎"] };
//   const [color, sym] = map[type] || [T.subtle,"·"];
//   return <span style={{ color, fontWeight:700, marginRight:6, fontFamily: T.fonts.mono }}>{sym}</span>;
// }

// function AIInsightsPanel({ transactions, categoryBreakdown, burn, subscriptions }) {
//   const [insights, setInsights] = useState(null);
//   const [loading,  setLoading]  = useState(false);
//   const [error,    setError]    = useState(null);
//   const [open,     setOpen]     = useState(true);

//   const runInsights = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch("/api/ai-insights", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           summary: {
//             totalTransactions: transactions.length,
//             totalSpent: transactions.reduce((s,t) => s + t.amount, 0),
//             categoryBreakdown,
//             burnRate: burn,
//             subscriptionCount: subscriptions?.length ?? 0,
//             topMerchants: Object.entries(
//               transactions.reduce((acc, t) => { acc[t.merchant] = (acc[t.merchant]||0)+t.amount; return acc; }, {})
//             ).sort((a,b)=>b[1]-a[1]).slice(0,5),
//             recentTransactions: transactions.slice(0,10).map(t=>({ merchant:t.merchant, amount:t.amount, category:t.category, date:t.date })),
//           }
//         }),
//       });
//       const data = await res.json();
//       setInsights(data.insights);
//     } catch(e) {
//       setError("Could not load AI insights. Check your /api/ai-insights route.");
//     } finally {
//       setLoading(false);
//     }
//   }, [transactions, categoryBreakdown, burn, subscriptions]);

//   useEffect(() => { if (transactions?.length) runInsights(); }, []);

//   return (
//     <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.5s 0.3s both" }}>
//       {/* header */}
//       <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:`1px solid ${T.border}`, cursor:"pointer" }} onClick={() => setOpen(o=>!o)}>
//         <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//           <div style={{ width:28, height:28, borderRadius:8, background:`${T.accent}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✦</div>
//           <span style={{ fontWeight:700, fontSize:15, fontFamily: T.fonts.display }}>AI Financial Insights</span>
//           <Pill color={T.accent}>Claude</Pill>
//         </div>
//         <div style={{ display:"flex", gap:8, alignItems:"center" }}>
//           <button onClick={(e)=>{ e.stopPropagation(); runInsights(); }}
//             style={{ background:`${T.accent}12`, border:`1px solid ${T.accent}30`, borderRadius:8, padding:"5px 12px", color: T.accent, fontFamily: T.fonts.mono, fontSize:11, cursor:"pointer" }}>
//             {loading ? "Analysing…" : "↺ Refresh"}
//           </button>
//           <span style={{ color: T.muted, fontSize:18, fontFamily: T.fonts.mono }}>{open ? "−" : "+"}</span>
//         </div>
//       </div>

//       {open && (
//         <div style={{ padding:"20px 24px" }}>
//           {loading && (
//             <div style={{ display:"flex", alignItems:"center", gap:12, color: T.muted, fontFamily: T.fonts.mono, fontSize:13 }}>
//               <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>◌</span>
//               Claude is analysing your spending patterns…
//             </div>
//           )}
//           {error && <div style={{ color: T.danger, fontFamily: T.fonts.mono, fontSize:13 }}>{error}</div>}
//           {insights && !loading && (
//             <div style={{ display:"grid", gap:12 }}>
//               {insights.map((ins, i) => (
//                 <div key={i} style={{
//                   background: ins.type==="anomaly" ? `${T.danger}08` : ins.type==="warning" ? `${T.warn}08` : `${T.accent}06`,
//                   border: `1px solid ${ins.type==="anomaly" ? T.danger : ins.type==="warning" ? T.warn : T.accent}20`,
//                   borderRadius:12, padding:"14px 18px",
//                   animation:`fadeUp 0.4s ${i*0.08}s both`,
//                 }}>
//                   <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
//                     <InsightBadge type={ins.type} />
//                     <div>
//                       <div style={{ fontWeight:600, fontSize:14, color: T.text, marginBottom:3 }}>{ins.title}</div>
//                       <div style={{ fontSize:13, color: T.subtle, lineHeight:1.6 }}>{ins.description}</div>
//                       {ins.value && <div style={{ marginTop:6 }}><Pill color={ins.type==="anomaly"?T.danger:ins.type==="warning"?T.warn:T.accent}>{ins.value}</Pill></div>}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           {!insights && !loading && !error && (
//             <div style={{ color: T.muted, fontFamily: T.fonts.mono, fontSize:13 }}>No insights yet — click Refresh.</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Subscriptions Panel ──────────────────────────────────────────────────────

// function SubscriptionsPanel({ subscriptions }) {
//   if (!subscriptions?.length) return null;
//   const total = subscriptions.reduce((s,sub) => s + (sub.amount||0), 0);
//   return (
//     <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 24px" }}>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
//         <div style={{ fontWeight:700, fontSize:15, fontFamily: T.fonts.display }}>Recurring Subscriptions</div>
//         <Pill color={T.warn}>{fmt(total)}/mo</Pill>
//       </div>
//       <div style={{ display:"grid", gap:8 }}>
//         {subscriptions.map((sub,i) => (
//           <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10, border:`1px solid ${T.border}` }}>
//             <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//               <span style={{ fontSize:18 }}>{icon(sub.category)}</span>
//               <div>
//                 <div style={{ fontWeight:600, fontSize:13 }}>{sub.merchant}</div>
//                 <div style={{ fontSize:11, color: T.muted, fontFamily: T.fonts.mono }}>{fcat(sub.category)}</div>
//               </div>
//             </div>
//             <div style={{ fontFamily: T.fonts.mono, fontWeight:700, fontSize:14, color: T.warn }}>{fmt(sub.amount)}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Main Dashboard ───────────────────────────────────────────────────────────

// const PAGE_SIZE = 15;
// const TABS = ["overview","transactions","analytics","insights"];

// export default function DashboardPage() {
//   const [data,   setData]   = useState(null);
//   const [tab,    setTab]    = useState("overview");
//   const [search, setSearch] = useState("");
//   const [sort,   setSort]   = useState("date");
//   const [page,   setPage]   = useState(1);
//   const [syncing,setSyncing]= useState(false);

//   useEffect(() => {
//     fetch("/api/dashboard").then(r => r.json()).then(setData);
//   }, []);

//   useEffect(() => { setPage(1); }, [search]);

//   // ── derived ──
//   const totalSpent = useMemo(() =>
//     data?.transactions.reduce((s,t) => s + t.amount, 0) ?? 0
//   , [data]);

//   const filtered = useMemo(() => {
//     if (!data) return [];
//     return data.transactions.filter(t =>
//       t.merchant.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [data, search]);

//   const sorted = useMemo(() =>
//     [...filtered].sort((a,b) => sort==="amount"
//       ? b.amount - a.amount
//       : new Date(b.date) - new Date(a.date))
//   , [filtered, sort]);

//   const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
//   const paginated  = sorted.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

//   const handleSync = () => {
//     setSyncing(true);
//     fetch("/api/plaid/sync", { method:"POST" })
//       .then(() => fetch("/api/dashboard").then(r=>r.json()).then(setData))
//       .finally(() => setSyncing(false));
//   };

//   // ── loading ──
//   if (!data) return (
//     <div style={{ minHeight:"100vh", background: T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily: T.fonts.body, color: T.muted }}>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
//       <div style={{ textAlign:"center" }}>
//         <div style={{ fontSize:36, animation:"spin 1.1s linear infinite", marginBottom:16 }}>◌</div>
//         Loading your finances…
//       </div>
//     </div>
//   );

//   // ── monthly chart data from API ──
//   const monthlyData = data.monthlySummary ?? [];

//   return (
//     <div style={{ minHeight:"100vh", background: T.bg, fontFamily: T.fonts.body, color: T.text }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
//         *{box-sizing:border-box;margin:0;padding:0}
//         @keyframes spin{to{transform:rotate(360deg)}}
//         @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
//         @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
//         ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${T.bg}}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
//         input:focus{outline:none}
//         .nav-tab{background:none;border:none;cursor:pointer;padding:8px 18px;border-radius:999px;font-family:${T.fonts.body};font-size:13px;font-weight:600;letter-spacing:0.03em;transition:all 0.2s;color:${T.muted}}
//         .nav-tab.active{background:${T.accent};color:#030a0a}
//         .nav-tab:hover:not(.active){color:${T.text};background:rgba(255,255,255,0.05)}
//         .sort-btn{background:none;border:1px solid ${T.border};cursor:pointer;padding:6px 14px;border-radius:8px;font-family:${T.fonts.mono};font-size:12px;color:${T.muted};transition:all 0.18s}
//         .sort-btn.active{border-color:${T.accent};color:${T.accent};background:${T.accent}10}
//         .sort-btn:hover{border-color:${T.accent};color:${T.accent}}
//         .pg-btn{background:rgba(255,255,255,0.03);border:1px solid ${T.border};cursor:pointer;width:30px;height:30px;border-radius:8px;color:${T.muted};font-size:13px;transition:all 0.15s;display:flex;align-items:center;justify-content:center}
//         .pg-btn:hover:not(:disabled){background:${T.accent}20;border-color:${T.accent};color:${T.accent}}
//         .pg-btn:disabled{opacity:0.25;cursor:default}
//         .tx-row td{padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.12s}
//         .tx-row:hover td{background:rgba(255,255,255,0.025)}
//         .sync-btn{background:rgba(255,255,255,0.04);border:1px solid ${T.border};borderRadius:10px;padding:7px 16px;cursor:pointer;color:${T.text};font-family:${T.fonts.mono};font-size:12px;display:flex;align-items:center;gap:6px;transition:all 0.2s;border-radius:10px}
//         .sync-btn:hover{border-color:${T.accent};color:${T.accent}}
//       `}</style>

//       {/* ── header ── */}
//       <header style={{ height:62, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", position:"sticky", top:0, zIndex:100, background:"rgba(8,12,20,0.88)", backdropFilter:"blur(14px)" }}>
//         <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//           <div style={{ width:30, height:30, borderRadius:9, background: T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>◈</div>
//           <span style={{ fontWeight:700, fontSize:17, fontFamily: T.fonts.display, letterSpacing:"-0.02em" }}>FinanceAI</span>
//         </div>
//         <nav style={{ display:"flex", gap:3, background:"rgba(255,255,255,0.03)", padding:4, borderRadius:999, border:`1px solid ${T.border}` }}>
//           {TABS.map(t => (
//             <button key={t} className={`nav-tab${tab===t?" active":""}`} onClick={() => setTab(t)}>
//               {t === "insights" ? "✦ " : ""}{t.charAt(0).toUpperCase()+t.slice(1)}
//             </button>
//           ))}
//         </nav>
//         <div style={{ display:"flex", gap:10, alignItems:"center" }}>
//           <button className="sync-btn" onClick={handleSync} disabled={syncing}>
//             <span style={{ display:"inline-block", animation: syncing?"spin 0.7s linear infinite":"none", fontSize:15 }}>⟳</span>
//             {syncing ? "Syncing…" : "Sync Plaid"}
//           </button>
//           <div style={{ width:33, height:33, borderRadius:"50%", background:`linear-gradient(135deg,${T.accent},#3b82f6)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#030a0a" }}>
//             {(data.user?.name?.[0] ?? "U")}
//           </div>
//         </div>
//       </header>

//       <main style={{ maxWidth:1220, margin:"0 auto", padding:"32px 22px" }}>

//         {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
//         {tab === "overview" && (
//           <div>
//             <div style={{ marginBottom:28, animation:"fadeUp 0.4s both" }}>
//               <div style={{ fontSize:12, color: T.muted, fontFamily: T.fonts.mono, marginBottom:5, letterSpacing:"0.08em" }}>DASHBOARD</div>
//               <h1 style={{ fontSize:30, fontWeight:700, fontFamily: T.fonts.display, letterSpacing:"-0.03em" }}>
//                 Welcome back<span style={{ color: T.accent }}>.</span>
//               </h1>
//             </div>

//             {/* stat cards */}
//             <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:22 }}>
//               <StatCard label="Net Worth"      value={fmt(data.netWorth)}       sub="all linked accounts"  accent={T.accent} delay={0}    />
//               <StatCard label="Total Spent"    value={fmt(totalSpent)}           sub={`${data.transactions.length} transactions`} accent="#f43f5e" delay={0.07} />
//               <StatCard label="Burn Rate"      value={fmt(data.burn?.daily??0)+"/day"} sub={`~${fmt(data.burn?.projected??0)} projected`} accent={T.warn} delay={0.14} />
//               <StatCard label="Subscriptions"  value={`${data.subscriptions?.length ?? 0} active`} sub={fmt(data.subscriptions?.reduce((s,x)=>s+(x.amount||0),0)??0)+"/mo"} accent="#a78bfa" delay={0.21} />
//             </div>

//             {/* charts */}
//             <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:22 }}>
//               {/* spending pie */}
//               <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 24px", animation:"fadeUp 0.5s 0.2s both" }}>
//                 <div style={{ fontWeight:700, fontSize:14, marginBottom:18, color: T.text }}>Spending by Category</div>
//                 <ResponsiveContainer width="100%" height={210}>
//                   <PieChart>
//                     <Pie data={data.categoryBreakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={85} innerRadius={48} paddingAngle={3}>
//                       {data.categoryBreakdown.map((_,i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]} />)}
//                     </Pie>
//                     <Tooltip content={<ChartTip />} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", marginTop:10 }}>
//                   {data.categoryBreakdown.map((c,i) => (
//                     <span key={i} style={{ fontSize:11, color: T.muted, fontFamily: T.fonts.mono, display:"flex", alignItems:"center", gap:5 }}>
//                       <span style={{ width:7, height:7, borderRadius:"50%", background: PALETTE[i%PALETTE.length], display:"inline-block" }} />
//                       {fcat(c.category)}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               {/* monthly area */}
//               <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 24px", animation:"fadeUp 0.5s 0.27s both" }}>
//                 <div style={{ fontWeight:700, fontSize:14, marginBottom:18, color: T.text }}>Monthly Spending</div>
//                 <ResponsiveContainer width="100%" height={210}>
//                   <AreaChart data={monthlyData}>
//                     <defs>
//                       <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%"  stopColor={T.accent} stopOpacity={0.25} />
//                         <stop offset="95%" stopColor={T.accent} stopOpacity={0}    />
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
//                     <XAxis dataKey="month" tick={{ fill: T.muted, fontSize:11, fontFamily: T.fonts.mono }} axisLine={false} tickLine={false} />
//                     <YAxis tick={{ fill: T.muted, fontSize:11, fontFamily: T.fonts.mono }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
//                     <Tooltip content={<ChartTip />} />
//                     <Area type="monotone" dataKey="amount" stroke={T.accent} strokeWidth={2.5} fill="url(#areaGrad)" />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* burn rate progress */}
//             {data.burn && (
//               <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 24px", animation:"fadeUp 0.5s 0.33s both" }}>
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
//                   <div style={{ fontWeight:700, fontSize:14 }}>Burn Rate — Month Progress</div>
//                   <Pill color={T.warn}>{fmt(data.burn.projected)} projected</Pill>
//                 </div>
//                 <div style={{ height:8, background:"rgba(255,255,255,0.05)", borderRadius:999 }}>
//                   <div style={{
//                     width:`${Math.min(100, (data.burn.spent / data.burn.projected) * 100)}%`,
//                     height:"100%", borderRadius:999,
//                     background:`linear-gradient(90deg,${T.accent},${T.warn})`,
//                     transition:"width 0.8s ease",
//                   }} />
//                 </div>
//                 <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontFamily: T.fonts.mono, fontSize:11, color: T.muted }}>
//                   <span>Spent: {fmt(data.burn.spent)}</span>
//                   <span>Daily avg: {fmt(data.burn.daily)}</span>
//                   <span>Projected: {fmt(data.burn.projected)}</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ══ TRANSACTIONS ══════════════════════════════════════════════════ */}
//         {tab === "transactions" && (
//           <div style={{ animation:"fadeUp 0.4s both" }}>
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, flexWrap:"wrap", gap:12 }}>
//               <h2 style={{ fontWeight:700, fontSize:22, fontFamily: T.fonts.display }}>
//                 Transactions <span style={{ color: T.muted, fontSize:14, fontWeight:400, fontFamily: T.fonts.mono }}>({filtered.length})</span>
//               </h2>
//               <div style={{ display:"flex", gap:8, alignItems:"center" }}>
//                 <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search merchant…"
//                   style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, borderRadius:10, padding:"8px 14px", color: T.text, fontFamily: T.fonts.mono, fontSize:12, width:200 }} />
//                 <button className={`sort-btn${sort==="date"?" active":""}`}   onClick={()=>setSort("date")}>Date</button>
//                 <button className={`sort-btn${sort==="amount"?" active":""}`} onClick={()=>setSort("amount")}>Amount</button>
//               </div>
//             </div>

//             <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, overflow:"hidden" }}>
//               <table style={{ width:"100%", borderCollapse:"collapse" }}>
//                 <thead>
//                   <tr style={{ borderBottom:`1px solid ${T.border}` }}>
//                     {["Merchant","Category","Date","Amount"].map(h => (
//                       <th key={h} style={{ padding:"13px 18px", textAlign:"left", fontSize:10, color: T.muted, fontFamily: T.fonts.mono, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:500 }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginated.map(t => (
//                     <tr key={t.id} className="tx-row">
//                       <td style={{ padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}>
//                         <span style={{ fontSize:18 }}>{icon(t.category)}</span>
//                         <span style={{ fontWeight:600, fontSize:14 }}>{t.merchant}</span>
//                       </td>
//                       <td style={{ padding:"12px 18px" }}><Pill color={PALETTE[Object.keys(ICONS).indexOf(t.category?.toLowerCase()?.replace(/\s/g,"_"))%PALETTE.length]||T.subtle}>{fcat(t.category)}</Pill></td>
//                       <td style={{ padding:"12px 18px", color: T.muted, fontFamily: T.fonts.mono, fontSize:12 }}>{new Date(t.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
//                       <td style={{ padding:"12px 18px", fontFamily: T.fonts.mono, fontWeight:700, color: T.text }}>−{fmt(t.amount)}</td>
//                     </tr>
//                   ))}
//                   {!paginated.length && (
//                     <tr><td colSpan={4} style={{ padding:36, textAlign:"center", color: T.muted, fontFamily: T.fonts.mono, fontSize:13 }}>No results found.</td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* pagination */}
//             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
//               <span style={{ color: T.muted, fontSize:12, fontFamily: T.fonts.mono }}>
//                 Page {page} of {totalPages||1} · {sorted.length} results
//               </span>
//               <div style={{ display:"flex", gap:5 }}>
//                 <button className="pg-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}>‹</button>
//                 {Array.from({length:Math.min(5,totalPages)},(_,i) => {
//                   const p = Math.max(1, Math.min(page-2, totalPages-4))+i;
//                   return (
//                     <button key={p} className="pg-btn" onClick={()=>setPage(p)}
//                       style={{ background:p===page?`${T.accent}20`:undefined, borderColor:p===page?T.accent:undefined, color:p===page?T.accent:undefined }}>
//                       {p}
//                     </button>
//                   );
//                 })}
//                 <button className="pg-btn" onClick={()=>setPage(p=>p+1)} disabled={page>=totalPages}>›</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ══ ANALYTICS ════════════════════════════════════════════════════ */}
//         {tab === "analytics" && (
//           <div style={{ animation:"fadeUp 0.4s both" }}>
//             <h2 style={{ fontWeight:700, fontSize:22, fontFamily: T.fonts.display, marginBottom:22 }}>Analytics</h2>

//             <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:20 }}>
//               {data.categoryBreakdown.map((c,i) => {
//                 const pct = Math.round((c.total/totalSpent)*100);
//                 return (
//                   <div key={i} style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"18px 20px" }}>
//                     <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
//                       <span style={{ fontSize:22 }}>{icon(c.category)}</span>
//                       <span style={{ fontFamily: T.fonts.mono, fontSize:11, color: T.muted }}>{pct}%</span>
//                     </div>
//                     <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{fcat(c.category)}</div>
//                     <div style={{ fontFamily: T.fonts.mono, fontSize:20, fontWeight:700, color: PALETTE[i%PALETTE.length], marginBottom:12 }}>{fmt(c.total)}</div>
//                     <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:999 }}>
//                       <div style={{ width:`${pct}%`, height:"100%", background: PALETTE[i%PALETTE.length], borderRadius:999, transition:"width 0.7s ease" }} />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div style={{ background: T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:"22px 24px", marginBottom:20 }}>
//               <div style={{ fontWeight:700, fontSize:14, marginBottom:18 }}>Category Breakdown</div>
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart data={data.categoryBreakdown.map(c=>({...c,name:fcat(c.category)}))} barSize={30}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
//                   <XAxis dataKey="name" tick={{ fill: T.muted, fontSize:11, fontFamily: T.fonts.mono }} axisLine={false} tickLine={false} />
//                   <YAxis tick={{ fill: T.muted, fontSize:11, fontFamily: T.fonts.mono }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
//                   <Tooltip content={<ChartTip />} />
//                   <Bar dataKey="total" radius={[6,6,0,0]}>
//                     {data.categoryBreakdown.map((_,i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]} />)}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             <SubscriptionsPanel subscriptions={data.subscriptions} />
//           </div>
//         )}

//         {/* ══ INSIGHTS ═════════════════════════════════════════════════════ */}
//         {tab === "insights" && (
//           <div style={{ animation:"fadeUp 0.4s both" }}>
//             <div style={{ marginBottom:24 }}>
//               <h2 style={{ fontWeight:700, fontSize:22, fontFamily: T.fonts.display }}>AI Insights <span style={{ color: T.accent }}>✦</span></h2>
//               <p style={{ color: T.muted, fontSize:13, fontFamily: T.fonts.mono, marginTop:4 }}>Powered by Claude — analyses your real Plaid transaction data</p>
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


// /*
// ═══════════════════════════════════════════════════════════════════════════════
//   COMPANION ROUTE: app/api/ai-insights/route.ts
//   Create this file in your project. It receives the spending summary from
//   the dashboard and returns structured Claude insights.
// ═══════════════════════════════════════════════════════════════════════════════

// import { NextResponse } from "next/server";
// import Anthropic from "@anthropic-ai/sdk";

// const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var

// export async function POST(req: Request) {
//   const { summary } = await req.json();

//   const prompt = `You are a sharp personal finance analyst. Analyse this user's spending data and return ONLY a JSON array of insight objects. No preamble, no markdown, just the raw JSON array.

// Each insight object must have:
// - "type": one of "anomaly" | "warning" | "tip" | "forecast"
// - "title": short headline (max 8 words)
// - "description": 1-2 sentence explanation with specific numbers
// - "value": optional short badge label (e.g. "$240 overspent", "+18% vs last month")

// Rules:
// - anomaly: unusually high single charges or merchants
// - warning: category overspend, high burn rate, subscription creep
// - tip: actionable saving opportunity
// - forecast: projected spend trajectory

// Spending data:
// ${JSON.stringify(summary, null, 2)}

// Return 4-6 insights. JSON array only.`;

//   const message = await client.messages.create({
//     model: "claude-sonnet-4-6",
//     max_tokens: 1024,
//     messages: [{ role: "user", content: prompt }],
//   });

//   const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
//   const clean = raw.replace(/```json|```/g, "").trim();
//   const insights = JSON.parse(clean);

//   return NextResponse.json({ insights });
// }
// */
