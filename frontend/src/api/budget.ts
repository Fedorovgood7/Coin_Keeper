import { get, post } from './client';
import type { MonthlyBudget, CategoryLimit, SafeDailyAmount } from '@/types';

export function getMonthlyBudget(month: string) {
  return get<MonthlyBudget>('/budget/monthly', { month });
}

export function setCategoryLimit(categoryId: string, month: string, limit: number) {
  return post<CategoryLimit>('/budget/category-limit', {
    category_id: categoryId,
    month,
    limit,
  });
}

export function getSafeDailyAmount(month: string) {
  return get<SafeDailyAmount>('/budget/safe-daily-amount', { month });
}
