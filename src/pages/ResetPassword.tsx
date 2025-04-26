import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { AlertCircle, Loader2, CheckCircle, KeyRound } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [modeState, setModeState] = useState<'idle' | 'verifying' | 'invalid' | 'valid' | 'resetting' | 'success' | 'error'>('idle');
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null); // Email associated with the code
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // General loading state

  useEffect(() => {
    const code = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (mode === 'resetPassword' && code) {
      setActionCode(code);
      setModeState('verifying');
      setLoading(true);
      // Verify the password reset code.
      verifyPasswordResetCode(auth, code)
        .then((verifiedEmail) => {
          setEmail(verifiedEmail);
          setModeState('valid'); // Code is valid, show password form
        })
        .catch((error) => {
          console.error("Password Reset Code Verification Error:", error);
          setModeState('invalid');
          let friendlyError = "Failed to verify request. The link may be invalid or expired.";
          if (error.code === 'auth/invalid-action-code') {
            friendlyError = "Password reset link is invalid or has expired. Please request a new one.";
          }
          setErrorMessage(friendlyError);
        })
        .finally(() => setLoading(false));
    } else {
      // Invalid mode or missing code
      setModeState('invalid');
      setErrorMessage("Invalid request. Please ensure you clicked the correct link.");
    }
  }, [searchParams]);

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!actionCode) {
      setErrorMessage("Action code is missing.");
      setModeState('error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return; // Keep state as 'valid' to allow re-entry
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return; 
    }

    setErrorMessage(null); // Clear previous errors
    setModeState('resetting');
    setLoading(true);

    confirmPasswordReset(auth, actionCode, newPassword)
      .then(() => {
        setModeState('success');
        // Optional: Auto-redirect after success?
        // setTimeout(() => navigate('/login'), 3000); 
      })
      .catch((error) => {
        console.error("Password Reset Confirmation Error:", error);
        setModeState('error');
        let friendlyError = "Failed to reset password. Please try again.";
        if (error.code === 'auth/weak-password') {
          friendlyError = "Password is too weak. Please choose a stronger password.";
        } else if (error.code === 'auth/invalid-action-code') {
          friendlyError = "Password reset link is invalid or has expired. Please request a new one.";
        } 
        setErrorMessage(friendlyError);
      })
      .finally(() => setLoading(false));
  };

  const renderContent = () => {
    switch (modeState) {
      case 'verifying':
      case 'idle': 
        return (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-cyan-400 animate-spin" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 text-white">Verifying Request...</h1>
            <p className="font-body text-body text-text-secondary mb-8">Please wait while we validate your password reset link.</p>
          </>
        );
      case 'invalid':
      case 'error':
        return (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 text-red-400">{modeState === 'invalid' ? 'Invalid Link' : 'Reset Failed'}</h1>
            <p className="font-body text-body text-text-secondary mb-8">{errorMessage || "An unexpected error occurred."}</p>
            <Button variant="secondary" className="font-heading w-full" onClick={() => navigate("/")}>Go to Home</Button>
          </>
        );
      case 'valid':
      case 'resetting': // Show form while resetting too, disable inputs/button
        return (
          <>
            <KeyRound className="mx-auto h-12 w-12 text-cyan-400" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 text-white">Set New Password</h1>
            <p className="font-body text-body text-text-secondary mb-4">
              Enter a new password for your account: <span className="font-medium text-white">{email}</span>
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="new-password" className="sr-only">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="New Password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="bg-surface border-white/10 text-white focus:border-white"
                />
              </div>
               <div>
                <Label htmlFor="confirm-password" className="sr-only">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="bg-surface border-white/10 text-white focus:border-white"
                />
              </div>
               {errorMessage && (
                 <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                   <AlertCircle className="h-4 w-4 flex-shrink-0" />
                   <span>{errorMessage}</span>
                 </div>
               )}
              <Button 
                type="submit" 
                className="bg-brand-gradient text-white font-heading w-full"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
              </Button>
            </form>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 text-green-400">Password Reset Successful!</h1>
            <p className="font-body text-body text-text-secondary mb-8">Your password has been updated. You can now log in with your new password.</p>
             <Button 
               className="bg-brand-gradient text-white font-heading w-full"
               onClick={() => navigate("/")} // Or navigate to a login page
             >
               Go to Home
             </Button>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <main className="pt-24 pb-16 px-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-lg w-full text-center bg-surface rounded-lg p-10 border border-white/10 shadow-lg">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ResetPassword; 