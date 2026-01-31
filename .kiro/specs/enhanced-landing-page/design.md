# Design Document: Enhanced Landing Page Redesign

## Overview

This design transforms the Podsee landing page into a premium, multi-section experience on desktop while maintaining a focused, one-viewport layout on mobile. The design draws inspiration from modern web trends (Porsche, Quantum, etc.) while preserving the M3 design system and existing functionality.

**Key Design Principles:**
- **Desktop**: Multi-section scrollable experience with rich animations
- **Mobile**: Strict one-viewport, non-scrollable, focused on core action (filter)
- **Visual Language**: Bold typography, subtle animations, premium feel
- **Performance**: 60fps animations, optimized for mobile

## Architecture

### Component Structure

```
LandingPage (page.jsx)
├── PageShell (layout wrapper)
│   ├── AnimatedBackground
│   └── Header (compact on mobile)
├── HeroSection (desktop only / compact mobile)
├── FilterSection (primary on mobile)
│   ├── PollCard (compact on mobile)
│   └── FilterWizard (enhanced)
├── HowItWorksSection (desktop only)
├── ComparisonSection (desktop only)
├── TrustSection (desktop only)
├── WaitlistSection (desktop card / mobile FAB)
└── ScrollProgress (desktop only)
```

### Responsive Strategy

**Desktop (lg: 1024px+)**
- Full multi-section scrollable page
- Scroll-triggered animations
- Rich visual treatments
- All sections visible

**Mobile (< 1024px)**
- Single viewport, no scroll
- Compact header
- Poll + Filter + FAB only
- Additional content via modals (optional)

## Visual Design

### Layout Grid

**Desktop:**
```
┌─────────────────────────────────────┐
│         Hero Section (100vh)         │
│  [Bold Headline + Stats + Visual]   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      Filter Section (auto)           │
│  [Poll] [Filter Wizard] [Waitlist]  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│    How It Works (80vh)               │
│  [Step 1] [Step 2] [Step 3]         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     Comparison (80vh)                │
│  [Traditional] vs [Podsee]          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      Trust Section (60vh)            │
│  [Stats] [Testimonials]             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│    Waitlist CTA (60vh)              │
│  [Form + Benefits]                  │
└─────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────┐
│  Compact Header  │ (60px)
├──────────────────┤
│   Poll (compact) │ (120px)
├──────────────────┤
│                  │
│  Filter Wizard   │ (flex-1)
│   (scrollable)   │
│                  │
├──────────────────┤
│   Apply Button   │ (60px)
├──────────────────┤
│   FAB (fixed)    │ (floating)
└──────────────────┘
Total: 100vh (locked)
```

### Typography Scale

**Hero Headlines (Desktop):**
- Primary: `text-display-large` (57px) - "Every tuition centre"
- Secondary: `text-headline-large` (32px) - "in Singapore"
- Subtext: `text-title-large` (22px)

**Section Headlines:**
- Desktop: `text-headline-medium` (28px)
- Mobile: `text-title-large` (22px)

**Body Text:**
- Desktop: `text-body-large` (16px)
- Mobile: `text-body-medium` (14px)

### Color Palette (M3 Extended)

**Existing M3 Colors:**
- Primary: `#4A6B5C` (muted green)
- Surface: `#FEF7FF` (light purple-tinted)
- Containers: Various surface levels

