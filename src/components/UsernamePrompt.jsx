'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

/**
 * UsernamePrompt Component
 * Modal prompt for users to set their username before posting
 * 
 * Features:
 * - Input validation (3-20 chars, alphanumeric + underscore)
 * - Real-time format validation
 * - Case-insensitive uniqueness check
 * - Error handling for taken usernames
 * 
 * Requirements: Username enforcement before posting
 */

export default function UsernamePrompt({ onUsernameSet }) {
  const { data: session, update } = useSession()
  const user = session?.user
  
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const validateUsername = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Username is required'
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (value.length > 20) {
      return 'Username must be 20 characters or less'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setError(null)

    // Validate input
    const validationError = validateUsername(username)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to set username')
      }

      // Update session with new user data
      await update({
        ...session,
        user: {
          ...session.user,
          username: data.user.username
        }
      })

      // Call callback to update parent component
      if (onUsernameSet) {
        onUsernameSet(data.user)
      }
      
      // Reload the page to refresh the session
      window.location.reload()

    } catch (err) {
      setError(err.message || 'Failed to set username. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    if (error) {
      setError(null)
    }
  }

  return (
    <div className="bg-surface-container rounded-2xl p-6 shadow-premium-sm border-2 border-primary">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary text-primary-on flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-title-large font-semibold text-on-surface mb-2">
            Choose Your Username
          </h3>
          <p className="text-body-medium text-on-surface-variant">
            Before you can post, please choose a username. This will be displayed on your comments.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-label-large font-medium text-on-surface mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="e.g. parent_john123"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-surface-container-high text-on-surface rounded-xl border-2 border-outline-variant focus:border-primary focus:outline-none transition-colors text-body-large placeholder:text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          <p className="text-label-small text-on-surface-variant mt-2">
            3-20 characters. Letters, numbers, and underscores only.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container rounded-xl">
            <p className="text-body-medium text-on-error-container">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !username.trim()}
          className={`w-full py-3 rounded-full text-label-large font-medium transition-all duration-200 ease-standard ${
            isSubmitting || !username.trim()
              ? 'bg-surface-container text-on-surface/38 cursor-not-allowed'
              : 'bg-primary text-primary-on shadow-elevation-1 hover:shadow-elevation-2 hover:scale-[1.02]'
          }`}
        >
          {isSubmitting ? 'Setting Username...' : 'Set Username'}
        </button>
      </form>
    </div>
  )
}
