'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  {
    value: 2000,
    suffix: '+',
    label: 'Tuition centres',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    value: 5000,
    suffix: '+',
    label: 'Searches completed',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    value: 4.8,
    suffix: '',
    label: 'Parent satisfaction',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
]

function useCountUp(end, duration = 1000, isVisible) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    let startTime
    let animationFrame

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth count-up
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, isVisible])

  return count
}

export default function TrustSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.4, rootMargin: '0px 0px -100px 0px' }
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
      className="hidden lg:block min-h-[60vh] py-24 bg-tertiary-container"
    >
      <div className="max-w-6xl mx-auto px-10">
        {/* Section title */}
        <h2 className={`text-headline-large text-center text-on-tertiary-container mb-16 ${isVisible ? 'fade-in-fwd' : 'opacity-0'}`}>
          Trusted by parents across Singapore
        </h2>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              stat={stat}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, index, isVisible }) {
  const count = useCountUp(stat.value, 1000, isVisible)
  
  return (
    <div 
      className={`bg-surface rounded-2xl p-8 shadow-elevation-2 text-center ${
        isVisible ? 'bounce-in-top' : 'opacity-0'
      }`}
      style={{ animationDelay: isVisible ? `${index * 0.1}s` : '0s' }}
    >
      {/* Icon */}
      <div 
        className={`w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center text-tertiary mx-auto mb-6 ${
          isVisible ? 'scale-in-center' : 'opacity-0'
        }`}
        style={{ animationDelay: isVisible ? `${index * 0.1 + 0.2}s` : '0s' }}
      >
        {stat.icon}
      </div>
      
      {/* Number with count-up animation */}
      <div className="text-display-small font-bold text-on-surface mb-2">
        {count.toLocaleString()}{stat.suffix}
      </div>
      
      {/* Label */}
      <div className="text-body-large text-on-surface-variant">
        {stat.label}
      </div>
    </div>
  )
}
