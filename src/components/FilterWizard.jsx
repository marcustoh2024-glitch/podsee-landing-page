'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import centresData from '@/data/centres.json'

export default function FilterWizard() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    levels: [], // Changed to array for multi-select
    subjects: [] // Changed to array for multi-select
  })
  
  const [expandedStep, setExpandedStep] = useState(1)
  
  // Extract unique levels and subjects from centres data
  const filterOptions = useMemo(() => {
    const levels = new Set()
    const subjects = new Set()
    
    centresData.forEach(centre => {
      centre.levels?.forEach(level => levels.add(level))
      centre.subjects?.forEach(subject => subjects.add(subject))
    })
    
    return {
      level: Array.from(levels).sort(),
      subject: Array.from(subjects).sort()
    }
  }, [])

  const handleFilterSelect = (category, value) => {
    const currentValues = filters[category]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value) // Remove if already selected
      : [...currentValues, value] // Add if not selected
    
    setFilters({ ...filters, [category]: newValues })
    
    // Auto-expand next step if first selection
    if (category === 'levels' && newValues.length === 1 && currentValues.length === 0) {
      setExpandedStep(2)
    }
  }

  const handleApply = () => {
    if (filters.levels.length > 0 && filters.subjects.length > 0) {
      // Navigate to results page with filters as query params
      const params = new URLSearchParams({
        levels: filters.levels.join(','),
        subjects: filters.subjects.join(',')
      })
      
      router.push(`/results?${params.toString()}`)
    }
  }
  
  const handleBrowseAll = () => {
    // Navigate to results without filters
    router.push('/results')
  }
  
  const handleClearFilters = () => {
    setFilters({ levels: [], subjects: [] })
    setExpandedStep(1)
  }

  const canApply = filters.levels.length > 0 && filters.subjects.length > 0
  const hasAnyFilter = filters.levels.length > 0 || filters.subjects.length > 0

  return (
    <div className="w-full h-full flex flex-col space-y-1.5 lg:space-y-3 overflow-hidden">
      {/* Disclaimer for partial data */}
      <div className="flex-shrink-0 px-1 slide-in-bottom" style={{ animationDelay: '0.3s' }}>
        <p className="text-label-small text-on-surface-variant text-center">
          Results based on available data
        </p>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 lg:space-y-3 pb-1.5 lg:pb-0">
        {/* Step 1: Level */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.5s' }}>
          <FilterStep
            stepNumber={1}
            title="Levels"
            isExpanded={expandedStep === 1}
            isCompleted={filters.levels.length > 0}
            selectedValue={filters.levels.length > 0 ? `${filters.levels.length} selected` : ''}
            onToggle={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
          >
            <div className="p-2 lg:p-5">
              <p className="text-label-small lg:text-body-small text-on-surface-variant mb-2 lg:mb-3 px-1">
                Select one or more levels (OR logic)
              </p>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {filterOptions.level.map((option) => (
                  <M3Chip
                    key={option}
                    label={option}
                    selected={filters.levels.includes(option)}
                    onClick={() => handleFilterSelect('levels', option)}
                  />
                ))}
              </div>
            </div>
          </FilterStep>
        </div>

        {/* Step 2: Subject */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.6s' }}>
          <FilterStep
            stepNumber={2}
            title="Subjects"
            isExpanded={expandedStep === 2}
            isCompleted={filters.subjects.length > 0}
            selectedValue={filters.subjects.length > 0 ? `${filters.subjects.length} selected` : ''}
            onToggle={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
            disabled={filters.levels.length === 0}
          >
            <div className="p-2 lg:p-5">
              <p className="text-label-small lg:text-body-small text-on-surface-variant mb-2 lg:mb-3 px-1">
                Select one or more subjects (OR logic)
              </p>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {filterOptions.subject.map((option) => (
                  <M3Chip
                    key={option}
                    label={option}
                    selected={filters.subjects.includes(option)}
                    onClick={() => handleFilterSelect('subjects', option)}
                  />
                ))}
              </div>
            </div>
          </FilterStep>
        </div>
      </div>

      {/* M3 Filled Button - Fixed at bottom on mobile with pulsate when enabled */}
      <div className="flex-shrink-0 space-y-2 slide-in-bottom" style={{ animationDelay: '0.8s' }}>
        {/* Clear filters button - only show if any filter is selected */}
        {hasAnyFilter && (
          <button
            onClick={handleClearFilters}
            className="w-full py-2 rounded-full text-label-medium font-medium text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-standard"
          >
            Clear filters
          </button>
        )}
        
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
