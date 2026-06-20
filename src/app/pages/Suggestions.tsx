import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  TrendingDown, Brain, Target, AlertTriangle, Star,
  ShieldAlert, Tv, Utensils, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Progress } from '../components/ui/progress';

// ─── Custom dark tooltip for area chart ──────────────────────────────────────
const AreaTooltip = ({ active, payload, label, currencySymbol }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 text-xs mb-1.5 font-medium">Day {label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
        <span className="text-zinc-300 text-xs">Spent:</span>
        <span className="text-blue-400 text-xs font-semibold">{currencySymbol}{Number(payload[0].value).toFixed(2)}</span>
      </div>
    </div>
  );
};

// ─── helpers ────────────────────────────────────────────────────────────────

const REFERENCE_DATE = new Date(2026, 5, 20); // June 20, 2026

function monthKey(offset = 0) {
  const d = new Date(REFERENCE_DATE);
  d.setMonth(d.getMonth() - offset);
  return d.toISOString().substring(0, 7);
}

function monthLabel(offset = 0) {
  const d = new Date(REFERENCE_DATE);
  d.setMonth(d.getMonth() - offset);
  return d.toLocaleString('default', { month: 'short' });
}

function dayOfMonth() {
  return REFERENCE_DATE.getDate();
}

function daysInMonth() {
  const d = new Date(REFERENCE_DATE.getFullYear(), REFERENCE_DATE.getMonth() + 1, 0);
  return d.getDate();
}

// ─── Financial Score ────────────────────────────────────────────────────────

function computeScore(
  transactions: any[],
  budgets: any[],
): { score: number; grade: string; color: string; factors: { label: string; points: number; max: number; tip: string }[] } {
  const cm = monthKey(0);

  const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(cm)).reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(cm)).reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? (income - expense) / income : 0;

  // Factor 1: Savings rate (0-30 pts)
  const savingsPts = Math.min(30, Math.round(savingsRate * 100));

  // Factor 2: Budget adherence (0-30 pts)
  const expByCategory = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(cm))
    .reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a; }, {} as Record<string, number>);
  const overBudgetCount = budgets.filter(b => (expByCategory[b.category] || 0) > b.amount).length;
  const budgetPts = budgets.length === 0 ? 20 : Math.max(0, 30 - overBudgetCount * 10);

  // Factor 3: Income stability (0-20 pts) — has income this month
  const incomePts = income > 0 ? 20 : 5;

  // Factor 4: Spending diversity (not over 60% in one category) (0-20 pts)
  const maxCatSpend = Math.max(...Object.values(expByCategory) as number[], 0);
  const diversityPts = expense > 0 && maxCatSpend / expense > 0.6 ? 10 : 20;

  const score = Math.min(100, savingsPts + budgetPts + incomePts + diversityPts);

  let grade = 'F', color = '#ef4444';
  if (score >= 85) { grade = 'A'; color = '#10b981'; }
  else if (score >= 70) { grade = 'B'; color = '#3b82f6'; }
  else if (score >= 55) { grade = 'C'; color = '#f59e0b'; }
  else if (score >= 40) { grade = 'D'; color = '#f97316'; }

  return {
    score,
    grade,
    color,
    factors: [
      { label: 'Savings Rate', points: savingsPts, max: 30, tip: savingsPts < 20 ? 'Try to save at least 20% of your income.' : 'Good savings habit!' },
      { label: 'Budget Adherence', points: budgetPts, max: 30, tip: budgetPts < 20 ? `You exceeded ${overBudgetCount} budget(s). Stay within limits.` : 'Well within budgets!' },
      { label: 'Income Stability', points: incomePts, max: 20, tip: incomePts < 15 ? 'Log all income sources for a complete picture.' : 'Steady income recorded.' },
      { label: 'Spending Balance', points: diversityPts, max: 20, tip: diversityPts < 15 ? 'Your spending is concentrated in one category.' : 'Spending is well-balanced.' },
    ]
  };
}

// ─── Month-end Forecast ─────────────────────────────────────────────────────

