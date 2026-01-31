import PodseeLogo from './PodseeLogo'

export default function Header() {
  return (
    <header className="text-center relative z-10 flex-shrink-0">
      {/* Logo only - enlarged */}
      <div className="flex items-center justify-center fade-in-fwd">
        {/* Podsee logo - larger size, no text */}
        <PodseeLogo className="h-16 w-auto md:h-20 md:w-auto" />
      </div>
      
      {/* Subtitle - Elegant and minimal */}
      <p className="mt-3 md:mt-5 text-[15px] md:text-body-large md:text-title-large text-[#6B7566] max-w-md mx-auto slide-in-bottom font-light" style={{ animationDelay: '0.2s' }}>
        Find tuition without the noise.
      </p>
    </header>
  )
}
