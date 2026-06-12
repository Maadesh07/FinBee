import React, { useState } from 'react';
import { useFinance, Budget } from '../context/FinanceContext';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

const BudgetCard = ({ budget, spent, updateBudget, deleteBudget }: { budget: Budget, spent: number, updateBudget: (id: string, amount: number) => void, deleteBudget: (id: string) => void }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAmount, setEditAmount] = useState(budget.amount.toString());

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editAmount && !isNaN(Number(editAmount))) {
      updateBudget(budget.id, Number(editAmount));
      setIsEditDialogOpen(false);
      toast.success('Budget limit updated successfully');
    }
  };

  const percentage = Math.min((spent / budget.amount) * 100, 100);
  const isOver = spent > budget.amount;
  const isWarning = spent > budget.amount * 0.8 && !isOver;

  let progressColor = "bg-emerald-500";
  if (isOver) progressColor = "bg-rose-500";
  else if (isWarning) progressColor = "bg-amber-500";

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm flex flex-col hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold leading-none tracking-tight">{budget.category}</h3>
          {isOver && <AlertCircle className="w-4 h-4 text-rose-500" />}
          {percentage < 80 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </div>
        <div className="flex items-center gap-2">
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-1.5 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md">
                <Edit2 className="w-4 h-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleEditSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Budget Limit</DialogTitle>
                  <DialogDescription>
                    Update the spending limit for {budget.category}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1"
                      min="1"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors rounded-md">
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the budget for {budget.category}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  deleteBudget(budget.id);
                  toast.success('Budget deleted');
                }} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Spent: <span className="font-medium text-neutral-900 dark:text-neutral-100">${spent.toFixed(2)}</span></span>
          <span className="text-neutral-500">Limit: <span className="font-medium text-neutral-900 dark:text-neutral-100">${budget.amount.toFixed(2)}</span></span>
        </div>
        
        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-500 ease-in-out`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <span className={isOver ? "text-rose-600 dark:text-rose-500 font-medium" : "text-neutral-500"}>
            {isOver ? `$${(spent - budget.amount).toFixed(2)} over limit` : `${percentage.toFixed(0)}% used`}
          </span>
          {!isOver && (
            <span className="text-neutral-500 font-medium">
              ${(budget.amount - spent).toFixed(2)} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const Budgets = () => {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');

  // Default expense categories
  const categories = ['Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Subscriptions', 'Utilities', 'Other'];
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    // Check if budget for category already exists
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      toast.error('Budget for this category already exists.');
      return;
    }

    addBudget({
      category,
      amount: Number(amount),
      month: new Date().toISOString().substring(0, 7)
    });
    
    setIsAdding(false);
    setAmount('');
  };

  // Calculate spent amounts per category
  const currentMonth = new Date().toISOString().substring(0, 7);
  const spentByCategory = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
          <p className="text-neutral-500">Track your spending limits for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm"
        >
          {isAdding ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> New Budget</>}
        </button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-medium mb-4">Create Budget</h3>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2 w-full">
              <label className="text-sm font-medium">Limit ($)</label>
              <input 
                required
                type="number"
                step="1"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950"
              />
            </div>
            <button 
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow-sm w-full sm:w-auto whitespace-nowrap"
            >
              Save Budget
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {budgets.length > 0 ? budgets.map((budget) => (
          <BudgetCard 
            key={budget.id} 
            budget={budget} 
            spent={spentByCategory[budget.category] || 0} 
            updateBudget={updateBudget} 
            deleteBudget={deleteBudget} 
          />
        )) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No budgets created yet</h3>
            <p className="text-neutral-500 max-w-sm mx-auto">Create budgets to track your spending and see where your money goes each month.</p>
          </div>
        )}
      </div>
    </div>
  );
};
