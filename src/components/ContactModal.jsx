'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactModal({ isOpen, onClose, centre }) {
  const router = useRouter()
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Fetch comments when modal opens
      fetchComments()
    } else {
      document.body.style.overflow = 'unset'
      setReplyingTo(null)
      setReplyText('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, centre?.id])

  const fetchComments = async () => {
    if (!centre?.id) return
    
    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/discussions/${centre.id}`)
      const data = await response.json()
      
      if (response.ok && data.comments) {
        // Group comments with their replies
        const commentsWithReplies = data.comments.map(comment => ({
          ...comment,
          replies: data.comments.filter(c => c.parentId === comment.id)
        })).filter(comment => !comment.parentId) // Only show top-level comments
        
        setComments(commentsWithReplies)
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setIsLoadingComments(false)
    }
  }

  if (!isOpen || !centre) return null

  const handleWhatsApp = () => {
    // Format: https://wa.me/65XXXXXXXX
    const whatsappUrl = `https://wa.me/${centre.whatsapp}`
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  const handleWebsite = () => {
    window.open(centre.website, '_blank')
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    
    // In a real app, this would post to the API
    const mockComment = {
      id: Date.now(),
      body: newComment,
      isAnonymous: true,
      createdAt: new Date().toISOString(),
      author: null,
      replies: []
    }
    
    setComments([mockComment, ...comments])
    setNewComment('')
  }

  const handlePostReply = async (parentId) => {
    if (!replyText.trim()) return
    
    // In a real app, this would post to the API
    const mockReply = {
      id: Date.now(),
      body: replyText,
      isAnonymous: false,
      createdAt: new Date().toISOString(),
      parentId: parentId,
      author: {
        email: centre.name,
        role: 'CENTRE'
      }
    }
    
    // Add reply to the parent comment
    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), mockReply]
        }
      }
      return comment
    }))
    
    setReplyText('')
    setReplyingTo(null)
  }

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return `${Math.floor(diffInSeconds / 604800)}w`
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 animate-standard-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full shadow-elevation-3 flex flex-col max-h-[90vh] animate-emphasized-in">
          {/* Header - Fixed */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-outline-variant">
            <div>
              <h3 className="text-title-large font-semibold text-on-surface mb-2">
                {centre.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-lg text-label-small font-medium">
                  {centre.location}
                </span>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg text-label-small font-medium">
                  {centre.level}
                </span>
                <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-lg text-label-small font-medium">
                  {centre.subject}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-2 -mr-2 -mt-2 rounded-full hover:bg-on-surface/8"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contact options - Fixed */}
          <div className="px-6 pt-4 space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-4 p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all shadow-elevation-1 hover:shadow-elevation-2"
            >
              <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-label-large font-medium text-on-surface">WhatsApp</p>
                <p className="text-body-small text-on-surface-variant">Chat directly with the centre</p>
              </div>
              <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {centre.website && (
              <button
                onClick={handleWebsite}
                className="w-full flex items-center gap-4 p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all shadow-elevation-1 hover:shadow-elevation-2"
              >
                <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-on-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="text-label-large font-medium text-on-surface">Visit Website</p>
                  <p className="text-body-small text-on-surface-variant">Learn more about the centre</p>
                </div>
                <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Comments Section - Scrollable */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Comments Header */}
            <div className="px-6 py-4 border-t border-b border-outline-variant">
              <h4 className="text-title-medium font-medium text-on-surface text-center">Comments</h4>
            </div>

            {/* Comments List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoadingComments ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 mx-auto border-3 border-outline-variant border-t-primary rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-high flex items-center justify-center">
                    <svg className="w-8 h-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-body-medium text-on-surface-variant">No comments yet</p>
                  <p className="text-body-small text-on-surface-variant mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id}>
                      {/* Main Comment */}
                      <div className="flex gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          comment.author?.role === 'CENTRE' 
                            ? 'bg-primary text-on-primary' 
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {comment.author?.role === 'CENTRE' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        
                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-label-large font-medium text-on-surface">
                              {comment.isAnonymous || !comment.author ? 'Anonymous Parent' : comment.author.email}
                            </span>
                            {comment.author?.role === 'CENTRE' && (
                              <span className="px-2 py-0.5 bg-primary text-on-primary rounded-sm text-label-small font-medium">
                                Centre
                              </span>
                            )}
                            <span className="text-label-small text-on-surface-variant">
                              {formatTimestamp(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-body-medium text-on-surface mt-1 break-words">
                            {comment.body}
                          </p>
                          
                          {/* Like/Reply actions */}
                          <div className="flex items-center gap-4 mt-2">
                            <button 
                              onClick={() => setReplyingTo(comment.id)}
                              className="text-label-medium text-on-surface-variant hover:text-on-surface font-medium transition-colors"
                            >
                              Reply
                            </button>
                            {comment.replies && comment.replies.length > 0 && (
                              <span className="text-label-small text-on-surface-variant">
                                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Like button */}
                        <button className="flex-shrink-0 text-on-surface-variant hover:text-error transition-colors p-2 -mr-2 rounded-full hover:bg-error/8">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-13 mt-3 space-y-3 pl-4 border-l-2 border-outline-variant">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              {/* Reply Avatar */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                reply.author?.role === 'CENTRE' 
                                  ? 'bg-primary text-on-primary' 
                                  : 'bg-secondary-container text-on-secondary-container'
                              }`}>
                                {reply.author?.role === 'CENTRE' ? (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                              
                              {/* Reply Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="text-label-large font-medium text-on-surface">
                                    {reply.isAnonymous || !reply.author ? 'Anonymous Parent' : reply.author.email}
                                  </span>
                                  {reply.author?.role === 'CENTRE' && (
                                    <span className="px-2 py-0.5 bg-primary text-on-primary rounded-sm text-label-small font-medium">
                                      Centre
                                    </span>
                                  )}
                                  <span className="text-label-small text-on-surface-variant">
                                    {formatTimestamp(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-body-medium text-on-surface mt-1 break-words">
                                  {reply.body}
                                </p>
                              </div>
                              
                              {/* Like button for reply */}
                              <button className="flex-shrink-0 text-on-surface-variant hover:text-error transition-colors p-2 -mr-2 rounded-full hover:bg-error/8">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="ml-13 mt-3 flex items-center gap-3 bg-surface-container rounded-xl p-3 shadow-elevation-1">
                          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePostReply(comment.id)}
                            placeholder={`Reply as ${centre.name}...`}
                            className="flex-1 text-body-medium border-none outline-none bg-transparent placeholder-on-surface-variant text-on-surface"
                            autoFocus
                          />
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="text-label-medium text-on-surface-variant hover:text-on-surface font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          {replyText.trim() && (
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              className="text-label-medium font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              Post
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input - Fixed at bottom */}
            <div className="border-t border-outline-variant p-4 bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                  placeholder="Add a comment..."
                  className="flex-1 text-body-medium border-none outline-none bg-transparent placeholder-on-surface-variant text-on-surface"
                />
                {newComment.trim() && (
                  <button
                    onClick={handlePostComment}
                    className="text-label-large font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
