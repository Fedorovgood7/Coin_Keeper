import { get } from './client';
import type { CategoryStatItem, DailyStatItem, IncomeExpenseComparison } from '@/types';

interface ApiResponse<T> {
  data: T;
}

interface CategoryStatsResponse {
  month: string;
  categories: CategoryStatItem[];
  total: number;
}

interface DailyStatsResponse {
  month: string;
  days: DailyStatItem[];
}

export async function getCategoryStats(month: string) {
  const response = await get<ApiResponse<CategoryStatsResponse>>('/analytics/categories', { month });
  return response.data;
}

export async function getDailyStats(month: string) {
  const response = await get<ApiResponse<DailyStatsResponse>>('/analytics/daily', { month });
  return response.data;
}

export async function getIncomeExpenseComparison(month: string) {
  const response = await get<ApiResponse<IncomeExpenseComparison>>('/analytics/comparison', { month });
  return response.data;
}
