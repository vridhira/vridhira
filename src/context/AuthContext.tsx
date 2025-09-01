
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
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { createUser, findUserByEmail, findUserByPhoneNumber } from '@/lib/user-actions';
import { checkAndRecordOtpAttempt } from '@/lib/otp-actions';
import { signIn, signOut } from 'next-auth/react';


interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signup: (password: string, firstName: string, lastName: string, email: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithPhoneNumber: (phoneNumber: string, recaptchaContainerId: string) => Promise<{ verificationId: string | null, remaining: number }>;
  confirmPhoneNumberOtp: (verificationId: string, otp: string) => Promise<FirebaseUser | null>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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

  const signup = async (password: string, firstName: string, lastName: string, email: string, phoneNumber: string) => {
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      throw new Error("An account with this email already exists.");
    }

    const existingUserByPhone = await findUserByPhoneNumber(phoneNumber);
    if (existingUserByPhone) {
      throw new Error("An account with this phone number already exists.");
    }
    
    await createUser({ email, phoneNumber, password, firstName, lastName });
    
    try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
    } catch (firebaseError) {
        console.error("Firebase signup failed after local user creation:", firebaseError);
        throw firebaseError;
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
     
     // This flow is only for password reset. Actual login happens on the login page.
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const googleUser = result.user;
      if (!googleUser.email) {
        throw new Error("Could not retrieve email from Google.");
      }

      let dbUser = await findUserByEmail(googleUser.email);

      if (!dbUser) {
        const nameParts = googleUser.displayName?.split(' ') ?? [''];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // A placeholder is needed as phone is required, but not provided by Google.
        // In a real app, you might redirect to a page to complete the profile.
        const placeholderPhoneNumber = `+${Date.now()}`;

        dbUser = await createUser({
          id: googleUser.uid,
          email: googleUser.email,
          firstName,
          lastName,
          phoneNumber: placeholderPhoneNumber, // Or handle this differently
        });
      }

      // Now, sign in to next-auth to create a session
      const nextAuthResult = await signIn('credentials', {
        redirect: false,
        user: JSON.stringify(dbUser), // Pass the user object to the authorize function
      });

      if (nextAuthResult?.error) {
        throw new Error(nextAuthResult.error);
      }

    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      throw error;
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
      signInWithGoogle,
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
