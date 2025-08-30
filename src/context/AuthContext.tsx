'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser, // Alias Firebase User to avoid conflict with local User
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { findUserByEmail, createUser } from '@/lib/user-actions';
import { User } from '@/lib/types'; // Import your local User type

interface AuthContextType {
  user: FirebaseUser | null; // Use FirebaseUser here as this context interacts directly with Firebase Auth
  loading: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<FirebaseUser | null>;
  login: (email: string, password: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signInWithPhoneNumber: (phoneNumber: string, recaptchaContainerId: string) => Promise<string | null>;
  confirmPhoneNumberOtp: (verificationId: string, otp: string) => Promise<FirebaseUser | null>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null); // To store the confirmation result

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
      // Create user in local data store
      createUser({ id: userCredential.user.uid, email, firstName, lastName, password }); // Pass password
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check if user exists in your local data, if not, create it
      const existingUser = findUserByEmail(result.user.email || '');
      if (!existingUser) {
        const nameParts = result.user.displayName?.split(' ') || [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        createUser({ id: result.user.uid, email: result.user.email || '', firstName, lastName });
      }
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const sendPhoneNumberVerification = async (phoneNumber: string, recaptchaContainerId: string) => {
    try {
      let verifier = recaptchaVerifier; // Use existing verifier if available
      if (!verifier) {
        verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          'size': 'invisible',
          'callback': (response: any) => {
            console.log("reCAPTCHA solved", response);
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
          }
        });
        await verifier.render();
        setRecaptchaVerifier(verifier);
      }

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation); // Store the confirmation result
      return confirmation.verificationId;
    } catch (error) {
      console.error("Error sending phone number verification:", error);
      throw error;
    }
  };

  const confirmPhoneNumberOtp = async (verificationId: string, otp: string) => {
    try {
      if (!confirmationResult || confirmationResult.verificationId !== verificationId) {
        throw new Error("Invalid verification ID or confirmation result not found.");
      }
      const result = await confirmationResult.confirm(otp);
      // Check if user exists in your local data, if not, create it
      const existingUser = findUserByEmail(result.user.email || '');
      if (!existingUser) {
        createUser({ id: result.user.uid, email: result.user.email || '', firstName: '', lastName: '' });
      }
      return result.user;
    } catch (error) {
      console.error("Error confirming OTP:", error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (user) {
      try {
        await updateProfile(user, { displayName });
        // You might want to update your local data store here as well
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signup,
      login,
      logout,
      signInWithGoogle,
      signInWithPhoneNumber: sendPhoneNumberVerification, // Map the new function name
      confirmPhoneNumberOtp,
      updateUserProfile,
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
