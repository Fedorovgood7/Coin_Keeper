import { get, post, patch, del } from './client';
import type { Transaction } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getTransactions(params?: {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  categoryId?: string;
  type?: string;
}) {
  const queryParams: Record<string, string> = {};
  if (params?.dateFrom) queryParams.date_from = params.dateFrom;
  if (params?.dateTo) queryParams.date_to = params.dateTo;
  if (params?.accountId) queryParams.account_id = params.accountId;
  if (params?.categoryId) queryParams.category_id = params.categoryId;
  if (params?.type) queryParams.type = params.type;
  const response = await get<ApiResponse<Transaction[]>>('/transactions', queryParams);
  return response.data;
}

export async function createTransaction(data: {
  type: string;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId: string;
  date: string;
  comment?: string;
}) {
  const response = await post<ApiResponse<Transaction>>('/transactions', {
    type: data.type,
    amount: data.amount,
    account_id: data.accountId,
    to_account_id: data.toAccountId,
    category_id: data.categoryId,
    date: data.date,
    comment: data.comment,
  });
  return response.data;
}

export async function updateTransaction(id: string, data: {
  amount?: number;
  categoryId?: string;
  date?: string;
  comment?: string;
}) {
  const response = await patch<ApiResponse<Transaction>>(`/transactions/${id}`, {
    id,
    ...data,
  });
  return response.data;
}

export async function deleteTransaction(id: string) {
  await del<void>(`/transactions/${id}`);
}
