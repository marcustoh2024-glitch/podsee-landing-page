'use client'

import { useEffect } from 'react'

const filterOptions = {
  location: ['Bishan', 'Ang Mo Kio', 'Toa Payoh', 'Jurong East', 'Tampines'],
  level: ['Primary', 'Secondary', 'Junior College'],
  subject: ['Mathematics', 'English', 'Science', 'Chinese', 'Physics', 'Chemistry']
}

export default function FilterSheet({ isOpen, onClose, filters, onFiltersChange }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFilterChange = (category, value) => {
    onFiltersChange({
      ...filters,
      [category]: filters[category] === value ? '' : value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      level: '',
      subject: ''
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto lg:hidden">
        <div className="sticky top-0 bg-white border-b border-light px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Filters</h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {Object.entries(filterOptions).map(([category, options]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-primary mb-3 capitalize">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange(category, option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filters[category] === option
                        ? 'bg-green-primary text-white'
                        : 'bg-cream text-secondary hover:bg-green-50 hover:text-green-primary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-light p-6 flex gap-3">
          <button
            onClick={clearFilters}
            className="flex-1 px-6 py-3 border border-light rounded-xl text-sm font-medium text-secondary hover:bg-cream transition-all"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-green-primary text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}
