export type TransactionType = 'income' | 'expense' | 'transfer';
export type AccountType = 'cash' | 'debit' | 'credit' | 'savings';
export type Currency = 'RUB' | 'USD' | 'EUR';
export type Periodicity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  archived: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  targetAccountId?: string;
  categoryId?: string;
  date: string;
  note?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface RecurringPayment {
  id: string;
  categoryId: string;
  amount: number;
  periodicity: string;
  nextDate: string;
  note?: string;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'period';
