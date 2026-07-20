import { get, post, patch } from './client';
import type { Account } from '@/types';

export function getAccounts() {
  return get<Account[]>('/accounts');
}

export function createAccount(data: {
  name: string;
  type: string;
  currency: string;
  initialBalance: number;
}) {
  return post<Account>('/accounts', {
    name: data.name,
    type: data.type,
    currency: data.currency,
    initial_balance: data.initialBalance,
  });
}

export function updateAccount(id: string, name: string) {
  return patch<Account>(`/accounts/${id}`, { id, name });
}

export function archiveAccount(id: string) {
  return patch<Account>(`/accounts/${id}/archive`);
}
