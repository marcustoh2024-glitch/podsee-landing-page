'use client'

import FilterWizard from './FilterWizard'

export default function SearchSection() {
  return (
    <section className="w-full h-full flex flex-col lg:block">
      {/* Mobile compact header - Ultra compact */}
      <div className="md:hidden mb-1.5 flex-shrink-0 slide-in-bottom" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-label-large text-on-surface text-center font-medium">
          Every tuition centre in Singapore
        </h2>
      </div>

      {/* Informational Header - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16 fade-in-fwd">
        <div className="text-center">
          <h2 className="text-headline-large lg:text-display-small font-display text-on-surface mb-5">
            Every tuition centre in Singapore, in one place
          </h2>
          <p className="text-body-large lg:text-title-large text-on-surface-variant max-w-2xl mx-auto">
            No ads. No rankings. No jumping between websites. Just a complete, neutral list of all tuition centres across Singapore. Filter once, see everything relevant, and decide calmly.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <FilterWizard />
      </div>
    </section>
  )
}
