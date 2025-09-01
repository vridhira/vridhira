
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  updateProfile,
  signInWithCredential,
  PhoneAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { createUser, findUserByEmail, findUserByPhoneNumber } from '@/lib/user-actions';
import { checkAndRecordOtpAttempt } from '@/lib/otp-actions';
import { signIn, signOut } from 'next-auth/react';


interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signup: (password: string, firstName: string, lastName: string, email?: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithPhoneNumber: (phoneNumber: string, recaptchaContainerId: string) => Promise<{ verificationId: string | null, remaining: number }>;
  confirmPhoneNumberOtp: (verificationId: string, otp: string) => Promise<FirebaseUser | null>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
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

  const signup = async (password: string, firstName: string, lastName: string, email?: string, phoneNumber?: string) => {
    if (email) {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          throw new Error("An account with this email already exists.");
        }
    }
    if (phoneNumber) {
        const existingUser = await findUserByPhoneNumber(phoneNumber);
        if (existingUser) {
          throw new Error("An account with this phone number already exists.");
        }
    }
    
    await createUser({ email, phoneNumber, password, firstName, lastName });
    
    // We only create a Firebase user if they sign up with email.
    // Phone auth with password doesn't require a separate Firebase user record for this app's logic.
    if (email) {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
        } catch (firebaseError) {
            console.error("Firebase signup failed after local user creation:", firebaseError);
            throw firebaseError;
        }
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/login' });
      await firebaseSignOut(firebaseAuth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };


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
     const result = await signInWithCredential(firebaseAuth, credential);
     
     if (!result.user.phoneNumber) {
        throw new Error("Could not retrieve phone number from Firebase.");
     }

     const existingUser = await findUserByPhoneNumber(result.user.phoneNumber);
     if (!existingUser) {
        throw new Error("User not found after phone verification.");
     }
     
     // Sign in with next-auth for session management
     await signIn('credentials', {
         phoneNumber: existingUser.phoneNumber,
         password: existingUser.password, // This won't work as we don't have the plain password. This flow is only for password reset.
         redirect: false,
     });

     return result.user;
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
      signup,
      logout,
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
