'use client'

import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'Forever',
    description: 'Perfect for getting started',
    features: [
      'Connect 1 bank account',
      'Transaction history (30 days)',
      'Basic spending analytics',
      'Email support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious money management',
    features: [
      'Unlimited bank accounts',
      'Full transaction history',
      'Advanced AI insights',
      'Custom budgets & alerts',
      'Investment tracking',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Family',
    price: '$14.99',
    period: '/month',
    description: 'Manage family finances together',
    features: [
      'Everything in Pro',
      'Up to 5 family members',
      'Shared budgets',
      'Allowance tracking',
      'Financial goals',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
]

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-pretty">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade anytime. No hidden fees or surprise charges.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group overflow-hidden rounded-xl transition-all duration-300 ${
                plan.highlighted
                  ? 'md:scale-105 border-2 border-cyan-500/50'
                  : 'border border-secondary'
              }`}
            >
              {/* Hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className={`p-8 ${plan.highlighted ? 'bg-secondary/40' : 'bg-secondary/20'}`}>
                {plan.highlighted && (
                  <div className="inline-block mb-4 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-2">{plan.period}</span>
                </div>

                <Button
                  className={`w-full mb-8 rounded-lg font-semibold transition-all group/btn ${
                    plan.highlighted
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-background'
                      : 'bg-secondary/50 hover:bg-secondary text-white border border-secondary'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently asked questions</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Is my bank information secure?',
                a: 'Yes. We use industry-standard encryption and never store your banking credentials. We use Plaid, the same technology banks use.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Of course! No contracts, no commitments. Cancel your subscription anytime with one click.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes. We offer a 30-day money-back guarantee if you\'re not satisfied with our service.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-secondary/20 border border-secondary rounded-lg p-6 hover:bg-secondary/30 transition-colors">
                <h4 className="text-white font-semibold mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
