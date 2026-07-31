import { get, post, patch } from './client';
import type { Category } from '@/types';

interface ApiResponse<T> {
  data: T;
}

export async function getCategories() {
  const response = await get<ApiResponse<Category[]>>('/categories');
  return response.data;
}

export async function createCategory(data: { name: string; type: string; color?: string; icon?: string }) {
  const response = await post<ApiResponse<Category>>('/categories', {
    name: data.name,
    type: data.type,
    color: data.color,
    icon: data.icon,
  });
  return response.data;
}

export async function updateCategory(id: string, data: { color?: string; icon?: string }) {
  const response = await patch<ApiResponse<Category>>(`/categories/${id}`, { id, ...data });
  return response.data;
}
