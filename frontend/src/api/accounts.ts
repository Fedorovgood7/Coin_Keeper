import { get, post, patch } from './client';
import type { Account } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getAccounts() {
  const response = await get<ApiResponse<Account[]>>('/accounts');
  return response.data;
}

export async function createAccount(data: {
  name: string;
  type: string;
  currency: string;
  initialBalance: number;
}) {
  const response = await post<ApiResponse<Account>>('/accounts', {
    name: data.name,
    type: data.type,
    currency: data.currency,
    initial_balance: data.initialBalance,
  });
  return response.data;
}

export async function updateAccount(id: string, name: string) {
  const response = await patch<ApiResponse<Account>>(`/accounts/${id}`, { id, name });
  return response.data;
}

export async function archiveAccount(id: string) {
  const response = await patch<ApiResponse<Account>>(`/accounts/${id}/archive`);
  return response.data;
}
