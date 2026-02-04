'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import ContactModal from '@/components/ContactModal'

// Deterministic sorting functions
function sortLevels(levels) {
  const order = { 'Primary': 1, 'Secondary': 2, 'JC': 3 }
  return [...levels].sort((a, b) => {
    const [aPre, aNum] = a.name.split(' ')
    const [bPre, bNum] = b.name.split(' ')
    const aOrder = order[aPre] || 999
    const bOrder = order[bPre] || 999
    if (aOrder !== bOrder) return aOrder - bOrder
    return parseInt(aNum || 0) - parseInt(bNum || 0)
  })
}

function sortSubjects(subjects) {
  return [...subjects].sort((a, b) => a.name.localeCompare(b.name))
}

// Helper function to extract centre name without branch suffix
function getCentreName(fullName) {
  // Remove branch suffix like "(Main)", "(Branch Name)", etc.
  const match = fullName.match(/^(.+?)\s*\([^)]+\)$/)
  return match ? match[1].trim() : fullName
}

// Helper function to extract branch name
function getBranchName(fullName) {
  const match = fullName.match(/\(([^)]+)\)$/)
  return match ? match[1] : null
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const levels = searchParams.get('levels')
  const subjects = searchParams.get('subjects')
  const search = searchParams.get('search')
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '100'

  const [selectedCentre, setSelectedCentre] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tuition centres from API
  useEffect(() => {
    const fetchCentres = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build query parameters - ALWAYS use URL params, never stale state
        const params = new URLSearchParams()
        if (levels) params.append('levels', levels)
        if (subjects) params.append('subjects', subjects)
        if (search) params.append('search', search)
        params.append('page', page)
        params.append('limit', limit)

        const url = `/api/tuition-centres?${params.toString()}`

        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to fetch centres')
        }

        setResults(data.data || [])
        setPagination(data.pagination || null)
      } catch (err) {
        setError(err.message)
        console.error('Failed to fetch centres:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCentres()
  }, [levels, subjects, search, page, limit])

  const handleCentreClick = (centre) => {
    setSelectedCentre({
      ...centre,
      levels: levels,
      subjects: subjects
    })
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-10 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-label-large text-[#6B7566] hover:text-[#2C3E2F] mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to filters
          </Link>
          
          <h1 className="text-headline-large md:text-display-small font-semibold text-[#2C3E2F] mb-3">
            Tuition Centres
          </h1>
          
          {/* Show applied filters if any */}
          {(levels || subjects) && !isLoading && (
            <div className="flex flex-wrap gap-2 mb-3">
              {levels && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-label-small">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Level: {levels}
                </span>
              )}
              {subjects && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-label-small">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Subject: {subjects}
                </span>
              )}
            </div>
          )}
          
          {!isLoading && !error && pagination && (
            <p className="text-body-large text-[#6B7566]">
              {pagination.total} centres found
            </p>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-high animate-pulse" />
            <p className="text-body-large text-on-surface-variant">Loading centres...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="max-w-md mx-auto bg-surface-container rounded-2xl p-8 shadow-premium-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-container flex items-center justify-center">
              <svg className="w-8 h-8 text-on-error-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-title-large font-semibold text-on-surface mb-2">
              Unable to Load Centres
            </h2>
            <p className="text-body-medium text-on-surface-variant mb-6">
              {error}
            </p>
          </div>
        )}

        {/* Empty state - No results */}
        {!isLoading && !error && results.length === 0 && (
          <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-premium-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F1E8] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#6B7566]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-title-large font-semibold text-[#2C3E2F] mb-2">
              No Centres Found
            </h2>
            <p className="text-body-medium text-[#6B7566] mb-6">
              We couldn't find any tuition centres matching your selected filters.
            </p>
            <div className="space-y-3 text-left bg-[#F5F1E8] rounded-xl p-4 mb-6">
              <p className="text-label-large font-medium text-[#2C3E2F]">Try:</p>
              <ul className="space-y-2 text-body-small text-[#6B7566]">
                <li className="flex items-start gap-2">
                  <span className="text-[#4A6B64] mt-0.5">•</span>
                  <span>Removing some filters to broaden your search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4A6B64] mt-0.5">•</span>
                  <span>Selecting different levels or subjects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4A6B64] mt-0.5">•</span>
                  <span>Checking back later as we add more centres</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4A6B64] text-white rounded-full text-label-large font-medium hover:bg-[#3D5851] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Adjust Filters
            </Link>
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => {
              // Sort levels and subjects deterministically
              const sortedLevels = sortLevels(result.levels || []).filter(l => l.name !== 'UNKNOWN')
              const sortedSubjects = sortSubjects(result.subjects || [])
              
              // Extract clean centre name and branch
              const centreName = getCentreName(result.name)
              const branchName = getBranchName(result.name)
              
              return (
                <button
                  key={result.id}
                  onClick={() => handleCentreClick({
                    id: result.id,
                    name: result.name,
                    location: result.location,
                    whatsappLink: result.whatsappLink,
                    website: result.website
                  })}
                  className="w-full text-left bg-white/90 backdrop-blur-sm rounded-[18px] p-5 shadow-premium-sm hover:shadow-premium-md transition-all duration-300 ease-emphasized hover:scale-[1.01] active:scale-[0.99]"
                >
                  <h3 className="text-title-medium font-semibold text-[#2C3E2F] mb-3">
                    {centreName}
                  </h3>
                  
                  {/* Branch name - subtle display if not "Main" */}
                  {branchName && branchName !== 'Main' && (
                    <div className="mb-2 text-label-small text-[#8B9586]">
                      Branch: {branchName}
                    </div>
                  )}
                  
                  {/* Location */}
                  <div className="mb-3 flex items-center gap-2 text-body-small text-[#6B7566]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {result.location}
                  </div>
                  
                  {/* Show levels and subjects if available */}
                  {(sortedLevels.length > 0 || sortedSubjects.length > 0) && (
                    <div className="space-y-2">
                      {sortedLevels.length > 0 && (
                        <div>
                          <p className="text-label-small font-medium text-[#6B7566] mb-1.5">Levels offered:</p>
                          <p className="text-body-small text-[#8B9586]">
                            {sortedLevels.map(l => l.name).join(', ')}
                          </p>
                        </div>
                      )}
                      {sortedSubjects.length > 0 && (
                        <div>
                          <p className="text-label-small font-medium text-[#6B7566] mb-1.5">Subjects offered:</p>
                          <p className="text-body-small text-[#8B9586]">
                            {sortedSubjects.map(s => s.name).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        centre={selectedCentre}
      />
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-secondary">Loading results...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
