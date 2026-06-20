import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const STORAGE_KEYS = {
  transactions: 'finbee_transactions',
  budgets: 'finbee_budgets',
};

const defaultTransactions: Transaction[] = [
  // ── JUNE 2026 – Current Month ──────────────────────────────────────────────
  // Income
  { id: 'j_i1', date: '2026-06-01T08:00:00.000Z', amount: 2500,  category: 'Allowance',     description: 'PTPTN Student Loan Disbursement',        type: 'income'  },
  { id: 'j_i2', date: '2026-06-05T09:00:00.000Z', amount: 500,   category: 'Allowance',     description: 'Monthly Allowance from Parents',          type: 'income'  },
  { id: 'j_i3', date: '2026-06-15T17:00:00.000Z', amount: 500,   category: 'Salary',        description: 'Part-Time Job Salary (Retail)',           type: 'income'  },
  // Fixed / bills
  { id: 'j_e1', date: '2026-06-01T10:00:00.000Z', amount: 1200,  category: 'Housing',       description: 'Monthly Rent Payment',                   type: 'expense' },
  { id: 'j_e2', date: '2026-06-02T00:00:00.000Z', amount: 12.99, category: 'Subscriptions', description: 'Netflix Premium Subscription',            type: 'expense' },
  { id: 'j_e3', date: '2026-06-02T00:00:00.000Z', amount: 14.99, category: 'Subscriptions', description: 'Spotify Student Plan',                    type: 'expense' },
  // Education
  { id: 'j_e4', date: '2026-06-03T11:00:00.000Z', amount: 120,   category: 'Education',     description: 'University Bookstore – Reference Textbook', type: 'expense' },
  // Food – small campus meals (green progress bar)
  { id: 'j_e5', date: '2026-06-05T12:30:00.000Z', amount: 8.50,  category: 'Food',          description: 'Campus Canteen – Chicken Rice',           type: 'expense' },
  { id: 'j_e6', date: '2026-06-07T09:00:00.000Z', amount: 12.00, category: 'Food',          description: 'Brunch at CLC Café',                      type: 'expense' },
  { id: 'j_e7', date: '2026-06-08T13:00:00.000Z', amount: 85,    category: 'Food',          description: 'Mydin Supermarket Run',                   type: 'expense' },
  { id: 'j_e8', date: '2026-06-10T12:00:00.000Z', amount: 9.50,  category: 'Food',          description: 'Campus Canteen – Nasi Lemak Set',         type: 'expense' },
  { id: 'j_e9', date: '2026-06-14T12:30:00.000Z', amount: 11.00, category: 'Food',          description: 'Campus Canteen – Set Lunch',              type: 'expense' },
  { id: 'j_e10', date: '2026-06-16T19:00:00.000Z', amount: 14.00, category: 'Food',         description: 'Mamak Stall – Dinner with Friends',       type: 'expense' },
  { id: 'j_e11', date: '2026-06-19T08:30:00.000Z', amount: 8.00, category: 'Food',          description: 'Kopitiam Breakfast',                      type: 'expense' },
  // Transport
  { id: 'j_e12', date: '2026-06-10T07:30:00.000Z', amount: 15,   category: 'Transport',     description: 'RapidKL Bus/Subway Weekly Pass',          type: 'expense' },
  { id: 'j_e13', date: '2026-06-13T21:00:00.000Z', amount: 30,   category: 'Transport',     description: 'Grab Ride – Late Night to Station',       type: 'expense' },
  // Shopping
  { id: 'j_e14', date: '2026-06-12T14:00:00.000Z', amount: 45,   category: 'Shopping',      description: 'Thrift Store Jacket',                     type: 'expense' },
  // Entertainment
  { id: 'j_e15', date: '2026-06-18T20:00:00.000Z', amount: 60,   category: 'Entertainment', description: 'Movie Tickets & Popcorn',                 type: 'expense' },
  // Utilities
  { id: 'j_e16', date: '2026-06-06T10:00:00.000Z', amount: 45,   category: 'Utilities',     description: 'Prepaid Mobile Top-Up',                  type: 'expense' },
  { id: 'j_e17', date: '2026-06-06T10:00:00.000Z', amount: 39,   category: 'Utilities',     description: 'TM Unifi Wi-Fi (Shared)',                 type: 'expense' },

  // ── MAY 2026 – Income Boost Month ─────────────────────────────────────────
  { id: 'm_i1', date: '2026-05-02T09:00:00.000Z', amount: 2500,  category: 'Allowance',     description: 'PTPTN Student Loan Disbursement',         type: 'income'  },
  { id: 'm_i2', date: '2026-05-01T08:00:00.000Z', amount: 500,   category: 'Allowance',     description: 'Monthly Allowance from Parents',          type: 'income'  },
  { id: 'm_i3', date: '2026-05-15T17:00:00.000Z', amount: 550,   category: 'Salary',        description: 'Part-Time Job Salary',                    type: 'income'  },
  { id: 'm_e1', date: '2026-05-01T10:00:00.000Z', amount: 1200,  category: 'Housing',       description: 'Monthly Rent Payment',                    type: 'expense' },
  { id: 'm_e2', date: '2026-05-10T14:00:00.000Z', amount: 150,   category: 'Education',     description: 'University Textbook Buyback',             type: 'expense' },
  { id: 'm_e3', date: '2026-05-12T12:00:00.000Z', amount: 380,   category: 'Food',          description: 'Monthly Groceries & Campus Dining',       type: 'expense' },
  { id: 'm_e4', date: '2026-05-18T11:00:00.000Z', amount: 65,    category: 'Transport',     description: 'Grab & LRT Top-Up',                       type: 'expense' },
  { id: 'm_e5', date: '2026-05-20T15:00:00.000Z', amount: 200,   category: 'Shopping',      description: 'Uniqlo Clothes Shopping',                 type: 'expense' },
  { id: 'm_e6', date: '2026-05-25T19:00:00.000Z', amount: 55,    category: 'Entertainment', description: 'Bowling Night with Classmates',           type: 'expense' },

  // ── APRIL 2026 – Baseline Month ───────────────────────────────────────────
  { id: 'a_i1', date: '2026-04-01T08:00:00.000Z', amount: 500,   category: 'Allowance',     description: 'Monthly Allowance from Parents',          type: 'income'  },
  { id: 'a_i2', date: '2026-04-15T17:00:00.000Z', amount: 600,   category: 'Salary',        description: 'Part-Time Job Salary',                    type: 'income'  },
  { id: 'a_e1', date: '2026-04-01T10:00:00.000Z', amount: 1200,  category: 'Housing',       description: 'Monthly Rent Payment',                    type: 'expense' },
  { id: 'a_e2', date: '2026-04-10T12:00:00.000Z', amount: 320,   category: 'Food',          description: 'Groceries & Campus Meals',                type: 'expense' },
  { id: 'a_e3', date: '2026-04-18T09:00:00.000Z', amount: 80,    category: 'Transport',     description: 'LRT & Grab Credits',                      type: 'expense' },
  { id: 'a_e4', date: '2026-04-22T16:00:00.000Z', amount: 38,    category: 'Utilities',     description: 'Prepaid Mobile Top-Up',                   type: 'expense' },
  { id: 'a_e5', date: '2026-04-25T20:00:00.000Z', amount: 90,    category: 'Entertainment', description: 'Cinema & Snacks with Friends',            type: 'expense' },

  // ── MARCH 2026 – High Expense Month ───────────────────────────────────────
  { id: 'ma_i1', date: '2026-03-01T08:00:00.000Z', amount: 500,  category: 'Allowance',     description: 'Monthly Allowance from Parents',          type: 'income'  },
  { id: 'ma_i2', date: '2026-03-15T17:00:00.000Z', amount: 450,  category: 'Salary',        description: 'Part-Time Job Salary',                    type: 'income'  },
  { id: 'ma_e1', date: '2026-03-05T09:00:00.000Z', amount: 400,  category: 'Education',     description: 'Semester Registration & Exam Fees',       type: 'expense' },
  { id: 'ma_e2', date: '2026-03-01T10:00:00.000Z', amount: 1200, category: 'Housing',       description: 'Monthly Rent Payment',                    type: 'expense' },
  { id: 'ma_e3', date: '2026-03-12T12:00:00.000Z', amount: 450,  category: 'Food',          description: 'Heavy Dining Out & Groceries',            type: 'expense' },
  { id: 'ma_e4', date: '2026-03-20T15:00:00.000Z', amount: 180,  category: 'Shopping',      description: 'Study Stationery & Supplies',             type: 'expense' },
  { id: 'ma_e5', date: '2026-03-28T10:00:00.000Z', amount: 95,   category: 'Transport',     description: 'Intercity Bus Home (Semester Break)',     type: 'expense' },
];

const defaultBudgets: Budget[] = [
  { id: 'b1', category: 'Housing',       amount: 1200, month: '2026-06' }, // 100% full – orange warning
  { id: 'b2', category: 'Food',          amount: 400,  month: '2026-06' }, // ~37% – healthy green
  { id: 'b3', category: 'Transport',     amount: 150,  month: '2026-06' }, // 30% – healthy green
  { id: 'b4', category: 'Entertainment', amount: 100,  month: '2026-06' }, // 60% – yellow warning
  { id: 'b5', category: 'Subscriptions', amount: 20,   month: '2026-06' }, // RM27.98 – over limit red
  { id: 'b6', category: 'Education',     amount: 200,  month: '2026-06' }, // 60% – healthy
  { id: 'b7', category: 'Utilities',     amount: 100,  month: '2026-06' }, // 84% – warning
  { id: 'b8', category: 'Shopping',      amount: 80,   month: '2026-06' }, // 56% – healthy
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw && raw !== 'undefined' && raw !== 'null') {
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
  }
  return fallback;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.transactions, defaultTransactions)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadFromStorage(STORAGE_KEYS.budgets, defaultBudgets)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
  }, [budgets]);

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
