'use client'

import { ShieldCheck, Lock, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function SecuritySection() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const features = [
        {
            icon: <Lock className="w-6 h-6 text-cyan-400" />,
            title: "Bank-Level Encryption",
            description: "Your data is protected with AES-256-GCM encryption, the same standard used by major financial institutions worldwide.",
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
            title: "Trusted by Millions",
            description: "We partner with Plaid to securely connect your accounts. We never see or store your bank login credentials.",
        },
        {
            icon: <EyeOff className="w-6 h-6 text-cyan-400" />,
            title: "Read-Only Access",
            description: "We can only view your transaction data. We cannot move money or perform any actions on your accounts.",
        },
        {
            icon: <KeyRound className="w-6 h-6 text-cyan-400" />,
            title: "Zero-Knowledge Security",
            description: "Sensitive tokens are encrypted before they hit our database. Even our engineers can't access your raw account tokens.",
        },
    ]

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">Enterprise-Grade Security</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Your security is our <br />
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            top priority
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        We build with a security-first mindset. From data transit to storage, your financial information remains private and protected.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-2xl bg-secondary/30 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group animate-fade-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-8 rounded-3xl bg-cyan-900/10 border border-cyan-500/20 flex flex-col items-center text-center">
                    <div className="flex gap-8 mb-8 flex-wrap justify-center opacity-70">
                        {/* Logos represent trust, can use text if images aren't ready */}
                        <div className="flex items-center gap-2 text-white font-bold opacity-80 italic">
                            <Lock className="w-5 h-5 text-cyan-400" /> SOC2 COMPLIANT
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold opacity-80 italic">
                            <ShieldCheck className="w-5 h-5 text-cyan-400" /> GDPR READY
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold opacity-80 italic">
                            <Lock className="w-5 h-5 text-cyan-400" /> 256-BIT AES
                        </div>
                    </div>
                    <p className="text-sm text-cyan-200/60 max-w-xl">
                        We use industry-standard protocols and undergo regular security audits to ensure your data stays where it belongs: with you.
                    </p>
                </div>
            </div>
        </section>
    )
}
