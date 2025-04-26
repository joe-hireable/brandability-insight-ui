import { PredictionRequest, CasePrediction } from "@/types/trademark";
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Calls the backend API to predict trademark opposition outcome.
 * 
 * @param requestData The data conforming to the PredictionRequest interface.
 * @returns A promise that resolves with the CasePrediction data.
 * @throws An error if the API call fails or returns a non-OK status.
 */
export const predictTrademarkOpposition = async (
  requestData: PredictionRequest
): Promise<CasePrediction> => {
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

  const response = await fetch(`${API_BASE_URL}/predict`, {
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

  return response.json() as Promise<CasePrediction>;
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