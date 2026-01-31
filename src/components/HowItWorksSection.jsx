'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: 1,
    title: 'Filter your needs',
    description: 'Select location, level, and subject in seconds',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    )
  },
  {
    number: 2,
    title: 'Browse all centres',
    description: 'See every relevant option in one complete list',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )
  },
  {
    number: 3,
    title: 'Make your choice',
    description: 'Compare and decide calmly, without the noise',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

export default function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="hidden lg:block min-h-[80vh] py-24 bg-surface"
    >
      <div className="max-w-6xl mx-auto px-10">
        {/* Section title */}
        <h2 className={`text-headline-large text-center text-on-surface mb-16 ${isVisible ? 'fade-in-fwd' : 'opacity-0'}`}>
          How it works
        </h2>
        
        {/* Steps grid */}
        <div className="grid grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Step card */}
              <div 
                className={`bg-surface-container-high rounded-2xl p-8 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 ease-emphasized ${
                  isVisible ? 'slide-in-bottom' : 'opacity-0'
                }`}
                style={{ animationDelay: isVisible ? `${index * 0.1}s` : '0s' }}
              >
                {/* Icon */}
                <div 
                  className={`w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary mb-6 ${
                    isVisible ? 'scale-in-center' : 'opacity-0'
                  }`}
                  style={{ animationDelay: isVisible ? `${index * 0.1 + 0.2}s` : '0s' }}
                >
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-title-large text-on-surface mb-3">
                  {step.title}
                </h3>
                <p className="text-body-large text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Arrow connector (except for last step) */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-1/2 -right-4 transform -translate-y-1/2 text-outline ${
                    isVisible ? 'fade-in-fwd' : 'opacity-0'
                  }`}
                  style={{ animationDelay: isVisible ? `${index * 0.1 + 0.3}s` : '0s' }}
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
