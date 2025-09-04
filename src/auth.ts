
import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { findUserByEmail, findUserByPhoneNumber, findOrCreateUser } from '@/lib/user-actions';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';
import { User } from './lib/types';

class UserNotFoundError extends AuthError {
  code = 'UserNotFound';
}

class InvalidPasswordError extends AuthError {
  code = 'InvalidPassword';
}

class MissingPasswordError extends AuthError {
    code = 'MissingPassword';
}

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const { email, phoneNumber, password } = credentials;

        if (!password) {
            // A password must always be provided for credential-based login.
            return null; 
        }

        let user: User | null | undefined;
        
        try {
            if (email) {
                user = await findUserByEmail(email as string);
            } else if (phoneNumber) {
                user = await findUserByPhoneNumber(phoneNumber as string);
            } else {
                return null;
            }

            if (!user) {
                throw new UserNotFoundError("No user found with the provided credentials.");
            }

            if (!user.password) {
                throw new MissingPasswordError("This account does not have a password set. Try a social login.");
            }

            const passwordsMatch = await bcrypt.compare(password as string, user.password);

            if (!passwordsMatch) {
                throw new InvalidPasswordError("The provided password did not match.");
            }
            
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;

        } catch (error) {
            if (error instanceof UserNotFoundError || error instanceof InvalidPasswordError || error instanceof MissingPasswordError) {
                // Re-throw custom auth errors so NextAuth can handle them
                throw error;
            }
            // Log unexpected errors and throw a generic one
            console.error("Unexpected error in authorize function:", error);
            throw new Error("An unexpected error occurred during authentication.");
        }
      },
    }),
  ],
  callbacks: {
     async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
           const userToCreate = {
              id: profile.sub, // Google's unique ID
              email: profile.email,
              name: profile.name,
              image: profile.picture,
           };
           await findOrCreateUser(userToCreate);
        } catch (error) {
           console.error("Error creating user from Google profile:", error);
           return false; // Prevent sign-in if user creation fails
        }
      }
      return true; // Allow sign-in
    },
    async jwt({ token, user, account }) {
      if (user) {
        // This is the initial sign-in
        const dbUser = await findUserByEmail(user.email as string);
        if (dbUser) {
           token.id = dbUser.id;
           token.name = `${dbUser.firstName} ${dbUser.lastName}`;
           token.email = dbUser.email;
           token.image = dbUser.image || user.image;
           token.createdAt = dbUser.createdAt;
           token.role = dbUser.role; // Add role to token
        } else {
           // Fallback for initial user object from provider if db lookup fails
           token.id = user.id;
           token.name = user.name;
           token.email = user.email;
           token.image = user.image;
           // @ts-ignore
           token.role = user.role; // Add role to token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string | undefined;
        // @ts-ignore
        session.user.createdAt = token.createdAt;
        // @ts-ignore
        session.user.role = token.role; // Add role to session
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
