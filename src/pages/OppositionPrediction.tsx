import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { useState } from "react";
import { ArrowLeft, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types based on Pydantic models
interface GoodService {
  term: string;
  nice_class: number;
}

interface Mark {
  wordmark: string;
  is_registered: boolean;
  registration_number?: string;
}

interface PredictionRequest {
  applicant: Mark;
  opponent: Mark;
  applicant_goods: GoodService[];
  opponent_goods: GoodService[];
}

const OppositionPrediction = () => {
  const navigate = useNavigate();
  
  // State for the form
  const [request, setRequest] = useState<PredictionRequest>({
    applicant: {
      wordmark: "",
      is_registered: false
    },
    opponent: {
      wordmark: "",
      is_registered: false,
      registration_number: ""
    },
    applicant_goods: [{
      term: "",
      nice_class: 0
    }],
    opponent_goods: [{
      term: "",
      nice_class: 0
    }]
  });
  const [error, setError] = useState<string>("");

  // Handlers
  const handleApplicantMarkChange = (wordmark: string) => {
    setRequest({
      ...request,
      applicant: {
        ...request.applicant,
        wordmark
      }
    });
  };

  const handleOpponentMarkChange = (wordmark: string) => {
    setRequest({
      ...request,
      opponent: {
        ...request.opponent,
        wordmark
      }
    });
  };

  const handleApplicantIsRegisteredChange = (checked: boolean) => {
    setRequest({
      ...request,
      applicant: {
        ...request.applicant,
        is_registered: checked
      }
    });
  };

  const handleOpponentIsRegisteredChange = (checked: boolean) => {
    setRequest({
      ...request,
      opponent: {
        ...request.opponent,
        is_registered: checked
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

  const handleApplicantGoodChange = (index: number, field: keyof GoodService, value: string | number) => {
    const newGoods = [...request.applicant_goods];
    newGoods[index] = {
      ...newGoods[index],
      [field]: value
    };
    setRequest({
      ...request,
      applicant_goods: newGoods
    });
  };

  const handleOpponentGoodChange = (index: number, field: keyof GoodService, value: string | number) => {
    const newGoods = [...request.opponent_goods];
    newGoods[index] = {
      ...newGoods[index],
      [field]: value
    };
    setRequest({
      ...request,
      opponent_goods: newGoods
    });
  };

  const addApplicantGood = () => {
    if (request.applicant_goods.length < 3) {
      setRequest({
        ...request,
        applicant_goods: [
          ...request.applicant_goods,
          { term: "", nice_class: 0 }
        ]
      });
    }
  };

  const addOpponentGood = () => {
    if (request.opponent_goods.length < 3) {
      setRequest({
        ...request,
        opponent_goods: [
          ...request.opponent_goods,
          { term: "", nice_class: 0 }
        ]
      });
    }
  };

  const removeApplicantGood = (index: number) => {
    const newGoods = [...request.applicant_goods];
    newGoods.splice(index, 1);
    setRequest({
      ...request,
      applicant_goods: newGoods
    });
  };

  const removeOpponentGood = (index: number) => {
    const newGoods = [...request.opponent_goods];
    newGoods.splice(index, 1);
    setRequest({
      ...request,
      opponent_goods: newGoods
    });
  };

  // Validation logic
  const hasValidGoods = (goods: GoodService[]) =>
    goods.length > 0 && goods.some(g => g.term.trim() !== "" && g.nice_class > 0);
  const isFormValid =
    request.applicant.wordmark.trim() !== "" &&
    request.opponent.wordmark.trim() !== "" &&
    hasValidGoods(request.applicant_goods) &&
    hasValidGoods(request.opponent_goods);

  const handleSubmit = () => {
    if (request.applicant.wordmark.trim() === "" || request.opponent.wordmark.trim() === "") {
      setError("Please enter a trademark for both Applicant and Opponent.");
      return;
    }
    if (!hasValidGoods(request.applicant_goods) || !hasValidGoods(request.opponent_goods)) {
      setError("Each side must have at least one good/service with both class and description filled.");
      return;
    }
    setError("");
    console.log("Submitting prediction request:", request);
    // Here you would call the API with the request data
    // For now, we just log it
  };

  const handleClearAll = () => {
    setRequest({
      applicant: {
        wordmark: "",
        is_registered: false
      },
      opponent: {
        wordmark: "",
        is_registered: false,
        registration_number: ""
      },
      applicant_goods: [{
        term: "",
        nice_class: 0
      }],
      opponent_goods: [{
        term: "",
        nice_class: 0
      }]
    });
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="font-heading font-bold text-heading-2 mb-2">
              <span className="bg-clip-text text-transparent bg-brand-gradient">Opposition Prediction</span>
            </h1>
            <p className="text-text-secondary">
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

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant */}
            <div className="bg-[#131722] rounded-lg border border-white/10 p-6">
              <h2 className="font-heading text-heading-4 mb-4 flex items-center">
                <span className="bg-clip-text text-transparent bg-brand-gradient font-semibold">Applicant</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="applicant-trademark" className="text-white mb-2 block">
                    Trademark
                  </Label>
                  <Input 
                    id="applicant-trademark"
                    value={request.applicant.wordmark}
                    onChange={(e) => handleApplicantMarkChange(e.target.value)}
                    className="bg-surface border-white/10 text-white focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="applicant-is-registered" 
                    checked={request.applicant.is_registered}
                    onCheckedChange={handleApplicantIsRegisteredChange}
                    className="border-white/30 data-[state=checked]:bg-cyan-400"
                  />
                  <Label htmlFor="applicant-is-registered" className="text-white">
                    This mark is registered
                  </Label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium">
                      Goods & Services <span className="text-cyan-400 ml-1">Required</span> <span className="text-xs text-white/60 ml-2">(Add up to 3)</span>
                    </Label>
                  </div>
                  
                  <div className="space-y-3">
                    {request.applicant_goods.map((good, index) => (
                      <div key={index} className="relative">
                        <div className="grid grid-cols-5 gap-3">
                          <div className="col-span-1">
                            <Label htmlFor={`applicant-class-${index}`} className="sr-only">Class</Label>
                            <Input
                              id={`applicant-class-${index}`}
                              placeholder="Class"
                              type="number"
                              min={1}
                              max={45}
                              value={good.nice_class || ""}
                              onChange={(e) => handleApplicantGoodChange(index, "nice_class", parseInt(e.target.value) || 0)}
                              className="bg-surface border-white/10 text-white focus:border-white"
                            />
                          </div>
                          <div className="col-span-4">
                            <Label htmlFor={`applicant-term-${index}`} className="sr-only">Term</Label>
                            <Input
                              id={`applicant-term-${index}`}
                              placeholder="Enter goods/services..."
                              value={good.term}
                              onChange={(e) => handleApplicantGoodChange(index, "term", e.target.value)}
                              className="bg-surface border-white/10 text-white focus:border-white"
                            />
                          </div>
                        </div>
                        
                        {index > 0 && (
                          <button 
                            onClick={() => removeApplicantGood(index)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Display class badge after input */}
                        {good.nice_class > 0 && good.term && (
                          <div className="mt-2 inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                            Class {good.nice_class}: {good.term}
                            <button 
                              onClick={() => removeApplicantGood(index)}
                              className="ml-1 text-cyan-400/70 hover:text-cyan-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {request.applicant_goods.length < 3 && (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={addApplicantGood}
                      className="mt-3"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Another Class
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Opponent */}
            <div className="bg-[#131722] rounded-lg border border-white/10 p-6">
              <h2 className="font-heading text-heading-4 mb-4 flex items-center">
                <span className="bg-clip-text text-transparent bg-brand-gradient font-semibold">Opponent</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="opponent-trademark" className="text-white mb-2 block">
                    Trademark
                  </Label>
                  <Input 
                    id="opponent-trademark"
                    value={request.opponent.wordmark}
                    onChange={(e) => handleOpponentMarkChange(e.target.value)}
                    className="bg-surface border-white/10 text-white focus:border-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="opponent-is-registered" 
                    checked={request.opponent.is_registered}
                    onCheckedChange={handleOpponentIsRegisteredChange}
                    className="border-white/30 data-[state=checked]:bg-cyan-400"
                  />
                  <Label htmlFor="opponent-is-registered" className="text-white">
                    This mark is registered
                  </Label>
                </div>

                {request.opponent.is_registered && (
                  <div>
                    <Label htmlFor="registration-number" className="text-white mb-2 block">
                      Registration Number
                    </Label>
                    <Input 
                      id="registration-number"
                      value={request.opponent.registration_number || ""}
                      onChange={(e) => handleRegistrationNumberChange(e.target.value)}
                      className="bg-surface border-white/10 text-white focus:border-white"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white font-medium">
                      Goods & Services <span className="text-cyan-400 ml-1">Required</span> <span className="text-xs text-white/60 ml-2">(Add up to 3)</span>
                    </Label>
                  </div>
                  
                  <div className="space-y-3">
                    {request.opponent_goods.map((good, index) => (
                      <div key={index} className="relative">
                        <div className="grid grid-cols-5 gap-3">
                          <div className="col-span-1">
                            <Label htmlFor={`opponent-class-${index}`} className="sr-only">Class</Label>
                            <Input
                              id={`opponent-class-${index}`}
                              placeholder="Class"
                              type="number"
                              min={1}
                              max={45}
                              value={good.nice_class || ""}
                              onChange={(e) => handleOpponentGoodChange(index, "nice_class", parseInt(e.target.value) || 0)}
                              className="bg-surface border-white/10 text-white focus:border-white"
                            />
                          </div>
                          <div className="col-span-4">
                            <Label htmlFor={`opponent-term-${index}`} className="sr-only">Term</Label>
                            <Input
                              id={`opponent-term-${index}`}
                              placeholder="Enter goods/services..."
                              value={good.term}
                              onChange={(e) => handleOpponentGoodChange(index, "term", e.target.value)}
                              className="bg-surface border-white/10 text-white focus:border-white"
                            />
                          </div>
                        </div>
                        {index > 0 && (
                          <button 
                            onClick={() => removeOpponentGood(index)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        {/* Display class badge after input */}
                        {good.nice_class > 0 && good.term && (
                          <div className="mt-2 inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                            Class {good.nice_class}: {good.term}
                            <button 
                              onClick={() => removeOpponentGood(index)}
                              className="ml-1 text-cyan-400/70 hover:text-cyan-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {request.opponent_goods.length < 3 && (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={addOpponentGood}
                      className="mt-3"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Another Class
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {error && (
            <div className="mt-4 text-red-500 text-center font-medium">
              {error}
            </div>
          )}
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="px-8 text-white border-white/20 hover:bg-surface"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
            <Button 
              className="bg-brand-gradient text-white font-heading px-8"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Predict Opposition Outcome
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OppositionPrediction;