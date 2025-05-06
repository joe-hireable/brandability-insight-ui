import { vi, describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGoodServiceSimilarity } from './useGoodServiceSimilarity';
import { getGoodServiceSimilarity } from '@/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { MarkSimilarityEnum } from '@/types/trademark';

// Mock the API module
vi.mock('@/lib/api', () => ({
  getGoodServiceSimilarity: vi.fn()
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

describe('useGoodServiceSimilarity', () => {
  it('should call getGoodServiceSimilarity when mutate is called', async () => {
    // Arrange
    const mockResponse = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      are_competitive: true,
      are_complementary: false,
      similarity_score: 0.85,
      likelihood_of_confusion: true,
      confusion_type: 'direct' as 'direct'
    };
    
    const mockRequest = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      mark_similarity: {
        visual: 'moderate' as MarkSimilarityEnum,
        aural: 'high' as MarkSimilarityEnum,
        conceptual: 'low' as MarkSimilarityEnum,
        overall: 'moderate' as MarkSimilarityEnum
      }
    };
    
    // Mock implementation
    (getGoodServiceSimilarity as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    // Act
    const { result } = renderHook(() => useGoodServiceSimilarity(), {
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
    expect(getGoodServiceSimilarity).toHaveBeenCalledWith(mockRequest);
    
    // Assert - data should match the mock response
    expect(result.current.data).toEqual(mockResponse);
  });
  
  it('should handle error when API call fails', async () => {
    // Arrange
    const mockError = new Error('API error');
    const mockRequest = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      mark_similarity: {
        visual: 'moderate' as MarkSimilarityEnum,
        aural: 'high' as MarkSimilarityEnum,
        conceptual: 'low' as MarkSimilarityEnum,
        overall: 'moderate' as MarkSimilarityEnum
      }
    };
    
    // Mock implementation to reject
    (getGoodServiceSimilarity as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);
    
    // Act
    const { result } = renderHook(() => useGoodServiceSimilarity(), {
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
    const mockResponse = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      are_competitive: true,
      are_complementary: false,
      similarity_score: 0.85,
      likelihood_of_confusion: true,
      confusion_type: 'direct' as 'direct'
    };
    
    const mockRequest = {
      applicant_good: { term: 'clothing', nice_class: 25 },
      opponent_good: { term: 't-shirts', nice_class: 25 },
      mark_similarity: {
        visual: 'moderate' as MarkSimilarityEnum,
        aural: 'high' as MarkSimilarityEnum,
        conceptual: 'low' as MarkSimilarityEnum,
        overall: 'moderate' as MarkSimilarityEnum
      }
    };
    
    const onSuccess = vi.fn();
    
    // Mock implementation
    (getGoodServiceSimilarity as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    // Act
    const { result } = renderHook(() => useGoodServiceSimilarity({ onSuccess }), {
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