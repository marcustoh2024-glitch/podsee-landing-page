'use client'

import { useState } from 'react'

const pollData = {
  options: [
    { id: 1, text: "Ads & search results", votes: 60, color: 'bg-[#E89B8F]' },
    { id: 2, text: "Word of mouth", votes: 40, color: 'bg-[#6FA89E]' }
  ]
}

export default function PollSectionHorizontal() {
  const [selectedOption, setSelectedOption] = useState(null)
  
  const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0)
  
  const handleOptionClick = (optionId) => {
    if (!selectedOption) {
      setSelectedOption(optionId)
    }
  }

  return (
    <section className="w-full">
      {/* Title above poll */}
      <h2 className="text-[13px] font-light text-[#6B7566] text-center mb-3 tracking-wide">
        What do you tend to go with when looking for tuition?
      </h2>
      
      {/* Horizontal poll cards - smaller height */}
      <div className="grid grid-cols-2 gap-2">
        {pollData.options.map((option, index) => {
          const percentage = Math.round((option.votes / totalVotes) * 100)
          const isSelected = selectedOption === option.id
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={selectedOption !== null}
              className={`relative overflow-hidden rounded-[16px] p-4 text-left transition-all duration-300 ease-emphasized scale-in-center shadow-premium-sm hover:shadow-premium-md ${
                option.color
              } ${
                selectedOption && !isSelected ? 'opacity-60' : 'opacity-100'
              } hover:scale-[1.02] active:scale-[0.98]`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Content - more compact */}
              <div className="relative z-10">
                <h3 className="text-[15px] font-medium text-white mb-2 tracking-tight">
                  {option.text}
                </h3>
                <div className="h-[1px] bg-white/30 mb-2" />
                <div className={`text-[40px] font-bold text-white leading-none tracking-tight transition-all duration-500 ${
                  selectedOption ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                }`}>
                  {selectedOption ? `${percentage}%` : '—'}
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
          )
        })}
      </div>
    </section>
  )
}
