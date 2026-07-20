import { get, patch } from './client';
import type { Category } from '@/types';

export function getCategories() {
  return get<Category[]>('/categories');
}

export function updateCategory(id: string, data: { color?: string; icon?: string }) {
  return patch<Category>(`/categories/${id}`, { id, ...data });
}
