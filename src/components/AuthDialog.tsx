
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, LogIn } from "lucide-react";
import { useState } from "react";

export const AuthDialog = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  return <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col space-y-6 py-6">
          <div className="flex flex-col space-y-2 text-center">
            <h3 className="bg-clip-text text-transparent bg-brand-gradient text-heading-1 font-bold">
              {isLogin ? "Welcome" : "Create an account"}
            </h3>
            <p className="text-text-secondary text-sm">
              {isLogin ? "Enter your credentials to access your account" : "Enter your details to create your account"}
            </p>
          </div>

          <Button variant="outline" className="relative">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 absolute left-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-text-secondary">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Input type="email" placeholder="name@example.com" className="bg-surface border-white/10" />
            <Input type="password" placeholder="••••••••" className="bg-surface border-white/10" />
          </div>

          <Button className="bg-brand-gradient font-heading">
            <LogIn className="w-4 h-4 mr-2" />
            {isLogin ? "Sign in" : "Sign up"}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            {isLogin ? "Don't" : "Already"} have an account?{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="underline hover:text-white transition-colors">
              {isLogin ? "Sign up" : "Sign in"} here
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>;
};
