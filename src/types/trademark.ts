/**
 * Represents a single trademark mark.
 */
export interface TrademarkMark {
  wordmark: string;
  is_registered: boolean;
  registration_number?: string; // Optional, only for opponent if registered
}

/**
 * Represents a single good or service associated with a trademark.
 */
export interface GoodOrService {
  term: string;
  nice_class: number;
}

/**
 * Represents the request body for the /predict endpoint.
 */
export interface PredictionRequest {
  applicant: Omit<TrademarkMark, 'registration_number'>; // Applicant cannot have registration number
  opponent: TrademarkMark;
  applicant_goods: GoodOrService[];
  opponent_goods: GoodOrService[];
}

/**
 * Represents the similarity score and reasoning for a specific comparison aspect.
 */
export interface SimilarityAnalysis {
  score: number; // Typically between 0 and 1
  reasoning: string;
}

/**
 * Represents the detailed comparison between the two marks.
 */
export interface MarkComparisonAnalysis {
  visual_similarity: SimilarityAnalysis;
  aural_similarity: SimilarityAnalysis;
  conceptual_similarity: SimilarityAnalysis;
  overall_mark_similarity: SimilarityAnalysis;
}

/**
 * Represents the comparison result between one applicant good/service and one opponent good/service.
 */
export interface GoodsServicesPairComparison {
  applicant_term: string;
  applicant_nice_class: number;
  opponent_term: string;
  opponent_nice_class: number;
  similarity: SimilarityAnalysis;
}

/**
 * Represents the detailed comparison between the goods and services.
 */
export interface GoodsServicesComparisonAnalysis {
  similarity_matrix: GoodsServicesPairComparison[]; // Array comparing each applicant G/S with each opponent G/S
  overall_similarity: SimilarityAnalysis;
}

/**
 * Represents the full analysis section of the prediction response.
 */
export interface DetailedAnalysis {
  mark_comparison: MarkComparisonAnalysis;
  goods_services_comparison: GoodsServicesComparisonAnalysis;
  likelihood_of_confusion: SimilarityAnalysis;
}

/**
 * Represents the final prediction outcome and summary.
 */
export interface PredictionResult {
  outcome: string; // e.g., "Opposition likely to succeed", "Opposition unlikely to succeed"
  confidence: string; // e.g., "High", "Medium", "Low"
  summary: string; // Detailed explanation of the prediction
}

/**
 * Represents the full response body from the /predict endpoint.
 */
export interface CasePrediction {
  analysis: DetailedAnalysis;
  prediction: PredictionResult;
  // Include other potential top-level fields if known from the full schema
  // For example:
  // request_details: PredictionRequest; // Echo back the request?
  // timestamp: string;
} 