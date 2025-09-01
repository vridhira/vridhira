
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findUserByEmail, findUserByPhoneNumber, createUser } from '@/lib/user-actions';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';
import { User } from './lib/types';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        // For Google Sign-In, we pass a user object directly.
        if (credentials.user) {
           try {
            const user = JSON.parse(credentials.user as string) as User;
            // Omit password before returning, even if it's undefined.
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
           } catch (e) {
             // If parsing fails, it's an invalid request.
             console.error("Invalid user data for social sign in:", e);
             return null;
           }
        }

        const { email, phoneNumber, password } = credentials;

        if (!password) {
            // This should not happen with the current forms, but it's a good safeguard.
            console.error("Authorize error: Password is required.");
            return null;
        }
        
        let user: User | undefined | null;

        try {
            if (email) {
              user = await findUserByEmail(email as string);
            } else if (phoneNumber) {
              user = await findUserByPhoneNumber(phoneNumber as string);
            } else {
                // This case should not be reached if the form is submitted correctly
                console.error("Authorize error: Either email or phone number is required.");
                return null;
            }
        } catch (error: any) {
            // This catches errors from the file system (readUsers)
            console.error("Error finding user in authorize function:", error);
            // We return null to tell NextAuth it's a server error without crashing.
            // NextAuth will show a generic error message.
            return null;
        }

        if (!user) {
            // User not found. This is a valid failure case.
            // Returning null will result in a "CredentialsSignin" error on the client.
            // We can map this to a user-friendly message on the login page.
            return null; 
        }
        
        if (!user.password) {
            // This case handles users who signed up via a social provider
            // and are trying to log in with credentials.
            return null;
        }
        
        const passwordMatch = await bcrypt.compare(password as string, user.password);
        
        if (passwordMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword; // Success!
        }
        
        // Incorrect password. This is a valid failure case.
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Attempt to find the full user details to populate the token
        // This is useful for when Google sign in happens, where the initial `user` object might be partial
        const dbUser = await findUserByEmail(user.email as string);
        if (dbUser) {
           token.name = `${dbUser.firstName} ${dbUser.lastName}`;
           token.email = dbUser.email;
           // Preserve the image from the auth provider (e.g., Google)
           token.image = dbUser.image || user.image; 
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
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
