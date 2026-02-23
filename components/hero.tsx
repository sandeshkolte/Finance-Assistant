'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeroProps {
  onDemoReset?: () => void;
}

export function Hero({ onDemoReset }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-48">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Announcement Badge */}
        <div className={`flex justify-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">New: AI-powered expense insights</span>
          </div>
        </div>

        {/* Main heading */}
        <div className={`text-center transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-pretty leading-tight">
            Your money,
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              finally understood
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Connect your bank in seconds. Get instant insights into spending, automate budgets, and make smarter financial decisions with AI-powered analytics.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Button
            size="lg"
            className="px-8 h-12 rounded-full bg-white text-background hover:bg-gray-100 font-semibold text-base transition-all hover:shadow-lg hover:shadow-white/20 group"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 rounded-full border-secondary bg-transparent hover:bg-secondary/50 text-white font-semibold text-base"
          >
            Watch Demo
          </Button>
        </div>

        {/* Quick Trust Badges */}
        <div className={`flex justify-center items-center gap-6 mt-10 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Bank-Grade Security
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
            <Lock className="w-4 h-4 text-cyan-400" /> AES-256 Encrypted
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> SOC2 Compliant
          </div>
        </div>


        {/* Trust indicators */}
        <div className={`mt-16 pt-16 border-t border-secondary transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-center text-muted-foreground text-sm mb-6">Trusted by 50,000+ users</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {['Secure', 'Fast', 'Private', 'Smart'].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
