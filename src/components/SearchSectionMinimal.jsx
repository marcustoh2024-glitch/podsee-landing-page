'use client'

import FilterWizardMinimal from './FilterWizardMinimal'

export default function SearchSectionMinimal() {
  return (
    <section className="w-full flex flex-col space-y-3 py-2">
      {/* Header - Bold title and supporting text */}
      <div className="text-center space-y-1 flex-shrink-0">
        <h2 className="text-[18px] font-semibold text-[#2C3E2F] leading-tight tracking-tight">
          Every tuition centre in Marina Parade Here
        </h2>
        <p className="text-[12px] text-[#6B7566] font-light">
          Filter and Search!
        </p>
      </div>
      
      {/* Filter Wizard */}
      <div className="flex-shrink-0">
        <FilterWizardMinimal />
      </div>
    </section>
  )
}
