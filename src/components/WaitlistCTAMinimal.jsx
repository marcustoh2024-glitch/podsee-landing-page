'use client'

import { useState } from 'react'

export default function WaitlistCTAMinimal() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8 scale-in-center">
        <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4 jello-horizontal">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-[20px] font-medium text-[#2C3E2F] mb-2">You're on the list</h3>
        <p className="text-[14px] text-[#6B7566]">We'll reach out when we're ready.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-center max-w-md mx-auto">
      {/* Main title - centered, classy */}
      <h2 className="text-[20px] md:text-[24px] font-light text-[#2C3E2F] leading-snug tracking-tight">
        Get access to parent recommendations, in your own community
      </h2>
      
      {/* Subtitle - centered, minimal */}
      <p className="text-[13px] md:text-[14px] text-[#6B7566] leading-relaxed font-light">
        We're building a quiet parent community where tuition centres are shared through real experiences — not ads or rankings.
      </p>
      
      {/* Email input - minimal, centered */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full px-4 py-3.5 rounded-full border border-[#2C3E2F]/20 text-[#2C3E2F] text-[14px] text-center placeholder:text-[#6B7566]/60 focus:outline-none focus:border-[#2C3E2F]/40 transition-all duration-300 bg-white/40 font-light"
        />
        
        {/* Submit button - minimal, elegant */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-full bg-[#2C3E2F] text-white text-[15px] font-light tracking-wide transition-all duration-300 ease-emphasized hover:bg-[#3D5240] active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          Join the Waitlist
        </button>
      </form>
    </div>
  )
}
