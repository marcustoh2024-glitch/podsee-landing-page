'use client'

import { useEffect, useRef, useState } from 'react'

const traditionalPoints = [
  'Multiple websites to check',
  'Ads everywhere',
  'Incomplete information',
  'Time-consuming search'
]

const podseePoints = [
  'One complete platform',
  'No advertisements',
  'Complete database',
  'Filter once, see all'
]

export default function ComparisonSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
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
      className="hidden lg:block min-h-[80vh] py-24 bg-surface-container"
    >
      <div className="max-w-6xl mx-auto px-10">
        {/* Section title */}
        <h2 className={`text-headline-large text-center text-on-surface mb-16 ${isVisible ? 'fade-in-fwd' : 'opacity-0'}`}>
          Why Podsee?
        </h2>
        
        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-12 items-center">
          {/* Traditional Search (Left) */}
          <div 
            className={`${isVisible ? 'slide-in-elliptic-top-fwd' : 'opacity-0'}`}
            style={{ animationDelay: isVisible ? '0.2s' : '0s' }}
          >
            <div className="bg-error-container rounded-2xl p-8 shadow-elevation-1">
              <h3 className="text-title-large text-on-error-container mb-6 text-center">
                Traditional Search
              </h3>
              <ul className="space-y-4">
                {traditionalPoints.map((point, index) => (
                  <li 
                    key={index}
                    className={`flex items-start gap-3 ${isVisible ? 'fade-in-fwd' : 'opacity-0'}`}
                    style={{ animationDelay: isVisible ? `${0.3 + index * 0.1}s` : '0s' }}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-error flex items-center justify-center ${
                      isVisible ? 'scale-in-center' : 'opacity-0'
                    }`}
                    style={{ animationDelay: isVisible ? `${0.4 + index * 0.1}s` : '0s' }}
                    >
                      <svg className="w-4 h-4 text-error-on" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-body-large text-on-error-container">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* VS Divider */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`w-20 h-20 rounded-full bg-surface shadow-elevation-3 flex items-center justify-center ${
              isVisible ? 'scale-in-center' : 'opacity-0'
            }`}
            style={{ animationDelay: isVisible ? '0.5s' : '0s' }}
            >
              <span className="text-headline-medium font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                vs
              </span>
            </div>
          </div>
          
          {/* Podsee (Right) */}
          <div 
            className={`${isVisible ? 'slide-in-elliptic-top-fwd' : 'opacity-0'}`}
            style={{ animationDelay: isVisible ? '0.2s' : '0s' }}
          >
            <div className="bg-primary-container rounded-2xl p-8 shadow-elevation-2">
              <h3 className="text-title-large text-on-primary-container mb-6 text-center font-medium">
                Podsee
              </h3>
              <ul className="space-y-4">
                {podseePoints.map((point, index) => (
                  <li 
                    key={index}
                    className={`flex items-start gap-3 ${isVisible ? 'fade-in-fwd' : 'opacity-0'}`}
                    style={{ animationDelay: isVisible ? `${0.3 + index * 0.1}s` : '0s' }}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center ${
                      isVisible ? 'scale-in-center' : 'opacity-0'
                    }`}
                    style={{ animationDelay: isVisible ? `${0.4 + index * 0.1}s` : '0s' }}
                    >
                      <svg className="w-4 h-4 text-primary-on" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-body-large text-on-primary-container font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
