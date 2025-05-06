import { vi, describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMarkSimilarity } from './useMarkSimilarity';
import { getMarkSimilarity } from '@/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { MarkSimilarityEnum } from '@/types/trademark';

// Mock the API module
vi.mock('@/lib/api', () => ({
  getMarkSimilarity: vi.fn()
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

describe('useMarkSimilarity', () => {
  it('should call getMarkSimilarity when mutate is called', async () => {
    // Arrange
    const mockResponse = {
      visual: 'moderate' as MarkSimilarityEnum,
      aural: 'high' as MarkSimilarityEnum,
      conceptual: 'low' as MarkSimilarityEnum,
      overall: 'moderate' as MarkSimilarityEnum
    };
    
    const mockRequest = {
      applicant: { wordmark: 'ACME', is_registered: false },
      opponent: { wordmark: 'ACE', is_registered: true, registration_number: '12345' }
    };
    
    // Mock implementation
    (getMarkSimilarity as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    // Act
    const { result } = renderHook(() => useMarkSimilarity(), {
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
    expect(getMarkSimilarity).toHaveBeenCalledWith(mockRequest);
    
    // Assert - data should match the mock response
    expect(result.current.data).toEqual(mockResponse);
  });
  
  it('should handle error when API call fails', async () => {
    // Arrange
    const mockError = new Error('API error');
    const mockRequest = {
      applicant: { wordmark: 'ACME', is_registered: false },
      opponent: { wordmark: 'ACE', is_registered: true, registration_number: '12345' }
    };
    
    // Mock implementation to reject
    (getMarkSimilarity as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);
    
    // Act
    const { result } = renderHook(() => useMarkSimilarity(), {
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
      visual: 'moderate' as MarkSimilarityEnum,
      aural: 'high' as MarkSimilarityEnum, 
      conceptual: 'low' as MarkSimilarityEnum,
      overall: 'moderate' as MarkSimilarityEnum
    };
    
    const mockRequest = {
      applicant: { wordmark: 'ACME', is_registered: false },
      opponent: { wordmark: 'ACE', is_registered: true, registration_number: '12345' }
    };
    
    const onSuccess = vi.fn();
    
    // Mock implementation
    (getMarkSimilarity as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    // Act
    const { result } = renderHook(() => useMarkSimilarity({ onSuccess }), {
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