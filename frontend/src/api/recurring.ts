import { get, post } from './client';
import type { RecurringPayment } from '@/types';

export function getRecurringPayments() {
  return get<RecurringPayment[]>('/recurring');
}

export function createRecurring(data: {
  type: string;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  periodicity: string;
  nextDate: string;
  comment?: string;
}) {
  return post<RecurringPayment>('/recurring', {
    type: data.type,
    amount: data.amount,
    account_id: data.accountId,
    to_account_id: data.toAccountId,
    category_id: data.categoryId,
    periodicity: data.periodicity,
    next_date: data.nextDate,
    comment: data.comment,
  });
}

export function generateRecurringTransactions() {
  return post<void>('/recurring/generate');
}
