import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ingestRules, listRules } from '@/services/rules';
import { queryKeys } from '@/services/queryKeys';
import { RULE_LIST_LIMIT } from '@/config/rules';

export function useRuleList() {
  return useQuery({
    queryKey: queryKeys.rules.list,
    queryFn: () => listRules(RULE_LIST_LIMIT),
  });
}

export function useIngestRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => ingestRules(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rules.list });
    },
  });
}
