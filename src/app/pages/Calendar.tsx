import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, AlertCircle, Check, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

interface FutureExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  isPaid: boolean;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  'food',
  'housing',
  'transport',
  'entertainment',
  'shopping',
  'subscriptions',
  'utilities',
];

export const Calendar = () => {
  const { t, currencySymbol } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FutureExpense | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
    dueDate: '',
    isPaid: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load future expenses from localStorage (seed with demo data if empty)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('finbee_futureExpenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFutureExpenses(parsed);
          return;
        }
      }
      // Seed demo data for advisor presentation
      const demo: FutureExpense[] = [
        // --- Past (overdue, not paid) ---
        { id: 'demo_1', description: 'Library Fine – Overdue Book Return', amount: 15,   category: 'education',   dueDate: '2026-06-05', isPaid: false, createdAt: '2026-05-30T08:00:00.000Z' },
        { id: 'demo_2', description: 'Campus Parking Season Pass',          amount: 80,   category: 'transport',   dueDate: '2026-06-10', isPaid: false, createdAt: '2026-06-01T08:00:00.000Z' },
        // --- Past (paid) ---
        { id: 'demo_3', description: 'Gym Membership – June',               amount: 50,   category: 'entertainment', dueDate: '2026-06-08', isPaid: true,  createdAt: '2026-05-28T08:00:00.000Z' },
        { id: 'demo_4', description: 'Phone Bill – Digi Postpaid',          amount: 45,   category: 'utilities',   dueDate: '2026-06-12', isPaid: true,  createdAt: '2026-06-05T08:00:00.000Z' },
        { id: 'demo_5', description: 'Group Project Printing Costs',         amount: 22,   category: 'education',   dueDate: '2026-06-15', isPaid: true,  createdAt: '2026-06-10T08:00:00.000Z' },
        // --- Upcoming (this month) ---
        { id: 'demo_6', description: 'Monthly Rent – July 2026',            amount: 1200, category: 'housing',     dueDate: '2026-06-28', isPaid: false, createdAt: '2026-06-01T08:00:00.000Z' },
        { id: 'demo_7', description: 'Internet Bill – TM Unifi',            amount: 89,   category: 'utilities',   dueDate: '2026-06-25', isPaid: false, createdAt: '2026-06-01T08:00:00.000Z' },
        { id: 'demo_8', description: 'Final Exam Stationery Pack',           amount: 35,   category: 'education',   dueDate: '2026-06-22', isPaid: false, createdAt: '2026-06-18T08:00:00.000Z' },
        // --- Future (July 2026) ---
        { id: 'demo_9',  description: 'University Exam Registration Fee',   amount: 250,  category: 'education',   dueDate: '2026-07-05', isPaid: false, createdAt: '2026-06-10T08:00:00.000Z' },
        { id: 'demo_10', description: 'Health Insurance Premium',           amount: 80,   category: 'utilities',   dueDate: '2026-07-10', isPaid: false, createdAt: '2026-06-10T08:00:00.000Z' },
        { id: 'demo_11', description: 'Laptop Servicing & Cleaning',        amount: 120,  category: 'shopping',    dueDate: '2026-07-15', isPaid: false, createdAt: '2026-06-15T08:00:00.000Z' },
        { id: 'demo_12', description: 'Bus Ticket Home – Semester Break',   amount: 95,   category: 'transport',   dueDate: '2026-07-20', isPaid: false, createdAt: '2026-06-15T08:00:00.000Z' },
      ];
      setFutureExpenses(demo);
    } catch (error) {
      console.error('Error loading future expenses:', error);
    }
  }, []);

  // Save to localStorage whenever futureExpenses changes
  useEffect(() => {
    try {
      localStorage.setItem('finbee_futureExpenses', JSON.stringify(futureExpenses));
    } catch (error) {
      console.error('Error saving future expenses:', error);
    }
  }, [futureExpenses]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getExpensesForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return futureExpenses.filter(exp => exp.dueDate === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      category: 'food',
      dueDate: selectedDate || new Date().toISOString().split('T')[0],
      isPaid: false,
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleEditExpense = (expense: FutureExpense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      dueDate: expense.dueDate,
      isPaid: expense.isPaid,
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleDeleteExpense = (id: string) => {
    setFutureExpenses(prev => prev.filter(exp => exp.id !== id));
    toast.success(t('deleteExpense'));
  };

  const handleTogglePaid = (id: string) => {
    setFutureExpenses(prev =>
      prev.map(exp =>
        exp.id === id ? { ...exp, isPaid: !exp.isPaid } : exp
      )
    );
    toast.success(t('settingsSaved'));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveExpense = () => {
    if (!validateForm()) return;

    const expenseData: FutureExpense = {
      id: editingExpense?.id || Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      dueDate: formData.dueDate,
      isPaid: formData.isPaid,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
    };

    if (editingExpense) {
      setFutureExpenses(prev =>
        prev.map(exp => (exp.id === editingExpense.id ? expenseData : exp))
      );
      toast.success(t('settingsSaved'));
    } else {
      setFutureExpenses(prev => [...prev, expenseData]);
      toast.success(t('addFutureExpense'));
    }

    setShowAddModal(false);
    setEditingExpense(null);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingExpenses = futureExpenses
    .filter(exp => !exp.isPaid && getDaysUntilDue(exp.dueDate) >= 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overdueExpenses = futureExpenses
    .filter(exp => !exp.isPaid && getDaysUntilDue(exp.dueDate) < 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-2 border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayExpenses = getExpensesForDate(day);
    const hasExpenses = dayExpenses.length > 0;
    const isCurrentDay = isToday(day);

    calendarDays.push(
      <div
        key={day}
        className={`p-2 border border-neutral-200 dark:border-neutral-800 min-h-[80px] cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
          isCurrentDay ? 'bg-blue-50 dark:bg-blue-950' : 'bg-white dark:bg-neutral-900'
        }`}
        onClick={() => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          setSelectedDate(dateStr);
          handleAddExpense();
        }}
      >
        <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' : ''}`}>
          {day}
        </div>
        {hasExpenses && (
          <div className="space-y-1">
            {dayExpenses.slice(0, 2).map(exp => (
              <div
                key={exp.id}
                className={`text-xs p-1 rounded truncate ${
                  exp.isPaid
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : getDaysUntilDue(exp.dueDate) < 0
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}
              >
                {currencySymbol}{exp.amount.toFixed(0)}
              </div>
            ))}
            {dayExpenses.length > 2 && (
              <div className="text-xs text-neutral-500">+{dayExpenses.length - 2}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl tracking-tight text-neutral-900 dark:text-white">{t('calendar')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t('manageCalendar')}
          </p>
        </div>
        <Button onClick={handleAddExpense} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('addFutureExpense')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0 border border-neutral-200 dark:border-neutral-800">
              {calendarDays}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming & Outstanding */}
        <div className="space-y-4">
          {/* Outstanding Payments */}
          {overdueExpenses.length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {t('outstandingPayments')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueExpenses.map(expense => (
                  <div
                    key={expense.id}
                    className="p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(expense.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-sm text-red-600 dark:text-red-400">
                        {currencySymbol}{expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {Math.abs(getDaysUntilDue(expense.dueDate))} {t('daysOverdue')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => handleTogglePaid(expense.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {t('markAsPaid')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-red-600"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Payments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('upcomingPayments')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingExpenses.length > 0 ? (
                upcomingExpenses.slice(0, 5).map(expense => (
                  <div
                    key={expense.id}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(expense.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-sm">{currencySymbol}{expense.amount.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {getDaysUntilDue(expense.dueDate)} {t('daysUntilDue')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => handleTogglePaid(expense.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {t('markAsPaid')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-red-600"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 text-center py-4">{t('noUpcomingPayments')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? t('editFutureExpense') : t('addFutureExpense')}
            </DialogTitle>
            <DialogDescription>
              {t('manageCalendar')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setErrors({});
                }}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  setErrors({});
                }}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value });
                  setErrors({});
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {t(cat as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">{t('dueDate')}</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData({ ...formData, dueDate: e.target.value });
                  setErrors({});
                }}
              />
              {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPaid">{t('markAsPaid')}</Label>
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                {t('cancel')}
              </Button>
              <Button className="flex-1" onClick={handleSaveExpense}>
                {editingExpense ? t('saveChanges') : t('addFutureExpense')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
