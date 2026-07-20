import { get } from './client';
import type { DashboardData } from '@/types';

export function getDashboard() {
  return get<DashboardData>('/dashboard');
}
