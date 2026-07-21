import { get, post } from './client';
import type { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

interface ApiResponse<T> {
  data: T;
}

export async function loginWithYandex(code: string) {
  const response = await post<ApiResponse<AuthResponse>>('/auth/yandex', { code });
  return response.data;
}

export async function getProfile() {
  const response = await get<ApiResponse<User>>('/auth/me');
  return response.data;
}

export function logout() {
  return post<void>('/auth/logout');
}
