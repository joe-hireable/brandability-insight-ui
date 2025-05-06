import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { useState } from "react";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PredictionRequest as ApiPredictionRequest,
  CasePrediction,
  GoodOrService as ApiGoodOrService,
  TrademarkMark as ApiTrademarkMark,
  MarkSimilarityOutput,
  GoodServiceLikelihoodOutput,
  CasePredictionResult,
  GsSimilarityRequest,
  MarkSimilarityRequest,
  CasePredictionRequest
} from "@/types/trademark";
import { useTrademarkPrediction } from "@/hooks/useTrademarkPrediction";
import { useMarkSimilarity } from "@/hooks/useMarkSimilarity";
import { useGoodServiceSimilarity, useBatchGoodServiceSimilarity } from "@/hooks/useGoodServiceSimilarity";
import { useCasePrediction } from "@/hooks/useCasePrediction";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoodsServicesComparisonDisplay } from "@/components/GoodsServicesComparisonDisplay";

// Local types for state (similar to original, but using Api types)
interface GoodServiceState extends Omit<ApiGoodOrService, 'nice_class'> {
    nice_class: number | string; // Allow string for input
}

interface MarkState extends Omit<ApiTrademarkMark, 'is_registered' | 'registration_number'> {
    is_registered: boolean | string; // Allow string for checkbox state if needed, though boolean is better
    registration_number?: string;
}

interface PredictionRequestState {
  applicant: Omit<MarkState, 'registration_number' | 'is_registered'> & { is_registered: false }; // Applicant is always false
  opponent: MarkState;
  applicant_goods: GoodServiceState[];
  opponent_goods: GoodServiceState[];
}

// --- Helper Component for Displaying Analysis ---
interface AnalysisCardProps {
    title: string;
    analysis: { score: number; reasoning: string };
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, analysis }) => (
    <div className="bg-background p-4 rounded border border-white/10">
        <h4 className="font-medium text-base mb-1">{title}</h4>
        <p className="text-sm font-semibold text-brand mb-2">Score: {(analysis.score * 100).toFixed(0)}%</p>
        <p className="text-xs text-text-secondary">{analysis.reasoning}</p>
    </div>
);

// --- Helper function to get severity color for similarity ---
const getSimilaritySeverityColor = (similarity: MarkSimilarityOutput['overall'] | undefined): string => {
  if (!similarity) return 'text-slate-400'; // Default/unknown
  switch (similarity) {
    case 'identical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    case 'dissimilar':
      return 'text-sky-500';
    default:
      return 'text-slate-400';
  }
};

const getScoreSeverityColor = (score: number | undefined): string => {
  if (score === undefined) return 'text-slate-400';
  if (score >= 0.8) return 'text-red-500'; // High similarity/LoC
  if (score >= 0.6) return 'text-orange-500'; // Moderate-high
  if (score >= 0.4) return 'text-yellow-500'; // Moderate
  if (score >= 0.2) return 'text-green-500'; // Low
  return 'text-sky-500'; // Very Low/Dissimilar
};

