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
