# Implementation Plan: Enhanced Landing Page Redesign

## Overview

This plan implements a premium, multi-section landing page for desktop while maintaining a strict one-viewport, non-scrollable experience on mobile. The implementation is phased to allow incremental progress and testing.

## Tasks

- [ ] 1. Setup and Mobile Viewport Lock
  - Update PageShell to enforce mobile viewport lock
  - Add responsive breakpoint utilities
  - Test viewport stability on iOS/Android
  - _Requirements: 8.1, 8.2, 9.5_

- [ ] 2. Create Hero Section (Desktop Only)
  - [ ] 2.1 Create HeroSection component with bold typography
    - Implement oversized headline layout
    - Add statistics display (2,000+ centres, etc.)
    - Add scroll indicator with pulse animation
    - _Requirements: 1.1, 1.2, 1.5, 1.7_
  
  - [ ] 2.2 Add hero section animations
    - Implement staggered entrance animations (fade-in-fwd, slide-in-bottom)
    - Add scroll indicator pulse animation
    - Test animation timing and delays
    - _Requirements: 1.2, 1.4_
  
  - [ ] 2.3 Hide hero on mobile / add compact variant
    - Implement responsive logic to hide on mobile
    - OR create ultra-compact mobile variant (40px)
    - _Requirements: 1.6_

- [ ] 3. Enhance Filter Section
  - [ ] 3.1 Create compact mobile layout
    - Reduce header to 60px
    - Compact poll to 120px
    - Optimize filter wizard spacing
    - Ensure internal scrolling works
    - _Requirements: 4.7, 8.2, 8.3, 8.4_
  
  - [ ] 3.2 Add enhanced filter animations
    - Implement swing-in-top-fwd for step expansion
    - Add scale-in-center for chip selection
    - Add pulsate-fwd for enabled apply button
    - Add jello-horizontal for completion checkmarks
    - _Requirements: 4.2, 4.3, 4.5_
  
  - [ ] 3.3 Test mobile viewport fit
    - Verify all elements fit in 100vh
    - Test on various mobile devices
    - Ensure no scrolling occurs
    - _Requirements: 8.1, 8.7_

- [ ] 4. Create "How It Works" Section (Desktop Only)
  - [ ] 4.1 Create HowItWorksSection component
    - Implement 3-column step layout
    - Add icons for each step (filter, browse, choose)
    - Add connecting arrows between steps
    - _Requirements: 2.1, 2.4, 2.6_
  
  - [ ] 4.2 Add scroll-triggered animations
    - Implement Intersection Observer
    - Add staggered slide-in-bottom animations
    - Add scale-in-center for icons
    - _Requirements: 2.2, 2.7_
  
  - [ ] 4.3 Implement mobile hiding
    - Hide section on mobile devices
    - _Requirements: 2.5_

- [ ] 5. Create Comparison Section (Desktop Only)
  - [ ] 5.1 Create ComparisonSection component
    - Implement side-by-side card layout
    - Add "Traditional Search" pain points (left)
    - Add "Podsee" benefits (right)
    - Add "vs" divider with styling
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 5.2 Add visual treatments
    - Apply error-container background to left card
    - Apply primary-container background to right card
    - Style icons (❌ for left, ✅ for right)
    - _Requirements: 3.6_
  
  - [ ] 5.3 Add scroll-triggered animations
    - Implement slide-in-elliptic-top-fwd from opposite sides
    - Add staggered fade-in-fwd for list items
    - Add scale-in-center for icons
    - _Requirements: 3.5_
  
  - [ ] 5.4 Implement mobile hiding
    - Hide section on mobile devices
    - _Requirements: 3.7_

- [ ] 6. Create Trust/Social Proof Section (Desktop Only)
  - [ ] 6.1 Create TrustSection component
    - Implement statistics card layout
    - Add number displays (2000+ centres, 5000+ searches, 4.8 rating)
    - Add labels below each stat
    - _Requirements: 5.1, 5.2_
  
  - [ ] 6.2 Add count-up animations
    - Implement number count-up animation from 0
    - Add scale-in-center for star ratings
    - Add bounce-in-top for cards
    - _Requirements: 5.3_
  
  - [ ] 6.3 Implement scroll trigger
    - Trigger animations at 40% visibility
    - _Requirements: 5.5_
  
  - [ ] 6.4 Implement mobile hiding
    - Hide section on mobile devices
    - _Requirements: 5.6_

- [ ] 7. Enhance Waitlist Section
  - [ ] 7.1 Create desktop card variant
    - Implement full-width card with gradient background
    - Add form on left, benefits list on right
    - Style with primary-container and elevation-2
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [ ] 7.2 Add entrance animation
    - Implement scroll-triggered animation
    - _Requirements: 6.3_
  
  - [ ] 7.3 Keep mobile FAB
    - Ensure existing FAB remains on mobile
    - _Requirements: 6.5_

