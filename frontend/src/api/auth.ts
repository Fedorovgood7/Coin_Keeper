import { get, post } from './client';
import type { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

export function loginWithYandex(code: string) {
  return post<AuthResponse>('/auth/yandex', { code });
}

export function getProfile() {
  return get<User>('/auth/me');
}

export function logout() {
  return post<void>('/auth/logout');
}
