'use client'

import useReducedMotion from '@/hooks/useReducedMotion'

export default function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-bg" />
        
        {/* Grain overlay */}
        <div className="absolute inset-0 grain-overlay" />
        
        {/* Static geometric shapes with M3 colors */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary-container/40 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-secondary-container/30 rounded-full opacity-40 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-tertiary-container/20 rounded-full opacity-30 blur-3xl" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Grain overlay */}
      <div className="absolute inset-0 grain-overlay" />
      
      {/* Animated geometric shapes with M3 colors */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary-container/40 rounded-full opacity-50 blur-3xl animate-drift-slow" />
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-secondary-container/30 rounded-full opacity-40 blur-3xl animate-drift-medium" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-tertiary-container/20 rounded-full opacity-30 blur-3xl animate-drift-fast" />
    </div>
  )
}
