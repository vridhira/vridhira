import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // @ts-ignore
        session.user.role = token.email === 'hk8913114@gmail.com' ? 'admin' : 'user';
      }
      return session
    },
  }
})
