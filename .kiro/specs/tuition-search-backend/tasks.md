# Implementation Plan: Tuition Search Backend

## Overview

This plan implements a backend API and database system for searching and filtering tuition centres using Next.js 14 App Router, Prisma ORM, and PostgreSQL. The implementation follows an incremental approach, building the database layer first, then the service layer, and finally the API routes with comprehensive testing throughout.

## Tasks

- [x] 1. Set up Prisma and database schema
  - Install Prisma dependencies (`prisma`, `@prisma/client`)
  - Initialize Prisma with `npx prisma init`
  - Create database schema in `prisma/schema.prisma` with TuitionCentre, Level, Subject models and join tables
  - Configure database connection for PostgreSQL (production) and SQLite (development)
  - Add indexes on name and location fields for search optimization
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [-] 2. Create Prisma client singleton and seed data
  - Create `src/lib/prisma.js` with singleton pattern to avoid multiple instances
  - Create `prisma/seed.js` with sample tuition centre data
  - Add seed script to package.json
  - Run initial migration with `npx prisma migrate dev`
  - Seed database with sample data
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 3. Implement tuition centre service layer
  - [ ] 3.1 Create service class structure
    - Create `src/lib/services/tuitionCentreService.js`
    - Implement TuitionCentreService class with Prisma client injection
    - _Requirements: 2.1, 4.1, 6.1_

  - [ ] 3.2 Implement search and filter logic
    - Implement `searchTuitionCentres` method with search, level, and subject filters
    - Build Prisma where clauses for search (name OR location, case-insensitive)
    - Build level filter with OR logic within levels
    - Build subject filter with OR logic within subjects
    - Combine filters with AND logic between filter types
    - Implement pagination logic
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 4.1, 5.1, 5.2_

  - [ ] 3.3 Implement WhatsApp link formatting
    - Create `formatWhatsAppLink` helper method
    - Strip non-digit characters except leading '+'
    - Generate `https://wa.me/{number}` format
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 3.4 Implement get by ID method
    - Implement `getTuitionCentreById` method
    - Include related levels and subjects
    - Format WhatsApp link in response
    - Throw not found error for invalid IDs
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 3.5 Write property test for search matching
    - **Property 1: Search returns matching centres**
    - **Validates: Requirements 2.1, 2.3**
    - Generate random search terms and verify all results contain term in name or location

  - [ ] 3.6 Write property test for level filtering
    - **Property 3: Level filter returns only matching centres**
    - **Validates: Requirements 3.1, 3.2**
    - Generate random level sets and verify all results have matching levels

  - [ ] 3.7 Write property test for subject filtering
    - **Property 4: Subject filter returns only matching centres**
    - **Validates: Requirements 4.1, 4.2**
    - Generate random subject sets and verify all results have matching subjects

  - [ ] 3.8 Write property test for combined filters
    - **Property 5: Combined filters use AND logic between types**
    - **Validates: Requirements 5.1, 5.2**
    - Generate random filter combinations and verify AND logic

  - [ ] 3.9 Write property test for WhatsApp link format
    - **Property 6: WhatsApp link format is valid**
    - **Validates: Requirements 7.1, 7.2, 7.4**
    - Generate random phone numbers and verify link format

- [ ] 4. Checkpoint - Ensure service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement API route for search and filter
  - [ ] 5.1 Create search endpoint route handler
    - Create `src/app/api/tuition-centres/route.js`
    - Implement GET handler for search and filter
    - Parse query parameters (search, levels, subjects, page, limit)
    - Validate query parameters (page >= 1, limit <= 100)
    - Call tuitionCentreService.searchTuitionCentres
    - Format response with data and pagination metadata
    - _Requirements: 2.1, 2.2, 3.1, 4.1, 5.1_

  - [ ] 5.2 Implement error handling for search endpoint
    - Wrap handler in try-catch block
    - Return 400 for validation errors with descriptive messages
    - Return 500 for database errors
    - Log errors with context
    - _Requirements: 9.4, 10.4_

  - [ ] 5.3 Write unit tests for search endpoint
    - Test query parameter parsing
    - Test validation error responses
    - Test successful search responses
    - Test pagination metadata
    - _Requirements: 2.1, 2.2, 5.1_

  - [ ] 5.4 Write property test for pagination consistency
    - **Property 8: Pagination consistency**
    - **Validates: Requirements 2.4**
    - Generate random page and limit values and verify result count and metadata

