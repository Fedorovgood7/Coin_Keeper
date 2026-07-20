import { get, post } from './client';
import type { Goal } from '@/types';

export function getGoals() {
  return get<Goal[]>('/goals');
}

export function createGoal(data: {
  title: string;
  targetAmount: number;
  deadline: string;
}) {
  return post<Goal>('/goals', {
    title: data.title,
    target_amount: data.targetAmount,
    deadline: data.deadline,
  });
}

export function topupGoal(id: string, amount: number, accountId: string) {
  return post<Goal>(`/goals/${id}/topup`, {
    amount,
    account_id: accountId,
  });
}
