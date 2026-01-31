'use client'

import { useState, useEffect } from 'react'

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

export default function PollSectionHorizontal() {
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPercentages, setShowPercentages] = useState(false)
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
      
      // Show percentages
      setTimeout(() => {
        setShowPercentages(true)
      }, 400)
    }
  }

  const pollData = {
    title: "How do you usually decide your tuition?",
    options: [
      { id: 1, text: "Ads & search results", percentage: option1Percentage, color: 'bg-[#E89B8F]' },
      { id: 2, text: "Word of mouth", percentage: option2Percentage, color: 'bg-[#6FA89E]' }
    ]
  }

  return (
    <section className="w-full h-[80px]">
      {/* Title above poll - bigger and very close to top */}
      <h2 className="text-[16px] font-medium text-[#2C3E2F] text-center mb-2 tracking-tight">
        {pollData.title}
      </h2>
      
      {/* Two-card layout with divider - fixed height */}
      <div className="flex items-stretch gap-0 relative h-[50px]">
        {/* Option 1 Card - Ads option (always dimmed when selected) */}
        <button
          onClick={() => handleOptionClick(pollData.options[0].id)}
          disabled={selectedOption !== null || hasVoted}
          className={`${pollData.options[0].color} rounded-l-[16px] p-2 shadow-premium-sm relative overflow-hidden transition-all duration-500 ease-out ${
            !selectedOption && !hasVoted ? 'cursor-pointer hover:shadow-premium-md' : 'cursor-default opacity-50'
          }`}
          style={{ 
            width: selectedOption || hasVoted ? `${pollData.options[0].percentage}%` : '50%'
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-[13px] font-medium text-white tracking-tight">
              {pollData.options[0].text}
            </h3>
            {/* Percentage fades in smoothly */}
            <div className={`text-[20px] font-bold text-white leading-none tracking-tight transition-opacity duration-300 ${
              showPercentages ? 'opacity-100' : 'opacity-0'
            }`}>
              {pollData.options[0].percentage}%
            </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </button>
        
        {/* Vertical Divider */}
        <div className="w-[2px] bg-[#6B7566]/20" />
        
        {/* Option 2 Card */}
        <button
          onClick={() => handleOptionClick(pollData.options[1].id)}
          disabled={selectedOption !== null || hasVoted}
          className={`${pollData.options[1].color} rounded-r-[16px] p-2 shadow-premium-sm relative overflow-hidden transition-all duration-500 ease-out ${
            !selectedOption && !hasVoted ? 'cursor-pointer hover:shadow-premium-md' : 'cursor-default'
          }`}
          style={{ 
            width: selectedOption || hasVoted ? `${pollData.options[1].percentage}%` : '50%'
          }}
        >
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h3 className="text-[13px] font-medium text-white tracking-tight">
              {pollData.options[1].text}
            </h3>
            {/* Percentage fades in smoothly */}
            <div className={`text-[20px] font-bold text-white leading-none tracking-tight transition-opacity duration-300 ${
              showPercentages ? 'opacity-100' : 'opacity-0'
            }`}>
              {pollData.options[1].percentage}%
            </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </button>
      </div>
    </section>
  )
}
