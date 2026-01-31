'use client'

const pollData = {
  title: "How do you usually decide?",
  options: [
    { id: 1, text: "Ads & search results", percentage: 60 },
    { id: 2, text: "Word of mouth", percentage: 40 }
  ]
}

export default function PollSectionStatic() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12">
      {/* Poll Title */}
      <h3 className="text-title-large lg:text-headline-small text-on-surface text-center mb-8">
        {pollData.title}
      </h3>
      
      {/* Two-card layout with divider */}
      <div className="flex items-stretch gap-0 relative">
        {/* Option 1 Card */}
        <div className="flex-1 bg-surface-container-high rounded-l-2xl p-8 shadow-elevation-1">
          <div className="text-body-large lg:text-title-medium text-on-surface mb-4">
            {pollData.options[0].text}
          </div>
          {/* Percentage hidden for now */}
          <div className="text-display-small lg:text-display-medium text-on-surface-variant opacity-0">
            {pollData.options[0].percentage}%
          </div>
        </div>
        
        {/* Vertical Divider */}
        <div className="w-px bg-outline-variant" />
        
        {/* Option 2 Card */}
        <div className="flex-1 bg-surface-container-high rounded-r-2xl p-8 shadow-elevation-1">
          <div className="text-body-large lg:text-title-medium text-on-surface mb-4">
            {pollData.options[1].text}
          </div>
          {/* Percentage hidden for now */}
          <div className="text-display-small lg:text-display-medium text-on-surface-variant opacity-0">
            {pollData.options[1].percentage}%
          </div>
        </div>
      </div>
    </section>
  )
}
