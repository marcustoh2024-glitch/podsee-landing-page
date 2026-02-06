'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useMemo } from 'react'
import Link from 'next/link'
import ContactModal from '@/components/ContactModal'
import centresData from '@/data/centres.json'
import { normalizeWhatsAppLink, getCentreName, getBranchName } from '@/lib/centreUtils'

function ResultsContent() {
  const searchParams = useSearchParams()
  const levelsParam = searchParams.get('levels') // comma-separated
  const subjectsParam = searchParams.get('subjects') // comma-separated
  const search = searchParams.get('search')

  const [selectedCentre, setSelectedCentre] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [displayCount, setDisplayCount] = useState(20)

  // Parse filters from URL
  const selectedLevels = levelsParam ? levelsParam.split(',') : []
  const selectedSubjects = subjectsParam ? subjectsParam.split(',') : []

  // Client-side filtering with multi-select OR logic
  const results = useMemo(() => {
    let filtered = [...centresData]

    // Filter by levels (OR within levels)
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(centre =>
        centre.levels?.some(level => selectedLevels.includes(level))
      )
    }

    // Filter by subjects (OR within subjects)
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(centre =>
        centre.subjects?.some(subject => selectedSubjects.includes(subject))
      )
    }

    // Optional: text search across name and address
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(centre => 
        centre.name.toLowerCase().includes(searchLower) ||
        centre.address.toLowerCase().includes(searchLower) ||
        (centre.area && centre.area.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [selectedLevels, selectedSubjects, search])

  // Paginated results
  const displayedResults = results.slice(0, displayCount)
  const hasMore = displayCount < results.length

  const handleCentreClick = (centre) => {
    setSelectedCentre(centre)
    setIsModalOpen(true)
  }

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, results.length))
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
          
          {/* Show applied filters */}
          {(selectedLevels.length > 0 || selectedSubjects.length > 0 || search) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLevels.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-label-small">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Levels: {selectedLevels.join(', ')}
                </span>
              )}
              {selectedSubjects.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-label-small">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Subjects: {selectedSubjects.join(', ')}
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-label-small">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search: {search}
                </span>
              )}
            </div>
          )}
          
          <p className="text-body-large text-[#6B7566]">
            {results.length} {results.length === 1 ? 'centre' : 'centres'} found
          </p>
        </div>

        {/* Empty state - No results */}
        {results.length === 0 && (
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

        {results.length > 0 && (
          <>
            <div className="space-y-3">
              {displayedResults.map((centre) => {
                // Extract clean centre name and branch
                const centreName = getCentreName(centre.name)
                const branchName = getBranchName(centre.name)
                
                return (
                  <button
                    key={centre.id}
                    onClick={() => handleCentreClick(centre)}
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
                      {centre.address}
                    </div>
                    
                    {/* Area tag */}
                    {centre.area && (
                      <div className="flex gap-2">
                        <span className="px-3 py-1.5 bg-[#D4E8E4] text-[#4A6B64] rounded-full text-label-small font-medium">
                          {centre.area}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Load More button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-primary text-primary-on rounded-full text-label-large font-medium hover:shadow-elevation-2 transition-all"
                >
                  Load More ({displayCount} of {results.length})
                </button>
              </div>
            )}
          </>
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
