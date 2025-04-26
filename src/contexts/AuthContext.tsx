import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust path if needed

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle sign-out errors if necessary
    }
  };

  // Function to send password reset email
  const sendPasswordReset = async (email: string) => {
    try {
      // You might want to configure actionCodeSettings if you use a custom domain
      // or want to redirect back to a specific page after reset.
      // const actionCodeSettings = {
      //   url: `${window.location.origin}/login`, // Example redirect URL
      //   handleCodeInApp: true,
      // };
      await sendPasswordResetEmail(auth, email);
      // Success state will be handled in the UI where this is called
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      // Re-throw or handle error specifically based on UI needs
      throw error; 
    }
  };

  const value = {
    currentUser,
    loading,
    signOut,
    sendPasswordReset,
  };

  // Don't render children until loading is complete to avoid flicker
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 