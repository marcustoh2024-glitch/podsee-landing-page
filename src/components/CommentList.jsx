'use client'

/**
 * CommentList Component
 * Displays a list of comments for a discussion thread
 * 
 * Features:
 * - Renders comments in chronological order
 * - Shows "Anonymous Parent" for anonymous comments
 * - Displays author name for identified comments
 * - Highlights centre comments with a badge
 * - Handles empty state when no comments exist
 * - Shows timestamps for each comment
 * 
 * Requirements: 3.1, 3.2, 3.3, 5.3
 */

export default function CommentList({ comments = [] }) {
  // Handle empty state
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
          <svg className="w-8 h-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-body-large text-on-surface-variant">No comments yet</p>
        <p className="text-body-medium text-on-surface-variant mt-2">Be the first to share your thoughts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}

/**
 * CommentItem Component
 * Renders a single comment with author info and timestamp
 */
function CommentItem({ comment }) {
  const isCentre = comment.author?.role === 'CENTRE'
  const isAnonymous = comment.isAnonymous
  const isDeleted = !comment.author
  
  // Display name logic:
  // 1. If user is deleted -> "[Deleted User]"
  // 2. If anonymous -> "Anonymous Parent" or "Anonymous Centre"
  // 3. Otherwise -> username (or email as fallback)
  const displayName = isDeleted
    ? '[Deleted User]'
    : isAnonymous 
      ? (isCentre ? 'Anonymous Centre' : 'Anonymous Parent')
      : comment.author?.username || comment.author?.email || 'Unknown User'
  
  // Format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    } else {
      return date.toLocaleDateString('en-SG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="bg-surface-container rounded-2xl p-5 shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      {/* Author and timestamp header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Author avatar/icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isDeleted
              ? 'bg-surface-container-highest text-on-surface-variant'
              : isCentre 
                ? 'bg-primary text-primary-on' 
                : isAnonymous 
                  ? 'bg-surface-container-high text-on-surface-variant'
                  : 'bg-secondary-container text-on-secondary-container'
          }`}>
            {isDeleted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : isCentre ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          {/* Author name and badge */}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-label-large font-medium ${
                isDeleted ? 'text-on-surface-variant italic' : 'text-on-surface'
              }`}>
                {displayName}
              </span>
              {isCentre && !isDeleted && (
                <span className="px-2 py-0.5 bg-primary text-primary-on rounded-full text-label-small font-medium">
                  Centre
                </span>
              )}
            </div>
            <span className="text-label-small text-on-surface-variant">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Comment body */}
      <p className="text-body-large text-on-surface whitespace-pre-wrap break-words">
        {comment.body}
      </p>
    </div>
  )
}
