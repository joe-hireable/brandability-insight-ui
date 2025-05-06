import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GoodServiceLikelihoodOutput } from "@/types/trademark";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface GoodsServicesComparisonDisplayProps {
  goodsServiceLikelihoods: GoodServiceLikelihoodOutput[];
}

/**
 * Helper function to get severity color based on similarity score
 */
const getScoreSeverityColor = (score: number | undefined): string => {
  if (score === undefined) return 'text-slate-400';
  if (score >= 0.8) return 'text-red-500';     // High similarity/LoC
  if (score >= 0.6) return 'text-orange-500';  // Moderate-high
  if (score >= 0.4) return 'text-yellow-500';  // Moderate
  if (score >= 0.2) return 'text-green-500';   // Low
  return 'text-sky-500';                       // Very Low/Dissimilar
};

/**
 * Component for displaying detailed goods/services comparisons
 */
export const GoodsServicesComparisonDisplay = ({ goodsServiceLikelihoods }: GoodsServicesComparisonDisplayProps) => {
  const [showOnlyConfusing, setShowOnlyConfusing] = useState<boolean>(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("all");

  if (!goodsServiceLikelihoods || goodsServiceLikelihoods.length === 0) {
    return <p className="text-sm text-text-secondary">No goods/services comparison data available.</p>;
  }

  // Calculate some statistics for the summary
  const totalComparisons = goodsServiceLikelihoods.length;
  const confusingComparisons = goodsServiceLikelihoods.filter(item => item.likelihood_of_confusion).length;
  const highSimilarityComparisons = goodsServiceLikelihoods.filter(item => item.similarity_score >= 0.8).length;
  const competitiveComparisons = goodsServiceLikelihoods.filter(item => item.are_competitive).length;
  const complementaryComparisons = goodsServiceLikelihoods.filter(item => item.are_complementary).length;

  const toggleItemExpansion = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(i => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };
  
  // Filter comparisons based on current tab and showing only confusing items
  const filteredComparisons = goodsServiceLikelihoods.filter(item => {
    if (showOnlyConfusing && !item.likelihood_of_confusion) return false;
    
    if (currentTab === "all") return true;
    if (currentTab === "confusing") return item.likelihood_of_confusion;
    if (currentTab === "competitive") return item.are_competitive;
    if (currentTab === "complementary") return item.are_complementary;
    if (currentTab === "high-similarity") return item.similarity_score >= 0.8;
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-text-primary">Goods/Services Comparison Details</h3>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-confusing" 
            checked={showOnlyConfusing}
            onCheckedChange={setShowOnlyConfusing}
          />
          <Label htmlFor="show-confusing">Show only confusing pairs</Label>
        </div>
      </div>
      
      <Card className="bg-background/70 border-border mb-4">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            {totalComparisons} total comparison{totalComparisons !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-2 bg-background/30 rounded-md">
            <span className="block text-xl font-bold text-orange-500">{confusingComparisons}</span>
            <span className="text-xs">Confusing</span>
          </div>
          <div className="text-center p-2 bg-background/30 rounded-md">
            <span className="block text-xl font-bold text-red-500">{highSimilarityComparisons}</span>
            <span className="text-xs">High Similarity</span>
          </div>
          <div className="text-center p-2 bg-background/30 rounded-md">
            <span className="block text-xl font-bold text-blue-500">{competitiveComparisons}</span>
            <span className="text-xs">Competitive</span>
          </div>
          <div className="text-center p-2 bg-background/30 rounded-md">
            <span className="block text-xl font-bold text-purple-500">{complementaryComparisons}</span>
            <span className="text-xs">Complementary</span>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="confusing">Confusing</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="complementary">Complementary</TabsTrigger>
          <TabsTrigger value="high-similarity">High Similarity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredComparisons.length === 0 ? (
            <p className="text-center text-text-secondary py-4">No matching comparisons found.</p>
          ) : (
            filteredComparisons.map((item, index) => (
              <ComparisonCard 
                key={index} 
                item={item} 
                index={index} 
                isExpanded={expandedItems.includes(index)}
                onToggleExpand={() => toggleItemExpansion(index)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="confusing" className="space-y-4">
          {filteredComparisons.length === 0 ? (
            <p className="text-center text-text-secondary py-4">No confusing comparisons found.</p>
          ) : (
            filteredComparisons.map((item, index) => (
              <ComparisonCard 
                key={index} 
                item={item} 
                index={index}
                isExpanded={expandedItems.includes(index)}
                onToggleExpand={() => toggleItemExpansion(index)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="competitive" className="space-y-4">
          {filteredComparisons.length === 0 ? (
            <p className="text-center text-text-secondary py-4">No competitive comparisons found.</p>
          ) : (
            filteredComparisons.map((item, index) => (
              <ComparisonCard 
                key={index} 
                item={item} 
                index={index}
                isExpanded={expandedItems.includes(index)}
                onToggleExpand={() => toggleItemExpansion(index)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="complementary" className="space-y-4">
          {filteredComparisons.length === 0 ? (
            <p className="text-center text-text-secondary py-4">No complementary comparisons found.</p>
          ) : (
            filteredComparisons.map((item, index) => (
              <ComparisonCard 
                key={index} 
                item={item} 
                index={index}
                isExpanded={expandedItems.includes(index)}
                onToggleExpand={() => toggleItemExpansion(index)}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="high-similarity" className="space-y-4">
          {filteredComparisons.length === 0 ? (
            <p className="text-center text-text-secondary py-4">No high similarity comparisons found.</p>
          ) : (
            filteredComparisons.map((item, index) => (
              <ComparisonCard 
                key={index} 
                item={item} 
                index={index}
                isExpanded={expandedItems.includes(index)}
                onToggleExpand={() => toggleItemExpansion(index)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ComparisonCardProps {
  item: GoodServiceLikelihoodOutput;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ComparisonCard = ({ item, index, isExpanded, onToggleExpand }: ComparisonCardProps) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <Card className={`bg-background/70 border-border ${item.likelihood_of_confusion ? 'border-l-4 border-l-orange-500' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center">
                Comparison Pair #{index + 1}
                {item.likelihood_of_confusion && (
                  <Badge variant="destructive" className="ml-2">Confusing</Badge>
                )}
                {item.are_competitive && (
                  <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-500">Competitive</Badge>
                )}
                {item.are_complementary && (
                  <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-500">Complementary</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                <strong>Applicant:</strong> {item.applicant_good.term} (Class {item.applicant_good.nice_class})
              </CardDescription>
              <CardDescription className="mt-1">
                <strong>Opponent:</strong> {item.opponent_good.term} (Class {item.opponent_good.nice_class})
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <button className="p-2 hover:bg-accent rounded-full">
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-background/30 rounded-md">
                <div className="mb-2">
                  <span className="font-medium text-text-secondary">Overall Similarity Score:</span>
                  <span className={`ml-2 font-semibold ${getScoreSeverityColor(item.similarity_score)}`}>
                    {(item.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-medium text-text-secondary">Likelihood of Confusion:</span>
                  <span className={`ml-2 font-semibold ${item.likelihood_of_confusion ? 'text-orange-500' : 'text-green-500'}`}>
                    {item.likelihood_of_confusion ? 'Yes' : 'No'}
                    {item.likelihood_of_confusion && item.confusion_type && (
                      <span className="text-xs text-text-tertiary ml-1">({item.confusion_type})</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-background/30 rounded-md">
                <div className="mb-2">
                  <span className="font-medium text-text-secondary">Competitive Relationship:</span>
                  <span className={`ml-2 ${item.are_competitive ? 'text-blue-500 font-medium' : 'text-green-500'}`}>
                    {item.are_competitive ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Complementary Relationship:</span>
                  <span className={`ml-2 ${item.are_complementary ? 'text-purple-500 font-medium' : 'text-green-500'}`}>
                    {item.are_complementary ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 p-3 bg-background/30 rounded-md">
              <h4 className="font-medium mb-1">Analysis</h4>
              <p className="text-sm text-text-secondary">
                {item.similarity_score >= 0.8 && "These goods/services are highly similar, creating a strong risk of consumer confusion."}
                {item.similarity_score >= 0.6 && item.similarity_score < 0.8 && "These goods/services have substantial similarity, posing a moderate to high risk of confusion."}
                {item.similarity_score >= 0.4 && item.similarity_score < 0.6 && "These goods/services have moderate similarity, with some potential for confusion."}
                {item.similarity_score >= 0.2 && item.similarity_score < 0.4 && "These goods/services have low similarity, with limited potential for confusion."}
                {item.similarity_score < 0.2 && "These goods/services are dissimilar, with minimal risk of confusion."}
                
                {item.are_competitive && " They compete in the same market, which increases the likelihood of confusion."}
                {item.are_complementary && " They are complementary in nature, which may contribute to indirect confusion."}
                
                {item.likelihood_of_confusion && item.confusion_type === 'direct' && " The direct confusion risk means consumers might mistake one good/service for the other."}
                {item.likelihood_of_confusion && item.confusion_type === 'indirect' && " The indirect confusion risk means consumers might believe there is a connection between the providers."}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}; 