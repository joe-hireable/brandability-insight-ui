import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, LogIn, AlertCircle, KeyRound, CheckCircle } from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

export const AuthDialog = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { sendPasswordReset } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      setError(error.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordAction = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError("Please verify your email before logging in.");
          await auth.signOut();
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setShowConfirmation(true);
      }
    } catch (error: any) {
      console.error("Email/Password Error:", error);
      let friendlyError = "An error occurred. Please try again.";
      if (error.code === 'auth/user-not-found') {
        friendlyError = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        friendlyError = "Incorrect password.";
      } else if (error.code === 'auth/email-already-in-use') {
        friendlyError = "This email is already associated with an account.";
      } else if (error.code === 'auth/weak-password') {
        friendlyError = "Password is too weak. Please use a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyError = "Please enter a valid email address.";
      }
      setError(friendlyError);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setError(null);
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setResetEmailSent(true);
    } catch (error: any) {
      console.error("Password Reset Request Error:", error);
      let friendlyError = "Failed to send password reset email. Please try again.";
      if (error.code === 'auth/user-not-found') {
        friendlyError = "No account found with this email.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyError = "Please enter a valid email address.";
      }
      setError(friendlyError);
      setResetEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  const resetDialogState = () => {
    setIsLogin(true);
    setShowConfirmation(false);
    setShowPasswordReset(false);
    setResetEmailSent(false);
    setError(null);
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const toggleMode = () => {
    const currentEmail = email;
    resetDialogState();
    setIsLogin(!isLogin);
    if (showPasswordReset) setEmail(currentEmail);
  };
  
  const switchToPasswordReset = () => {
    const currentEmail = email;
    resetDialogState();
    setShowPasswordReset(true);
    setIsLogin(false);
    setEmail(currentEmail);
  };
  
  const switchToLogin = () => {
    resetDialogState();
    setIsLogin(true);
  };

  return <Dialog onOpenChange={(open) => { if (!open) resetDialogState(); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col space-y-6 py-6">
          {showConfirmation ? (
            <div className="text-center space-y-4">
              <Mail className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="font-heading font-bold text-heading-3 text-white">Check your email</h3>
              <p className="text-text-secondary text-sm px-4">We've sent a verification link to <span className="font-medium text-white">{email}</span>. Please check your inbox (and spam folder) to confirm your account.</p>
              <DialogClose asChild>
                 <Button variant="secondary" className="w-full" onClick={resetDialogState}>Close</Button>
              </DialogClose>
            </div>
          ) : resetEmailSent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="font-heading font-bold text-heading-3 text-white">Reset Link Sent</h3>
              <p className="text-text-secondary text-sm px-4">A password reset link has been sent to <span className="font-medium text-white">{email}</span>. Please check your inbox (and spam folder).</p>
              <DialogClose asChild>
                 <Button variant="secondary" className="w-full" onClick={resetDialogState}>Close</Button>
              </DialogClose>
            </div>
          ) : showPasswordReset ? (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h3 className="bg-clip-text text-transparent bg-brand-gradient font-heading font-bold text-heading-3">
                  Reset Password
                </h3>
                <p className="text-text-secondary text-sm">
                  Enter your email address to receive a password reset link.
                </p>
              </div>
               <div className="space-y-4">
                 <Input 
                   type="email" 
                   placeholder="name@example.com" 
                   className="bg-surface border-white/10 text-white focus:border-white"
                   value={email} 
                   onChange={(e) => setEmail(e.target.value)}
                   disabled={loading}
                 />
               </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                className="bg-brand-gradient font-heading" 
                onClick={handlePasswordResetRequest} 
                disabled={loading || !email}
              >
                {loading ? "Processing..." : 
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                }
              </Button>

              <p className="text-center text-sm text-text-secondary">
                Remembered your password?{" "}
                <button 
                  onClick={switchToLogin} 
                  className="underline hover:text-white transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Sign in here
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h3 className="bg-clip-text text-transparent bg-brand-gradient font-heading font-bold text-heading-3">
                  {isLogin ? "Welcome Back" : "Create an Account"}
                </h3>
                <p className="text-text-secondary text-sm">
                  {isLogin ? "Enter your credentials to access your account" : "Enter your email and password to get started"}
                </p>
              </div>

              <Button variant="outline" className="relative text-white" onClick={handleGoogleSignIn} disabled={loading}>
                {loading ? "Processing..." : 
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 absolute left-4" />
                  Continue with Google
                </>
                }
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
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="bg-surface border-white/10 text-white focus:border-white" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-surface border-white/10 text-white focus:border-white" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                className="bg-brand-gradient font-heading" 
                onClick={handleEmailPasswordAction} 
                disabled={loading || !email || !password}
              >
                {loading ? "Processing..." : 
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLogin ? "Sign in" : "Sign up"}
                  </>
                }
              </Button>

              <p className="text-center text-sm text-text-secondary">
                {isLogin ? "Don't" : "Already"} have an account?{" "}
                <button 
                  onClick={toggleMode} 
                  className="underline hover:text-white transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {isLogin ? "Sign up" : "Sign in"} here
                </button>
              </p>

              {isLogin && (
                 <div className="text-right text-sm">
                   <button 
                     onClick={switchToPasswordReset}
                     className="underline text-text-secondary hover:text-white transition-colors disabled:opacity-50"
                     disabled={loading}
                   >
                     Forgot Password?
                   </button>
                 </div>
               )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>;
};