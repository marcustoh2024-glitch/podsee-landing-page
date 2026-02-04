import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Get the current session in API routes
 * @returns {Promise<Session|null>}
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Require authentication in API routes
 * Throws error if not authenticated
 * @returns {Promise<Session>}
 */
export async function requireAuth() {
  const session = await getSession()
  
  if (!session || !session.user) {
    const error = new Error('Unauthorized')
    error.status = 401
    throw error
  }
  
  return session
}
