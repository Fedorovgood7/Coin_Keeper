export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'card' | 'cash' | 'savings';
export type Periodicity = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Currency = 'RUB' | 'USD' | 'EUR' | 'GBP' | 'TRY' | 'CNY' | 'JPY';

export interface UserProfile {
  name: string;
  initials: string;
  email: string;
  currency: Currency;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: TransactionType;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  number?: string;
  archived: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  description: string;
  date: string;
  recurring: boolean;
  frequency?: Periodicity;
}

export interface CategoryLimit {
  categoryId: string;
  limit: number;
}

export interface MonthlyBudget {
  monthly: number;
  limits: CategoryLimit[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  color: string;
  target: number;
  current: number;
  deadline: string;
}

export interface AppState {
  profile: UserProfile | null;
  auth: boolean;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  goals: SavingsGoal[];
  budget: MonthlyBudget;
}

export interface BudgetStats {
  totalExpense: number;
  remaining: number;
  percent: number;
}

export interface SafePerDayData {
  perDay: number;
  daysLeft: number;
}

export interface ExpenseByCategory {
  category: Category;
  amount: number;
}

export interface PieSegment {
  pct: number;
  offset: number;
  color: string;
}

export interface LimitStats {
  spent: number;
  percent: number;
  isOver: boolean;
}

export interface DateGroup {
  date: string;
  transactions: Transaction[];
}

export interface Validation {
  valid: boolean;
  field?: string;
  error?: string;
}

(window as any).CK = (window as any).CK || {};
(window as any).CK.types = 'loaded';
