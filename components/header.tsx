'use client'

import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-secondary">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-background">
            F
          </div>
          <span className="text-xl font-bold text-white hidden sm:inline">FinFlow</span>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
            Pricing
          </a>
          <a href="#" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
            Docs
          </a>
          <a href="#" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
            Blog
          </a>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:bg-secondary/20">
            Sign In
          </Button>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-background font-semibold rounded-lg">
            Get Started
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-secondary/20 rounded-lg transition-colors"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-secondary bg-background/95 backdrop-blur">
          <div className="px-4 py-4 space-y-4">
            <a href="#features" className="block text-muted-foreground hover:text-white transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#pricing" className="block text-muted-foreground hover:text-white transition-colors text-sm font-medium">
              Pricing
            </a>
            <a href="#" className="block text-muted-foreground hover:text-white transition-colors text-sm font-medium">
              Docs
            </a>
            <a href="#" className="block text-muted-foreground hover:text-white transition-colors text-sm font-medium">
              Blog
            </a>
            <div className="pt-4 space-y-2 border-t border-secondary">
              <Button variant="ghost" className="w-full text-white hover:bg-secondary/20">
                Sign In
              </Button>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-background font-semibold rounded-lg">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
