
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findUserByEmail, findUserByPhoneNumber } from '@/lib/user-actions';
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
        // This function handles credential-based login (email/password or phone/password)
        
        const { email, phoneNumber, password } = credentials;

        if (!password) {
            // A password is always required for credential-based login.
            return null;
        }

        let user: User | null | undefined;
        
        try {
            // Determine whether to find the user by email or phone number
            if (email) {
                user = await findUserByEmail(email as string);
            } else if (phoneNumber) {
                user = await findUserByPhoneNumber(phoneNumber as string);
            } else {
                // If neither email nor phone is provided, we cannot proceed.
                return null;
            }

            // Case 1: User does not exist in the database.
            if (!user) {
                return null;
            }

            // Case 2: User exists, but they don't have a password set
            // (e.g., they might have signed up via a social provider).
            if (!user.password) {
                return null;
            }

            // Case 3: User exists and has a password. Compare the provided password.
            const passwordsMatch = await bcrypt.compare(password as string, user.password);

            if (passwordsMatch) {
                // Successful login. Return the user object without the password.
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }

            // Case 4: Passwords do not match.
            return null;

        } catch (error) {
            // If any unexpected error occurs (e.g., database connection issue),
            // log it and prevent login.
            console.error("Error in authorize function:", error);
            return null;
        }
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
