import NextAuth from 'next-auth';
import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import env from '@/lib/env';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
