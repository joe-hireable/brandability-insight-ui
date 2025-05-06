import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getGoodServiceSimilarity, batchGoodServiceSimilarity } from "@/lib/api";
import { GsSimilarityRequest, GoodServiceLikelihoodOutput, GoodOrService, MarkSimilarityOutput } from "@/types/trademark";

type GsSimilarityError = Error;

type UseGoodServiceSimilarityOptions = Omit<
  UseMutationOptions<
    GoodServiceLikelihoodOutput,
    GsSimilarityError,
    GsSimilarityRequest
  >,
  'mutationFn'
>;

type BatchGsParams = {
  applicantGoods: GoodOrService[];
  opponentGoods: GoodOrService[];
  markSimilarity: MarkSimilarityOutput;
};

type UseBatchGoodServiceSimilarityOptions = Omit<
  UseMutationOptions<
    GoodServiceLikelihoodOutput[],
    GsSimilarityError,
    BatchGsParams
  >,
  'mutationFn'
>;

export const useGoodServiceSimilarity = (options?: UseGoodServiceSimilarityOptions) => {
  return useMutation<GoodServiceLikelihoodOutput, GsSimilarityError, GsSimilarityRequest>({
    mutationFn: getGoodServiceSimilarity,
    ...options,
  });
};

export const useBatchGoodServiceSimilarity = (options?: UseBatchGoodServiceSimilarityOptions) => {
  return useMutation<GoodServiceLikelihoodOutput[], GsSimilarityError, BatchGsParams>({
    mutationFn: ({ applicantGoods, opponentGoods, markSimilarity }) => 
      batchGoodServiceSimilarity(applicantGoods, opponentGoods, markSimilarity),
    ...options,
  });
}; 