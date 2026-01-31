'use client'

import { useState, useEffect } from 'react'

export default function WaitlistSheet({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [wantsUpdates, setWantsUpdates] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Reset form when closed
      setTimeout(() => {
        setIsSubmitted(false)
        setEmail('')
        setWantsUpdates(false)
      }, 300)
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // TODO: Add actual email submission logic
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-light px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Join the waitlist</h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">You're on the list</h3>
              <p className="text-sm text-secondary">We'll reach out when we're ready.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-secondary mb-6 leading-relaxed">
                We're building a better way to find tuition. Join the waitlist to be notified when we launch.
              </p>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full px-4 py-3 border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-light focus:border-green-primary transition-all text-sm mb-4"
              />
              
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsUpdates}
                  onChange={(e) => setWantsUpdates(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-green-primary border-light rounded focus:ring-green-light"
                />
                <span className="text-sm text-secondary leading-relaxed">
                  I'd like to contribute feedback as you build
                </span>
              </label>
              
              <button
                type="submit"
                className="w-full bg-green-primary text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-all text-base"
              >
                Join the waitlist
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
