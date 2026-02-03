import DiscussionPage from '@/components/DiscussionPage'

/**
 * Discussion Page Route
 * 
 * Renders the discussion thread for a specific tuition centre.
 * Handles invalid centre IDs and sets appropriate metadata.
 * 
 * Requirements: 7.2, 7.3
 */

export async function generateMetadata({ params }) {
  const { centreId } = params
  
  // Validate centre ID format (basic UUID check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!centreId || !uuidRegex.test(centreId)) {
    return {
      title: 'Invalid Centre | Podsee',
      description: 'The requested tuition centre could not be found.',
    }
  }

  return {
    title: 'Community Discussion | Podsee',
    description: 'Join the discussion about this tuition centre. Read reviews, ask questions, and share experiences with other parents.',
  }
}

export default function DiscussionPageRoute({ params }) {
  const { centreId } = params
  
  // Validate centre ID format (basic UUID check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  // Handle invalid centre IDs
  if (!centreId || !uuidRegex.test(centreId)) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface-container rounded-2xl p-8 shadow-premium-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-container flex items-center justify-center">
            <svg className="w-8 h-8 text-on-error-container" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-title-large font-semibold text-on-surface mb-2">
            Invalid Centre ID
          </h2>
          <p className="text-body-medium text-on-surface-variant mb-6">
            The tuition centre you're looking for could not be found. Please check the URL and try again.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-on rounded-full text-label-large font-medium hover:shadow-elevation-2 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }
  
  // Render the DiscussionPage component with the centreId
  return <DiscussionPage centreId={centreId} />
}
