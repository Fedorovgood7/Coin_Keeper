import { get } from './client';
import type { DashboardData } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getDashboard() {
  const response = await get<ApiResponse<DashboardData>>('/dashboard');
  return response.data;
}
