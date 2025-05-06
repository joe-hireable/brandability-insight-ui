// import { Literal, List, Annotated, Optional } from "@pydantic/core"; // Assuming pydantic-core or similar helper if needed, otherwise use TS types

// Use TypeScript Enums or Union Types for Literal fields
export type MarkSimilarityEnum = "dissimilar" | "low" | "moderate" | "high" | "identical";
export type OppositionResultEnum = "Opposition likely to succeed" | "Opposition may partially succeed" | "Opposition likely to fail";

/**
 * A trademark mark, consisting of text and registration details.
 * Matches Python: Mark
 */
export interface TrademarkMark {
  wordmark: string;
  is_registered: boolean;
  registration_number?: string | null; // Allow null as FastAPI might send null for optional fields
}

/**
 * A single goods/services entry with Nice classification.
 * Matches Python: GoodService
 */
export interface GoodOrService {
  term: string;
  nice_class: number; // Assuming pydantic validates >=1, <=45
}

/**
 * Comparison results between two trademarks across multiple dimensions.
 * Matches Python: MarkComparison
 */
export interface MarkComparison {
  visual: MarkSimilarityEnum;
  aural: MarkSimilarityEnum;
  conceptual: MarkSimilarityEnum;
  overall: MarkSimilarityEnum;
}

/**
 * Detailed comparison between one applicant good/service and one opponent good/service.
 * Matches Python: GoodServiceComparison
 */
export interface GoodServiceComparison {
  applicant_good: GoodOrService;
  opponent_good: GoodOrService;
  overall_similarity: MarkSimilarityEnum;
  are_competitive: boolean;
  are_complementary: boolean;
  // reasoning?: string | null; // Optional reasoning if added later
}

/**
 * Structured prediction of the opposition outcome.
 * Matches Python: OppositionOutcome
 */
export interface OppositionOutcome {
  result: OppositionResultEnum;
  confidence: number; // Pydantic float maps to TS number
  reasoning: string;
}

/**
 * Complete trademark opposition case prediction including all comparisons.
 * Matches Python: CasePrediction
 * @deprecated Use CasePredictionResult instead
 */
export interface CasePrediction {
  mark_comparison: MarkComparison;
  goods_services_comparisons: GoodServiceComparison[];
  likelihood_of_confusion: boolean;
  opposition_outcome: OppositionOutcome;
}

/**
 * Input model for trademark opposition prediction.
 * Matches Python: PredictionRequest
 */
export interface PredictionRequest {
  // Ensure applicant mark matches Python model (is_registered is not part of Mark in Python, handled differently)
  applicant: Omit<TrademarkMark, 'registration_number'>; // Match the Pydantic definition
  opponent: TrademarkMark;
  applicant_goods: GoodOrService[]; // Pydantic max_length is runtime validation, not TS type
  opponent_goods: GoodOrService[]; // Pydantic max_length is runtime validation, not TS type
}

// --- New Interfaces for Refactored API ---

/**
 * Request model for mark similarity assessment.
 */
export interface MarkSimilarityRequest {
  applicant: TrademarkMark;
  opponent: TrademarkMark;
}

/**
 * Response model for mark similarity assessment.
 */
export interface MarkSimilarityOutput {
  visual: MarkSimilarityEnum;
  aural: MarkSimilarityEnum;
  conceptual: MarkSimilarityEnum;
  overall: MarkSimilarityEnum;
  reasoning?: string; // Optional LLM reasoning
}

/**
 * Response model for goods/services likelihood of confusion assessment.
 */
export interface GoodServiceLikelihoodOutput {
  applicant_good: GoodOrService;
  opponent_good: GoodOrService;
  are_competitive: boolean;
  are_complementary: boolean;
  similarity_score: number; // 0.0 to 1.0
  likelihood_of_confusion: boolean;
  confusion_type?: "direct" | "indirect"; // Only if likelihood_of_confusion is true
}

/**
 * Request model for goods/services similarity assessment.
 */
export interface GsSimilarityRequest {
  applicant_good: GoodOrService;
  opponent_good: GoodOrService;
  mark_similarity: MarkSimilarityOutput; // The output from /mark_similarity
}

/**
 * Request model for batch goods/services similarity assessment.
 */
export interface BatchGsSimilarityRequest {
  applicant_goods: GoodOrService[];
  opponent_goods: GoodOrService[];
  mark_similarity: MarkSimilarityOutput;
}

/**
 * Request model for final case prediction.
 */
export interface CasePredictionRequest {
  mark_similarity: MarkSimilarityOutput;
  goods_services_likelihoods: GoodServiceLikelihoodOutput[];
}

/**
 * Response model for case prediction, replacing the legacy CasePrediction.
 */
export interface CasePredictionResult {
  mark_similarity: MarkSimilarityOutput;
  goods_services_likelihoods: GoodServiceLikelihoodOutput[];
  opposition_outcome: OppositionOutcome;
}

// --- Deprecated / Old Types (to be removed or updated if still used elsewhere) ---
/*
export interface SimilarityAnalysis {
  score: number; // Typically between 0 and 1
  reasoning: string;
}

export interface MarkComparisonAnalysis {
  visual_similarity: SimilarityAnalysis;
  aural_similarity: SimilarityAnalysis;
  conceptual_similarity: SimilarityAnalysis;
  overall_mark_similarity: SimilarityAnalysis;
}

export interface GoodsServicesPairComparison {
  applicant_term: string;
  applicant_nice_class: number;
  opponent_term: string;
  opponent_nice_class: number;
  similarity: SimilarityAnalysis;
}

export interface GoodsServicesComparisonAnalysis {
  similarity_matrix: GoodsServicesPairComparison[]; // Array comparing each applicant G/S with each opponent G/S
  overall_similarity: SimilarityAnalysis;
}

export interface DetailedAnalysis {
  mark_comparison: MarkComparisonAnalysis;
  goods_services_comparison: GoodsServicesComparisonAnalysis;
  likelihood_of_confusion: SimilarityAnalysis;
}

export interface PredictionResult {
  outcome: string; // e.g., "Opposition likely to succeed", "Opposition unlikely to succeed"
  confidence: string; // e.g., "High", "Medium", "Low"
  summary: string; // Detailed explanation of the prediction
}
*/ 