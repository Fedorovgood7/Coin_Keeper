export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'card' | 'deposit';
export type Currency = 'RUB' | 'USD' | 'EUR';
export type Periodicity = 'daily' | 'weekly' | 'monthly';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  initialBalance: number;
  isArchived: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  date: string;
  comment: string;
  createdAt: string;
}

export interface MonthlyBudget {
  id: string;
  month: string;
  plannedAmount: number;
  actualAmount: number;
  usagePercent: number;
  remainingAmount: number;
  safeDailyAmount: number;
  updatedAt: string;
}

export interface CategoryLimit {
  id: string;
  categoryId: string;
  month: string;
  limit: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  isExceeded: boolean;
  updatedAt: string;
}

export interface SafeDailyAmount {
  month: string;
  safeDailyAmount: number;
  remainingDays: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  deadline: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface RecurringPayment {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  periodicity: Periodicity;
  nextDate: string;
  comment: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  budgetRemaining: number;
  safeDailyAmount: number;
  topCategories: CategoryStatItem[];
  upcomingRecurring: RecurringPayment[];
}

export interface CategoryStatItem {
  categoryId: string;
  name: string;
  amount: number;
  percent: number;
}

export interface DailyStatItem {
  date: string;
  amount: number;
}

export interface IncomeExpenseComparison {
  month: string;
  income: number;
  expense: number;
  saving: number;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'period';
