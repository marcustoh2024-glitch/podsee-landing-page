'use client'

import { useState } from 'react'
import useReducedMotion from '@/hooks/useReducedMotion'

const pollData = {
  title: "Quick question",
  question: "How does finding tuition feel right now?",
  options: [
    { id: 1, text: "Overwhelming", votes: 45 },
    { id: 2, text: "Confusing", votes: 32 },
    { id: 3, text: "Time-consuming", votes: 38 },
    { id: 4, text: "Uncertain", votes: 28 }
  ]
}

export default function PollSection() {
  const [selectedOption, setSelectedOption] = useState(null)
  const prefersReducedMotion = useReducedMotion()
  
  const totalVotes = pollData.options.reduce((sum, opt) => sum + opt.votes, 0)
  
  const handleOptionClick = (optionId) => {
    if (!selectedOption) {
      setSelectedOption(optionId)
    }
  }

  return (
    <section className="w-full max-w-[360px] mx-auto lg:mx-0 slide-in-bottom" style={{ animationDelay: '0.3s' }}>
      {/* M3 Filled Card - More compact on mobile */}
      <div className="bg-surface-container-high rounded-lg lg:rounded-2xl p-2 lg:p-6 shadow-elevation-1 relative overflow-hidden hover:shadow-elevation-2 transition-shadow duration-300 ease-emphasized">
        {/* M3 Accent indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        
        <h3 className="text-label-large lg:text-title-large text-on-surface mb-0.5 lg:mb-1 pl-1.5 lg:pl-0">{pollData.title}</h3>
        <p className="text-label-small lg:text-body-large text-on-surface-variant mb-1.5 lg:mb-5 pl-1.5 lg:pl-0">{pollData.question}</p>
        
        <div className="space-y-0.5 lg:space-y-2">
          {pollData.options.map((option, index) => {
            const percentage = Math.round((option.votes / totalVotes) * 100)
            const isSelected = selectedOption === option.id
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={selectedOption !== null}
                className="w-full text-left relative group state-layer rounded-md lg:rounded-lg slide-in-bottom"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                {/* Background bar (only after voting) - M3 style */}
                {selectedOption && (
                  <div 
                    className={`absolute inset-0 rounded-md lg:rounded-lg ${
                      isSelected ? 'bg-primary-container' : 'bg-surface-container-highest'
                    } ${prefersReducedMotion ? '' : 'transition-all duration-300 ease-standard'}`}
                    style={{ 
                      width: selectedOption ? `${percentage}%` : '0%',
                      transitionProperty: prefersReducedMotion ? 'none' : 'width'
                    }}
                  />
                )}
                
                {/* Content - More compact on mobile */}
                <div className="relative flex items-center gap-1.5 lg:gap-4 px-1.5 lg:px-4 py-1 lg:py-3">
                  {/* M3 Radio button - Smaller on mobile */}
                  <div className="flex-shrink-0">
                    {selectedOption ? (
                      isSelected ? (
                        // Selected state
                        <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 rounded-full bg-primary flex items-center justify-center scale-in-center">
                          <div className="w-1.5 h-1.5 lg:w-2.5 lg:h-2.5 rounded-full bg-primary-on" />
                        </div>
                      ) : (
                        // Unselected state (after voting)
                        <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 rounded-full border-2 border-outline" />
                      )
                    ) : (
                      // Before voting
                      <div className="w-3.5 h-3.5 lg:w-5 lg:h-5 rounded-full border-2 border-outline group-hover:border-on-surface transition-colors duration-200 ease-standard" />
                    )}
                  </div>
                  
                  {/* Option text and percentage */}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-label-medium lg:text-body-large text-on-surface font-medium">{option.text}</span>
                    {selectedOption && (
                      <span className="text-label-small lg:text-label-large text-primary ml-1.5 font-medium scale-in-center">{percentage}%</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

