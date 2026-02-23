'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowUpRight, ArrowDownLeft, DollarSign, TrendingDown } from 'lucide-react'

const monthlyData = [
  { month: 'Jan', income: 4500, expenses: 2400 },
  { month: 'Feb', income: 5200, expenses: 2800 },
  { month: 'Mar', income: 4800, expenses: 2200 },
  { month: 'Apr', income: 5500, expenses: 3000 },
  { month: 'May', income: 6000, expenses: 2900 },
  { month: 'Jun', income: 5800, expenses: 3200 },
]

const categoryData = [
  { name: 'Food', value: 1200, color: '#ff6b6b' },
  { name: 'Transport', value: 800, color: '#4ecdc4' },
  { name: 'Entertainment', value: 600, color: '#95e1d3' },
  { name: 'Other', value: 400, color: '#2d3d5f' },
]

export function DashboardPreview() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-pretty">
            See your finances at a glance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time dashboard with actionable insights to help you make better financial decisions.
          </p>
        </div>

        {/* Main dashboard card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative bg-secondary/30 backdrop-blur border border-secondary rounded-2xl p-8 overflow-hidden">
            {/* Top stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Balance', value: '$24,580', trend: '+12%', color: 'text-cyan-400', icon: DollarSign },
                { label: 'Monthly Income', value: '$5,800', trend: '+8%', color: 'text-green-400', icon: ArrowDownLeft },
                { label: 'Monthly Spend', value: '$3,100', trend: '-5%', color: 'text-orange-400', icon: ArrowUpRight },
                { label: 'Savings Rate', value: '46.6%', trend: '+2%', color: 'text-purple-400', icon: TrendingDown },
              ].map((stat, idx) => {
                const IconComp = stat.icon
                return (
                  <div key={idx} className="bg-secondary/40 border border-secondary rounded-lg p-4 group/card hover:bg-secondary/60 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground text-sm">{stat.label}</span>
                      <IconComp className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.trend.includes('+') ? 'text-green-400' : 'text-orange-400'}`}>
                      {stat.trend} vs last month
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Income vs Expenses Chart */}
              <div className="lg:col-span-2 bg-secondary/20 rounded-lg p-6 border border-secondary">
                <h3 className="text-white font-semibold mb-4">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
                    <XAxis dataKey="month" stroke="#8a96b5" />
                    <YAxis stroke="#8a96b5" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3d5f', borderRadius: '8px' }}
                      labelStyle={{ color: '#f0f4ff' }}
                    />
                    <Bar dataKey="income" fill="#00d4ff" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Spending by Category */}
              <div className="bg-secondary/20 rounded-lg p-6 border border-secondary">
                <h3 className="text-white font-semibold mb-4">Spending Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #2d3d5f', borderRadius: '8px' }}
                      labelStyle={{ color: '#f0f4ff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="mt-6 bg-secondary/20 rounded-lg p-6 border border-secondary">
              <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[
                  { name: 'Whole Foods Market', category: 'Groceries', amount: '-$124.50', time: '2 hours ago' },
                  { name: 'Uber', category: 'Transport', amount: '-$28.75', time: '5 hours ago' },
                  { name: 'Netflix', category: 'Entertainment', amount: '-$15.99', time: '1 day ago' },
                  { name: 'Salary Deposit', category: 'Income', amount: '+$5,800.00', time: '3 days ago' },
                ].map((txn, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-colors">
                    <div>
                      <p className="text-white font-medium text-sm">{txn.name}</p>
                      <p className="text-muted-foreground text-xs">{txn.category} • {txn.time}</p>
                    </div>
                    <p className={`font-semibold text-sm ${txn.amount.includes('+') ? 'text-green-400' : 'text-orange-400'}`}>
                      {txn.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