- [ ] 6. Implement API route for get by ID
  - [ ] 6.1 Create get by ID endpoint route handler
    - Create `src/app/api/tuition-centres/[id]/route.js`
    - Implement GET handler for ID lookup
    - Validate ID parameter format
    - Call tuitionCentreService.getTuitionCentreById
    - Format response with all centre details
    - _Requirements: 6.1, 6.2_

  - [ ] 6.2 Implement error handling for get by ID endpoint
    - Return 404 for not found centres
    - Return 400 for invalid ID format
    - Return 500 for database errors
    - _Requirements: 6.3, 9.4_

  - [ ] 6.3 Write property test for ID lookup
    - **Property 9: ID lookup returns single or none**
    - **Validates: Requirements 6.1, 6.3**
    - Verify ID lookups return exactly one or 404 error

  - [ ] 6.4 Write property test for required fields
    - **Property 10: Required fields are always present**
    - **Validates: Requirements 1.1, 1.2, 1.3, 10.1**
    - Verify name, location, whatsappNumber are always non-null and non-empty

- [ ] 7. Implement input validation and sanitization
  - [ ] 7.1 Add phone number validation
    - Create validation helper for phone numbers
    - Validate format contains only digits and optional leading '+'
    - Sanitize by stripping formatting characters
    - _Requirements: 7.3, 7.4, 10.2_

  - [ ] 7.2 Add URL validation
    - Create validation helper for website URLs
    - Validate URLs start with http:// or https://
    - Return validation errors for invalid formats
    - _Requirements: 8.2, 10.3_

  - [ ] 7.3 Write property test for phone number sanitization
    - **Property 12: Phone number sanitization**
    - **Validates: Requirements 7.4, 10.2**
    - Generate random phone numbers with formatting and verify sanitization

  - [ ] 7.4 Write property test for URL validation
    - **Property 7: Website URL validation**
    - **Validates: Requirements 8.2**
    - Generate random URLs and verify validation

- [ ] 8. Add edge case handling and tests
  - [ ] 8.1 Write unit test for empty search
    - Test that empty search returns all centres
    - **Validates: Requirements 2.2**

  - [ ] 8.2 Write unit test for no matches
    - Test that non-matching filters return empty array with total 0
    - **Property 11: Filter with no matches returns empty array**
    - **Validates: Requirements 2.5, 5.4**

  - [ ] 8.3 Write unit test for missing website
    - Test that centres without websites return null for website field
    - **Validates: Requirements 8.3**

  - [ ] 8.4 Write unit test for no filters applied
    - Test that no level/subject filters return all centres
    - **Validates: Requirements 3.4, 4.4**

- [ ] 9. Final checkpoint and integration testing
  - [ ] 9.1 Run all tests and verify passing
    - Run unit tests
    - Run property-based tests
    - Verify all 12 properties pass
    - _Requirements: All_

  - [ ] 9.2 Write integration tests
    - Test full API flow from HTTP request to database
    - Test with real test database
    - Test error scenarios end-to-end
    - _Requirements: 2.1, 6.1, 9.4_

  - [ ] 9.3 Update documentation
    - Add API endpoint documentation to README
    - Document environment variables needed
    - Document how to run migrations and seed data
    - _Requirements: All_

## Notes

- All tasks including tests are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- Service layer is tested independently before API routes
- Database schema uses PostgreSQL for production, SQLite for development
- Prisma handles SQL injection prevention automatically
