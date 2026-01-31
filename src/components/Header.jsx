import PodseeLogo from './PodseeLogo'

export default function Header() {
  return (
    <header className="text-center relative z-10 flex-shrink-0">
      {/* Logo only - enlarged */}
      <div className="flex items-center justify-center fade-in-fwd">
        {/* Podsee logo - larger size, no text */}
        <PodseeLogo className="h-16 w-auto md:h-20 md:w-auto" />
      </div>
    </header>
  )
}
