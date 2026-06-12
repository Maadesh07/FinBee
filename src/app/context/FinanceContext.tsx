import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'expense' | 'income';
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
};

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, amount: number) => void;
  deleteBudget: (id: string) => void;
  balance: number;
  totalIncome: number;
  totalExpense: number;
};

const defaultTransactions: Transaction[] = [
  { id: '1', date: new Date().toISOString(), amount: 3500, category: 'Salary', description: 'Monthly Salary', type: 'income' },
  { id: '2', date: new Date().toISOString(), amount: 1200, category: 'Housing', description: 'Rent', type: 'expense' },
  { id: '3', date: new Date().toISOString(), amount: 150, category: 'Food', description: 'Groceries', type: 'expense' },
  { id: '4', date: new Date(Date.now() - 86400000).toISOString(), amount: 45, category: 'Transport', description: 'Gas', type: 'expense' },
  { id: '5', date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 60, category: 'Entertainment', description: 'Movie Tickets', type: 'expense' },
  { id: '6', date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 110, category: 'Shopping', description: 'Clothes', type: 'expense' },
  { id: '7', date: new Date(Date.now() - 86400000 * 10).toISOString(), amount: 12.99, category: 'Subscriptions', description: 'Netflix', type: 'expense' },
  { id: '8', date: new Date(Date.now() - 86400000 * 12).toISOString(), amount: 9.99, category: 'Subscriptions', description: 'Spotify', type: 'expense' },
];

const defaultBudgets: Budget[] = [
  { id: '1', category: 'Housing', amount: 1200, month: new Date().toISOString().substring(0, 7) },
  { id: '2', category: 'Food', amount: 400, month: new Date().toISOString().substring(0, 7) },
  { id: '3', category: 'Transport', amount: 150, month: new Date().toISOString().substring(0, 7) },
  { id: '4', category: 'Entertainment', amount: 100, month: new Date().toISOString().substring(0, 7) },
  { id: '5', category: 'Subscriptions', amount: 20, month: new Date().toISOString().substring(0, 7) },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substring(7) };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: Math.random().toString(36).substring(7) };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: string, amount: number) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, amount } : b)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        balance,
        totalIncome,
        totalExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
