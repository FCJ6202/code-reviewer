import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/users';
import { queryKeys } from '@/services/queryKeys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: getMe,
  });
}
