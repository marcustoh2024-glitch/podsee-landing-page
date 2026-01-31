# Requirements Document: Enhanced Landing Page Redesign

## Introduction

This specification defines the redesign of the Podsee landing page to create a premium, modern web experience inspired by contemporary design trends while maintaining the core functionality of helping parents find tuition centres in Singapore. The redesign will transform the current simple layout into a sophisticated, multi-section landing page with advanced animations and interactions.

## Glossary

- **Hero Section**: The first viewport section containing the primary value proposition and main call-to-action
- **Filter Wizard**: The multi-step interface for selecting location, level, and subject
- **Scroll-Triggered Animation**: Animations that activate when elements enter the viewport during scrolling
- **One-Viewport Lock**: Mobile design constraint where content fits within a single screen height without scrolling
- **M3**: Material Design 3 - Google's design system
- **Animista**: CSS animation library providing pre-built animation effects
- **Section**: A distinct content area on the landing page (Hero, How It Works, Comparison, etc.)

## Requirements

### Requirement 1: Hero Section Redesign

**User Story:** As a parent visiting the site, I want to immediately understand what Podsee offers and how to start my search, so that I can quickly determine if this service meets my needs.

#### Acceptance Criteria

1. WHEN a user lands on the homepage THEN the system SHALL display a full-viewport hero section with a clear value proposition
2. WHEN the hero section loads THEN the system SHALL animate the headline and subheadline with staggered entrance animations
3. THE hero section SHALL contain a prominent, animated search/filter entry point
4. WHEN a user scrolls down THEN the hero section SHALL smoothly transition to the next section
5. THE hero section SHALL display trust indicators (e.g., "2,000+ centres" or "Trusted by X parents")
6. ON mobile devices THEN the hero section SHALL maintain the one-viewport lock constraint
7. THE hero section SHALL include a subtle animated background element (gradient or geometric shapes)

### Requirement 2: "How It Works" Section

**User Story:** As a parent new to the platform, I want to understand the search process in simple steps, so that I feel confident using the service.

#### Acceptance Criteria

1. WHEN a user scrolls to the "How It Works" section THEN the system SHALL display 3 clear steps with icons
2. WHEN each step enters the viewport THEN the system SHALL animate it with a slide-in or fade-in effect
3. THE steps SHALL be: (1) Filter your needs, (2) Browse all centres, (3) Make your choice
4. EACH step SHALL include an icon, title, and brief description
5. ON mobile devices THEN the steps SHALL stack vertically with appropriate spacing
6. ON desktop devices THEN the steps SHALL display horizontally in a row
7. THE section SHALL use scroll-triggered animations from Animista library

### Requirement 3: Comparison Section

**User Story:** As a parent, I want to understand how Podsee differs from traditional search methods, so that I can see the value of using this platform.

#### Acceptance Criteria

1. WHEN a user scrolls to the comparison section THEN the system SHALL display a side-by-side comparison
2. THE comparison SHALL contrast "Traditional Search" vs "Podsee"
3. THE left side SHALL list pain points: "Multiple websites", "Ads everywhere", "Incomplete info", "Time-consuming"
4. THE right side SHALL list benefits: "One platform", "No ads", "Complete database", "Filter once"
5. WHEN the section enters viewport THEN the system SHALL animate the comparison with a slide or reveal effect
6. THE section SHALL use contrasting visual treatments (e.g., muted colors for traditional, vibrant for Podsee)
7. ON mobile devices THEN the comparison SHALL stack vertically or use a toggle/tab interface

### Requirement 4: Poll Interaction

**User Story:** As a parent, I want to participate in a poll that feels observational and trustworthy, so that I can see how others make decisions without feeling manipulated.

#### Acceptance Criteria

1. WHEN the poll is displayed THEN the system SHALL show both options with equal visual weight and size
2. WHEN a user selects an option THEN the system SHALL dim the non-selected option to reduce visual emphasis
3. WHEN a user selects an option THEN the system SHALL move only the divider between options to reflect the percentage distribution
4. THROUGHOUT all poll states THEN both options SHALL retain their original size without shrinking or growing
5. THROUGHOUT all poll states THEN both options SHALL maintain constant colors regardless of vote distribution
6. WHEN the divider moves THEN the system SHALL animate the movement smoothly over 700ms with ease-in-out timing
7. WHEN percentages are revealed THEN the system SHALL fade them in after the divider animation completes
8. THE poll SHALL feel observational and neutral, not competitive or persuasive

### Requirement 5: Enhanced Filter Wizard Section

**User Story:** As a parent, I want an engaging and intuitive filter experience, so that finding the right tuition centre feels effortless.

#### Acceptance Criteria

1. WHEN a user reaches the filter section THEN the system SHALL display the filter wizard with enhanced animations
2. WHEN a filter step is expanded THEN the system SHALL animate the expansion with smooth easing
3. WHEN a user selects a filter option THEN the system SHALL provide immediate visual feedback with animation
4. THE filter wizard SHALL maintain M3 design principles with enhanced micro-interactions
5. WHEN all filters are selected THEN the "Apply" button SHALL pulse or glow to draw attention
6. THE filter section SHALL include the informational header from current design
7. ON mobile devices THEN the filter wizard SHALL remain scrollable within its container while page stays locked

