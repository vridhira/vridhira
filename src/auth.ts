import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { findUserByEmail } from "@/lib/user-actions"
import bcrypt from "bcrypt"

export const config = {
  theme: {
    logo: "https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null
        }

        const user = await findUserByEmail(email);

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (isPasswordValid) {
          return { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email };
        }

        return null
      },
    }),
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === "/middleware-example") return !!auth
      return true
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
