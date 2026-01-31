'use client'

import { useState, useEffect } from 'react'

const pollData = {
  title: "How do you usually decide?",
  options: [
    { id: 1, text: "Ads & search results", percentage: 60 },
    { id: 2, text: "Word of mouth", percentage: 40 }
  ]
}

// Cap the distribution to avoid extreme edge alignment
const MIN_WIDTH = 35 // Minimum width percentage for any option
const MAX_WIDTH = 65 // Maximum width percentage for any option

export default function PollSectionStatic() {
  const [hasAnimated, setHasAnimated] = useState(false)
  
  // Calculate capped widths based on actual percentages
  const option1Percentage = pollData.options[0].percentage
  const option2Percentage = pollData.options[1].percentage
  
  // Apply caps to prevent extreme positioning
  let option1Width = option1Percentage
  let option2Width = option2Percentage
  
  if (option1Percentage > MAX_WIDTH) {
    option1Width = MAX_WIDTH
    option2Width = 100 - MAX_WIDTH
  } else if (option1Percentage < MIN_WIDTH) {
    option1Width = MIN_WIDTH
    option2Width = 100 - MIN_WIDTH
  }
  
  useEffect(() => {
    // Trigger animation after 400ms delay
    const timer = setTimeout(() => {
      setHasAnimated(true)
    }, 400)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12">
      {/* Poll Title */}
      <h3 className="text-title-large lg:text-headline-small text-on-surface text-center mb-8">
        {pollData.title}
      </h3>
      
      {/* Two-card layout with divider */}
      <div className="flex items-stretch gap-0 relative">
        {/* Option 1 Card */}
        <div 
          className="bg-surface-container-high rounded-l-2xl p-8 shadow-elevation-1 transition-all duration-700 ease-in-out"
          style={{ 
            width: hasAnimated ? `${option1Width}%` : '50%'
          }}
        >
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
        <div 
          className="bg-surface-container-high rounded-r-2xl p-8 shadow-elevation-1 transition-all duration-700 ease-in-out"
          style={{ 
            width: hasAnimated ? `${option2Width}%` : '50%'
          }}
        >
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
