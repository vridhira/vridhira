
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
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  updateProfile,
  signInWithCredential,
  PhoneAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { createUser, findUserByEmail, findUserByPhoneNumber, updateUserPassword } from '@/lib/user-actions';
import { checkAndRecordOtpAttempt, getOtpAttemptInfo } from '@/lib/otp-actions';
import { signIn } from 'next-auth/react';


interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
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

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }
    
    // Create user in our local store first
    const newUser = await createUser({ email, password, firstName, lastName });
    
    try {
        // Then create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
        
        // This is important to sync the ID from our store with Firebase
        // In a real DB, you'd probably update the user record with the Firebase UID.
        // For our file-based store, we are using the Firebase UID as our ID.
        // The `createUser` function should be adapted to handle this if not already done.
        
        // Sign in with NextAuth
        await signIn('credentials', { email, password, redirect: false });

        return userCredential.user;
    } catch (firebaseError) {
        // If Firebase signup fails, we should ideally roll back the user creation in our store.
        // This is complex with a file-based system, but in a DB you'd use a transaction.
        console.error("Firebase signup failed after local user creation:", firebaseError);
        throw firebaseError;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    
    const email = result.user.email;
    if (!email) {
        throw new Error("Could not retrieve email from Google Sign-In.");
    }

    let existingUser = await findUserByEmail(email);
    if (!existingUser) {
      const nameParts = result.user.displayName?.split(' ') || [''];
      const firstName = nameParts[0] || 'Google';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      // Create user in our backend
      await createUser({ id: result.user.uid, email, firstName, lastName });
    }
    
    // We don't use NextAuth credentials provider here,
    // as Google is a separate federated identity provider.
    // NextAuth handles this automatically when set up correctly.
    // The session will be managed by NextAuth based on Firebase's state.
    // We might need a custom NextAuth provider or adapter for deep integration.
    // For now, onAuthStateChanged handles the Firebase user state.

    return result.user;
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

     let existingUser = await findUserByPhoneNumber(result.user.phoneNumber);
     if (!existingUser) {
        // This case should ideally not be hit if we check for user existence before sending OTP.
        // But as a fallback, we can create the user here.
        const name = result.user.displayName || "New User";
        const [firstName, ...lastNameParts] = name.split(' ');
        await createUser({ 
            id: result.user.uid,
            phoneNumber: result.user.phoneNumber,
            firstName,
            lastName: lastNameParts.join(' ') || ''
        });
     }

     // Sign in with NextAuth after phone verification.
     // This would require a custom credentials provider setup for phone numbers.
     // For now, we rely on Firebase's auth state.

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
      signInWithGoogle,
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
