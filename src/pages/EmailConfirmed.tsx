import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/AuthDialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";
import { MailCheck, AlertCircle, Loader2 } from "lucide-react";

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');

    if (mode === 'verifyEmail' && actionCode) {
      setVerificationState('verifying');
      applyActionCode(auth, actionCode)
        .then(() => {
          setVerificationState('success');
          // Optional: Redirect to login or dashboard after a delay?
          // setTimeout(() => navigate('/'), 3000);
        })
        .catch((error) => {
          console.error("Email Verification Error:", error);
          setVerificationState('error');
          let friendlyError = "Failed to verify email. The link may be invalid or expired.";
          if (error.code === 'auth/invalid-action-code') {
             friendlyError = "Verification link is invalid or has expired. Please sign up again.";
          }
          setErrorMessage(friendlyError);
        });
    } else {
      // If no verification params, maybe show a different message or redirect?
      // For now, assume the user landed here manually after verification
       setVerificationState('success'); // Assume success if landed here without params? Or 'idle'?
    }
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (verificationState) {
      case 'verifying':
        return (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-cyan-400 animate-spin" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 text-white">Verifying Email...</h1>
            <p className="font-body text-body text-text-secondary mb-8">Please wait while we verify your email address.</p>
          </>
        );
      case 'success':
        return (
          <>
            <MailCheck className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 bg-clip-text text-transparent bg-brand-gradient">Email Confirmed!</h1>
            <p className="font-body text-body text-text-secondary mb-8">Your email has been successfully verified. You can now log in to your account.</p>
            <div className="flex flex-col gap-4">
              <AuthDialog>
                <Button className="bg-brand-gradient text-white font-heading w-full">Log in</Button>
              </AuthDialog>
               <Button variant="secondary" className="font-heading w-full" onClick={() => navigate("/")}>Go to Home</Button>
            </div>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="font-heading font-bold text-heading-2 mt-4 mb-4 text-red-400">Verification Failed</h1>
            <p className="font-body text-body text-text-secondary mb-8">{errorMessage || "An unexpected error occurred."}</p>
            <Button variant="secondary" className="font-heading w-full" onClick={() => navigate("/")}>Go to Home</Button>
          </>
        );
      case 'idle': // Initial state before useEffect runs
      default:
        return (
           <Loader2 className="mx-auto h-12 w-12 text-cyan-400 animate-spin" /> // Show loader initially
        );

    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />
      <main className="pt-24 pb-16 px-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]"> {/* Adjusted min-height */} 
        <div className="max-w-lg w-full text-center bg-surface rounded-lg p-10 border border-white/10 shadow-lg">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default EmailConfirmed; 