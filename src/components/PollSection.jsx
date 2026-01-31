'use client'

import { useState, useEffect } from 'react'
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
  const [hasAnimated, setHasAnimated] = useState(false)
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
  
  useEffect(() => {
    if (prefersReducedMotion) {
      setHasAnimated(true)
      return
    }
    
    // Trigger animation after 400ms delay
    const timer = setTimeout(() => {
      setHasAnimated(true)
    }, 400)
    
    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  return (
    <section className="w-full max-w-[360px] mx-auto lg:mx-0 slide-in-bottom" style={{ animationDelay: '0.3s' }}>
      {/* Poll Title */}
      <h3 className="text-title-medium text-on-surface text-center mb-6">
        {pollData.title}
      </h3>
      
      {/* Two-card layout with divider */}
      <div className="flex flex-col items-stretch gap-0 relative">
        {/* Option 1 Card */}
        <div 
          className="bg-surface-container-high rounded-t-2xl p-6 shadow-elevation-1 transition-all ease-in-out"
          style={{ 
            height: hasAnimated ? `${option1Width}%` : '50%',
            transitionDuration: prefersReducedMotion ? '0ms' : '700ms'
          }}
        >
          <div className="text-body-large text-on-surface mb-2">
            {pollData.options[0].text}
          </div>
          {/* Percentage hidden for now */}
          <div className="text-display-small text-on-surface-variant opacity-0">
            {pollData.options[0].percentage}%
          </div>
        </div>
        
        {/* Horizontal Divider */}
        <div className="h-px bg-outline-variant" />
        
        {/* Option 2 Card */}
        <div 
          className="bg-surface-container-high rounded-b-2xl p-6 shadow-elevation-1 transition-all ease-in-out"
          style={{ 
            height: hasAnimated ? `${option2Width}%` : '50%',
            transitionDuration: prefersReducedMotion ? '0ms' : '700ms'
          }}
        >
          <div className="text-body-large text-on-surface mb-2">
            {pollData.options[1].text}
          </div>
          {/* Percentage hidden for now */}
          <div className="text-display-small text-on-surface-variant opacity-0">
            {pollData.options[1].percentage}%
          </div>
        </div>
      </div>
    </section>
  )
}

