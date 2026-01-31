'use client'

import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progress = (scrolled / documentHeight) * 100

      setScrollProgress(progress)
      setShowBackToTop(scrolled > windowHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Progress bar */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 h-1 bg-surface-container z-50">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-primary-on shadow-elevation-3 hover:shadow-elevation-4 items-center justify-center transition-all duration-200 ease-standard state-layer z-40 scale-in-center"
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </>
  )
}
