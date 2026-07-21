import { get, post } from './client';
import type { MonthlyBudget, CategoryLimit, SafeDailyAmount } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getMonthlyBudget(month: string) {
  const response = await get<ApiResponse<MonthlyBudget>>('/budget/monthly', { month });
  return response.data;
}

export async function setCategoryLimit(categoryId: string, month: string, limit: number) {
  const response = await post<ApiResponse<CategoryLimit>>('/budget/category-limit', {
    category_id: categoryId,
    month,
    limit,
  });
  return response.data;
}

export async function getSafeDailyAmount(month: string) {
  const response = await get<ApiResponse<SafeDailyAmount>>('/budget/safe-daily-amount', { month });
  return response.data;
}
