import { vi, describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTrademarkPrediction } from './useTrademarkPrediction';
import { predictTrademarkOpposition } from '@/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { MarkSimilarityEnum } from '@/types/trademark';

// Mock the API module
vi.mock('@/lib/api', () => ({
  predictTrademarkOpposition: vi.fn()
}));

// Setup a wrapper with QueryClientProvider for testing hooks that use react-query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTrademarkPrediction', () => {
  it('should call predictTrademarkOpposition when mutate is called', async () => {
    // Arrange
    const mockMarkSimilarity = {
      visual: 'moderate' as MarkSimilarityEnum,
      aural: 'high' as MarkSimilarityEnum,
      conceptual: 'low' as MarkSimilarityEnum,
      overall: 'moderate' as MarkSimilarityEnum
    };
    
    const mockGoodServiceLikelihood = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      are_competitive: true,
      are_complementary: false,
      similarity_score: 0.85,
      likelihood_of_confusion: true,
      confusion_type: 'direct' as 'direct'
    };
    
    const mockResponse = {
      mark_similarity: mockMarkSimilarity,
      goods_services_likelihoods: [mockGoodServiceLikelihood],
      opposition_outcome: {
        result: 'Opposition likely to succeed' as const,
        confidence: 0.85,
        reasoning: 'The marks are moderately similar and there is a likelihood of confusion between the goods.'
      }
    };
    
    const mockRequest = {
      applicant: { wordmark: 'ACME', is_registered: false },
      opponent: { wordmark: 'ACE', is_registered: true, registration_number: '12345' },
      applicant_goods: [{ term: 'clothing', nice_class: 25 }],
      opponent_goods: [{ term: 't-shirts', nice_class: 25 }]
    };
    
    // Mock implementation
    (predictTrademarkOpposition as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    // Act
    const { result } = renderHook(() => useTrademarkPrediction(), {
      wrapper: createWrapper()
    });
    
    // Assert - initially not loading
    expect(result.current.isPending).toBe(false);
    
    // Act - call mutate
    result.current.mutate(mockRequest);
    
    // Assert - should be loading
    expect(result.current.isPending).toBe(true);
    
    // Wait for the mutation to complete
    await waitFor(() => expect(result.current.isPending).toBe(false));
    
    // Assert - API should have been called with the request
    expect(predictTrademarkOpposition).toHaveBeenCalledWith(mockRequest);
    
    // Assert - data should match the mock response
    expect(result.current.data).toEqual(mockResponse);
  });
  
  it('should handle error when API call fails', async () => {
    // Arrange
    const mockError = new Error('API error');
    const mockRequest = {
      applicant: { wordmark: 'ACME', is_registered: false },
      opponent: { wordmark: 'ACE', is_registered: true, registration_number: '12345' },
      applicant_goods: [{ term: 'clothing', nice_class: 25 }],
      opponent_goods: [{ term: 't-shirts', nice_class: 25 }]
    };
    
    // Mock implementation to reject
    (predictTrademarkOpposition as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);
    
    // Act
    const { result } = renderHook(() => useTrademarkPrediction(), {
      wrapper: createWrapper()
    });
    
    // Act - call mutate
    result.current.mutate(mockRequest);
    
    // Wait for the mutation to complete
    await waitFor(() => expect(result.current.isPending).toBe(false));
    
    // Assert - should have error
    expect(result.current.error).toEqual(mockError);
  });
  
  it('should execute onSuccess callback if provided', async () => {
    // Arrange
    const mockMarkSimilarity = {
      visual: 'moderate' as MarkSimilarityEnum,
      aural: 'high' as MarkSimilarityEnum,
      conceptual: 'low' as MarkSimilarityEnum,
      overall: 'moderate' as MarkSimilarityEnum
    };
    
    const mockGoodServiceLikelihood = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      are_competitive: true,
      are_complementary: false,
      similarity_score: 0.85,
      likelihood_of_confusion: true,
      confusion_type: 'direct' as 'direct'
    };
    
    const mockResponse = {
      mark_similarity: mockMarkSimilarity,
      goods_services_likelihoods: [mockGoodServiceLikelihood],
      opposition_outcome: {
        result: 'Opposition likely to succeed' as const,
        confidence: 0.85,
        reasoning: 'The marks are moderately similar and there is a likelihood of confusion between the goods.'
      }
    };
    
    const mockRequest = {
      applicant: { wordmark: 'ACME', is_registered: false },
      opponent: { wordmark: 'ACE', is_registered: true, registration_number: '12345' },
      applicant_goods: [{ term: 'clothing', nice_class: 25 }],
      opponent_goods: [{ term: 't-shirts', nice_class: 25 }]
    };
    
    const onSuccess = vi.fn();
    
    // Mock implementation
    (predictTrademarkOpposition as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    // Act
    const { result } = renderHook(() => useTrademarkPrediction({ onSuccess }), {
      wrapper: createWrapper()
    });
    
    // Act - call mutate
    result.current.mutate(mockRequest);
    
    // Wait for the mutation to complete
    await waitFor(() => expect(result.current.isPending).toBe(false));
    
    // Assert - onSuccess should have been called with the response
    expect(onSuccess).toHaveBeenCalledWith(mockResponse, mockRequest, expect.anything());
  });
}); 