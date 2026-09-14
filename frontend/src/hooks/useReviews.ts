import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReview, getReview, listReviews } from '@/services/reviews';
import { queryKeys } from '@/services/queryKeys';
import { HISTORY_LIMIT } from '@/config/review';
import type { Review, ReviewRequest } from '@/types';

export function useReviewList(limit = HISTORY_LIMIT) {
  return useQuery({
    queryKey: queryKeys.reviews.list(limit),
    queryFn: () => listReviews(limit),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: queryKeys.reviews.detail(id),
    queryFn: () => getReview(id),
    // A stored review never changes.
    staleTime: Infinity,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReviewRequest) => createReview(request),
    onSuccess: (review, request) => {
      // The POST response leaves out the code; add it back so the result page
      // renders from cache without a second request.
      const withCode: Review = { ...review, code: request.code };
      queryClient.setQueryData(queryKeys.reviews.detail(review.id), withCode);
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.lists });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
    },
  });
}
