# Implementation Plan: Community Discussion Forum

## Overview

This implementation plan breaks down the community discussion feature into discrete, actionable coding tasks. Each task builds incrementally on previous work, with property-based tests integrated throughout to catch errors early. The plan follows the existing Next.js + Prisma architecture and coding patterns established in the codebase.

## Tasks

- [ ] 1. Set up database schema and migrations
  - Create Prisma schema for User, DiscussionThread, and Comment models
  - Add UserRole enum (PARENT, CENTRE, ADMIN)
  - Configure foreign key relationships and constraints
  - Create and run database migration
  - Update TuitionCentre model to include discussionThread relation
  - _Requirements: 1.4, 2.1, 2.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 1.1 Write property test for schema constraints
  - **Property 24: Invalid thread foreign keys are rejected**
  - **Property 25: Invalid centre foreign keys are rejected**
  - **Validates: Requirements 9.3, 9.4**

- [ ] 2. Implement AuthService for user authentication
  - [ ] 2.1 Create AuthService class with password hashing
    - Implement hashPassword() using bcrypt
    - Implement authenticate() for email/password login
    - Implement validateSession() for JWT token validation
    - Generate JWT tokens with user ID and role
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 2.2 Write property tests for authentication
    - **Property 1: Valid credentials create or retrieve user**
    - **Property 2: Successful authentication issues token**
    - **Property 3: Valid tokens authorize write operations**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ] 2.3 Write unit tests for AuthService
    - Test specific login scenarios (valid, invalid password, non-existent user)
    - Test token expiration handling
    - Test password hashing security
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement DiscussionService for thread and comment management
  - [ ] 3.1 Create DiscussionService class with core methods
    - Implement getOrCreateThread() to ensure one thread per centre
    - Implement getComments() to retrieve non-hidden comments ordered chronologically
    - Implement createComment() with validation and sanitization
    - Implement hideComment() for moderation
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 4.5, 6.1, 6.3_

  - [ ] 3.2 Write property tests for thread management
    - **Property 4: One thread per centre invariant**
    - **Property 5: Thread retrieval returns correct thread**
    - **Property 6: Threads cannot be deleted**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [ ] 3.3 Write property tests for comment display
    - **Property 7: Hidden comments are excluded**
    - **Property 8: Comments are chronologically ordered**
    - **Property 9: Anonymous comments hide author identity**
    - **Validates: Requirements 3.1, 3.2, 3.3, 6.2, 8.2**

  - [ ] 3.4 Write property tests for comment creation
    - **Property 10: Valid comments are stored**
    - **Property 11: Anonymity preference is respected**
    - **Property 12: Whitespace-only comments are rejected**
    - **Property 13: HTML and scripts are sanitized**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

  - [ ] 3.5 Write property tests for centre accounts
    - **Property 14: Centre comments store correct role**
    - **Property 15: Centres cannot post anonymously**
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ] 3.6 Write property tests for moderation
    - **Property 16: Hiding sets flag**
    - **Property 17: Unhiding restores visibility**
    - **Property 18: Hiding preserves data**
    - **Validates: Requirements 6.1, 6.3, 6.4**

  - [ ] 3.7 Write property tests for privacy
    - **Property 19: Anonymous comments store author internally**
    - **Property 20: Admins can see anonymous authors**
    - **Property 21: Anonymous comments maintain referential integrity**
    - **Validates: Requirements 8.1, 8.3, 8.4**

  - [ ] 3.8 Write property tests for data integrity
    - **Property 22: Centre deletion preserves discussions**
    - **Property 23: User deletion preserves comments**
    - **Validates: Requirements 9.1, 9.2**

  - [ ] 3.9 Write unit tests for DiscussionService
    - Test specific edge cases (empty threads, single comment, many comments)
    - Test error conditions (invalid IDs, missing fields)
    - Test sanitization with specific XSS patterns
    - _Requirements: 2.1, 3.1, 4.1, 4.3, 4.5, 6.1_

- [ ] 4. Checkpoint - Ensure all service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement authentication API endpoint
  - [ ] 5.1 Create POST /api/auth/login route
    - Parse and validate request body (email, password)
    - Call AuthService.authenticate()
    - Return user data and JWT token
    - Handle authentication errors (401, 400, 500)
    - _Requirements: 1.1, 1.2_

  - [ ] 5.2 Write unit tests for login endpoint
    - Test successful login response format
    - Test invalid credentials error
    - Test missing fields error
    - Test malformed request body
    - _Requirements: 1.1, 1.2_

