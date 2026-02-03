'use client'

import { useState, useEffect } from 'react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Reset form when modal opens
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setError('')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (!email || !password) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      // Get existing users from localStorage
      const usersKey = 'podsee_users'
      const existingUsers = JSON.parse(localStorage.getItem(usersKey) || '[]')

      if (isSignUp) {
        // Check if user already exists
        const userExists = existingUsers.find(u => u.email === email)
        if (userExists) {
          setError('An account with this email already exists')
          setIsLoading(false)
          return
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email,
          name: name || email.split('@')[0],
          password, // In production, this should be hashed
          role: 'PARENT',
          createdAt: new Date().toISOString()
        }

        existingUsers.push(newUser)
        localStorage.setItem(usersKey, JSON.stringify(existingUsers))

        // Set current user
        const userSession = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
        localStorage.setItem('podsee_current_user', JSON.stringify(userSession))
        
        onAuthSuccess(userSession)
        onClose()
      } else {
        // Sign in
        const user = existingUsers.find(u => u.email === email && u.password === password)
        if (!user) {
          setError('Invalid email or password')
          setIsLoading(false)
          return
        }

        // Set current user
        const userSession = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
        localStorage.setItem('podsee_current_user', JSON.stringify(userSession))
        
        onAuthSuccess(userSession)
        onClose()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h3>
              <p className="text-sm text-gray-500">
                {isSignUp ? 'Join the community to share your thoughts' : 'Welcome back! Sign in to comment'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Anonymous Option */}
          {!isSignUp && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const anonymousUser = {
                    id: 'anonymous_' + Date.now(),
                    email: 'anonymous',
                    name: 'Anonymous Parent',
                    role: 'PARENT',
                    isAnonymous: true
                  }
                  localStorage.setItem('podsee_current_user', JSON.stringify(anonymousUser))
                  onAuthSuccess(anonymousUser)
                  onClose()
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Continue as Anonymous
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
