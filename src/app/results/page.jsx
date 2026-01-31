'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import ContactModal from '@/components/ContactModal'

function ResultsContent() {
  const searchParams = useSearchParams()
  const location = searchParams.get('location')
  const level = searchParams.get('level')
  const subject = searchParams.get('subject')

  const [selectedCentre, setSelectedCentre] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock data - will be replaced with real data later
  const mockResults = [
    {
      id: 1,
      name: "Learning Hub @ " + location,
      location: location,
      level: level,
      subject: subject,
      whatsapp: "6591234567", // Singapore format
      website: "https://example.com"
    },
    {
      id: 2,
      name: "Education Centre",
      location: location,
      level: level,
      subject: subject,
      whatsapp: "6591234568",
      website: "https://example.com"
    },
    {
      id: 3,
      name: "Tuition Studio",
      location: location,
      level: level,
      subject: subject,
      whatsapp: "6591234569",
      website: null // Some centres might not have website
    },
    {
      id: 4,
      name: "Academic Excellence",
      location: location,
      level: level,
      subject: subject,
      whatsapp: "6591234570",
      website: "https://example.com"
    },
    {
      id: 5,
      name: "Study Point",
      location: location,
      level: level,
      subject: subject,
      whatsapp: "6591234571",
      website: "https://example.com"
    }
  ]

  const handleCentreClick = (centre) => {
    setSelectedCentre(centre)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-cream pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-10 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to filters
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Tuition Centres
          </h1>
          
          {/* Applied filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {location && (
              <span className="px-3 py-1 bg-white border border-light rounded-lg text-sm text-secondary">
                {location}
              </span>
            )}
            {level && (
              <span className="px-3 py-1 bg-white border border-light rounded-lg text-sm text-secondary">
                {level}
              </span>
            )}
            {subject && (
              <span className="px-3 py-1 bg-white border border-light rounded-lg text-sm text-secondary">
                {subject}
              </span>
            )}
          </div>
          
          <p className="text-base text-secondary">
            {mockResults.length} centres found
          </p>
        </div>

        {/* Results list */}
        <div className="space-y-3">
          {mockResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleCentreClick(result)}
              className="w-full text-left bg-white rounded-2xl p-5 border border-light shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-base font-semibold text-primary mb-3">
                {result.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cream rounded-lg text-xs text-secondary">
                  {result.location}
                </span>
                <span className="px-3 py-1 bg-cream rounded-lg text-xs text-secondary">
                  {result.level}
                </span>
                <span className="px-3 py-1 bg-cream rounded-lg text-xs text-secondary">
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