- [ ] 8. Implement Scroll Behavior (Desktop Only)
  - [ ] 8.1 Add smooth scrolling
    - Implement CSS scroll-behavior: smooth
    - Add scroll-snap for sections
    - _Requirements: 7.1, 7.6_
  
  - [ ] 8.2 Create ScrollProgress component
    - Implement progress indicator or back-to-top button
    - Show after scrolling past hero
    - _Requirements: 7.2, 7.5_
  
  - [ ] 8.3 Setup Intersection Observer
    - Create reusable scroll-trigger utility
    - Implement for all desktop sections
    - _Requirements: 7.3_
  
  - [ ] 8.4 Add reduced motion support
    - Disable scroll animations when prefers-reduced-motion
    - _Requirements: 7.4_

- [ ] 9. Update Page Layout
  - [ ] 9.1 Refactor page.jsx for new structure
    - Add all new sections with responsive logic
    - Implement desktop-only conditional rendering
    - Maintain mobile one-viewport layout
    - _Requirements: 1.1, 8.1, 8.2_
  
  - [ ] 9.2 Update PageShell for sections
    - Add section-based layout support
    - Ensure mobile viewport lock remains
    - _Requirements: 8.1, 8.7_

- [ ] 10. Performance Optimization
  - [ ] 10.1 Optimize animations
    - Use CSS animations over JavaScript where possible
    - Add will-change for animated elements
    - Remove will-change after animation completes
    - _Requirements: 9.3, 9.4_
  
  - [ ] 10.2 Implement lazy loading
    - Lazy-load below-the-fold sections
    - Lazy-load images
    - _Requirements: 9.2_
  
  - [ ] 10.3 Mobile performance tuning
    - Reduce animation complexity on mobile
    - Test on low-end devices
    - _Requirements: 9.5_
  
  - [ ] 10.4 Measure performance
    - Run Lighthouse audit
    - Ensure page load < 2s
    - Verify 60fps animations
    - _Requirements: 9.1, 9.3_

- [ ] 11. Design System Integration
  - [ ] 11.1 Apply M3 colors
    - Use existing M3 color palette
    - Add new section-specific colors to tailwind config
    - _Requirements: 10.1_
  
  - [ ] 11.2 Apply M3 typography
    - Use Roboto/Roboto Flex fonts
    - Apply M3 type scale
    - _Requirements: 10.2_
  
  - [ ] 11.3 Apply M3 elevation
    - Use M3 shadow levels
    - _Requirements: 10.3_
  
  - [ ] 11.4 Apply M3 motion
    - Use M3 easing curves
    - Integrate Animista animations
    - _Requirements: 10.4, 10.5_
  
  - [ ] 11.5 Maintain component consistency
    - Keep existing button/card/input styles
    - Use state layer system
    - _Requirements: 10.6, 10.7_

- [ ] 12. Testing and Polish
  - [ ] 12.1 Cross-browser testing
    - Test on Chrome, Firefox, Safari
    - Test iOS Safari viewport height
    - Test Android Chrome
    - _Requirements: 9.1_
  
  - [ ] 12.2 Responsive testing
    - Test at 375px, 768px, 1024px, 1440px
    - Verify mobile viewport lock
    - Verify desktop scrolling
    - _Requirements: 8.1, 8.7_
  
  - [ ] 12.3 Animation testing
    - Verify all animations trigger correctly
    - Test reduced motion support
    - Check animation performance
    - _Requirements: 7.4, 9.3_
  
  - [ ] 12.4 Accessibility audit
    - Keyboard navigation
    - Screen reader testing
    - Color contrast verification
    - _Requirements: 10.1_

- [ ] 13. Final Integration
  - Ensure all sections work together
  - Verify mobile/desktop switching
  - Test all user flows
  - Deploy to staging for review
  - _Requirements: All_

## Notes

- **Mobile Priority**: Tasks 1, 3 are critical for mobile viewport lock
- **Desktop Sections**: Tasks 4, 5, 6 are desktop-only and can be built in parallel
- **Performance**: Task 10 should be done incrementally, not at the end
- **Testing**: Task 12 should happen throughout, not just at the end

## Implementation Order

**Phase 1 (Core - 1-2 hours):**
1. Mobile viewport lock (Task 1)
2. Compact mobile layout (Task 3)
3. Enhanced filter animations (Task 3.2)

**Phase 2 (Desktop Sections - 2-3 hours):**
4. Hero section (Task 2)
5. How It Works (Task 4)
6. Comparison (Task 5)
7. Trust section (Task 6)

**Phase 3 (Polish - 1 hour):**
8. Scroll behavior (Task 8)
9. Waitlist enhancement (Task 7)
10. Performance optimization (Task 10)
11. Testing (Task 12)

**Total Estimated Time: 4-6 hours**

