import { get } from './client';
import type { CategoryStatItem, DailyStatItem, IncomeExpenseComparison } from '@/types';

interface CategoryStatsResponse {
  month: string;
  categories: CategoryStatItem[];
  total: number;
}

interface DailyStatsResponse {
  month: string;
  days: DailyStatItem[];
}

export function getCategoryStats(month: string) {
  return get<CategoryStatsResponse>('/analytics/categories', { month });
}

export function getDailyStats(month: string) {
  return get<DailyStatsResponse>('/analytics/daily', { month });
}

export function getIncomeExpenseComparison(month: string) {
  return get<IncomeExpenseComparison>('/analytics/comparison', { month });
}
