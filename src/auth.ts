
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
        // For Google Sign-In, we might pass a user object directly.
        if (credentials.user) {
           try {
            const user = JSON.parse(credentials.user as string) as User;
            // Omit password before returning, even if it's undefined.
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
           } catch (e) {
             console.error("Invalid user data for social sign in:", e);
             return null;
           }
        }

        const { email, phoneNumber, password } = credentials;

        if (!password) {
            console.error("Authorize error: Password is required for credential login.");
            return null;
        }
        
        let user: User | undefined | null;

        try {
            if (email) {
              user = await findUserByEmail(email as string);
            } else if (phoneNumber) {
              user = await findUserByPhoneNumber(phoneNumber as string);
            } else {
                console.error("Authorize error: Either email or phone number is required.");
                return null;
            }
        } catch (error: any) {
            console.error("Error finding user in authorize function:", error);
            // This indicates a server-side problem (e.g., can't read file)
            // It's better to throw an error here so it can be debugged.
            // Returning null would imply a user-facing error like "user not found".
            throw new Error("There was a server error during authentication.");
        }

        // Case 1: User not found
        if (!user) {
            return null; 
        }
        
        // Case 2: User exists but signed up via a social provider (no password)
        if (!user.password) {
            return null;
        }
        
        // Case 3: User exists, has a password, now compare it
        const passwordMatch = await bcrypt.compare(password as string, user.password);
        
        if (passwordMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword; // Success!
        }
        
        // Case 4: Password does not match
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
           token.image = user.image || dbUser.image;
        } else {
           token.name = user.name
           token.email = user.email
           token.image = user.image
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
