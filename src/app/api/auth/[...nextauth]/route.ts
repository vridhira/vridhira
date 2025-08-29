'use server';

import NextAuth from 'next-auth';
import type { AuthOptions, Provider } from 'next-auth/providers';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail, createUser } from '@/lib/data';
import { User } from '@/lib/types';
import bcrypt from 'bcrypt';

const providers: Provider[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = findUserByEmail(credentials.email);

      if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
        return { 
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        } as any;
      } else {
        return null;
      }
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn("Google OAuth credentials are not set in environment variables. Google login will not be available.");
}


export const authOptions: AuthOptions = {
  providers: providers,
  secret: process.env.NEXTAUTH_SECRET || 'authsecret',
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        let existingUser = findUserByEmail(profile.email);
        if (!existingUser) {
          const nameParts = profile.name?.split(' ') || [''];
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');

          existingUser = createUser({
            email: profile.email,
            firstName,
            lastName,
          });
        }
        user.id = existingUser.id;
        (user as any).firstName = existingUser.firstName;
        (user as any).lastName = existingUser.lastName;
      }
      return true;
    },
    async session({ session, token }) {
        if (token && session.user) {
            (session.user as any).id = token.id;
            (session.user as any).firstName = token.firstName;
            (session.user as any).lastName = token.lastName;
        }
        return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            (token as any).firstName = (user as any).firstName;
            (token as any).lastName = (user as any).lastName;
        }
        return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
