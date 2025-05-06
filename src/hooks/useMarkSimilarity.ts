import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getMarkSimilarity } from "@/lib/api";
import { MarkSimilarityRequest, MarkSimilarityOutput } from "@/types/trademark";

type MarkSimilarityError = Error;

type UseMarkSimilarityOptions = Omit<
  UseMutationOptions<
    MarkSimilarityOutput,
    MarkSimilarityError,
    MarkSimilarityRequest
  >,
  'mutationFn'
>;

export const useMarkSimilarity = (options?: UseMarkSimilarityOptions) => {
  return useMutation<MarkSimilarityOutput, MarkSimilarityError, MarkSimilarityRequest>({
    mutationFn: getMarkSimilarity,
    ...options,
  });
}; 