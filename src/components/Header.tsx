import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, loading } = useAuth();

  return (
    <header className="w-full px-6 py-4 bg-background/80 backdrop-blur-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          className="flex items-center gap-2 focus:outline-none"
          aria-label="Go to home page"
          onClick={() => navigate("/")}
        >
          <img src="/stamp-logo.svg" alt="Brandability Logo" className="w-10 h-10" />
          <span className="font-heading font-bold text-2xl">
            <span className="bg-clip-text text-transparent bg-brand-gradient">BRAND</span>
            <span className="text-white">ABILITY</span>
          </span>
        </button>
        
        {!loading && (
          currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">{currentUser.email}</span>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <AuthDialog>
              <Button className="bg-brand-gradient text-white font-heading">
                Sign up / Login
              </Button>
            </AuthDialog>
          )
        )}
      </div>
    </header>
  );
};
