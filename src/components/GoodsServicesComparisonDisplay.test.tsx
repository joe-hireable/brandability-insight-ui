import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GoodsServicesComparisonDisplay } from './GoodsServicesComparisonDisplay';
import { GoodServiceLikelihoodOutput } from '@/types/trademark';

describe('GoodsServicesComparisonDisplay', () => {
  const mockData: GoodServiceLikelihoodOutput[] = [
    {
      applicant_good: { term: 'T-shirts', nice_class: 25 },
      opponent_good: { term: 'Clothing, namely shirts', nice_class: 25 },
      are_competitive: true,
      are_complementary: false,
      similarity_score: 0.85,
      likelihood_of_confusion: true,
      confusion_type: 'direct'
    },
    {
      applicant_good: { term: 'Online retail services for clothing', nice_class: 35 },
      opponent_good: { term: 'Retail services for clothing', nice_class: 35 },
      are_competitive: true,
      are_complementary: false,
      similarity_score: 0.75,
      likelihood_of_confusion: true,
      confusion_type: 'direct'
    },
    {
      applicant_good: { term: 'T-shirts', nice_class: 25 },
      opponent_good: { term: 'Retail services for clothing', nice_class: 35 },
      are_competitive: false,
      are_complementary: true,
      similarity_score: 0.45,
      likelihood_of_confusion: true,
      confusion_type: 'indirect'
    }
  ];

  it('renders the component with title', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={mockData} />);
    
    expect(screen.getByText('Goods/Services Comparison Details')).toBeInTheDocument();
  });

  it('displays correct number of comparison pairs', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={mockData} />);
    
    // Check that we have the appropriate number of cards in the tab panel
    expect(screen.getAllByRole('tabpanel')[0].children.length).toBe(mockData.length);
  });

  it('displays applicant and opponent goods/services with classes', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={mockData} />);
    
    // Look for partial text matches of applicant and opponent good terms
    expect(screen.getAllByText(/T-shirts/, { exact: false })).toHaveLength(2);
    expect(screen.getByText(/Clothing, namely shirts/, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/Online retail services for clothing/, { exact: false })).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={mockData} />);
    
    // Check the summary card value for total comparisons
    expect(screen.getByText('3', { exact: true }).closest('[class*="text-center"]')).toHaveTextContent('3');
    
    // Check the summary categories are present in the right order
    const statLabels = screen.getAllByText(/(Confusing|High Similarity|Competitive|Complementary)/, { exact: false });
    expect(statLabels.length).toBeGreaterThan(3); // At least one of each category
  });

  it('has functioning tab navigation', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={mockData} />);
    
    // Check that all tabs are present
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Confusing' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Competitive' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Complementary' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'High Similarity' })).toBeInTheDocument();
  });

  it('displays appropriate badges for comparisons', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={mockData} />);
    
    // Look for badges in the component
    expect(screen.getAllByText('Confusing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Competitive').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Complementary').length).toBeGreaterThan(0);
  });

  it('handles empty data properly', () => {
    render(<GoodsServicesComparisonDisplay goodsServiceLikelihoods={[]} />);
    
    expect(screen.getByText('No goods/services comparison data available.')).toBeInTheDocument();
  });
}); 