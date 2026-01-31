import AnimatedBackground from './AnimatedBackground'
import Header from './Header'
import ScrollProgress from './ScrollProgress'

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen overflow-y-auto relative bg-[#F5F1E8] lg:bg-surface lg:overflow-auto">
      {/* Background layer (z-0) - Only on desktop */}
      <div className="hidden lg:block">
        <AnimatedBackground />
      </div>
      
      {/* Scroll progress indicator (desktop only) */}
      <ScrollProgress />
      
      {/* Content layer (z-10) */}
      <div className="relative z-10 flex flex-col lg:h-auto lg:max-w-none lg:px-0">
        {/* Main content area */}
        <main className="flex-1 lg:py-0 lg:overflow-visible lg:min-h-fit">
          {children}
        </main>
      </div>
    </div>
  )
}