**New Accent Colors for Sections:**
- Hero gradient: `primary-container` to `secondary-container`
- Comparison negative: `error-container` (#FFDAD6)
- Comparison positive: `primary-container` (#C8E6D4)
- Trust section: `tertiary-container` (#BEE9F8)

### Elevation & Depth

**Section Backgrounds:**
- Hero: gradient overlay on animated background
- Filter: `surface-container-high` with `elevation-1`
- How It Works: `surface` with `elevation-0`
- Comparison: split background (muted left, vibrant right)
- Trust: `surface-container` with `elevation-1`
- Waitlist: `primary-container` with `elevation-2`

## Component Designs

### 1. Hero Section (Desktop Only)

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│     EVERY TUITION CENTRE           │
│     IN SINGAPORE                    │
│                                     │
│     No ads. No jumping.             │
│     Just search.                    │
│                                     │
│     [2,000+ centres] [Trusted]     │
│                                     │
│     ↓ Start searching               │
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Headline: `fade-in-fwd` with stagger (0s, 0.2s)
- Subtext: `slide-in-bottom` (0.4s delay)
- Stats: `scale-in-center` (0.6s delay)
- Scroll indicator: `pulsate-fwd` (infinite)

**Mobile Adaptation:**
- Removed entirely OR
- Ultra-compact version (40px): "Every centre in Singapore" only

### 2. Filter Section (Primary on Mobile)

**Desktop Layout:**
- 3-column: Poll (25%) | Filter (50%) | Waitlist (25%)
- Maintains current structure
- Enhanced animations on filter selection

**Mobile Layout (CRITICAL):**
```
Header: 60px (logo + tagline)
Poll: 120px (compact card)
Filter: flex-1 (scrollable internally)
  - Steps: 40px each (collapsed)
  - Expanded: shows options (scrollable)
Apply: 60px (fixed button)
FAB: floating (50px)
```

**Enhancements:**
- Filter step expansion: `swing-in-top-fwd`
- Chip selection: `scale-in-center` + haptic feedback
- Apply button: `pulsate-fwd` when enabled
- Completion: `jello-horizontal` on checkmarks

### 3. How It Works Section (Desktop Only)

**Layout:**
```
┌─────────────────────────────────────┐
│        How It Works                 │
│                                     │
│  ┌─────┐    ┌─────┐    ┌─────┐    │
│  │  1  │    │  2  │    │  3  │    │
│  │ 🔍  │ →  │ 📋  │ →  │ ✓   │    │
│  │     │    │     │    │     │    │
│  └─────┘    └─────┘    └─────┘    │
│  Filter     Browse     Choose      │
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Section title: `fade-in-fwd` on scroll
- Steps: `slide-in-bottom` staggered (0.1s, 0.2s, 0.3s)
- Icons: `scale-in-center` after step appears
- Arrows: `fade-in-fwd` between steps

**Icons:**
- Step 1: Filter/funnel icon
- Step 2: List/grid icon  
- Step 3: Checkmark/star icon

### 4. Comparison Section (Desktop Only)

**Layout:**
```
┌─────────────────────────────────────┐
│     Traditional    vs    Podsee     │
│                                     │
│  ┌──────────────┐   ┌──────────────┐
│  │ ❌ Multiple  │   │ ✅ One       │
│  │    websites  │   │    platform  │
│  │              │   │              │
│  │ ❌ Ads       │   │ ✅ No ads    │
│  │    everywhere│   │              │
│  │              │   │              │
│  │ ❌ Incomplete│   │ ✅ Complete  │
│  │    info      │   │    database  │
│  │              │   │              │
│  │ ❌ Time-     │   │ ✅ Filter    │
│  │    consuming │   │    once      │
│  └──────────────┘   └──────────────┘
│                                     │
└─────────────────────────────────────┘
```

**Visual Treatment:**
- Left card: muted colors, `error-container` background
- Right card: vibrant colors, `primary-container` background
- Divider: "vs" in large text with gradient

**Animations:**
- Cards: `slide-in-elliptic-top-fwd` from opposite sides
- Items: `fade-in-fwd` staggered within each card
- Icons: `scale-in-center` with color pulse

### 5. Trust Section (Desktop Only)

**Layout:**
```
┌─────────────────────────────────────┐
│      Trusted by Parents             │
│                                     │
│   ┌─────┐  ┌─────┐  ┌─────┐       │
│   │2000+│  │5000+│  │ 4.8 │       │
│   │     │  │     │  │ ⭐⭐⭐│       │
│   └─────┘  └─────┘  └─────┘       │
│   Centres  Searches  Rating        │
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Numbers: Count-up animation from 0
- Stars: `scale-in-center` sequentially
- Cards: `bounce-in-top` on scroll

### 6. Waitlist Section

**Desktop:**
- Full-width card with gradient background
- Form on left, benefits list on right
- Prominent CTA button

**Mobile:**
- Floating FAB only (existing)
- Opens bottom sheet with form

## Animation Choreography

### Page Load Sequence

**Desktop:**
1. Hero headline: 0s - `fade-in-fwd`
2. Hero subtext: 0.2s - `slide-in-bottom`
3. Hero stats: 0.4s - `scale-in-center`
4. Filter section: 0.6s - `slide-in-bottom`
5. Scroll indicator: 0.8s - `pulsate-fwd`

**Mobile:**
1. Header: 0s - `fade-in-fwd`
2. Poll: 0.2s - `slide-in-bottom`
3. Filter steps: 0.4s, 0.5s, 0.6s - `slide-in-bottom` staggered
4. Apply button: 0.7s - `slide-in-bottom`
5. FAB: 0.8s - `pulsate-fwd`

### Scroll-Triggered Animations (Desktop Only)

**Trigger Point:** When section is 20% visible in viewport

**How It Works:**
- Threshold: 20% visibility
- Animation: `slide-in-bottom` for cards
- Stagger: 100ms between elements

**Comparison:**
- Threshold: 30% visibility
- Animation: `slide-in-elliptic-top-fwd` from sides
- Stagger: 200ms between cards

**Trust:**
- Threshold: 40% visibility
- Animation: Count-up for numbers
- Duration: 1000ms with easing

### Interaction Animations

**Filter Selection:**
- Chip click: `scale-in-center` (200ms)
- Step completion: `jello-horizontal` on checkmark
- Apply button enable: `pulsate-fwd` starts

**Form Submission:**
- Button: `scale-in-center` to loading spinner
- Success: `jello-horizontal` checkmark
- Message: `slide-in-bottom`

## Mobile-Specific Design

### Viewport Breakdown

```css
/* Mobile viewport allocation */
height: 100vh (100dvh for iOS)
├── Header: 60px (8%)
├── Poll: 120px (15%)
├── Filter: calc(100vh - 300px) (62%)
│   └── Internal scroll only
├── Apply: 60px (8%)
└── FAB: 50px floating (7%)
```

### Compact Components

**Header:**
- Logo: 28px (down from 32px)
- Text: `text-body-small`
- No subtitle

**Poll:**
- Padding: 8px (down from 12px)
- Title: `text-title-small`
- Options: `text-body-small`
- Radio: 16px (down from 20px)

**Filter Steps:**
- Collapsed height: 40px
- Icon: 24px
- Text: `text-title-small`
- Chips: `text-label-small`

### Performance Optimizations

**Mobile-Specific:**
- Disable parallax effects
- Reduce animation complexity
- Use `will-change` sparingly
- Lazy-load images
- Debounce scroll listeners (desktop only)

## Implementation Notes

### CSS Architecture

```css
/* Desktop sections */
.section {
  min-height: 60vh;
  scroll-snap-align: start;
}

/* Mobile viewport lock */
@media (max-width: 1023px) {
  html, body {
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    position: fixed;
  }
}

/* Scroll-triggered animations */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s ease-out;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Component Files

**New Components:**
- `HeroSection.jsx` (desktop only)
- `HowItWorksSection.jsx` (desktop only)
- `ComparisonSection.jsx` (desktop only)
- `TrustSection.jsx` (desktop only)
- `ScrollProgress.jsx` (desktop only)

**Modified Components:**
- `page.jsx` - Add new sections with responsive logic
- `PageShell.jsx` - Update for section-based layout
- `Header.jsx` - Compact mobile variant
- `PollSection.jsx` - Compact mobile variant
- `FilterWizard.jsx` - Enhanced animations
- `WaitlistCTA.jsx` - Desktop card variant

### Scroll Detection (Desktop Only)

```javascript
// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);
```

## Accessibility

### Keyboard Navigation
- All sections keyboard accessible
- Skip links for desktop sections
- Focus management in modals

### Screen Readers
- Semantic HTML structure
- ARIA labels for decorative elements
- Descriptive alt text for icons

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    transition: none;
    opacity: 1;
    transform: none;
  }
  
  .pulsate-fwd,
  .jello-horizontal {
    animation: none;
  }
}
```

## Testing Strategy

### Visual Regression
- Screenshot tests for each section
- Mobile vs desktop layouts
- Animation states

### Performance
- Lighthouse score > 90
- FPS monitoring during animations
- Mobile performance profiling

### Cross-Browser
- Chrome, Firefox, Safari
- iOS Safari (viewport height)
- Android Chrome

### Responsive
- Test at breakpoints: 375px, 768px, 1024px, 1440px
- Verify mobile viewport lock
- Test filter scrolling on mobile

## Future Enhancements

### Phase 2 (Post-Launch)
- A/B test section order
- Add video backgrounds (desktop hero)
- Interactive Singapore map
- Testimonial carousel
- Dark mode support

### Phase 3 (Advanced)
- Parallax scrolling effects
- 3D card transforms
- Lottie animations
- Micro-interactions library
- Advanced scroll storytelling

## Success Metrics

### User Engagement
- Time on page increase
- Filter completion rate
- Scroll depth (desktop)
- Waitlist conversion rate

### Technical
- Page load time < 2s
- Animation FPS = 60
- Mobile viewport stability
- Zero layout shifts

