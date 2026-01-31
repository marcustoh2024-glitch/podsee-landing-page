'use client'

import FilterWizardMinimal from './FilterWizardMinimal'

export default function SearchSectionMinimal() {
  return (
    <section className="w-full h-full flex flex-col space-y-3 overflow-hidden pb-4">
      {/* Header - Bold title and supporting text */}
      <div className="text-center space-y-1 flex-shrink-0">
        <h2 className="text-[18px] font-semibold text-[#2C3E2F] leading-tight tracking-tight">
          Every tuition centre in Singapore — in one place
        </h2>
        <p className="text-[12px] text-[#6B7566] font-light">
          Filter and Search!
        </p>
      </div>
      
      {/* Filter Wizard - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FilterWizardMinimal />
      </div>
    </section>
  )
}
