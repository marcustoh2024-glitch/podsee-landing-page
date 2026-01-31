'use client'

import { useState, useEffect } from 'react'
import useReducedMotion from '@/hooks/useReducedMotion'

const POLL_STORAGE_KEY = 'podsee_poll_votes'

// Initialize poll data with vote counts
const getInitialPollData = () => {
  if (typeof window === 'undefined') return { option1: 20, option2: 80 }
  
  const stored = localStorage.getItem(POLL_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  // Default starting votes
  return { option1: 20, option2: 80 }
}

const savePollData = (data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(data))
  }
}

export default function PollSection() {
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPercentages, setShowPercentages] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const [votes, setVotes] = useState({ option1: 20, option2: 80 })
  const [hasVoted, setHasVoted] = useState(false)
  
  // Load votes on mount
  useEffect(() => {
    const data = getInitialPollData()
    setVotes(data)
    
    // Check if user has already voted
    const voted = localStorage.getItem('podsee_user_voted')
    if (voted) {
      setHasVoted(true)
      setSelectedOption(parseInt(voted))
      setShowPercentages(true)
    }
  }, [])
  
  // Calculate percentages
  const totalVotes = votes.option1 + votes.option2
  const option1Percentage = Math.round((votes.option1 / totalVotes) * 100)
  const option2Percentage = Math.round((votes.option2 / totalVotes) * 100)
  
  const handleOptionClick = (optionId) => {
    if (!selectedOption && !hasVoted) {
      setSelectedOption(optionId)
      setHasVoted(true)
      
      // Update vote counts
      const newVotes = {
        option1: optionId === 1 ? votes.option1 + 1 : votes.option1,
        option2: optionId === 2 ? votes.option2 + 1 : votes.option2
      }
      setVotes(newVotes)
      savePollData(newVotes)
      
      // Save user's vote
      localStorage.setItem('podsee_user_voted', optionId.toString())
      
      // Wait for animation before showing percentages
      const delay = prefersReducedMotion ? 0 : 400
      setTimeout(() => {
        setShowPercentages(true)
      }, delay)
    }
  }

  const pollData = {
    title: "How do you usually decide your tuition?",
    options: [
      { id: 1, text: "Ads & search results", percentage: option1Percentage },
      { id: 2, text: "Word of mouth", percentage: option2Percentage }
    ]
  }

  return (
    <section className="w-full max-w-[360px] mx-auto lg:mx-0 slide-in-bottom" style={{ animationDelay: '0.3s' }}>
      {/* Poll Title - bigger */}
      <h3 className="text-title-large text-on-surface text-center mb-4">
        {pollData.title}
      </h3>
      
      {/* Two-card layout with divider - fixed height */}
      <div className="flex flex-col items-stretch gap-0 relative h-[100px]">
        {/* Option 1 Card - Ads option (always dimmed when selected) */}
        <button
          onClick={() => handleOptionClick(pollData.options[0].id)}
          disabled={selectedOption !== null || hasVoted}
          className={`bg-surface-container-high rounded-t-2xl p-3 shadow-elevation-1 transition-all ease-in-out text-left ${
            !selectedOption && !hasVoted ? 'cursor-pointer hover:shadow-elevation-2' : 'cursor-default opacity-50'
          }`}
          style={{ 
            height: '50%',
            transitionDuration: prefersReducedMotion ? '0ms' : '700ms'
          }}
        >
          <div className="text-body-medium text-on-surface mb-1">
            {pollData.options[0].text}
          </div>
          {/* Percentage fades in after divider animation, with subtle crossfade on updates */}
          <div className={`text-headline-medium text-on-surface-variant transition-all duration-500 ${
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
          disabled={selectedOption !== null || hasVoted}
          className={`bg-surface-container-high rounded-b-2xl p-3 shadow-elevation-1 transition-all ease-in-out text-left ${
            !selectedOption && !hasVoted ? 'cursor-pointer hover:shadow-elevation-2' : 'cursor-default'
          }`}
          style={{ 
            height: '50%',
            transitionDuration: prefersReducedMotion ? '0ms' : '700ms'
          }}
        >
          <div className="text-body-medium text-on-surface mb-1">
            {pollData.options[1].text}
          </div>
          {/* Percentage fades in after divider animation, with subtle crossfade on updates */}
          <div className={`text-headline-medium text-on-surface-variant transition-all duration-500 ${
            showPercentages ? 'opacity-100' : 'opacity-0'
          }`}>
            {pollData.options[1].percentage}%
          </div>
        </button>
      </div>
    </section>
  )
}

