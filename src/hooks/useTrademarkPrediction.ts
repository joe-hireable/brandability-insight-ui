import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { predictTrademarkOpposition } from "@/lib/api";
import { PredictionRequest, CasePrediction } from "@/types/trademark";

// Define the type for the error, which is likely an Error object
type PredictionError = Error;

// Define options type if you want to allow customizing mutation behavior from the component
type UseTrademarkPredictionOptions = Omit<
  UseMutationOptions<
    CasePrediction, // Type of data returned on success
    PredictionError,  // Type of error
    PredictionRequest // Type of variables passed to the mutation function
  >,
  'mutationFn' // Exclude mutationFn as we provide it
>;

/**
 * Custom hook to manage the trademark opposition prediction API call using TanStack Query.
 *
 * @param options Optional configuration for the useMutation hook.
 * @returns The mutation object from TanStack Query, including state like `mutate`, `isPending`, `isError`, `error`, `data`.
 */
export const useTrademarkPrediction = (options?: UseTrademarkPredictionOptions) => {
  return useMutation<CasePrediction, PredictionError, PredictionRequest>({
    mutationFn: predictTrademarkOpposition, // The function that performs the API call
    // You can add default options here if needed, e.g.:
    // gcTime: 300000, // Cache time for the mutation result (5 minutes)
    // You can also pass onSuccess, onError, onSettled handlers here or in the component
    ...options, // Spread any options passed in from the component
  });
}; 