function computeForecast(transactions: any[]) {
  const cm = monthKey(0);
  const today = dayOfMonth();
  const total = daysInMonth();

  const incomeThisMonth = transactions.filter(t => t.type === 'income' && t.date.startsWith(cm)).reduce((s, t) => s + t.amount, 0);
  const spentThisMonth = transactions.filter(t => t.type === 'expense' && t.date.startsWith(cm)).reduce((s, t) => s + t.amount, 0);

  const dailyRate = today > 0 ? spentThisMonth / today : 0;
  const projectedTotal = dailyRate * total;
  const projectedBalance = incomeThisMonth - projectedTotal;
  const remainingDays = total - today;
  const safeDaily = projectedBalance > 0 ? projectedBalance / remainingDays : 0;

  // Build daily area chart data (past + projected)
  const pastData = Array.from({ length: today }, (_, i) => {
    const d = new Date(REFERENCE_DATE);
    d.setDate(i + 1);
    const dayKey = d.toISOString().split('T')[0];
    const daySpend = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(dayKey))
      .reduce((s, t) => s + t.amount, 0);
    return { day: `${i + 1}`, actual: +daySpend.toFixed(2), projected: null };
  });

  const futureData = Array.from({ length: remainingDays }, (_, i) => ({
    day: `${today + i + 1}`,
    actual: null,
    projected: +dailyRate.toFixed(2),
  }));

  return { incomeThisMonth, spentThisMonth, projectedTotal, projectedBalance, safeDaily, dailyRate, chartData: [...pastData, ...futureData] };
}

// ─── Smart Suggestions ──────────────────────────────────────────────────────

function computeSuggestions(transactions: any[], budgets: any[], currencySymbol: string) {
  const currency = currencySymbol;
  const cm = monthKey(0);
  const lm = monthKey(1);
  const items: { id: string; priority: 'high' | 'medium' | 'low'; title: string; desc: string; action: string; actionHref: string; saving: number; icon: React.ElementType }[] = [];

  const expByCat = (month: string) =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(month))
      .reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a; }, {} as Record<string, number>);

  const curr = expByCat(cm);
  const prev = expByCat(lm);
  const totalIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(cm)).reduce((s, t) => s + t.amount, 0);
  const totalExp = Object.values(curr).reduce((s: number, v) => s + (v as number), 0);

  // Over budget alerts
  budgets.forEach(b => {
    const spent = curr[b.category] || 0;
    if (spent > b.amount) {
      items.push({
        id: `ob_${b.category}`,
        priority: 'high',
        title: `${b.category} budget exceeded`,
        desc: `You spent ${currencySymbol}${spent.toFixed(2)} vs your ${currencySymbol}${b.amount} budget — that's ${currencySymbol}${(spent - b.amount).toFixed(2)} over.`,
        action: 'Review Budget',
        actionHref: '/budgets',
        saving: spent - b.amount,
        icon: ShieldAlert,
      });
    }
  });

  // Subscription audit
  const subs = curr['Subscriptions'] || 0;
  if (subs > 30) {
    items.push({
      id: 'subs',
      priority: 'medium',
      title: 'Audit your subscriptions',
      desc: `You're spending ${currencySymbol}${subs.toFixed(2)}/month on subscriptions. Cancelling just one unused service could free up cash.`,
      action: 'View Transactions',
      actionHref: '/transactions',
      saving: subs * 0.3,
      icon: Tv,
    });
  }

  // Spending surge
  Object.keys(curr).forEach(cat => {
    const c = curr[cat];
    const p = prev[cat] || 0;
    if (p > 0 && c > p * 1.25 && c > 50) {
      items.push({
        id: `surge_${cat}`,
        priority: 'medium',
        title: `${cat} spending up ${Math.round(((c - p) / p) * 100)}%`,
        desc: `Last month: ${currencySymbol}${p.toFixed(2)}. This month: ${currencySymbol}${c.toFixed(2)}. A notable increase worth reviewing.`,
        action: 'See Transactions',
        actionHref: '/transactions',
        saving: c - p,
        icon: TrendingDown,
      });
    }
  });

  // Low savings rate
  if (totalIncome > 0 && (totalIncome - totalExp) / totalIncome < 0.1) {
    items.push({
      id: 'savings',
      priority: 'high',
      title: 'Savings rate is below 10%',
      desc: `You're saving less than 10% of your income this month. Aim for at least 20% to build an emergency fund.`,
      action: 'Track Budgets',
      actionHref: '/budgets',
      saving: totalIncome * 0.1,
      icon: Target,
    });
  }

  // Food tip
  const food = curr['Food'] || 0;
  if (food > 200) {
    items.push({
      id: 'food',
      priority: 'low',
      title: `Meal prep could save you ${currencySymbol}${(food * 0.2).toFixed(0)}`,
      desc: `Cooking at home just 3 extra days a week typically cuts food expenses by 15–25%.`,
      action: 'See Transactions',
      actionHref: '/transactions',
      saving: food * 0.2,
      icon: Utensils,
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'great',
      priority: 'low',
      title: 'You\'re doing great!',
      desc: 'No major spending issues detected. Keep tracking your expenses to maintain this momentum.',
      action: 'View Dashboard',
      actionHref: '/',
      saving: 0,
      icon: CheckCircle2,
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);
}

// ─── Spending Patterns ──────────────────────────────────────────────────────

function computePatterns(transactions: any[]) {
  // Last 6 months bar chart
  const months = Array.from({ length: 6 }, (_, i) => {
    const mk = monthKey(5 - i);
    const label = monthLabel(5 - i);
    const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(mk)).reduce((s, t) => s + t.amount, 0);
    return { month: label, Income: +income.toFixed(2), Expense: +expense.toFixed(2) };
  });

  // Category breakdown pie (all time)
  const catTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a; }, {} as Record<string, number>);
  const pie = Object.entries(catTotals)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 6)
    .map(([name, value]) => ({ name, value: +(value as number).toFixed(2) }));

  // Spending habit analysis
  const cm = monthKey(0);
  const totalExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(cm)).reduce((s, t) => s + t.amount, 0);
  const habits = Object.entries(
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(cm))
      .reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a; }, {} as Record<string, number>)
  )
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt as number,
      pct: totalExp > 0 ? Math.round(((amt as number) / totalExp) * 100) : 0,
    }));

  return { months, pie, habits };
}

