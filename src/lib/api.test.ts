import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
  getMarkSimilarity, 
  getGoodServiceSimilarity, 
  getCasePrediction, 
  predictTrademarkOpposition, 
  checkApiHealth 
} from './api';
import { 
  MarkSimilarityRequest, 
  GsSimilarityRequest, 
  CasePredictionRequest,
  MarkSimilarityEnum
} from '@/types/trademark';

// Mock global fetch
const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;

// Mock responses
const mockMarkSimilarityResponse = {
  visual: "moderate" as MarkSimilarityEnum,
  aural: "high" as MarkSimilarityEnum,
  conceptual: "low" as MarkSimilarityEnum,
  overall: "moderate" as MarkSimilarityEnum
};

const mockGoodServiceLikelihoodResponse = {
  applicant_good: { term: "clothing", nice_class: 25 },
  opponent_good: { term: "t-shirts", nice_class: 25 },
  are_competitive: true,
  are_complementary: false,
  similarity_score: 0.85,
  likelihood_of_confusion: true,
  confusion_type: "direct" as "direct" | "indirect"
};

const mockCasePredictionResponse = {
  mark_similarity: mockMarkSimilarityResponse,
  goods_services_likelihoods: [mockGoodServiceLikelihoodResponse],
  opposition_outcome: {
    result: "Opposition likely to succeed" as const,
    confidence: 0.85,
    reasoning: "The marks are moderately similar and there is a likelihood of confusion between the goods."
  }
};

describe('API functions', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getMarkSimilarity', () => {
    it('should call the mark_similarity endpoint with correct data', async () => {
      // Arrange
      const request: MarkSimilarityRequest = {
        applicant: { wordmark: "ACME", is_registered: false },
        opponent: { wordmark: "ACE", is_registered: true, registration_number: "12345" }
      };
      
      // Configure mock to return a successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMarkSimilarityResponse)
      });

      // Act
      const result = await getMarkSimilarity(request);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/mark_similarity', 
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify(request)
        })
      );
      
      expect(result).toEqual(mockMarkSimilarityResponse);
    });

    it('should throw an error when the API call fails', async () => {
      // Arrange
      const request: MarkSimilarityRequest = {
        applicant: { wordmark: "ACME", is_registered: false },
        opponent: { wordmark: "ACE", is_registered: true, registration_number: "12345" }
      };
      
      // Configure mock to return an error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ detail: 'Invalid request data' })
      });

      // Act & Assert
      await expect(getMarkSimilarity(request)).rejects.toThrow(
        'API request failed with status 400: Invalid request data'
      );
    });
  });

  describe('getGoodServiceSimilarity', () => {
    it('should call the gs_similarity endpoint with correct data', async () => {
      // Arrange
      const request: GsSimilarityRequest = {
        applicant_good: { term: "clothing", nice_class: 25 },
        opponent_good: { term: "t-shirts", nice_class: 25 },
        mark_similarity: mockMarkSimilarityResponse
      };
      
      // Configure mock to return a successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGoodServiceLikelihoodResponse)
      });

      // Act
      const result = await getGoodServiceSimilarity(request);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/gs_similarity', 
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      
      expect(result).toEqual(mockGoodServiceLikelihoodResponse);
    });
  });

  describe('getCasePrediction', () => {
    it('should call the case_prediction endpoint with correct data', async () => {
      // Arrange
      const request: CasePredictionRequest = {
        mark_similarity: mockMarkSimilarityResponse,
        goods_services_likelihoods: [mockGoodServiceLikelihoodResponse]
      };
      
      // Configure mock to return a successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCasePredictionResponse)
      });

      // Act
      const result = await getCasePrediction(request);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/case_prediction', 
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
      
      expect(result).toEqual(mockCasePredictionResponse);
    });
  });

  describe('predictTrademarkOpposition', () => {
    it('should call all three endpoints in sequence', async () => {
      // Arrange
      const request = {
        applicant: { wordmark: "ACME", is_registered: false },
        opponent: { wordmark: "ACE", is_registered: true, registration_number: "12345" },
        applicant_goods: [{ term: "clothing", nice_class: 25 }],
        opponent_goods: [{ term: "t-shirts", nice_class: 25 }]
      };
      
      // Configure mocks for the three sequential calls
      mockFetch
        // First call: mark_similarity
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMarkSimilarityResponse)
        })
        // Second call: gs_similarity
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGoodServiceLikelihoodResponse)
        })
        // Third call: case_prediction
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCasePredictionResponse)
        });

      // Act
      const result = await predictTrademarkOpposition(request);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3);
      
      // First call should be to mark_similarity
      expect(mockFetch.mock.calls[0][0]).toBe('https://test-api.example.com/mark_similarity');
      
      // Second call should be to gs_similarity
      expect(mockFetch.mock.calls[1][0]).toBe('https://test-api.example.com/gs_similarity');
      
      // Third call should be to case_prediction
      expect(mockFetch.mock.calls[2][0]).toBe('https://test-api.example.com/case_prediction');
      
      expect(result).toEqual(mockCasePredictionResponse);
    });
  });

  describe('checkApiHealth', () => {
    it('should call the health endpoint', async () => {
      // Arrange
      const mockHealthResponse = { status: "healthy" };
      
      // Configure mock to return a successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthResponse)
      });

      // Act
      const result = await checkApiHealth();

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('https://test-api.example.com/health');
      expect(result).toEqual(mockHealthResponse);
    });

    it('should throw an error when the API health check fails', async () => {
      // Configure mock to return an error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Act & Assert
      await expect(checkApiHealth()).rejects.toThrow(
        'API health check failed with status 500'
      );
    });
  });
}); 