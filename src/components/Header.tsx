import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";

export const Header = () => {
  return (
    <header className="w-full px-6 py-4 bg-background/80 backdrop-blur-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/stamp-logo.svg" alt="Brandability Logo" className="w-10 h-10" />
          <span className="font-heading font-bold text-2xl">
            <span className="bg-clip-text text-transparent bg-brand-gradient">BRAND</span>
            <span className="text-white">ABILITY</span>
          </span>
        </div>
        <AuthDialog>
          <Button className="bg-brand-gradient text-white font-heading">
            Sign up / Login
          </Button>
        </AuthDialog>
      </div>
    </header>
  );
};
