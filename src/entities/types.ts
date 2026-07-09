export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'card' | 'cash' | 'savings';
export type Periodicity = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Currency = 'RUB' | 'USD' | 'EUR';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  provider?: 'yandex' | 'demo';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color: string;
  icon: string;
  isArchived: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  periodicity?: Periodicity;
}

export interface Budget {
  monthly: number;
  limits: CategoryLimit[];
}

export interface CategoryLimit {
  categoryId: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  color: string;
  target: number;
  current: number;
  deadline: string;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'period';
