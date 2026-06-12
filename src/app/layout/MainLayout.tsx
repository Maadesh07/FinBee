import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Lightbulb,
  Menu,
  X,
  Wallet,
  UserCircle,
  CalendarDays
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Toaster } from '../components/ui/sonner';
import { useLanguage } from '../context/LanguageContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navigation = [
    { name: t('dashboard'), key: 'dashboard', href: '/', icon: LayoutDashboard },
    { name: t('transactions'), key: 'transactions', href: '/transactions', icon: Receipt },
    { name: t('budgets'), key: 'budgets', href: '/budgets', icon: PieChart },
    { name: t('calendar'), key: 'calendar', href: '/calendar', icon: CalendarDays },
    { name: t('suggestions'), key: 'suggestions', href: '/suggestions', icon: Lightbulb },
    { name: t('profile'), key: 'profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <>
      <Toaster />
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-50 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200 dark:border-neutral-800">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-500">
            <Wallet className="w-6 h-6" />
            <span>FinBee</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 px-4 mt-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.key}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-500" : "text-neutral-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center h-16 px-4 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 shrink-0 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-neutral-900 dark:text-white">
            {navigation.find(n => n.href === location.pathname)?.name || 'FinBee'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900 p-4 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
      </div>
    </>
  );
};
