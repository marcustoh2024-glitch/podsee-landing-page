'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import AuthModal from './AuthModal'

/**
 * DiscussionPage Component
 * Main component for displaying and interacting with a tuition centre's discussion thread
 * 
 * Features:
 * - Fetches discussion thread and comments on mount
 * - Displays centre name and tags at top
 * - Renders comments in chronological order
 * - Shows "Anonymous Parent" for anonymous comments
 * - Displays comment form if user is authenticated
 * - Shows auth modal for unauthenticated users
 * - Handles loading and error states
 * 
 * Requirements: 3.1, 3.2, 3.3, 7.3, 7.4
 */

export default function DiscussionPage({ centreId }) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const authLoading = status === 'loading'
  const user = session?.user
  
  const [thread, setThread] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Fetch discussion data
  const fetchDiscussion = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/discussions/${centreId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load discussion')
      }

      setThread(data.thread)
      setComments(data.comments)
    } catch (err) {
      setError(err.message || 'Failed to load discussion. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch discussion on mount
  useEffect(() => {
    if (centreId) {
      fetchDiscussion()
    }
  }, [centreId])

  // Handle new comment created
  const handleCommentCreated = (newComment) => {
    // Add new comment to the list
    setComments([...comments, newComment])
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-high animate-pulse" />
          <p className="text-body-large text-on-surface-variant">Loading discussion...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface-container rounded-2xl p-8 shadow-premium-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-container flex items-center justify-center">
            <svg className="w-8 h-8 text-on-error-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-title-large font-semibold text-on-surface mb-2">
            Unable to Load Discussion
          </h2>
          <p className="text-body-medium text-on-surface-variant mb-6">
            {error}
          </p>
          <button
            onClick={fetchDiscussion}
            className="px-6 py-3 bg-primary text-primary-on rounded-full text-label-large font-medium hover:shadow-elevation-2 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-10 py-8">
        {/* Header with centre info */}
        <div className="mb-8 slide-in-bottom">
          <h1 className="text-headline-large md:text-display-small font-semibold text-[#2C3E2F] mb-3">
            Community Discussion
          </h1>
          
          {thread?.tuitionCentre && (
            <div className="bg-surface-container rounded-2xl p-5 shadow-premium-sm">
              <h2 className="text-title-large font-semibold text-on-surface mb-3">
                {thread.tuitionCentre.name.replace(/\s*\([^)]+\)\s*$/, '').trim()}
              </h2>
              
              {/* Centre tags */}
              <div className="flex flex-wrap gap-2">
                {thread.tuitionCentre.location && (
                  <span className="px-3 py-1.5 bg-[#F4D4D0] text-[#8B5A54] rounded-full text-label-medium font-medium">
                    {thread.tuitionCentre.location}
                  </span>
                )}
                {thread.tuitionCentre.level && (
                  <span className="px-3 py-1.5 bg-[#D4E8E4] text-[#4A6B64] rounded-full text-label-medium font-medium">
                    {thread.tuitionCentre.level}
                  </span>
                )}
                {thread.tuitionCentre.subject && (
                  <span className="px-3 py-1.5 bg-[#E8E4D4] text-[#6B6454] rounded-full text-label-medium font-medium">
                    {thread.tuitionCentre.subject}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Comment form - only show if authenticated */}
        {isAuthenticated && (
          <div className="mb-8 slide-in-bottom" style={{ animationDelay: '0.1s' }}>
            <CommentForm 
              centreId={centreId}
              onCommentCreated={handleCommentCreated}
            />
          </div>
        )}

        {/* Login prompt for unauthenticated users */}
        {!isAuthenticated && (
          <>
            {/* Clickable comment input that triggers auth */}
            <div 
              onClick={() => setShowAuthModal(true)}
              className="mb-4 slide-in-bottom cursor-pointer" 
              style={{ animationDelay: '0.1s' }}
            >
              <div className="bg-surface-container rounded-2xl p-5 shadow-premium-sm hover:shadow-premium-md transition-all border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-body-large text-on-surface-variant">
                    Add a comment...
                  </span>
                </div>
              </div>
            </div>

            {/* Sign in prompt */}
            <div className="mb-8 slide-in-bottom" style={{ animationDelay: '0.15s' }}>
              <div className="bg-surface-container rounded-2xl p-5 shadow-premium-sm text-center">
                <p className="text-body-large text-on-surface mb-4">
                  Sign in to join the discussion
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-primary text-primary-on rounded-full text-label-large font-medium hover:shadow-elevation-2 transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          </>
        )}

        {/* Comments section */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-title-large font-semibold text-on-surface mb-4">
            Comments ({comments.length})
          </h3>
          <CommentList comments={comments} />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}
