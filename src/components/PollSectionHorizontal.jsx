'use client'

import { useState } from 'react'

const pollData = {
  title: "How do you usually decide your tuition?",
  options: [
    { id: 1, text: "Ads & search results", percentage: 20, color: 'bg-[#E89B8F]' },
    { id: 2, text: "Word of mouth", percentage: 80, color: 'bg-[#6FA89E]' }
  ]
}

// Live updates: When pollData.options percentages change, the component will:
// 1. Smoothly animate divider position via the existing 700ms ease-in-out transition
// 2. Subtly crossfade percentage values via the 500ms transition-all
// This creates a calm, alive feeling without jittery movements

export default function PollSectionHorizontal() {
  const [selectedOption, setSelectedOption] = useState(null)
  const [showPercentages, setShowPercentages] = useState(false)
  
  // Use actual percentages without capping
  const option1Width = pollData.options[0].percentage
  const option2Width = pollData.options[1].percentage
  
  const handleOptionClick = (optionId) => {
    if (!selectedOption) {
      setSelectedOption(optionId)
      // Wait for divider animation to complete (700ms) before showing percentages
      setTimeout(() => {
        setShowPercentages(true)
      }, 700)
    }
  }

  return (
    <section className="w-full">
      {/* Title above poll - bigger and closer to top */}
      <h2 className="text-[16px] font-medium text-[#2C3E2F] text-center mb-4 tracking-tight">
        {pollData.title}
      </h2>
      
      {/* Two-card layout with divider */}
      <div className="flex items-stretch gap-0 relative">
        {/* Option 1 Card - Ads option (always dimmed when selected) */}
        <button
          onClick={() => handleOptionClick(pollData.options[0].id)}
          disabled={selectedOption !== null}
          className={`${pollData.options[0].color} rounded-l-[16px] p-4 shadow-premium-sm relative overflow-hidden transition-all duration-700 ease-in-out ${
            !selectedOption ? 'cursor-pointer hover:shadow-premium-md active:scale-[0.98]' : 'cursor-default opacity-50'
          }`}
          style={{ 
            width: selectedOption ? `${option1Width}%` : '50%'
          }}
        >
          <div className="relative z-10">
            <h3 className="text-[15px] font-medium text-white mb-2 tracking-tight">
              {pollData.options[0].text}
            </h3>
            <div className="h-[1px] bg-white/30 mb-2" />
            {/* Percentage fades in after divider animation, with subtle crossfade on updates */}
            <div className={`text-[40px] font-bold text-white leading-none tracking-tight transition-all duration-500 ${
              showPercentages ? 'opacity-100' : 'opacity-0'
            }`}>
              {pollData.options[0].percentage}%
            </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
        </button>
        
        {/* Vertical Divider */}
        <div className="w-[2px] bg-[#6B7566]/20" />
        
        {/* Option 2 Card */}
        <button
          onClick={() => handleOptionClick(pollData.options[1].id)}
          disabled={selectedOption !== null}
          className={`${pollData.options[1].color} rounded-r-[16px] p-4 shadow-premium-sm relative overflow-hidden transition-all duration-700 ease-in-out ${
            !selectedOption ? 'cursor-pointer hover:shadow-premium-md active:scale-[0.98]' : 'cursor-default'
          }`}
          style={{ 
            width: selectedOption ? `${option2Width}%` : '50%'
          }}
        >
          <div className="relative z-10">
            <h3 className="text-[15px] font-medium text-white mb-2 tracking-tight">
              {pollData.options[1].text}
            </h3>
            <div className="h-[1px] bg-white/30 mb-2" />
            {/* Percentage fades in after divider animation, with subtle crossfade on updates */}
            <div className={`text-[40px] font-bold text-white leading-none tracking-tight transition-all duration-500 ${
              showPercentages ? 'opacity-100' : 'opacity-0'
            }`}>
              {pollData.options[1].percentage}%
            </div>
          </div>
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
        </button>
      </div>
    </section>
  )
}
