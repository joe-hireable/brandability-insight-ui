import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmailConfirmed = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <main className="pt-24 pb-16 px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-lg w-full text-center bg-surface rounded-lg p-10 border border-white/10 shadow-lg">
          <h1 className="font-heading font-bold text-heading-2 mb-4 bg-clip-text text-transparent bg-brand-gradient">Email confirmed</h1>
          <p className="font-body text-body text-text-secondary mb-8">Your email has been successfully confirmed. You can now log in to your account.</p>
          <Button className="bg-brand-gradient text-white font-heading w-full" onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmed; 