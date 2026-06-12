import React, { useState } from 'react';
import { useFinance, Transaction } from '../context/FinanceContext';
import { Plus, Search, Trash2, Filter, Printer } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Transactions = () => {
  const { transactions, addTransaction, deleteTransaction, balance, totalIncome, totalExpense } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const categories = type === 'expense' 
    ? ['Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Subscriptions', 'Utilities', 'Other']
    : ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !description) return;

    addTransaction({
      amount: Number(amount),
      description,
      category,
      type,
      date: new Date(date).toISOString()
    });

    setIsAdding(false);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().substring(0, 10));
    toast.success('Transaction added successfully');
  };

  const handlePrintMonthly = () => {
    // Filter transactions for selected month
    const monthlyTransactions = transactions.filter((tx) =>
      tx.date.startsWith(selectedMonth)
    );

    if (monthlyTransactions.length === 0) {
      toast.error('No transactions found for the selected month.');
      return;
    }

    // Calculate monthly totals
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyBalance = monthlyIncome - monthlyExpense;

    // Format month name
    const monthDate = new Date(selectedMonth + '-01');
    const monthName = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FinBee - Transaction Report ${monthName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: white;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .report-date {
            font-size: 18px;
            color: #666;
            margin-top: 5px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
          }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
          .balance { color: #2563eb; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) { background: #f9fafb; }
          .amount-income { color: #10b981; font-weight: 600; }
          .amount-expense { color: #000; font-weight: 600; }
          .category-badge {
            display: inline-block;
            padding: 4px 8px;
            background: #e5e7eb;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .summary { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🐝 FinBee</div>
          <h1>Monthly Transaction Report</h1>
          <div class="report-date">${monthName}</div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Income</div>
            <div class="summary-value income">+$${monthlyIncome.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-value expense">-$${monthlyExpense.toFixed(2)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Net Balance</div>
            <div class="summary-value balance">$${monthlyBalance.toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th style="text-align: right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyTransactions.map(tx => `
              <tr>
                <td>${new Date(tx.date).toLocaleDateString()}</td>
                <td>${tx.description}</td>
                <td><span class="category-badge">${tx.category}</span></td>
                <td>${tx.type === 'income' ? '✓ Income' : '✗ Expense'}</td>
                <td class="${tx.type === 'income' ? 'amount-income' : 'amount-expense'}" style="text-align: right">
                  ${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p style="margin-top: 5px;">FinBee - Your Personal Finance Tracker</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
            <p className="text-neutral-500">Manage your income and expenses here.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
          >
            {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add Transaction</>}
          </button>
        </div>

        {/* Print Monthly Report Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Print Monthly Report</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Select a month and print your transaction details</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex h-9 w-full sm:w-auto rounded-md border border-blue-300 dark:border-blue-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handlePrintMonthly}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 shadow-sm whitespace-nowrap"
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-medium mb-4">New Transaction</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type</label>
              <select 
                value={type} 
                onChange={(e) => {
                  setType(e.target.value as 'income' | 'expense');
                  setCategory(e.target.value === 'expense' ? 'Food' : 'Salary');
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
              <input 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Groceries"
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Amount ($)</label>
              <input 
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Date</label>
              <input 
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              />
            </div>
            <div className="lg:col-span-6 flex justify-end">
              <button 
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 pl-8"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex h-9 w-full sm:w-auto items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                <tr key={tx.id} className="bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className="bg-neutral-100 text-neutral-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-neutral-800 dark:text-neutral-300">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tx.type === 'income' 
                      ? <span className="text-emerald-600 dark:text-emerald-500">Income</span>
                      : <span className="text-neutral-600 dark:text-neutral-400">Expense</span>
                    }
                  </td>
                  <td className={cn("px-6 py-4 text-right font-medium", tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-neutral-900 dark:text-neutral-100')}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this transaction from your history. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => {
                              deleteTransaction(tx.id);
                              toast.success('Transaction deleted');
                            }} 
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
