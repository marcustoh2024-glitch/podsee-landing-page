import PageShell from '@/components/PageShell'
import PollSection from '@/components/PollSection'
import SearchSection from '@/components/SearchSection'
import ContextSection from '@/components/ContextSection'
import WaitlistCTA from '@/components/WaitlistCTA'
import HeroSection from '@/components/HeroSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import ComparisonSection from '@/components/ComparisonSection'
import TrustSection from '@/components/TrustSection'
import Header from '@/components/Header'
import PollSectionHorizontal from '@/components/PollSectionHorizontal'
import SearchSectionMinimal from '@/components/SearchSectionMinimal'
import WaitlistCTAMinimal from '@/components/WaitlistCTAMinimal'
import SMULogo from '@/components/SMULogo'

export default function Home() {
  return (
    <PageShell>
      {/* Desktop: Multi-section scrollable layout */}
      <div className="hidden lg:block">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Filter Section with ID for scroll targeting */}
        <section id="filter-section" className="min-h-screen py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-10">
            <div className="grid grid-cols-12 gap-8">
              {/* Poll - Left column */}
              <div className="col-span-3">
                <PollSection />
              </div>
              
              {/* FilterWizard - Center column */}
              <div className="col-span-6">
                <SearchSection />
              </div>
              
              {/* Waitlist - Right column */}
              <div className="col-span-3">
                <WaitlistCTA />
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* Comparison Section */}
        <ComparisonSection />
        
        {/* Trust Section */}
        <TrustSection />
        
        {/* Final Waitlist CTA Section */}
        <section className="min-h-[60vh] py-24 bg-primary-container flex items-center">
          <div className="max-w-4xl mx-auto px-10 w-full">
            <div className="bg-surface rounded-3xl p-12 shadow-elevation-3">
              <div className="grid grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-headline-large text-on-surface mb-4">
                    Ready to find the right tuition?
                  </h2>
                  <p className="text-body-large text-on-surface-variant leading-relaxed mb-6">
                    Join our waitlist to be the first to know when we launch. Get early access and help shape the future of tuition search in Singapore.
                  </p>
                  <ul className="space-y-3">
                    {['Early access to the platform', 'No ads, ever', 'Complete database of centres'].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-on" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-body-large text-on-surface">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <WaitlistCTA />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile: Single viewport layout (no scroll) - Premium minimal design */}
      <div className="lg:hidden h-screen flex flex-col bg-[#F5F1E8]">
        {/* Mobile header - compact */}
        <div className="flex-shrink-0 pt-4 pb-3">
          <Header />
        </div>
        
        {/* Poll - Horizontal cards - smaller */}
        <div className="flex-shrink-0 px-4 pb-4">
          <PollSectionHorizontal />
        </div>
        
        {/* Filter section with title - scrollable content */}
        <div className="flex-1 min-h-0 px-4 flex flex-col overflow-y-auto">
          <SearchSectionMinimal />
        </div>
        
        {/* Waitlist section - compact */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-[#2C3E2F]/10">
          <WaitlistCTAMinimal />
        </div>
        
        {/* Footer credit - SMU logo - compact */}
        <div className="flex-shrink-0 py-2 border-t border-[#2C3E2F]/10">
          <div className="flex items-center justify-center gap-2">
            <SMULogo />
            <span className="text-[10px] font-light text-[#6B7566]">by SMU students</span>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
