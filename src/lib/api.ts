import { 
  PredictionRequest, 
  CasePrediction,
  MarkSimilarityRequest,
  MarkSimilarityOutput,
  GsSimilarityRequest,
  GoodServiceLikelihoodOutput,
  CasePredictionRequest,
  CasePredictionResult,
  BatchGsSimilarityRequest,
  GoodOrService
} from "@/types/trademark";
import { getAuth } from "firebase/auth";

console.log("API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Helper function to get Firebase token and handle API calls
 */
async function callProtectedApi<TRequest, TResponse>(
  endpoint: string,
  requestData: TRequest
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured in environment variables.");
  }

  // Get Firebase ID token for the current user
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User is not logged in. Please log in to use this feature.");
  }
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    // Attempt to parse error details from the response body
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (e) {
      // Ignore if the body isn't valid JSON
    }
    console.error("API Error:", response.status, errorBody);
    throw new Error(
      `API request failed with status ${response.status}: ${
        errorBody?.detail || response.statusText
      }`
    );
  }

  return response.json() as Promise<TResponse>;
}

/**
 * Step 1: Compare marks
 * @param request The mark similarity request data
 * @returns Promise resolving to mark similarity assessment
 */
export const getMarkSimilarity = async (
  request: MarkSimilarityRequest
): Promise<MarkSimilarityOutput> => {
  return callProtectedApi<MarkSimilarityRequest, MarkSimilarityOutput>("/mark_similarity", request);
};

/**
 * Step 2: Compare a single goods/services pair
 * @param request The goods/services similarity request data
 * @returns Promise resolving to goods/services likelihood assessment
 */
export const getGoodServiceSimilarity = async (
  request: GsSimilarityRequest
): Promise<GoodServiceLikelihoodOutput> => {
  return callProtectedApi<GsSimilarityRequest, GoodServiceLikelihoodOutput>("/gs_similarity", request);
};

/**
 * Step 2B: Batch compare multiple goods/services pairs
 * @param applicantGoods Array of applicant goods/services
 * @param opponentGoods Array of opponent goods/services
 * @param markSimilarity Mark similarity assessment result
 * @returns Promise resolving to array of goods/services likelihood assessments
 */
export const batchGoodServiceSimilarity = async (
  applicantGoods: GoodOrService[],
  opponentGoods: GoodOrService[],
  markSimilarity: MarkSimilarityOutput
): Promise<GoodServiceLikelihoodOutput[]> => {
  const batchRequest: BatchGsSimilarityRequest = {
    applicant_goods: applicantGoods,
    opponent_goods: opponentGoods,
    mark_similarity: markSimilarity
  };
  return callProtectedApi<BatchGsSimilarityRequest, GoodServiceLikelihoodOutput[]>(
    "/batch_gs_similarity", 
    batchRequest
  );
};

/**
 * Step 3: Get final case prediction
 * @param request The case prediction request data
 * @returns Promise resolving to final case prediction result
 */
export const getCasePrediction = async (
  request: CasePredictionRequest
): Promise<CasePredictionResult> => {
  return callProtectedApi<CasePredictionRequest, CasePredictionResult>("/case_prediction", request);
};

/**
 * Calls the backend API to predict trademark opposition outcome.
 * 
 * @deprecated Use the new modular API endpoints instead: getMarkSimilarity, getGoodServiceSimilarity, getCasePrediction
 * @param requestData The data conforming to the PredictionRequest interface.
 * @returns A promise that resolves with the CasePredictionResult data.
 * @throws An error if the API call fails or returns a non-OK status.
 */
export const predictTrademarkOpposition = async (
  requestData: PredictionRequest
): Promise<CasePredictionResult> => {
  console.warn("predictTrademarkOpposition is deprecated. Use the new modular API endpoints.");
  
  // Step 1: Mark similarity
  const markSimilarityRequest: MarkSimilarityRequest = {
    applicant: requestData.applicant,
    opponent: requestData.opponent
  };
  const markSimilarity = await getMarkSimilarity(markSimilarityRequest);
  
  // Step 2: Process each goods/services pair
  const gsLikelihoodPromises = requestData.applicant_goods.flatMap(applicantGood => 
    requestData.opponent_goods.map(opponentGood => {
      const gsSimilarityRequest: GsSimilarityRequest = {
        applicant_good: applicantGood,
        opponent_good: opponentGood,
        mark_similarity: markSimilarity
      };
      return getGoodServiceSimilarity(gsSimilarityRequest);
    })
  );
  
  const gsLikelihoods = await Promise.all(gsLikelihoodPromises);
  
  // Step 3: Get case prediction
  const casePredictionRequest: CasePredictionRequest = {
    mark_similarity: markSimilarity,
    goods_services_likelihoods: gsLikelihoods
  };
  
  return getCasePrediction(casePredictionRequest);
};

// Optional: Add a health check function if needed
export const checkApiHealth = async (): Promise<{ status: string }> => {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured in environment variables.");
  }
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`API health check failed with status ${response.status}`);
  }
  return response.json() as Promise<{ status: string }>;
}; 