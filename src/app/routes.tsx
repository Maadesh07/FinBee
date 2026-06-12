import React from 'react';
import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Calendar } from './pages/Calendar';
import { Suggestions } from './pages/Suggestions';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "budgets", Component: Budgets },
      { path: "calendar", Component: Calendar },
      { path: "suggestions", Component: Suggestions },
      { path: "profile", Component: Profile },
    ],
  },
]);
