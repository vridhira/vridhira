
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
             throw new Error("Invalid user data for social sign in.");
           }
        }

        const { email, phoneNumber, password } = credentials;

        if (!password) {
          throw new Error("Password is required for this login method.");
        }

        let user: User | undefined;

        try {
            if (email) {
              user = await findUserByEmail(email as string);
            } else if (phoneNumber) {
              user = await findUserByPhoneNumber(phoneNumber as string);
            } else {
                throw new Error("Either email or phone number is required.");
            }
            
            if (!user) {
                // Return null to indicate "user not found" to the client.
                return null;
            }
        } catch (error: any) {
            // Rethrow the specific error message from user-actions
            throw new Error(error.message);
        }
        
        if (user && user.password) {
          const passwordMatch = await bcrypt.compare(password as string, user.password);
          if (passwordMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
        }
        
        // Return null to indicate "incorrect password" to the client.
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
