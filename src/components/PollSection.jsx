'use client'

import { useState } from 'react'
import useReducedMotion from '@/hooks/useReducedMotion'

const pollData = {
  title: "How do you usually decide?",
  options: [
    { id: 1, text: "Ads & search results", percentage: 60 },
    { id: 2, text: "Word of mouth", percentage: 40 }
  ]
}

// Cap the distribution to avoid extreme edge alignment
const MIN_WIDTH = 35
const MAX_WIDTH = 65

export default function PollSection() {
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPercentages, setShowPercentages] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  
  // Calculate capped widths based on actual percentages
  const option1Percentage = pollData.options[0].percentage
  const option2Percentage = pollData.options[1].percentage
  
  let option1Width = option1Percentage
  let option2Width = option2Percentage
  
  if (option1Percentage > MAX_WIDTH) {
    option1Width = MAX_WIDTH
    option2Width = 100 - MAX_WIDTH
  } else if (option1Percentage < MIN_WIDTH) {
    option1Width = MIN_WIDTH
    option2Width = 100 - MIN_WIDTH
  }
  
  const handleOptionClick = (optionId) => {
    if (!selectedOption) {
      setSelectedOption(optionId)
      // Wait for divider animation to complete (700ms or instant if reduced motion) before showing percentages
      const delay = prefersReducedMotion ? 0 : 700
      setTimeout(() => {
        setShowPercentages(true)
      }, delay)
    }
  }

  return (
    <section className="w-full max-w-[360px] mx-auto lg:mx-0 slide-in-bottom" style={{ animationDelay: '0.3s' }}>
      {/* Poll Title */}
      <h3 className="text-title-medium text-on-surface text-center mb-6">
        {pollData.title}
      </h3>
      
      {/* Two-card layout with divider */}
      <div className="flex flex-col items-stretch gap-0 relative">
        {/* Option 1 Card */}
        <button
          onClick={() => handleOptionClick(pollData.options[0].id)}
          disabled={selectedOption !== null}
          className={`bg-surface-container-high rounded-t-2xl p-6 shadow-elevation-1 transition-all ease-in-out text-left ${
            !selectedOption ? 'cursor-pointer hover:shadow-elevation-2' : 'cursor-default'
          }`}
          style={{ 
            height: selectedOption ? `${option1Width}%` : '50%',
            transitionDuration: prefersReducedMotion ? '0ms' : '700ms'
          }}
        >
          <div className="text-body-large text-on-surface mb-2">
            {pollData.options[0].text}
          </div>
          {/* Percentage fades in after divider animation */}
          <div className={`text-display-small text-on-surface-variant transition-opacity duration-500 ${
            showPercentages ? 'opacity-100' : 'opacity-0'
          }`}>
            {pollData.options[0].percentage}%
          </div>
        </button>
        
        {/* Horizontal Divider */}
        <div className="h-px bg-outline-variant" />
        
        {/* Option 2 Card */}
        <button
          onClick={() => handleOptionClick(pollData.options[1].id)}
          disabled={selectedOption !== null}
          className={`bg-surface-container-high rounded-b-2xl p-6 shadow-elevation-1 transition-all ease-in-out text-left ${
            !selectedOption ? 'cursor-pointer hover:shadow-elevation-2' : 'cursor-default'
          }`}
          style={{ 
            height: selectedOption ? `${option2Width}%` : '50%',
            transitionDuration: prefersReducedMotion ? '0ms' : '700ms'
          }}
        >
          <div className="text-body-large text-on-surface mb-2">
            {pollData.options[1].text}
          </div>
          {/* Percentage fades in after divider animation */}
          <div className={`text-display-small text-on-surface-variant transition-opacity duration-500 ${
            showPercentages ? 'opacity-100' : 'opacity-0'
          }`}>
            {pollData.options[1].percentage}%
          </div>
        </button>
      </div>
    </section>
  )
}

