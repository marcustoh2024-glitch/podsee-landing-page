'use client'

import Image from 'next/image'
import { useState } from 'react'
import PeaIcon from './PeaIcon'

export default function PodseeLogo({ className = "h-16 w-auto" }) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <PeaIcon className={className} />
  }

  return (
    <div className="relative" style={{ width: '280px', height: '90px' }}>
      <Image 
        src="/podsee-logo.jpg" 
        alt="Podsee" 
        fill
        className="object-contain"
        onError={() => setImageError(true)}
        priority
      />
    </div>
  )
}
