'use client'

export default function HeroSection() {
  const handleScrollToFilter = () => {
    const filterSection = document.getElementById('filter-section')
    if (filterSection) {
      filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="hidden lg:flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Content */}
      <div className="max-w-5xl mx-auto px-10 text-center relative z-10">
        {/* Main headline with staggered animation */}
        <h1 className="text-display-large font-display text-on-surface mb-6 fade-in-fwd">
          Every tuition centre
        </h1>
        <h2 className="text-display-medium font-display text-primary mb-8 fade-in-fwd" style={{ animationDelay: '0.2s' }}>
          in Marina Parade
        </h2>
        
        {/* Subtext */}
        <p className="text-title-large text-on-surface-variant max-w-2xl mx-auto mb-12 slide-in-bottom" style={{ animationDelay: '0.4s' }}>
          No ads. No jumping between websites. Just search.
        </p>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 mb-16 scale-in-center" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-headline-small font-medium text-on-surface">2,000+</div>
              <div className="text-body-small text-on-surface-variant">Centres listed</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-headline-small font-medium text-on-surface">Trusted</div>
              <div className="text-body-small text-on-surface-variant">By parents</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <button
          onClick={handleScrollToFilter}
          className="inline-flex flex-col items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors duration-200 ease-standard pulsate-fwd"
          style={{ animationDelay: '0.8s' }}
          aria-label="Scroll to search"
        >
          <span className="text-label-large">Start searching</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  )
}
