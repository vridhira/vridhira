
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  PhoneAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { findUserByPhoneNumber } from '@/lib/user-actions';
import { checkAndRecordOtpAttempt } from '@/lib/otp-actions';
import { signIn } from 'next-auth/react';


interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithPhoneNumber: (phoneNumber: string, recaptchaContainerId: string) => Promise<{ verificationId: string | null, remaining: number }>;
  confirmPhoneNumberOtp: (verificationId: string, otp: string) => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithPhoneNumber = async (phoneNumber: string, recaptchaContainerId: string) => {
    const userExists = await findUserByPhoneNumber(phoneNumber);
    if (!userExists) {
        throw new Error("No account found with this phone number. Please sign up.");
    }
    
    const attemptResult = await checkAndRecordOtpAttempt(phoneNumber);
    if (!attemptResult.success) {
      throw { message: attemptResult.message, bannedUntil: attemptResult.bannedUntil };
    }

    const recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
    'size': 'invisible',
    'callback': () => {},
    'expired-callback': () => {}
    });
    const confirmationResult = await firebaseSignInWithPhoneNumber(firebaseAuth, phoneNumber, recaptchaVerifier);
    
    return { verificationId: confirmationResult.verificationId, remaining: attemptResult.remaining };
  };

  const confirmPhoneNumberOtp = async (verificationId: string, otp: string) => {
     const credential = PhoneAuthProvider.credential(verificationId, otp);
     // This just verifies the OTP with Firebase, it doesn't sign the user in to our system.
     // We need to do this to confirm ownership before allowing a password reset.
     await firebaseAuth.signInWithCredential(credential);
     // We don't want to keep the user signed in to Firebase at this stage.
     await firebaseSignOut(firebaseAuth);
     return true;
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithPhoneNumber,
      confirmPhoneNumberOtp,
      sendPasswordResetEmail,
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
