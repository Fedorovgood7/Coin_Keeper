import { get, post } from './client';
import type { RecurringPayment } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getRecurringPayments() {
  const response = await get<ApiResponse<RecurringPayment[]>>('/recurring');
  return response.data;
}

export async function createRecurring(data: {
  type: string;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  periodicity: string;
  nextDate: string;
  comment?: string;
}) {
  const response = await post<ApiResponse<RecurringPayment>>('/recurring', {
    type: data.type,
    amount: data.amount,
    account_id: data.accountId,
    to_account_id: data.toAccountId,
    category_id: data.categoryId,
    periodicity: data.periodicity,
    next_date: data.nextDate,
    comment: data.comment,
  });
  return response.data;
}

export async function generateRecurringTransactions() {
  await post<void>('/recurring/generate');
}
