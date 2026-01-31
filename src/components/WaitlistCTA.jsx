'use client'

import { useState } from 'react'
import WaitlistSheet from './WaitlistSheet'

export default function WaitlistCTA() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <>
      {/* Desktop: M3 Filled Card */}
      <div className="hidden lg:block w-full max-w-[360px]">
        <div className="bg-surface-container-high rounded-2xl p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-300 ease-emphasized">
          <WaitlistForm />
        </div>
      </div>
      
      {/* Mobile: M3 FAB (Floating Action Button) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pulsate-fwd">
        <button
          onClick={() => setIsSheetOpen(true)}
          className="bg-primary text-primary-on px-5 py-3 rounded-full text-label-large font-medium shadow-elevation-3 hover:shadow-elevation-4 transition-all duration-200 ease-standard state-layer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Join waitlist
        </button>
      </div>
      
      {/* Mobile: Waitlist sheet */}
      <WaitlistSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  )
}

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [wantsUpdates, setWantsUpdates] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // TODO: Add actual email submission logic
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-6 scale-in-center">
        <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4 jello-horizontal">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-title-large text-on-surface mb-2 slide-in-bottom">You're on the list</h3>
        <p className="text-body-medium text-on-surface-variant slide-in-bottom" style={{ animationDelay: '0.1s' }}>We'll reach out when we're ready.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-title-large text-on-surface mb-2">Stay updated</h3>
        <p className="text-body-medium text-on-surface-variant leading-relaxed">
          We're building a better way to find tuition. Join the waitlist to be notified when we launch.
        </p>
      </div>
      
      {/* M3 Filled Text Field */}
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-4 pt-6 pb-2 bg-surface-container-highest rounded-t-md border-b-2 border-outline focus:border-primary focus:outline-none transition-colors duration-200 ease-standard text-body-large text-on-surface placeholder:text-on-surface-variant"
        />
        <label className="absolute left-4 top-2 text-body-small text-on-surface-variant pointer-events-none">
          Email
        </label>
      </div>
      
      {/* M3 Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={wantsUpdates}
            onChange={(e) => setWantsUpdates(e.target.checked)}
            className="peer w-5 h-5 appearance-none border-2 border-outline rounded-sm checked:bg-primary checked:border-primary transition-all duration-200 ease-standard cursor-pointer"
          />
          <svg 
            className="absolute inset-0 w-5 h-5 text-primary-on pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200 ease-standard"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-body-medium text-on-surface-variant leading-relaxed">
          I'd like to contribute feedback as you build
        </span>
      </label>
      
      {/* M3 Filled Button */}
      <button
        type="submit"
        className="w-full bg-primary text-primary-on py-3 rounded-full text-label-large font-medium shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 ease-standard state-layer hover:scale-[1.02]"
      >
        Join the waitlist
      </button>
    </form>
  )
}