### Requirement 6: Social Proof / Trust Section

**User Story:** As a parent, I want to see evidence that others trust this platform, so that I feel confident using it.

#### Acceptance Criteria

1. WHEN a user scrolls to the trust section THEN the system SHALL display trust indicators
2. THE section SHALL include statistics: number of centres, number of searches, or user testimonials
3. WHEN statistics enter viewport THEN the system SHALL animate numbers counting up from 0
4. IF testimonials are included THEN the system SHALL display them in a carousel or grid
5. THE section SHALL use subtle animations to draw attention without being distracting
6. ON mobile devices THEN statistics SHALL stack vertically with appropriate spacing

### Requirement 7: Waitlist CTA Section

**User Story:** As a parent interested in the platform, I want a clear way to join the waitlist, so that I can be notified when the service launches.

#### Acceptance Criteria

1. WHEN a user scrolls to the bottom THEN the system SHALL display a prominent waitlist CTA
2. THE CTA section SHALL have a distinct visual treatment (background color, gradient, or card)
3. WHEN the section enters viewport THEN the system SHALL animate the CTA with emphasis
4. THE section SHALL include the existing waitlist form functionality
5. ON mobile devices THEN the floating FAB SHALL remain for quick access
6. THE section SHALL include a brief value statement about early access or benefits

### Requirement 8: Scroll Behavior and Navigation (Desktop Only)

**User Story:** As a desktop user, I want smooth scrolling between sections and clear navigation, so that I can easily explore the page.

#### Acceptance Criteria

1. ON desktop devices WHEN a user scrolls THEN the system SHALL provide smooth scroll behavior between sections
2. ON desktop devices WHEN a user scrolls down THEN the system SHALL show a "back to top" button after passing the hero section
3. ON desktop devices THE system SHALL implement scroll-triggered animations for all major sections
4. WHEN animations trigger THEN the system SHALL respect prefers-reduced-motion settings
5. ON desktop THEN the system SHALL optionally include a sticky navigation or progress indicator
6. ON desktop THE scroll experience SHALL feel fluid with appropriate easing functions
7. ON mobile devices THEN scrolling SHALL be disabled and the page SHALL remain locked to one viewport

### Requirement 9: Mobile One-Viewport Constraint

**User Story:** As a mobile user, I want the landing page to fit in one viewport without scrolling, so that the experience feels focused and app-like.

#### Acceptance Criteria

1. ON mobile devices THEN the landing page SHALL be strictly non-scrollable and fit within one viewport
2. THE mobile layout SHALL prioritize the most essential elements: Hero message, Filter Wizard, and Waitlist CTA
3. THE poll section SHALL remain visible on mobile as a compact element
4. THE filter wizard SHALL remain fully functional within the locked viewport with internal scrolling only
5. THE floating FAB SHALL remain visible and accessible
6. ADDITIONAL sections (How It Works, Comparison, Trust) SHALL be desktop-only or accessible via modals/sheets on mobile
7. THE mobile experience SHALL maintain all animations in a performance-optimized manner within the viewport constraint

### Requirement 10: Performance and Loading

**User Story:** As a user, I want the page to load quickly and animations to run smoothly, so that the experience feels premium and responsive.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL display the hero section within 2 seconds
2. THE system SHALL lazy-load below-the-fold sections and images
3. WHEN animations run THEN the system SHALL maintain 60fps performance
4. THE system SHALL use CSS animations over JavaScript where possible for performance
5. THE system SHALL optimize animation complexity for mobile devices
6. WHEN reduced motion is preferred THEN the system SHALL disable decorative animations while maintaining functionality

### Requirement 10: Design System Consistency

**User Story:** As a user, I want the redesigned landing page to feel cohesive with the existing M3 design system, so that the experience is consistent.

#### Acceptance Criteria

1. THE redesigned page SHALL use the existing M3 color palette (muted green primary)
2. THE page SHALL use Roboto and Roboto Flex fonts from the M3 type scale
3. THE page SHALL use M3 elevation levels for shadows and depth
4. THE page SHALL use M3 motion curves (emphasized, standard, decelerate, accelerate)
5. THE page SHALL integrate Animista animations that complement M3 motion principles
6. THE page SHALL maintain the existing component styles (buttons, cards, inputs) where applicable
7. THE page SHALL use the existing state layer system for interactive elements

## Design Considerations

### Visual Hierarchy
- Hero section should be the most prominent
- Each section should have clear visual separation
- Typography scale should guide user attention
- White space should create breathing room

### Animation Strategy
- Entrance animations: slide-in-bottom, fade-in-fwd
- Emphasis animations: scale-in-center, pulsate-fwd
- Success states: jello-horizontal
- Scroll-triggered: staggered delays for sequential elements

### Mobile-First Approach
- Design sections for mobile first
- Enhance for desktop with additional space and effects
- Maintain one-viewport hero on mobile
- Allow scrolling for additional sections

### Accessibility
- All animations respect prefers-reduced-motion
- Color contrast meets WCAG AA standards
- Interactive elements have clear focus states
- Content is keyboard navigable

## Out of Scope

- Results page redesign (separate spec)
- Centre detail pages (separate spec)
- User authentication/accounts
- Backend API changes
- Analytics implementation
- A/B testing framework
