'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const filterOptions = {
  location: ['Bishan', 'Ang Mo Kio', 'Toa Payoh', 'Jurong East', 'Tampines', 'Woodlands', 'Bedok'],
  level: ['Primary', 'Secondary', 'Junior College'],
  subject: ['Mathematics', 'English', 'Science', 'Chinese', 'Physics', 'Chemistry', 'Biology']
}

export default function FilterWizard() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    location: '',
    level: '',
    subject: ''
  })
  
  const [expandedStep, setExpandedStep] = useState(1)

  const handleFilterSelect = (category, value) => {
    setFilters({ ...filters, [category]: value })
    
    // Auto-expand next step
    if (category === 'location' && value) {
      setExpandedStep(2)
    } else if (category === 'level' && value) {
      setExpandedStep(3)
    }
  }

  const handleApply = () => {
    if (filters.location && filters.level && filters.subject) {
      // Navigate to results page with filters as query params
      const params = new URLSearchParams({
        location: filters.location,
        level: filters.level,
        subject: filters.subject
      })
      router.push(`/results?${params.toString()}`)
    }
  }

  const canApply = filters.location && filters.level && filters.subject

  return (
    <div className="w-full h-full flex flex-col space-y-1.5 lg:space-y-3 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 lg:space-y-3 pb-1.5 lg:pb-0">
        {/* Step 1: Location */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.5s' }}>
          <FilterStep
            stepNumber={1}
            title="Location"
            isExpanded={expandedStep === 1}
            isCompleted={!!filters.location}
            selectedValue={filters.location}
            onToggle={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
          >
            <div className="flex flex-wrap gap-1.5 lg:gap-2 p-2 lg:p-5">
              {filterOptions.location.map((option) => (
                <M3Chip
                  key={option}
                  label={option}
                  selected={filters.location === option}
                  onClick={() => handleFilterSelect('location', option)}
                />
              ))}
            </div>
          </FilterStep>
        </div>

        {/* Step 2: Level */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.6s' }}>
          <FilterStep
            stepNumber={2}
            title="Level"
            isExpanded={expandedStep === 2}
            isCompleted={!!filters.level}
            selectedValue={filters.level}
            onToggle={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
            disabled={!filters.location}
          >
            <div className="flex flex-wrap gap-1.5 lg:gap-2 p-2 lg:p-5">
              {filterOptions.level.map((option) => (
                <M3Chip
                  key={option}
                  label={option}
                  selected={filters.level === option}
                  onClick={() => handleFilterSelect('level', option)}
                />
              ))}
            </div>
          </FilterStep>
        </div>

        {/* Step 3: Subject */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.7s' }}>
          <FilterStep
            stepNumber={3}
            title="Subject"
            isExpanded={expandedStep === 3}
            isCompleted={!!filters.subject}
            selectedValue={filters.subject}
            onToggle={() => setExpandedStep(expandedStep === 3 ? 0 : 3)}
            disabled={!filters.level}
          >
            <div className="flex flex-wrap gap-1.5 lg:gap-2 p-2 lg:p-5">
              {filterOptions.subject.map((option) => (
                <M3Chip
                  key={option}
                  label={option}
                  selected={filters.subject === option}
                  onClick={() => handleFilterSelect('subject', option)}
                />
              ))}
            </div>
          </FilterStep>
        </div>
      </div>

      {/* M3 Filled Button - Fixed at bottom on mobile with pulsate when enabled */}
      <div className="flex-shrink-0 slide-in-bottom" style={{ animationDelay: '0.8s' }}>
        <button
          onClick={handleApply}
          disabled={!canApply}
          className={`w-full py-2.5 lg:py-4 rounded-full text-label-large font-medium transition-all duration-200 ease-standard state-layer ${
            canApply
              ? 'bg-primary text-primary-on shadow-elevation-1 hover:shadow-elevation-2 hover:scale-[1.02] pulsate-fwd'
              : 'bg-surface-container text-on-surface/38 cursor-not-allowed'
          }`}
        >
          Apply filters
        </button>
      </div>
    </div>
  )
}

// M3 Filter Chip Component with enhanced animation
function M3Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 lg:px-4 lg:py-2 rounded-lg text-label-small lg:text-label-large font-medium transition-all duration-200 ease-standard state-layer ${
        selected
          ? 'bg-secondary-container text-on-secondary-container shadow-elevation-1 scale-in-center'
          : 'bg-surface-container-high text-on-surface hover:shadow-elevation-1'
      }`}
    >
      {label}
    </button>
  )
}

// M3 Expansion Panel (List Item) with enhanced animations
function FilterStep({ stepNumber, title, isExpanded, isCompleted, selectedValue, onToggle, disabled, children }) {
  return (
    <div className={`bg-surface-container-highest rounded-lg lg:rounded-xl overflow-hidden shadow-elevation-1 transition-all duration-300 ease-emphasized ${
      disabled ? 'opacity-50' : 'hover:shadow-elevation-2'
    }`}>
      <button
        onClick={onToggle}
        disabled={disabled}
        className="w-full px-2.5 py-2 lg:px-6 lg:py-5 flex items-center justify-between text-left state-layer transition-colors duration-200 ease-standard"
      >
        <div className="flex items-center gap-1.5 lg:gap-4">
          {/* M3 Step indicator with jello animation on completion */}
          <div className={`w-5 h-5 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-label-small lg:text-label-large font-medium transition-all duration-200 ease-standard ${
            isCompleted 
              ? 'bg-primary text-primary-on jello-horizontal' 
              : 'bg-surface-container text-on-surface-variant'
          }`}>
            {isCompleted ? (
              <svg className="w-3 h-3 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              stepNumber
            )}
          </div>
          <div>
            <h3 className="text-label-large lg:text-title-large text-on-surface">{title}</h3>
            {selectedValue && (
              <p className="text-label-small lg:text-body-small text-on-surface-variant mt-0.5">{selectedValue}</p>
            )}
          </div>
        </div>
        <svg 
          className={`w-4 h-4 lg:w-6 lg:h-6 text-on-surface-variant transition-transform duration-300 ease-emphasized ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && !disabled && (
        <div className="border-t border-outline-variant bg-surface-container swing-in-top-fwd">
          {children}
        </div>
      )}
    </div>
  )
}
