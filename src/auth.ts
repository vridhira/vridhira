
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { findUserByEmail, findUserByPhoneNumber, createUser } from '@/lib/user-actions';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const { email, phoneNumber, password } = credentials;

        if (!password) {
          throw new Error("Password is required.");
        }

        let user;
        if (email) {
          user = await findUserByEmail(email as string);
           if (!user) throw new Error("No user found with this email.");
        } else if (phoneNumber) {
          user = await findUserByPhoneNumber(phoneNumber as string);
           if (!user) throw new Error("No user found with this phone number.");
        } else {
            throw new Error("Either email or phone number is required.");
        }

        if (user && user.password) {
          const passwordMatch = await bcrypt.compare(password as string, user.password);
          if (passwordMatch) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
        }
        
        throw new Error("Incorrect password.");
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
