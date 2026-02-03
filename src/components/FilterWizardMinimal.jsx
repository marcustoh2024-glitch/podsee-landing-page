'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const filterOptions = {
  level: ['Primary', 'Secondary', 'Junior College'],
  subject: ['Mathematics', 'English', 'Science', 'Chinese', 'Physics', 'Chemistry', 'Biology']
}

const filterConfig = [
  {
    id: 'level',
    label: 'Level',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'bg-[#D4E8E4]',
    textColor: 'text-[#4A6B64]'
  },
  {
    id: 'subject',
    label: 'Subject',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'bg-[#E8E4D4]',
    textColor: 'text-[#6B6454]'
  }
]

export default function FilterWizardMinimal() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    location: '',
    level: '',
    subject: ''
  })
  const [activeFilter, setActiveFilter] = useState(null)

  const handleFilterClick = (filterId) => {
    setActiveFilter(activeFilter === filterId ? null : filterId)
  }

  const handleOptionSelect = (category, value) => {
    setFilters({ ...filters, [category]: value })
    setActiveFilter(null)
  }

  const handleApply = () => {
    if (filters.location && filters.level && filters.subject) {
      const params = new URLSearchParams(filters)
      router.push(`/results?${params.toString()}`)
    }
  }

  const canApply = filters.location && filters.level && filters.subject

  const canSearch = filters.location && filters.level && filters.subject

  const handleSearch = () => {
    if (canSearch) {
      const params = new URLSearchParams(filters)
      router.push(`/results?${params.toString()}`)
    }
  }

  return (
    <div className="w-full flex flex-col space-y-2">
      {/* Filter buttons - no scrolling, all visible */}
      <div className="flex flex-col space-y-2">
        {filterConfig.map((filter, index) => (
          <div key={filter.id} className="slide-in-bottom" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
            <button
              onClick={() => handleFilterClick(filter.id)}
              className={`w-full ${filter.color} rounded-[18px] p-3.5 flex items-center gap-3 transition-all duration-300 ease-emphasized hover:scale-[1.02] active:scale-[0.98] shadow-premium-sm hover:shadow-premium-md`}
            >
              <div className={`${filter.textColor} flex-shrink-0`}>
                {filter.icon}
              </div>
              <div className="flex-1 text-left">
                <div className={`text-[14px] font-medium ${filter.textColor} tracking-tight`}>
                  {filters[filter.id] || filter.label}
                </div>
              </div>
              <svg 
                className={`w-5 h-5 ${filter.textColor} transition-transform duration-300 ${activeFilter === filter.id ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Options dropdown - inline expansion */}
            {activeFilter === filter.id && (
              <div className="mt-2 bg-white/90 backdrop-blur-sm rounded-[18px] p-2.5 shadow-premium-lg swing-in-top-fwd max-h-[120px] overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions[filter.id].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(filter.id, option)}
                      className={`px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 scale-in-center ${
                        filters[filter.id] === option
                          ? `${filter.color} ${filter.textColor} shadow-premium-sm`
                          : 'bg-[#F5F1E8] text-[#6B7566] hover:bg-[#EBE7DE]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Search button - fixed at bottom */}
      <div className="flex-shrink-0">
        <button
          onClick={handleSearch}
          disabled={!canSearch}
          className={`w-full py-3.5 rounded-full text-[15px] font-medium transition-all duration-300 ease-emphasized ${
            canSearch
              ? 'bg-[#2C3E2F] text-white shadow-premium-sm hover:shadow-premium-md hover:bg-[#3D5240] active:scale-[0.98]'
              : 'bg-[#2C3E2F]/20 text-[#6B7566] cursor-not-allowed'
          }`}
        >
          Search
        </button>
      </div>
    </div>
  )
}
