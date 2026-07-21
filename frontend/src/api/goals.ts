import { get, post } from './client';
import type { Goal } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getGoals() {
  const response = await get<ApiResponse<Goal[]>>('/goals');
  return response.data;
}

export async function createGoal(data: {
  title: string;
  targetAmount: number;
  deadline: string;
}) {
  const response = await post<ApiResponse<Goal>>('/goals', {
    title: data.title,
    target_amount: data.targetAmount,
    deadline: data.deadline,
  });
  return response.data;
}

export async function topupGoal(id: string, amount: number, accountId: string) {
  const response = await post<ApiResponse<Goal>>(`/goals/${id}/topup`, {
    amount,
    account_id: accountId,
  });
  return response.data;
}
