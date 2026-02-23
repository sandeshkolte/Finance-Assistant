'use client';

import { useState } from 'react';
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { SecuritySection } from "@/components/security-section";
import { DashboardPreview } from "@/components/dashboard-preview";
import { CTASection } from "@/components/cta-section";
import { UploadStatement } from "@/components/UploadStatement";
import { Sparkles, X, LayoutDashboard, Wallet, TrendingDown, Leaf, Target, ShieldCheck, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from 'next/link';
import { clsx } from 'clsx';

export function LandingPageClient() {
    const [demoData, setDemoData] = useState<any>(null);

    const fmt = (val: any) => {
        const n = typeof val === 'string' ? parseFloat(val) : (val ?? 0);
        return "$" + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const COLORS = ['#22d3ee', '#3b82f6', '#818cf8', '#a78bfa', '#f472b6'];

    return (
        <div className="pt-16">
            {!demoData ? (
                <>
                    <Hero onDemoReset={() => setDemoData(null)} />

                    {/* Floating Demo Trigger */}
                    <div className="flex justify-center -mt-12 mb-12 relative z-20">
                        <div className="p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-2xl shadow-cyan-500/20 group">
                            <div className="bg-black rounded-[23px] p-8 flex flex-col items-center gap-6 transition-all group-hover:bg-slate-900/40">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold text-white">Experience the Engine</h3>
                                        <p className="text-slate-400 text-sm">Upload a PDF or CSV statement. No sync required.</p>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-white/5" />
                                <UploadStatement isDemo={true} onSuccess={(data) => setDemoData(data)} />
                            </div>
                        </div>
                    </div>

                    <Features />
                    <SecuritySection />
                    <DashboardPreview />
                </>
            ) : (
                <div className="animate-fade-up px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto space-y-8">
                    {/* Header with Exit & Save */}
                    <div className="flex items-center justify-between flex-wrap gap-4 bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <LayoutDashboard className="text-black w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Guest Insight Report</h1>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                                    <p className="text-cyan-400/80 text-[10px] font-mono tracking-widest uppercase">Privacy Mode Active • Zero Data Saved</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/sign-up" className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                                Save Full Report
                            </Link>
                            <button
                                onClick={() => setDemoData(null)}
                                title="Exit Demo"
                                className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-slate-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl bg-secondary/20 border border-white/5 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <Wallet className="text-emerald-400 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-mono mb-1 uppercase tracking-wider">Estimated Balance</p>
                                <p className="text-2xl font-bold text-white tracking-tight">{fmt(demoData.netWorth)}</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-secondary/20 border border-white/5 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                <TrendingDown className="text-rose-400 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-mono mb-1 uppercase tracking-wider">Monthly Spend</p>
                                <p className="text-2xl font-bold text-white tracking-tight text-rose-400">-{fmt(demoData.burn.spent)}</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-3xl bg-secondary/20 border border-white/5 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                                <PieIcon className="text-cyan-400 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-mono mb-1 uppercase tracking-wider">Top Category</p>
                                <p className="text-2xl font-bold text-white tracking-tight">
                                    {demoData.categoryBreakdown?.[0]?.name || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Insight Highlights */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Safe to Spend */}
                        <div className="group relative overflow-hidden p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-2xl">
                            <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.45rem] p-10 h-full border border-white/5 relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-slate-400 text-xs font-mono font-bold tracking-[0.2em] uppercase">Proactive Forecast</h3>
                                </div>
                                {demoData.insights.filter((i: any) => i.type === 'goal').map((insight: any, idx: number) => (
                                    <div key={idx} className="space-y-4">
                                        <p className="text-6xl font-black text-white tracking-tighter transition-all group-hover:scale-105 origin-left duration-500 inline-block">
                                            {insight.value}
                                            <span className="text-lg text-blue-500 ml-2">/day</span>
                                        </p>
                                        <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
                                            {insight.description}
                                        </p>
                                    </div>
                                ))}
                                <div className="mt-12 pt-8 border-t border-white/5">
                                    <p className="text-xs text-slate-500 italic">"Based on your disposable income and a 20% savings target."</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px]" />
                        </div>

                        {/* Carbon Footprint */}
                        <div className="group relative overflow-hidden p-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 shadow-2xl">
                            <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.45rem] p-10 h-full border border-white/5 relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Leaf className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <h3 className="text-slate-400 text-xs font-mono font-bold tracking-[0.2em] uppercase">Eco Ledger v1.0</h3>
                                </div>
                                {demoData.insights.filter((i: any) => i.type === 'carbon').map((insight: any, idx: number) => (
                                    <div key={idx} className="space-y-4">
                                        <p className="text-6xl font-black text-emerald-400 tracking-tighter transition-all group-hover:scale-105 origin-left duration-500 inline-block">
                                            {insight.value}
                                        </p>
                                        <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
                                            {insight.description}
                                        </p>
                                    </div>
                                ))}
                                <div className="mt-12 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-3/4 animate-pulse" />
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />
                        </div>
                    </div>

                    {/* Chart & Spending Mix */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 p-8 rounded-[2rem] bg-secondary/10 border border-white/5">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                                Monthly Spending Mix
                            </h3>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={demoData.categoryBreakdown?.slice(0, 5)}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="demoColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-secondary/10 border border-white/5">
                            <h3 className="text-white font-bold mb-6">Subscription Leakage</h3>
                            <div className="space-y-4">
                                {demoData.subscriptions?.map((sub: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.06] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                                                {sub.merchant[0]}
                                            </div>
                                            <p className="text-sm font-medium text-slate-200">{sub.merchant}</p>
                                        </div>
                                        <p className="text-white font-bold">{fmt(sub.amount)}</p>
                                    </div>
                                ))}
                                {(!demoData.subscriptions || demoData.subscriptions.length === 0) && (
                                    <p className="text-slate-500 text-sm italic text-center py-10">No recurring subscriptions detected.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Final Conversion card */}
                    <div className="mt-20 relative px-8 py-20 rounded-[3rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 overflow-hidden text-center">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                                Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Live Dashboard</span>
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                                Join 50,000+ users saving an average of $350/mo. Connect your bank live for automated tracking, deeper AI advice, and instant fraud alerts.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/sign-up" className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 hover:shadow-2xl shadow-white/10 transition-all active:scale-95">
                                    Create My Dashboard
                                </Link>
                                <button
                                    onClick={() => setDemoData(null)}
                                    className="px-10 py-4 bg-white/5 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                                >
                                    Dismiss Report
                                </button>
                            </div>
                        </div>
                        {/* Design elements */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    </div>
                </div>
            )}
            <CTASection />
        </div>
    );
}

// Re-importing specific chart components needed for the demo
const AreaChart = BarChart;

