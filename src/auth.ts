
import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { findUserByEmail, findUserByPhoneNumber } from '@/lib/user-actions';
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
  },
  secret: process.env.AUTH_SECRET,
  providers: [
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
                // If neither email nor phone is provided, we cannot proceed.
                return null;
            }

            if (!user) {
                throw new UserNotFoundError("No user found with the provided credentials.");
            }

            if (!user.password) {
                throw new MissingPasswordError("This account does not have a password set. Try a social login.");
            }

            const passwordsMatch = await bcrypt.compare(password as string, user.password);

            if (passwordsMatch) {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            } else {
                throw new InvalidPasswordError("The provided password did not match.");
            }

        } catch (error) {
            // Re-throw custom auth errors so NextAuth can handle them
            if (error instanceof UserNotFoundError || error instanceof InvalidPasswordError || error instanceof MissingPasswordError) {
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
