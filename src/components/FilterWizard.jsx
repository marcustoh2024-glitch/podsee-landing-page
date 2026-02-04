'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FilterWizard() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    level: '',
    subject: ''
  })
  
  const [expandedStep, setExpandedStep] = useState(1)
  
  // Dynamic filter options from API
  const [filterOptions, setFilterOptions] = useState({
    level: [],
    subject: []
  })
  const [filtersEnabled, setFiltersEnabled] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  
  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/filter-options')
        const data = await response.json()
        
        if (data.enabled) {
          setFilterOptions({
            level: (data.levels || []).filter(l => l !== 'UNKNOWN'),
            subject: data.subjects || []
          })
          setFiltersEnabled(true)
        } else {
          // Filters disabled - keep empty arrays
          setFiltersEnabled(false)
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error)
        setFiltersEnabled(false)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    fetchFilterOptions()
  }, [])

  const handleFilterSelect = (category, value) => {
    setFilters({ ...filters, [category]: value })
    
    // Auto-expand next step
    if (category === 'level' && value) {
      setExpandedStep(2)
    }
  }

  const handleApply = () => {
    if (filters.level && filters.subject) {
      // Navigate to results page with filters as query params (standardized: levels/subjects PLURAL)
      const params = new URLSearchParams({
        levels: filters.level,
        subjects: filters.subject
      })
      
      router.push(`/results?${params.toString()}`)
    }
  }
  
  const handleBrowseAll = () => {
    // Navigate to results without filters
    router.push('/results')
  }
  
  const handleClearFilters = () => {
    setFilters({ level: '', subject: '' })
    setExpandedStep(1)
  }

  const canApply = filters.level && filters.subject
  const hasAnyFilter = filters.level || filters.subject
  
  // Show loading state while fetching options
  if (isLoadingOptions) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-container-high animate-pulse" />
          <p className="text-body-medium text-on-surface-variant">Loading filters...</p>
        </div>
      </div>
    )
  }
  
  // Show disabled state with banner if filters are not enabled
  if (!filtersEnabled) {
    return (
      <div className="w-full h-full flex flex-col space-y-4">
        {/* Info banner */}
        <div className="bg-secondary-container rounded-xl p-4 slide-in-bottom" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-on-secondary-container mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-label-large font-medium text-on-secondary-container">Filters temporarily disabled</p>
              <p className="text-body-small text-on-secondary-container mt-1">
                No offerings data yet, so filters are disabled. Showing all centres for now.
              </p>
            </div>
          </div>
        </div>
        
        {/* Browse all button */}
        <button
          onClick={handleBrowseAll}
          className="w-full py-4 rounded-full bg-primary text-primary-on shadow-elevation-1 hover:shadow-elevation-2 hover:scale-[1.02] transition-all duration-200 ease-standard text-label-large font-medium"
        >
          Browse all centres
        </button>
      </div>
    )
  }

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
            title="Level"
            isExpanded={expandedStep === 1}
            isCompleted={!!filters.level}
            selectedValue={filters.level}
            onToggle={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
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

        {/* Step 2: Subject */}
        <div className="slide-in-bottom" style={{ animationDelay: '0.6s' }}>
          <FilterStep
            stepNumber={2}
            title="Subject"
            isExpanded={expandedStep === 2}
            isCompleted={!!filters.subject}
            selectedValue={filters.subject}
            onToggle={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
            disabled={!filters.level}
          >
            <div className="p-2 lg:p-5">
              <p className="text-label-small lg:text-body-small text-on-surface-variant mb-2 lg:mb-3 px-1">
                Results match exact subjects offered by centres.
              </p>
              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                {filterOptions.subject.map((option) => (
                  <M3Chip
                    key={option}
                    label={option}
                    selected={filters.subject === option}
                    onClick={() => handleFilterSelect('subject', option)}
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
