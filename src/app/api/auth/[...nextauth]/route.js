import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists in database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        // Create user if doesn't exist
        if (!dbUser) {
          try {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                role: 'PARENT', // Default role
                passwordHash: '', // Empty string for OAuth users (no password)
              }
            })
          } catch (createError) {
            // If user was created by another request, fetch it
            if (createError.code === 'P2002') {
              dbUser = await prisma.user.findUnique({
                where: { email: user.email }
              })
            } else {
              throw createError
            }
          }
        }

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        // Return true anyway if it's just a timeout - user might already exist
        if (error.code === 'P1008') {
          return true
        }
        return false
      }
    },
    async jwt({ token, user, account, trigger }) {
      // Always fetch latest user data from database to ensure username is included
      const email = token.email || user?.email
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email }
        })
        
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.username = dbUser.username
          token.email = dbUser.email
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add user info to session from token
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
      }
      return session
    },
  },
  pages: {
    signIn: '/', // Redirect to home page for sign in
    error: '/', // Redirect errors to home page instead of showing error page
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
