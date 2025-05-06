import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getCasePrediction } from "@/lib/api";
import { CasePredictionRequest, CasePredictionResult } from "@/types/trademark";

type CasePredictionError = Error;

type UseCasePredictionOptions = Omit<
  UseMutationOptions<
    CasePredictionResult,
    CasePredictionError,
    CasePredictionRequest
  >,
  'mutationFn'
>;

export const useCasePrediction = (options?: UseCasePredictionOptions) => {
  return useMutation<CasePredictionResult, CasePredictionError, CasePredictionRequest>({
    mutationFn: getCasePrediction,
    ...options,
  });
}; 