- [ ] 6. Implement discussion API endpoints
  - [ ] 6.1 Create GET /api/discussions/[centreId] route
    - Validate centre ID format (UUID)
    - Call DiscussionService.getOrCreateThread()
    - Call DiscussionService.getComments()
    - Format response with thread and comments
    - Handle errors (400, 404, 500)
    - Allow unauthenticated access
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.2 Create POST /api/discussions/[centreId] route
    - Validate authentication token (extract from Authorization header)
    - Validate request body (body, isAnonymous)
    - Reject centre accounts posting anonymously
    - Call DiscussionService.createComment()
    - Return created comment
    - Handle errors (400, 401, 403, 404, 500)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2_

  - [ ] 6.3 Create PATCH /api/discussions/[centreId]/[commentId] route
    - Validate authentication token and admin role
    - Validate request body (isHidden)
    - Call DiscussionService.hideComment()
    - Return updated comment
    - Handle errors (400, 401, 403, 404, 500)
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ] 6.4 Write property tests for discussion endpoints
    - Test GET endpoint returns correct data format for any valid centre
    - Test POST endpoint creates comments for any valid input
    - Test PATCH endpoint modifies only isHidden flag
    - **Validates: Requirements 3.1, 4.1, 6.1**

  - [ ] 6.5 Write unit tests for discussion endpoints
    - Test specific request/response formats
    - Test error responses (missing auth, invalid IDs)
    - Test unauthenticated read access
    - Test centre anonymous rejection
    - _Requirements: 3.4, 4.1, 5.2, 6.1_

- [ ] 7. Write integration tests for complete flows
  - Test end-to-end flow: login → create comment → read comments
  - Test moderation flow: create comment → hide → verify hidden
  - Test anonymous flow: create anonymous comment → verify author hidden
  - Test centre flow: centre login → create comment → verify role displayed
  - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 8.1_

- [ ] 8. Checkpoint - Ensure all API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create frontend components for discussion UI
  - [ ] 9.1 Create DiscussionPage component
    - Fetch discussion thread and comments on mount
    - Display centre name and tags at top
    - Render comments in chronological order
    - Show "Anonymous Parent" for anonymous comments
    - Display comment form if user is authenticated
    - Handle loading and error states
    - _Requirements: 3.1, 3.2, 3.3, 7.3, 7.4_

  - [ ] 9.2 Create CommentForm component
    - Input field for comment body
    - Checkbox for anonymous posting
    - Disable anonymous option for centre accounts
    - Validate input before submission
    - Show success/error feedback
    - Clear form after successful submission
    - _Requirements: 4.1, 4.2, 4.3, 5.2_

  - [ ] 9.3 Create CommentList component
    - Render list of comments
    - Display author name or "Anonymous Parent"
    - Display timestamp
    - Highlight centre comments with badge
    - Handle empty state (no comments yet)
    - _Requirements: 3.1, 3.2, 3.3, 5.3_

  - [ ]* 9.4 Write unit tests for frontend components
    - Test DiscussionPage renders correctly with data
    - Test CommentForm validation and submission
    - Test CommentList displays comments correctly
    - Test anonymous comment rendering
    - Test centre comment badge display
    - _Requirements: 3.3, 4.3, 5.3, 7.3, 7.4_

- [ ] 10. Integrate discussion link into tuition centre modal
  - [ ] 10.1 Add "Community Discussion" button to centre details modal
    - Position below WhatsApp and Website options
    - Link to /discussions/[centreId] page
    - Style consistently with existing buttons
    - _Requirements: 7.1, 7.2_

  - [ ]* 10.2 Write unit test for modal integration
    - Test button appears in correct position
    - Test navigation on click
    - _Requirements: 7.1, 7.2_

- [ ] 11. Create discussion page route
  - [ ] 11.1 Create /discussions/[centreId]/page.jsx
    - Render DiscussionPage component
    - Pass centreId from route params
    - Set page metadata (title, description)
    - Handle invalid centre IDs
    - _Requirements: 7.2, 7.3_

- [ ] 12. Add authentication context and hooks
  - [ ] 12.1 Create AuthContext for managing user session
    - Store current user and token in context
    - Provide login/logout functions
    - Persist token in localStorage
    - Validate token on app load
    - _Requirements: 1.2, 1.3_

  - [ ] 12.2 Create useAuth hook for components
    - Expose current user, isAuthenticated, login, logout
    - Simplify authentication checks in components
    - _Requirements: 1.3, 7.4_

  - [ ]* 12.3 Write unit tests for auth context
    - Test login updates context
    - Test logout clears context
    - Test token persistence
    - _Requirements: 1.2, 1.3_

- [ ] 13. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.
  - Manually test complete user flows in development environment
  - Verify all requirements are met

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- Both testing approaches are complementary and necessary for high confidence
