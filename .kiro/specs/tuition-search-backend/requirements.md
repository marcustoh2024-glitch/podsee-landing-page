# Requirements Document

## Introduction

This document specifies the requirements for a backend API and database system that enables users to search and filter tuition centres. The system will store tuition centre information including contact details, location, and educational offerings, and provide API endpoints for searching and filtering this data.

## Glossary

- **Tuition_Centre**: An educational institution offering tutoring services
- **API**: Application Programming Interface for backend communication
- **Database**: Persistent storage system for tuition centre data
- **Filter**: A mechanism to narrow search results based on specific criteria
- **Level**: Educational level (e.g., Primary, Secondary, JC)
- **Subject**: Academic subject offered by the tuition centre
- **WhatsApp_API**: External service for initiating WhatsApp conversations

## Requirements

### Requirement 1: Store Tuition Centre Data

**User Story:** As a system administrator, I want to store comprehensive tuition centre information in a database, so that users can search and access centre details.

#### Acceptance Criteria

1. THE Database SHALL store tuition centre name as a required text field
2. THE Database SHALL store location information as a required text field
3. THE Database SHALL store WhatsApp contact number as a required text field
4. THE Database SHALL store website URL as an optional text field
5. THE Database SHALL store multiple educational levels per tuition centre
6. THE Database SHALL store multiple subjects per tuition centre
7. THE Database SHALL maintain referential integrity between tuition centres and their offerings

### Requirement 2: Search Tuition Centres

**User Story:** As a user, I want to search for tuition centres by name or location, so that I can find relevant centres quickly.

#### Acceptance Criteria

1. WHEN a user provides a search query, THE API SHALL return tuition centres matching the name or location
2. WHEN a search query is empty, THE API SHALL return all tuition centres
3. THE API SHALL perform case-insensitive search matching
4. THE API SHALL return results sorted by relevance or alphabetically by name
5. WHEN no matches are found, THE API SHALL return an empty result set with appropriate status

### Requirement 3: Filter by Educational Level

**User Story:** As a user, I want to filter tuition centres by educational level, so that I can find centres offering my required level.

#### Acceptance Criteria

1. WHEN a user selects one or more educational levels, THE API SHALL return only centres offering those levels
2. WHEN multiple levels are selected, THE API SHALL return centres offering any of the selected levels
3. THE API SHALL support common educational levels (Primary, Secondary, Junior College, IB, IGCSE)
4. WHEN no level filter is applied, THE API SHALL return centres of all levels

### Requirement 4: Filter by Subject

**User Story:** As a user, I want to filter tuition centres by subject, so that I can find centres teaching specific subjects.

#### Acceptance Criteria

1. WHEN a user selects one or more subjects, THE API SHALL return only centres offering those subjects
2. WHEN multiple subjects are selected, THE API SHALL return centres offering any of the selected subjects
3. THE API SHALL support common subjects (Mathematics, Science, English, Chinese, Physics, Chemistry, Biology, etc.)
4. WHEN no subject filter is applied, THE API SHALL return centres offering all subjects

### Requirement 5: Combine Search and Filters

**User Story:** As a user, I want to apply multiple filters simultaneously with search, so that I can narrow down results precisely.

#### Acceptance Criteria

1. WHEN a user applies both search query and filters, THE API SHALL return centres matching all criteria
2. THE API SHALL apply filters using AND logic between different filter types
3. THE API SHALL apply filters using OR logic within the same filter type
4. WHEN combined filters return no results, THE API SHALL return an empty result set

### Requirement 6: Retrieve Tuition Centre Details

**User Story:** As a user, I want to view complete details of a tuition centre, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN a user requests a specific tuition centre by ID, THE API SHALL return all stored information
2. THE API SHALL include centre name, location, WhatsApp number, website, levels, and subjects
3. WHEN a requested centre ID does not exist, THE API SHALL return a 404 error with appropriate message
4. THE API SHALL format the response in a consistent JSON structure

### Requirement 7: WhatsApp Integration

**User Story:** As a user, I want to contact tuition centres via WhatsApp, so that I can inquire about their services easily.

#### Acceptance Criteria

1. THE API SHALL provide WhatsApp contact numbers in a format compatible with WhatsApp API
2. THE API SHALL generate WhatsApp deep links using the format `https://wa.me/{number}`
3. WHEN a WhatsApp number is stored, THE API SHALL validate it contains only digits and country code
4. THE API SHALL strip formatting characters from phone numbers before storage

### Requirement 8: Website Redirection

**User Story:** As a user, I want to visit tuition centre websites, so that I can learn more about their offerings.

#### Acceptance Criteria

1. WHEN a tuition centre has a website, THE API SHALL return the complete URL
2. THE API SHALL validate website URLs follow proper format (http:// or https://)
3. WHEN a tuition centre has no website, THE API SHALL return null for the website field
4. THE API SHALL not modify or redirect website URLs

### Requirement 9: API Performance and Reliability

**User Story:** As a developer, I want the API to respond quickly and reliably, so that users have a smooth experience.

#### Acceptance Criteria

1. THE API SHALL respond to search requests within 500ms under normal load
2. THE API SHALL handle at least 100 concurrent requests without degradation
3. WHEN database connection fails, THE API SHALL return a 503 error with appropriate message
4. THE API SHALL implement proper error handling for all endpoints
5. THE API SHALL log errors for debugging and monitoring

### Requirement 10: Data Validation

**User Story:** As a system administrator, I want data to be validated before storage, so that the database maintains data quality.

#### Acceptance Criteria

1. WHEN creating or updating a tuition centre, THE API SHALL validate all required fields are present
2. THE API SHALL reject requests with invalid phone number formats
3. THE API SHALL reject requests with invalid URL formats for websites
4. WHEN validation fails, THE API SHALL return a 400 error with specific validation messages
5. THE API SHALL sanitize input data to prevent injection attacks
