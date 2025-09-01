'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  signInWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { createUser, findUserByEmail } from '@/lib/user-actions';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signInWithPhoneNumber: (phoneNumber: string, recaptchaContainerId: string) => Promise<string | null>;
  confirmPhoneNumberOtp: (verificationId: string, otp: string) => Promise<FirebaseUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const syncUserWithFirebase = async (email: string, password?: string) => {
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password || "default-password-for-oauth");
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' && password) {
          await createUserWithEmailAndPassword(firebaseAuth, email, password);
        }
      }
  }


  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      const newUser = await createUser({ email, password, firstName, lastName });
      
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });

      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      
      const email = result.user.email;
      if (!email) {
          throw new Error("Could not retrieve email from Google Sign-In.");
      }

      let existingUser = await findUserByEmail(email);
      if (!existingUser) {
        const nameParts = result.user.displayName?.split(' ') || [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        await createUser({ id: result.user.uid, email, firstName, lastName });
      }
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithPhoneNumber = async (phoneNumber: string, recaptchaContainerId: string) => {
    try {
        const recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {}
      });
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
      return confirmationResult.verificationId;
    } catch (error) {
      console.error("Error sending phone number verification:", error);
      throw error;
    }
  };

  const confirmPhoneNumberOtp = async (verificationId: string, otp: string) => {
     throw new Error("Phone number OTP confirmation is not fully implemented yet.");
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signup,
      logout,
      signInWithGoogle,
      signInWithPhoneNumber,
      confirmPhoneNumberOtp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
