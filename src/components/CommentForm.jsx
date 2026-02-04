'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import UsernamePrompt from './UsernamePrompt'

/**
 * CommentForm Component
 * Form for submitting new comments to a discussion thread
 * 
 * Features:
 * - Input field for comment body
 * - Checkbox for anonymous posting
 * - Disables anonymous option for centre accounts
 * - Validates input before submission
 * - Shows success/error feedback
 * - Clears form after successful submission
 * - Shows username prompt if user hasn't set username
 * 
 * Requirements: 4.1, 4.2, 4.3, 5.2
 */

export default function CommentForm({ centreId, onCommentCreated }) {
  const { data: session } = useSession()
  const user = session?.user
  
  const [body, setBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const isCentre = user?.role === 'CENTRE'

  // Show username prompt if user doesn't have username
  if (!user?.username) {
    return <UsernamePrompt />
  }

  // Validate comment body
  const validateBody = (text) => {
    if (!text || text.trim().length === 0) {
      return 'Comment cannot be empty'
    }
    if (text.length > 5000) {
      return 'Comment is too long (maximum 5000 characters)'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous messages
    setError(null)
    setSuccess(false)

    // Validate input
    const validationError = validateBody(body)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      // Submit comment
      const response = await fetch(`/api/discussions/${centreId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: body.trim(),
          isAnonymous
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to post comment')
      }

      // Success!
      setSuccess(true)
      setBody('')
      setIsAnonymous(false)
      
      // Call callback to refresh comments
      if (onCommentCreated) {
        onCommentCreated(data.comment)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError(err.message || 'Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBodyChange = (e) => {
    setBody(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const handleAnonymousChange = (e) => {
    // Prevent centre accounts from posting anonymously
    if (isCentre) {
      return
    }
    setIsAnonymous(e.target.checked)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container rounded-2xl p-5 shadow-premium-sm">
      <h3 className="text-title-medium font-semibold text-on-surface mb-4">
        Share your thoughts
      </h3>

      {/* Comment textarea */}
      <div className="mb-4">
        <textarea
          value={body}
          onChange={handleBodyChange}
          placeholder="Write your comment here..."
          rows={4}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-surface-container-high text-on-surface rounded-xl border-2 border-outline-variant focus:border-primary focus:outline-none transition-colors resize-none text-body-large placeholder:text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-label-small ${
            body.length > 5000 ? 'text-error' : 'text-on-surface-variant'
          }`}>
            {body.length} / 5000 characters
          </span>
        </div>
      </div>

      {/* Anonymous checkbox */}
      <div className="mb-4">
        <label className={`flex items-center gap-3 cursor-pointer ${
          isCentre ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={handleAnonymousChange}
            disabled={isSubmitting || isCentre}
            className="w-5 h-5 rounded border-2 border-outline-variant text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed"
          />
          <span className="text-body-medium text-on-surface">
            Post anonymously
          </span>
        </label>
        {isCentre && (
          <p className="text-label-small text-on-surface-variant mt-2 ml-8">
            Centre accounts cannot post anonymously
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-error-container rounded-xl">
          <p className="text-body-medium text-on-error-container">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 p-3 bg-tertiary-container rounded-xl">
          <p className="text-body-medium text-on-tertiary-container">
            Comment posted successfully!
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || !body.trim()}
        className={`w-full py-3 rounded-full text-label-large font-medium transition-all duration-200 ease-standard state-layer ${
          isSubmitting || !body.trim()
            ? 'bg-surface-container text-on-surface/38 cursor-not-allowed'
            : 'bg-primary text-primary-on shadow-elevation-1 hover:shadow-elevation-2 hover:scale-[1.02]'
        }`}
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}
