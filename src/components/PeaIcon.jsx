export default function PeaIcon({ className = "h-10 w-10" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pea pod */}
      <path
        d="M20 30 Q15 50 20 70 Q30 85 50 85 Q70 85 80 70 Q85 50 80 30 Q70 15 50 15 Q30 15 20 30 Z"
        fill="#2E7D32"
      />
      
      {/* Three peas inside */}
      <circle cx="35" cy="35" r="10" fill="#A5D6A7" opacity="0.9" />
      <circle cx="50" cy="50" r="10" fill="#A5D6A7" opacity="0.9" />
      <circle cx="65" cy="65" r="10" fill="#A5D6A7" opacity="0.9" />
      
      {/* Highlight on pod */}
      <path
        d="M25 25 Q30 20 40 22"
        stroke="#A5D6A7"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  )
}
