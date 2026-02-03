'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import ContactModal from '@/components/ContactModal'

function ResultsContent() {
  const searchParams = useSearchParams()
  const location = searchParams.get('location')
  const level = searchParams.get('level')
  const subject = searchParams.get('subject')

  const [selectedCentre, setSelectedCentre] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch real tuition centres from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build query params
        const params = new URLSearchParams()
        if (location) params.append('location', location)
        if (level) params.append('level', level)
        if (subject) params.append('subject', subject)

        const response = await fetch(`/api/tuition-centres?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to load results')
        }

        // Transform data to match expected format
        const transformedResults = data.data.map(centre => ({
          id: centre.id,
          name: centre.name,
          location: centre.location,
          level: centre.levels?.[0] || level,
          subject: centre.subjects?.[0] || subject,
          whatsapp: centre.whatsappNumber,
          website: centre.website
        }))

        setResults(transformedResults)
      } catch (err) {
        console.error('Error fetching results:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [location, level, subject])

  const handleCentreClick = (centre) => {
    setSelectedCentre(centre)
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
          
          {/* Applied filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {location && (
              <span className="px-3 py-1.5 bg-[#F4D4D0] text-[#8B5A54] rounded-full text-label-medium font-medium">
                {location}
              </span>
            )}
            {level && (
              <span className="px-3 py-1.5 bg-[#D4E8E4] text-[#4A6B64] rounded-full text-label-medium font-medium">
                {level}
              </span>
            )}
            {subject && (
              <span className="px-3 py-1.5 bg-[#E8E4D4] text-[#6B6454] rounded-full text-label-medium font-medium">
                {subject}
              </span>
            )}
          </div>
          
          <p className="text-body-large text-[#6B7566]">
            {mockResults.length} centres found
          </p>
        </div>

        {/* Results list */}
        <div className="space-y-3">
          {mockResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleCentreClick(result)}
              className="w-full text-left bg-white/90 backdrop-blur-sm rounded-[18px] p-5 shadow-premium-sm hover:shadow-premium-md transition-all duration-300 ease-emphasized hover:scale-[1.01] active:scale-[0.99]"
            >
              <h3 className="text-title-medium font-semibold text-[#2C3E2F] mb-3">
                {result.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full text-label-small text-[#6B7566]">
                  {result.location}
                </span>
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full text-label-small text-[#6B7566]">
                  {result.level}
                </span>
                <span className="px-3 py-1 bg-[#F5F1E8] rounded-full text-label-small text-[#6B7566]">
                  {result.subject}
                </span>
              </div>
            </button>
          ))}
        </div>
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
