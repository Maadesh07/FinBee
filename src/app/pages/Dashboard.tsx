import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  Plus
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ─── Custom bar chart (replaces recharts BarChart to avoid duplicate key bug) ─
function CustomBarChart({ data, currencySymbol }: { data: { name: string; Income: number; Expense: number }[]; currencySymbol: string }) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const maxVal = Math.max(...data.flatMap(d => [d.Income, d.Expense]), 1);
  const chartH = 240;

  return (
    <div className="w-full" style={{ height: chartH + 40 }}>
      <div className="flex items-end gap-1 h-full">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-full pb-10 pr-1 shrink-0">
          {[1, 0.75, 0.5, 0.25, 0].map(f => (
            <span key={f} className="text-xs text-neutral-400 leading-none">
              {currencySymbol}{Math.round(maxVal * f)}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex flex-1 items-end gap-1 h-full">
          {data.map((d, i) => {
            const incomeH = maxVal > 0 ? (d.Income / maxVal) * chartH : 0;
            const expenseH = maxVal > 0 ? (d.Expense / maxVal) * chartH : 0;
            const label = d.name.slice(5); // "MM" from "YYYY-MM"
            const isHov = hovered === i;
            return (
              <div
                key={`bar-group-${i}`}
                className="relative flex flex-col items-center flex-1"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHov && (
                  <div className="absolute bottom-full mb-2 z-10 bg-zinc-900/95 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap left-1/2 -translate-x-1/2">
                    <p className="text-zinc-400 mb-1.5 font-medium">{d.name}</p>
                    <div className="flex items-center gap-1.5 py-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-zinc-300">Income:</span>
                      <span className="text-emerald-400 font-semibold">{currencySymbol}{d.Income.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-0.5">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-zinc-300">Expense:</span>
                      <span className="text-rose-400 font-semibold">{currencySymbol}{d.Expense.toFixed(0)}</span>
                    </div>
                  </div>
                )}
                {/* Bar pair */}
                <div className="flex items-end gap-0.5 w-full" style={{ height: chartH }}>
                  <div
                    key={`income-${i}`}
                    className="flex-1 rounded-t-md bg-emerald-500 transition-opacity"
                    style={{ height: incomeH, opacity: isHov ? 1 : 0.85 }}
                  />
                  <div
                    key={`expense-${i}`}
                    className="flex-1 rounded-t-md bg-rose-500 transition-opacity"
                    style={{ height: expenseH, opacity: isHov ? 1 : 0.85 }}
                  />
                </div>
                {/* X label */}
                <span className="mt-2 text-xs text-neutral-400">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// ─── Custom dark tooltip for bar chart ───────────────────────────────────────
// ─── Custom dark tooltip for pie chart ───────────────────────────────────────
const PieTooltip = ({ active, payload, currencySymbol }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 text-xs mb-1">{name}</p>
      <p className="text-white font-semibold text-xs">{currencySymbol}{Number(value).toFixed(2)}</p>
    </div>
  );
};

export const Dashboard = () => {
  const { transactions, balance } = useFinance();
  const { t, currencySymbol } = useLanguage();

  const currentMonthStr = '2026-06';
  
  const monthlyIncome = transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpense = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map((key) => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(2026, 5, 20); // Reference date: June 20, 2026
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  }).reverse();

  const barData = last6Months.map((month, index) => {
    const income = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: month,
      Income: income,
      Expense: expense
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('overview')}</h2>
          <p className="text-neutral-500">{t('welcomeBack')}</p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> {t('addTransaction')}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">{t('totalBalance')}</h3>
            <Wallet className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-bold">{currencySymbol}{balance.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">{t('monthlyIncome')}</h3>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">+{currencySymbol}{monthlyIncome.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">{t('monthlyExpenses')}</h3>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">-{currencySymbol}{monthlyExpense.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-neutral-500">{t('savingsRate')}</h3>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            {monthlyIncome > 0 ? (((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold leading-none tracking-tight">{t('incomeVsExpenses')}</h3>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Income</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />Expense</span>
            </div>
          </div>
          <CustomBarChart data={barData} currencySymbol={currencySymbol} />
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm col-span-3">
          <div className="mb-4">
            <h3 className="font-semibold leading-none tracking-tight">{t('expensesByCategory')}</h3>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center" style={{ minHeight: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`dashboard-pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={(props) => <PieTooltip {...props} currencySymbol={currencySymbol} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-neutral-500">{t('noExpenses')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900">
          <h3 className="font-semibold leading-none tracking-tight">{t('recentTransactions')}</h3>
          <Link to="/transactions" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            {t('viewAll')}
          </Link>
        </div>
        <div className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'}`}>
                    {tx.type === 'income' ? <DollarSign className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none mb-1">{tx.description}</p>
                    <p className="text-xs text-neutral-500">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                  {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-neutral-500 text-sm">{t('noRecentTransactions')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
