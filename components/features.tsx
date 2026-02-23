'use client'

import { TrendingUp, Zap, Shield, BarChart3, Brain, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'

const features = [
  {
    icon: Zap,
    title: 'Instant Connection',
    description: 'Connect any bank or credit card in seconds with Plaid. Your data stays encrypted and private.',
    color: 'from-cyan-400 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Visualize your spending patterns with beautiful charts. Understand where your money goes at a glance.',
    color: 'from-blue-400 to-blue-500',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Get intelligent recommendations to reduce expenses and reach your financial goals faster.',
    color: 'from-purple-400 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Budget Tracking',
    description: 'Set spending limits by category and get real-time alerts when you\'re approaching your budget.',
    color: 'from-green-400 to-green-500',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Military-grade encryption protects your financial data. We never store your bank credentials.',
    color: 'from-orange-400 to-orange-500',
  },
  {
    icon: Lock,
    title: 'Total Privacy',
    description: 'Your data is yours. We don\'t sell or share your information with anyone. Ever.',
    color: 'from-red-400 to-red-500',
  },
]

export function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])

  useEffect(() => {
    features.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards((prev) => [...prev, index])
      }, index * 100)
    })
  }, [])

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-pretty">
            Everything you need to take control
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to simplify your finances and help you make better decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isVisible = visibleCards.includes(index)

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl p-6 border border-secondary bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>

                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
