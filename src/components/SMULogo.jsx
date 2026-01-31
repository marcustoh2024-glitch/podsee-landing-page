'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function SMULogo() {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // Fallback SVG
    return (
      <div className="flex items-center gap-1.5">
        <svg className="h-5" viewBox="0 0 120 30" fill="none">
          <path d="M2 4 L2 26 L6 26 L6 16 L8 14 L10 16 L10 12 L8 10 L6 12 L6 4 Z" fill="#1B2D5A"/>
          <path d="M7 2 L9 4 L8 5 Z" fill="#9B8B6F"/>
          <path d="M9 4 L11 2 L10 5 Z" fill="#9B8B6F"/>
          <text x="14" y="20" fontFamily="serif" fontSize="16" fontWeight="bold" fill="#1B2D5A">SMU</text>
        </svg>
      </div>
    )
  }

  return (
    <div className="h-6 w-24 relative">
      <Image 
        src="/smu-logo.png" 
        alt="SMU" 
        fill
        className="object-contain object-center"
        onError={() => setImageError(true)}
      />
    </div>
  )
}