// --- Component ---
const OppositionPrediction = () => {
  const navigate = useNavigate();
  
  // Legacy prediction hook (deprecated)
  const {
    mutate: predict,
    data: predictionResult,
    isPending: isLoading,
    error: predictionError,
    reset: resetMutation,
  } = useTrademarkPrediction();

  // New multi-step prediction hooks
  const markSimilarityMutation = useMarkSimilarity();
  const goodServiceSimilarityMutation = useGoodServiceSimilarity();
  const batchGoodServiceSimilarityMutation = useBatchGoodServiceSimilarity();
  const casePredictionMutation = useCasePrediction();

  // New state for multi-step prediction
  const [markSimilarity, setMarkSimilarity] = useState<MarkSimilarityOutput | null>(null);
  const [goodsServiceLikelihoods, setGoodsServiceLikelihoods] = useState<GoodServiceLikelihoodOutput[]>([]);
  const [predictionResultNew, setPredictionResultNew] = useState<CasePredictionResult | null>(null);
  
  // Track the current step and overall loading state
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Not started, 1: Mark similarity, 2: G/S similarity, 3: Case prediction
  const [isLoadingMultiStep, setIsLoadingMultiStep] = useState<boolean>(false);
  const [predictionErrorNew, setPredictionErrorNew] = useState<Error | null>(null);

  // Restore useState for form management
  const [request, setRequest] = useState<PredictionRequestState>({
    applicant: {
      wordmark: "COOLBRAND", // Restore example text
      is_registered: false,
    },
    opponent: {
      wordmark: "KOOL BRAND", // Restore example text
      is_registered: true,   // Restore example state
      registration_number: "UK1234567", // Restore example text
    },
    applicant_goods: [
        { term: "T-shirts", nice_class: 25 }, // Restore example
        { term: "Online retail services for clothing", nice_class: 35 } // Restore example
    ],
    opponent_goods: [
        { term: "Clothing, namely shirts and jackets", nice_class: 25 } // Restore example
    ],
  });
  const [formError, setFormError] = useState<string>(""); // Use this for form validation errors

  // --- Restore Handlers ---
  const handleApplicantMarkChange = (wordmark: string) => {
    setRequest({ ...request, applicant: { ...request.applicant, wordmark } });
  };

  const handleOpponentMarkChange = (wordmark: string) => {
    setRequest({ ...request, opponent: { ...request.opponent, wordmark } });
  };

  const handleOpponentIsRegisteredChange = (checked: boolean | string) => {
    const isRegistered = checked === 'indeterminate' ? false : checked; // Handle checkbox states
    setRequest({
      ...request,
      opponent: {
        ...request.opponent,
        is_registered: isRegistered,
        // Clear reg number if unchecked
        registration_number: isRegistered ? request.opponent.registration_number : "",
      }
    });
  };

  const handleRegistrationNumberChange = (registration_number: string) => {
    setRequest({
      ...request,
      opponent: {
        ...request.opponent,
        registration_number
      }
    });
  };

  const handleGoodChange = (type: 'applicant' | 'opponent', index: number, field: keyof GoodServiceState, value: string | number) => {
      const goodsKey = type === 'applicant' ? 'applicant_goods' : 'opponent_goods';
      const newGoods = [...request[goodsKey]];
      // Ensure nice_class is handled correctly (store as string/number, parse later)
      newGoods[index] = {
        ...newGoods[index],
        [field]: value
      };
      setRequest({
        ...request,
        [goodsKey]: newGoods
      });
    };

  const addGood = (type: 'applicant' | 'opponent') => {
    const goodsKey = type === 'applicant' ? 'applicant_goods' : 'opponent_goods';
    if (request[goodsKey].length < 5) { // Keep limit at 5
      setRequest({
        ...request,
        [goodsKey]: [
          ...request[goodsKey],
          { term: "", nice_class: "" } // Start with empty strings
        ]
      });
    }
  };

 const removeGood = (type: 'applicant' | 'opponent', index: number) => {
    const goodsKey = type === 'applicant' ? 'applicant_goods' : 'opponent_goods';
    if (request[goodsKey].length > 1) { // Prevent removing the last one
        const newGoods = [...request[goodsKey]];
        newGoods.splice(index, 1);
        setRequest({
            ...request,
            [goodsKey]: newGoods
        });
    }
 };

 // Restore basic validation logic
 const hasValidGoods = (goods: GoodServiceState[]): boolean =>
     goods.length > 0 &&
     goods.every(g =>
         g.term.trim() !== "" &&
         String(g.nice_class).trim() !== "" &&
         !isNaN(Number(g.nice_class)) &&
         Number(g.nice_class) >= 1 &&
         Number(g.nice_class) <= 45
     );

 const isFormValid = () => {
     if (request.applicant.wordmark.trim() === "") return false;
     if (request.opponent.wordmark.trim() === "") return false;
     if (request.opponent.is_registered && (!request.opponent.registration_number || request.opponent.registration_number.trim() === "")) return false;
     if (!hasValidGoods(request.applicant_goods)) return false;
     if (!hasValidGoods(request.opponent_goods)) return false;
     return true;
 };

  // --- Multi-step API handling ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setFormError(""); // Clear previous form errors
    resetMutation(); // Clear previous API results/errors
    
    // Reset all prediction state
    setMarkSimilarity(null);
    setGoodsServiceLikelihoods([]);
    setPredictionResultNew(null);
    setPredictionErrorNew(null);
    setCurrentStep(0);
    setIsLoadingMultiStep(false);

    // Perform validation
    if (!isFormValid()) {
        // Set a generic form error, specific errors aren't easily displayed without RHF
        if (request.applicant.wordmark.trim() === "") {
             setFormError("Applicant mark cannot be empty."); return;
        }
        if (request.opponent.wordmark.trim() === "") {
             setFormError("Opponent mark cannot be empty."); return;
        }
        if (request.opponent.is_registered && (!request.opponent.registration_number || request.opponent.registration_number.trim() === "")) {
             setFormError("Registration number is required for registered opponent mark."); return;
        }
        if (!hasValidGoods(request.applicant_goods)) {
             setFormError("Applicant must have at least one valid good/service (Term and Class 1-45)."); return;
        }
         if (!hasValidGoods(request.opponent_goods)) {
             setFormError("Opponent must have at least one valid good/service (Term and Class 1-45)."); return;
        }
        setFormError("Please fill all required fields correctly.");
        return;
    }

    try {
        // Start loading state
        setIsLoadingMultiStep(true);
        
        // STEP 1: Get mark similarity
        setCurrentStep(1);
        
        const markSimilarityRequest: MarkSimilarityRequest = {
            applicant: {
                wordmark: request.applicant.wordmark,
                is_registered: false,
            },
            opponent: {
                wordmark: request.opponent.wordmark,
                is_registered: !!request.opponent.is_registered,
                ...(request.opponent.is_registered && { registration_number: request.opponent.registration_number })
            }
        };
        
        const markSimilarityResult = await markSimilarityMutation.mutateAsync(markSimilarityRequest);
        setMarkSimilarity(markSimilarityResult);
        
        // STEP 2: Compare each goods/services pair
        setCurrentStep(2);
        
        // Prepare properly formatted goods/services
        const applicantGoods = request.applicant_goods.map(good => ({
            term: good.term,
            nice_class: parseInt(String(good.nice_class), 10)
        }));

        const opponentGoods = request.opponent_goods.map(good => ({
            term: good.term,
            nice_class: parseInt(String(good.nice_class), 10)
        }));

        // Use batch API to process all goods/services at once
        const gsResults = await batchGoodServiceSimilarityMutation.mutateAsync({
            applicantGoods,
            opponentGoods,
            markSimilarity: markSimilarityResult
        });

        // Create a mapping for easier access to original terms
        const resultMapping = [];
        let resultIndex = 0;

        // Map original request data back to results for display
        applicantGoods.forEach(applicantGood => {
            opponentGoods.forEach(opponentGood => {
                resultMapping.push({
                    applicantGood,
                    opponentGood
                });
                resultIndex++;
            });
        });

        // Enhance results with original terms for display
        const enhancedGsResults = gsResults.map((result, index) => {
            // Preserve the original applicant and opponent goods data from the mapping
            return {
                ...result,
                applicant_good: {
                    ...result.applicant_good,
                    term: resultMapping[index].applicantGood.term,
                    nice_class: resultMapping[index].applicantGood.nice_class
                },
                opponent_good: {
                    ...result.opponent_good,
                    term: resultMapping[index].opponentGood.term,
                    nice_class: resultMapping[index].opponentGood.nice_class
                }
            };
        });

        console.log("Enhanced Goods/Services results:", JSON.stringify(enhancedGsResults, null, 2));
        setGoodsServiceLikelihoods(enhancedGsResults);
        
        // STEP 3: Get case prediction
        setCurrentStep(3);
        
        const casePredictionRequest: CasePredictionRequest = {
            mark_similarity: markSimilarityResult,
            goods_services_likelihoods: enhancedGsResults  // Use the enhanced results here
        };
        
        const caseResult = await casePredictionMutation.mutateAsync(casePredictionRequest);
        
        // Ensure the final result preserves our enhanced goods/services data
        const enhancedCaseResult = {
            ...caseResult,
            goods_services_likelihoods: enhancedGsResults
        };
        
        console.log("Final prediction result:", JSON.stringify(enhancedCaseResult, null, 2));
        setPredictionResultNew(enhancedCaseResult);
        
        // Clear loading states
        setIsLoadingMultiStep(false);
        
    } catch (error) {
        console.error("Prediction error:", error);
        setPredictionErrorNew(error as Error);
        setIsLoadingMultiStep(false);
    }
  };

  // --- Updated Clear Handler ---
  const handleClearAll = () => {
    setRequest({
      applicant: { wordmark: "", is_registered: false },
      opponent: { wordmark: "", is_registered: false, registration_number: "" },
      applicant_goods: [{ term: "", nice_class: "" }],
      opponent_goods: [{ term: "", nice_class: "" }],
    });
    setFormError("");
    resetMutation();
    
    // Reset multi-step prediction state
    setMarkSimilarity(null);
    setGoodsServiceLikelihoods([]);
    setPredictionResultNew(null);
    setPredictionErrorNew(null);
    setCurrentStep(0);
    setIsLoadingMultiStep(false);
  };

  // Restore getError (basic version, just returns the single formError)
  const getError = (field?: string): string | undefined => {
      // This is simplified - we only have one main form error message now
      return formError ? formError : undefined;
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl mb-2">
              <span className="bg-clip-text text-transparent bg-brand-gradient">
                Opposition Prediction
              </span>
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Analyse potential trademark conflicts and predict opposition outcomes
            </p>
          </div>

          {/* Back button */}
          <div className="mb-6">
            <Button 
              variant="secondary"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="bg-[#131722] rounded-lg border border-white/10 p-6">
                <h2 className="font-heading text-xl lg:text-2xl mb-4 flex items-center">
                  <span className="bg-clip-text text-transparent bg-brand-gradient font-semibold">
                    Applicant
                  </span>
                </h2>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="applicant-wordmark" className="text-white mb-1 block">
                    Trademark
                  </Label>
                  <Input
                    id="applicant-wordmark"
                    placeholder="e.g., COOLBRAND"
                    value={request.applicant.wordmark}
                    onChange={(e) => handleApplicantMarkChange(e.target.value)}
                    className="bg-surface border-white/10 text-white focus:border-white"
                  />
                   <p className="text-xs text-muted-foreground pt-1">The applicant's mark is assumed to be unregistered for opposition purposes.</p>
                </div>

                 <Separator className="my-4 bg-white/10" />

                <h3 className="font-medium text-lg mb-3">Goods & Services</h3>
                <div className="space-y-3">
                  {request.applicant_goods.map((good, index) => (
                    <div key={`${'applicant'}-${index}`} className="relative">
                       <div className="grid grid-cols-5 gap-3">
                         <div className="col-span-1">
                           <Label htmlFor={`applicant-class-${index}`} className="sr-only">Class</Label>
                           <Input
                             id={`applicant-class-${index}`}
                             placeholder="Class"
                             type="number"
                             min="1"
                             max="45"
                             value={good.nice_class}
                             onChange={(e) => handleGoodChange('applicant', index, "nice_class", e.target.value)}
                             className="bg-surface border-white/10 text-white focus:border-white"
                           />
                         </div>
                         <div className="col-span-4">
                           <Label htmlFor={`applicant-term-${index}`} className="sr-only">Term</Label>
                           <Input
                             id={`applicant-term-${index}`}
                             placeholder="Enter goods/services..."
                             value={good.term}
                             onChange={(e) => handleGoodChange('applicant', index, "term", e.target.value)}
                             className="bg-surface border-white/10 text-white focus:border-white"
                           />
                         </div>
                       </div>
                       {request.applicant_goods.length > 1 && (
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           onClick={() => removeGood('applicant', index)}
                           className="absolute right-[-5px] top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                           aria-label="Remove applicant good/service"
                         >
                           <X className="h-4 w-4" />
                         </Button>
                       )}
                    </div>
                  ))}
                   <Button
                     type="button"
                     variant="secondary"
                     size="sm"
                     onClick={() => addGood('applicant')}
                     disabled={request.applicant_goods.length >= 5}
                     className="mt-3"
                   >
                     <Plus className="mr-1 h-3 w-3" /> Add Good/Service
                   </Button>
                </div>
              </div>

              <div className="bg-[#131722] rounded-lg border border-white/10 p-6">
                 <h2 className="font-heading text-xl lg:text-2xl mb-4 flex items-center">
                   <span className="bg-clip-text text-transparent bg-brand-gradient font-semibold">
                    Opponent
                   </span>
                 </h2>

                 <div className="space-y-2 mb-4">
                    <Label htmlFor="opponent-wordmark" className="text-white mb-1 block">
                      Trademark
                    </Label>
                    <Input
                        id="opponent-wordmark"
                        placeholder="e.g., KOOL BRAND"
                        value={request.opponent.wordmark}
                        onChange={(e) => handleOpponentMarkChange(e.target.value)}
                        className="bg-surface border-white/10 text-white focus:border-white"
                    />
                 </div>

                <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                        id="opponent-registered"
                        checked={!!request.opponent.is_registered}
                        onCheckedChange={handleOpponentIsRegisteredChange}
                        className="border-white/30 data-[state=checked]:bg-cyan-400"
                        aria-labelledby="opponent-registered-label"
                     />
                     <Label htmlFor="opponent-registered" id="opponent-registered-label" className="text-white">
                         Opponent's mark is registered?
                     </Label>
                 </div>

                {request.opponent.is_registered && (
                    <div className="space-y-2 mb-4">
                         <Label htmlFor="opponent-reg-number" className="text-white mb-1 block">Registration Number</Label>
                         <Input
                            id="opponent-reg-number"
                            placeholder="e.g., UK1234567"
                            value={request.opponent.registration_number || ""}
                            onChange={(e) => handleRegistrationNumberChange(e.target.value)}
                            className="bg-surface border-white/10 text-white focus:border-white"
                        />
                    </div>
                 )}

                <Separator className="my-4 bg-white/10" />

                 <h3 className="font-medium text-lg mb-3">Goods & Services</h3>
                 <div className="space-y-3">
                   {request.opponent_goods.map((good, index) => (
                     <div key={`${'opponent'}-${index}`} className="relative">
                       <div className="grid grid-cols-5 gap-3">
                         <div className="col-span-1">
                           <Label htmlFor={`opponent-class-${index}`} className="sr-only">Class</Label>
                           <Input
                             id={`opponent-class-${index}`}
                             placeholder="Class"
                             type="number"
                             min="1"
                             max="45"
                             value={good.nice_class}
                             onChange={(e) => handleGoodChange('opponent', index, "nice_class", e.target.value)}
                             className="bg-surface border-white/10 text-white focus:border-white"
                           />
                         </div>
                         <div className="col-span-4">
                           <Label htmlFor={`opponent-term-${index}`} className="sr-only">Term</Label>
                           <Input
                             id={`opponent-term-${index}`}
                             placeholder="Enter goods/services..."
                             value={good.term}
                             onChange={(e) => handleGoodChange('opponent', index, "term", e.target.value)}
                             className="bg-surface border-white/10 text-white focus:border-white"
                           />
                         </div>
                       </div>
                        {request.opponent_goods.length > 1 && (
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           onClick={() => removeGood('opponent', index)}
                           className="absolute right-[-5px] top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                           aria-label="Remove opponent good/service"
                         >
                           <X className="h-4 w-4" />
                         </Button>
                       )}
                    </div>
                   ))}
                   <Button
                     type="button"
                     variant="secondary"
                     size="sm"
                     onClick={() => addGood('opponent')}
                     disabled={request.opponent_goods.length >= 5}
                     className="mt-3"
                   >
                     <Plus className="mr-1 h-3 w-3" /> Add Good/Service
                   </Button>
                 </div>
              </div>
            </div>

            {formError && (
                 <Alert variant="destructive" className="mt-4">
                     <AlertTitle>Validation Error</AlertTitle>
                     <AlertDescription>{formError}</AlertDescription>
                 </Alert>
             )}
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearAll}
                disabled={isLoading || isLoadingMultiStep}
                className="px-8 text-white border-white/20 hover:bg-surface"
              >
                Clear All
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isLoadingMultiStep || !isFormValid()}
                className="w-full sm:w-auto bg-brand-gradient text-white hover:opacity-90 transition-opacity px-8 py-3"
              >
                {isLoading || isLoadingMultiStep ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  "Predict Outcome"
                )}
              </Button>
            </div>
          </form>

          {/* New Results Section */}
          {(isLoadingMultiStep || predictionErrorNew || predictionResultNew || markSimilarity || goodsServiceLikelihoods.length > 0) && (
             <div className="mt-10">
                 <Separator className="mb-6 bg-white/20" />
                 <h2 className="font-heading text-2xl mb-4">Analysis Results</h2>

                 {/* Loading States for Multi-step Process */}
                 {isLoadingMultiStep && (
                    <div className="flex flex-col items-center justify-center p-8 bg-[#131722]/50 rounded-lg border border-white/10">
                        <Loader2 className="h-8 w-8 animate-spin text-brand mb-4" />
                        <p className="text-text-secondary text-lg font-medium mb-2">
                            {currentStep === 1 && "Analyzing trademark similarity..."}
                            {currentStep === 2 && "Comparing goods and services..."}
                            {currentStep === 3 && "Generating final prediction..."}
                        </p>
                        <div className="w-full max-w-md bg-white/10 h-2 rounded-full mt-2">
                            <div 
                                className="bg-brand-gradient h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                 )}

                {/* Error State */}
                {predictionErrorNew && !isLoadingMultiStep && (
                     <Alert variant="destructive">
                         <AlertTitle>API Error</AlertTitle>
                         <AlertDescription>
                             {predictionErrorNew.message || "An unknown error occurred during prediction."}
                         </AlertDescription>
                     </Alert>
                 )}

                {/* Results Display - New API Structure */}
                {!isLoadingMultiStep && !predictionErrorNew && (
                    <div className="space-y-6 bg-[#131722] rounded-lg border border-white/10 p-6">
                        {/* Overall Opposition Outcome */}
                        {predictionResultNew?.opposition_outcome && (
                          <Card className="bg-background/70 border-border">
                            <CardHeader>
                              <CardTitle>Overall Opposition Outcome</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <p className="text-lg font-semibold">
                                Result: <span className={`font-bold ${
                                  predictionResultNew.opposition_outcome.result.includes("fail") ? 'text-green-500' : 
                                  predictionResultNew.opposition_outcome.result.includes("partially succeed") ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {predictionResultNew.opposition_outcome.result}
                                </span>
                              </p>
                              <p>Confidence: <span className="font-semibold text-brand">{(predictionResultNew.opposition_outcome.confidence * 100).toFixed(0)}%</span></p>
                              <p className="text-sm text-text-secondary">{predictionResultNew.opposition_outcome.reasoning}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Insert Goods/Services Comparison Display HERE */}
                        {goodsServiceLikelihoods && goodsServiceLikelihoods.length > 0 && (
                          <GoodsServicesComparisonDisplay goodsServiceLikelihoods={goodsServiceLikelihoods} />
                        )}
                    </div>
                )}
                
                {/* Legacy Results Section - Will be removed after migration */}
                {predictionResult && !isLoading && !predictionError && !predictionResultNew && (
                    <div className="space-y-6 bg-[#131722] rounded-lg border border-white/10 p-6">
                        {/* Use opposition_outcome */}
                        {predictionResult.opposition_outcome && (
                          <Alert
                              variant={predictionResult.opposition_outcome.result.toLowerCase().includes("fail") ? "default" : "destructive"}
                              className="border-l-4"
                              >
                              <AlertTitle className="text-lg font-semibold">{predictionResult.opposition_outcome.result}</AlertTitle>
                              <AlertDescription className="mt-1">
                                  <p><span className="font-medium">Confidence:</span> {(predictionResult.opposition_outcome.confidence * 100).toFixed(0)}%</p>
                                  <p className="mt-2">{predictionResult.opposition_outcome.reasoning}</p>
                              </AlertDescription>
                          </Alert>
                        )}

                        {/* Display Mark Similarity (previously mark_comparison) */}
                        {predictionResult.mark_similarity && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-brand">Mark Comparison</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Directly display string values - Replace AnalysisCard */}
                              <div className="bg-background p-4 rounded border border-white/10">
                                <h4 className="font-medium text-base mb-1">Visual Similarity</h4>
                                <p className="text-sm capitalize">{predictionResult.mark_similarity.visual || 'N/A'}</p>
                              </div>
                              <div className="bg-background p-4 rounded border border-white/10">
                                <h4 className="font-medium text-base mb-1">Aural Similarity</h4>
                                <p className="text-sm capitalize">{predictionResult.mark_similarity.aural || 'N/A'}</p>
                              </div>
                              <div className="bg-background p-4 rounded border border-white/10">
                                <h4 className="font-medium text-base mb-1">Conceptual Similarity</h4>
                                <p className="text-sm capitalize">{predictionResult.mark_similarity.conceptual || 'N/A'}</p>
                              </div>
                               <div className="bg-background p-4 rounded border border-white/10">
                                <h4 className="font-medium text-base mb-1">Overall Mark Similarity</h4>
                                <p className="text-sm capitalize">{predictionResult.mark_similarity.overall || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Display Goods & Services with likelihood of confusion */}
                        {predictionResult.goods_services_likelihoods && predictionResult.goods_services_likelihoods.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-brand">Goods & Services with Likelihood of Confusion</h3>
                            <div className="space-y-4">
                              {predictionResult.goods_services_likelihoods
                                .filter(gs => gs && gs.likelihood_of_confusion)
                                .map((gs, index) => (
                                  <div key={index} className="bg-background p-4 rounded border border-white/10">
                                    <div className="flex flex-col md:flex-row justify-between gap-2 mb-3">
                                      <div className="flex-1">
                                        <h5 className="text-xs uppercase text-text-secondary mb-1">Applicant</h5>
                                        <p className="text-sm">
                                          {gs?.applicant_good?.term || '[No term]'} 
                                          {gs?.applicant_good?.nice_class ? ` (Class ${gs?.applicant_good?.nice_class})` : ''}
                                        </p>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="text-xs uppercase text-text-secondary mb-1">Opponent</h5>
                                        <p className="text-sm">
                                          {gs?.opponent_good?.term || '[No term]'} 
                                          {gs?.opponent_good?.nice_class ? ` (Class ${gs?.opponent_good?.nice_class})` : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="text-xs uppercase text-text-secondary mb-1">Confusion Type</h5>
                                      <p className="text-sm text-red-500 font-medium">
                                        {gs?.confusion_type ? gs.confusion_type : 'General'}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              }
                              {!predictionResult.goods_services_likelihoods || 
                                predictionResult.goods_services_likelihoods.filter(gs => gs && gs.likelihood_of_confusion).length === 0 && (
                                <p className="text-sm">No likelihood of confusion found between goods and services.</p>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OppositionPrediction;