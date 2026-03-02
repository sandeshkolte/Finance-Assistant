"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

function SetuCallbackInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Finalizing your connection...");

    useEffect(() => {
        // Setu v2 usually passes the consent ID as 'id' in the redirect
        const consentId = searchParams.get("id") || searchParams.get("consentId");

        if (!consentId) {
            setStatus("error");
            setMessage("Connection identifier missing. Please try again.");
            return;
        }

        const syncData = async () => {
            try {
                const res = await fetch("/api/bank/setu/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ consentId }),
                });

                const data = await res.json();

                if (data.success) {
                    setStatus("success");
                    setMessage("Bank successfully connected! Syncing your latest records...");
                    setTimeout(() => router.push("/dashboard"), 2000);
                }
                //  else {
                //     throw Error(data.error || "Sync failed");
                // }
            } catch (error: any) {
                console.error("Sync Error:", error);
                setStatus("error");
                setMessage(error.message || "Failed to sync bank data. Please try again.");
            }
        };

        syncData();
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] text-white p-6">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-10 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Decorative border animation could go here */}

                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    {status === "loading" && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
                        </div>
                    )}

                    {status === "success" && (
                        <div className="bg-emerald-500/20 p-4 rounded-full">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-500" />
                        </div>
                    )}

                    {status === "error" && (
                        <div className="bg-rose-500/20 p-4 rounded-full">
                            <AlertCircle className="w-16 h-16 text-rose-500 animate-in shake duration-500" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {status === "loading" ? "Secure Connection" :
                                status === "success" ? "All Set!" : "Connection Issue"}
                        </h1>
                        <p className={`text-sm ${status === "error" ? "text-rose-400" : "text-gray-400"}`}>
                            {message}
                        </p>
                    </div>

                    {status === "error" && (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-medium transition-all"
                        >
                            Back to Dashboard
                        </button>
                    )}
                </div>
            </div>

            <p className="mt-8 text-white/30 text-xs uppercase tracking-widest font-medium">
                Powered by Setu AA & Secure-SaaS
            </p>
        </div>
    );
}

export default function SetuCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0b] text-white p-6 text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400 font-mono text-sm">Initializing callback session...</p>
            </div>
        }>
            <SetuCallbackInner />
        </Suspense>
    );
}