// ─── Score Ring component ────────────────────────────────────────────────────

function ScoreRing({ score, grade, color }: { score: number; grade: string; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{grade}</span>
        <span className="text-sm text-neutral-500">{score}/100</span>
      </div>
    </div>
  );
}

// ─── Priority badge ─────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const map = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export const Suggestions = () => {
  const { transactions, budgets } = useFinance();
  const { currencySymbol } = useLanguage();

  const scoreData = useMemo(() => computeScore(transactions, budgets), [transactions, budgets]);
  const suggestions = useMemo(() => computeSuggestions(transactions, budgets, currencySymbol), [transactions, budgets, currencySymbol]);

  const highCount = suggestions.filter(s => s.priority === 'high').length;
  const totalSavings = suggestions.filter(s => s.saving > 0).reduce((s, i) => s + i.saving, 0);

  const dailyChartData = Array.from({ length: dayOfMonth() }, (_, i) => {
    const d = new Date(REFERENCE_DATE); d.setDate(i + 1);
    const dayKey = d.toISOString().split('T')[0];
    const spent = transactions.filter(t => t.type === 'expense' && t.date.startsWith(dayKey)).reduce((s, t) => s + t.amount, 0);
    return { day: `${i + 1}`, actual: +spent.toFixed(2) };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl tracking-tight text-neutral-900 dark:text-white">AI Financial Advisor</h1>
          </div>
          <p className="text-sm text-neutral-500 mt-1">Real-time analysis of your spending, habits & financial health.</p>
        </div>
        {highCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-400">{highCount} urgent issue{highCount > 1 ? 's' : ''} found</span>
          </div>
        )}
      </div>

      {/* Quick stat bar */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Financial Score', value: `${scoreData.score}/100`, sub: `Grade ${scoreData.grade}`, icon: Star,        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Potential Savings', value: `${currencySymbol}${totalSavings.toFixed(0)}`, sub: 'This month', icon: TrendingDown, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-neutral-500">{item.label}</p>
            <p className="text-xs text-neutral-400">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Financial Health Score — always visible, no tabs */}
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Health Score</CardTitle>
              <CardDescription>Based on savings rate, budget adherence & spending balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreRing score={scoreData.score} grade={scoreData.grade} color={scoreData.color} />
              <p className="text-center text-sm text-neutral-500">
                {scoreData.score >= 85 ? 'Excellent! Keep it up.' :
                 scoreData.score >= 70 ? "Good. A few tweaks and you'll hit A." :
                 scoreData.score >= 55 ? 'Fair. Focus on your budgets this month.' :
                 'Needs attention. Follow the suggestions below.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Breakdown</CardTitle>
              <CardDescription>What's contributing to your score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {scoreData.factors.map(f => (
                <div key={f.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700 dark:text-neutral-300">{f.label}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{f.points}/{f.max}</span>
                  </div>
                  <Progress value={(f.points / f.max) * 100} className="h-2" />
                  <p className="text-xs text-neutral-500">{f.tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending vs Income — This Month</CardTitle>
            <CardDescription>Daily expense activity so far</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart id="suggestions-daily-spend-chart" data={dailyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-100 dark:stroke-neutral-800" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={(props) => <AreaTooltip {...props} currencySymbol={currencySymbol} />} />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#colorActual)" strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
