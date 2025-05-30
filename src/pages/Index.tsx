import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return <div className="min-h-screen bg-background text-text-primary">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <section className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-24">
            <h1 className="font-heading font-bold text-heading-1 mb-6">
              <span className="bg-clip-text text-transparent bg-brand-gradient">Decision Intelligence</span>{" "}
              for Trademark Lawyers
            </h1>
            <p className="font-body text-body-large text-text-secondary max-w-3xl mx-auto mb-8">Make informed decisions about trademark applications and opposition using advanced AI analysis of opposition cases, likelihood of confusion, and historical precedents.</p>
            <div className="flex gap-4 justify-center">
              <Button 
                className="bg-brand-gradient text-white font-heading px-8 py-6"
                onClick={() => navigate("/opposition-prediction")}
              >
                Start
              </Button>
              <Button 
                variant="secondary" className="font-heading px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[{
            title: "Confusion Analysis",
            description: "Assess likelihood of confusion between trademarks using advanced AI comparison",
            icon: "⚖️"
          }, {
            title: "Success Prediction",
            description: "Get accurate predictions on opposition case outcomes based on historical data",
            icon: "📈"
          }, {
            title: "Similar Cases",
            description: "Access relevant precedent cases to support your trademark strategy",
            icon: "🔍"
          }].map(feature => <div key={feature.title} className="p-6 rounded-lg border border-white/10 bg-surface hover:border-brand-gradient-end/50 transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-heading text-heading-4 mb-2 bg-clip-text text-transparent bg-brand-gradient">
                  {feature.title}
                </h3>
                <p className="font-body text-text-secondary">
                  {feature.description}
                </p>
              </div>)}
          </div>
        </section>
      </main>
    </div>;
};
export default Index;