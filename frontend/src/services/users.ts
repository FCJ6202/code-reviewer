import { api } from './api';
import type { User } from '@/types';

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}
