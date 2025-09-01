
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { findUserByEmail, createUser } from '@/lib/user-actions';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        if (credentials.email && credentials.password) {
          const email = credentials.email as string;
          const password = credentials.password as string;
          const user = await findUserByEmail(email);

          if (!user) {
            throw new Error("No user found with this email.");
          }

          if (user && user.password) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            } else {
                 throw new Error("Incorrect password.");
            }
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false; 

        let existingUser = await findUserByEmail(email);
        if (!existingUser) {
          
          const nameParts = user.name?.split(' ') ?? [''];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || 'User';
          
          await createUser({
            id: user.id,
            email: email,
            firstName: firstName,
            lastName: lastName,
          });
        }
      }
      return true; 
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
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
