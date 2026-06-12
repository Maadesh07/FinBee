import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Lightbulb, TrendingDown, Info, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';

export const Suggestions = () => {
  const { transactions, budgets } = useFinance();

  // Simple rule-based suggestion generator
  const getSuggestions = () => {
    const suggestions: { id: string; title: string; desc: string; icon: any; color: string; saving: number }[] = [];
    const currentMonth = new Date().toISOString().substring(0, 7);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.toISOString().substring(0, 7);

    // Group expenses by category
    const getExpenseByCategory = (month: string) => {
      return transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(month))
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
    };

    const currentExpenses = getExpenseByCategory(currentMonth);
    const lastExpenses = getExpenseByCategory(lastMonth);

    // Rule 1: High Subscription Costs
    const subsCost = currentExpenses['Subscriptions'] || 0;
    if (subsCost > 50) {
      suggestions.push({
        id: 's1',
        title: 'Review Subscriptions',
        desc: `You spent $${subsCost.toFixed(2)} on subscriptions this month. Check if you actively use all of them to save money.`,
        icon: Info,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
        saving: subsCost * 0.3 // estimated 30% saving
      });
    }

    // Rule 2: Over Budget
    budgets.forEach(b => {
      const spent = currentExpenses[b.category] || 0;
      if (spent > b.amount) {
        suggestions.push({
          id: `s_budget_${b.category}`,
          title: `${b.category} over budget`,
          desc: `You are $${(spent - b.amount).toFixed(2)} over your $${b.amount} budget for ${b.category}. Try to cut down expenses in this category.`,
          icon: ShieldAlert,
          color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
          saving: spent - b.amount
        });
      }
    });

    // Rule 3: Increased spending
    Object.keys(currentExpenses).forEach(category => {
      if (category === 'Other') return;
      const current = currentExpenses[category] || 0;
      const prev = lastExpenses[category] || 0;
      if (prev > 0 && current > prev * 1.2 && current > 50) { // 20% increase and notable amount
        suggestions.push({
          id: `s_inc_${category}`,
          title: `Rising costs in ${category}`,
          desc: `Your spending on ${category} is up by ${(((current - prev) / prev) * 100).toFixed(0)}% compared to last month. Consider reducing this back to normal levels.`,
          icon: TrendingDown,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
          saving: current - prev
        });
      }
    });

    // Rule 4: General Dining out
    const foodCost = currentExpenses['Food'] || 0;
    if (foodCost > 300) {
      suggestions.push({
        id: 's_food',
        title: 'Meal prep opportunity',
        desc: `High food expenses ($${foodCost.toFixed(2)}). Consider cooking more meals at home to save an estimated 20% on food.`,
        icon: Lightbulb,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
        saving: foodCost * 0.2
      });
    }

    // Default if no issues
    if (suggestions.length === 0) {
      suggestions.push({
        id: 's_default',
        title: 'Great job!',
        desc: 'Your spending looks perfectly balanced and you are staying within budget limits.',
        icon: Lightbulb,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
        saving: 0
      });
    }

    return suggestions.sort((a, b) => b.saving - a.saving);
  };

  const suggestions = getSuggestions();
  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + s.saving, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-neutral-500">Smart suggestions to help you reduce your spending.</p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-full">
            <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300">Potential Monthly Savings</h3>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ${totalPotentialSavings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {suggestions.map((s) => (
          <div key={s.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className={`p-4 rounded-full shrink-0 ${s.color}`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">{s.title}</h3>
              <p className="text-neutral-500">{s.desc}</p>
            </div>
            {s.saving > 0 && (
              <div className="shrink-0 text-right md:border-l md:border-neutral-100 dark:border-neutral-800 md:pl-6">
                <p className="text-sm text-neutral-500 font-medium">Save approx.</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500">+${s.saving.toFixed(2)}</p>
              </div>
            )}
            <Link 
              to={s.id.includes('budget') ? '/budgets' : '/transactions'}
              className="mt-4 md:mt-0 inline-flex items-center justify-center p-2 rounded-full text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
