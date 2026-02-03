# Requirements Document

## Introduction

This document specifies the requirements for a community discussion feature that allows parents to ask questions and discuss tuition centres in Singapore. Each tuition centre has exactly one discussion thread where parents can post comments, ask questions, and receive replies from other parents or the centre itself. The system prioritizes calm, trustworthy interactions over social media-style engagement.

## Glossary

- **User**: Any person who accesses the system (authenticated or not)
- **Parent**: A user who has authenticated via email and can write comments
- **Centre_Account**: A tuition centre representative who has authenticated and can reply to comments
- **Admin**: The system administrator who can moderate content
- **Discussion_Thread**: A single, permanent comment section associated with one tuition centre
- **Comment**: A text-based message posted by a parent or centre in a discussion thread
- **Anonymous_Comment**: A comment where the author's identity is hidden in the UI but tracked internally
- **Hidden_Content**: Content that has been soft-deleted by an admin and is not visible to regular users

## Requirements

### Requirement 1: User Authentication

**User Story:** As a parent or tuition centre, I want to sign in using my email, so that I can participate in discussions.

#### Acceptance Criteria

1. WHEN a user provides a valid email and password, THE Authentication_System SHALL create or retrieve a user account
2. WHEN a user successfully authenticates, THE Authentication_System SHALL issue a session token
3. WHEN a user's session token is valid, THE Authentication_System SHALL allow write operations
4. THE Authentication_System SHALL distinguish between parent accounts and centre accounts using a role field

### Requirement 2: Discussion Thread Management

**User Story:** As a system, I want each tuition centre to have exactly one discussion thread, so that all conversations about a centre are centralized.

#### Acceptance Criteria

1. WHEN a tuition centre is created, THE Discussion_System SHALL automatically create one discussion thread for that centre
2. THE Discussion_System SHALL ensure that each tuition centre has exactly one discussion thread
3. WHEN a user views a tuition centre, THE Discussion_System SHALL retrieve the associated discussion thread
4. THE Discussion_System SHALL prevent deletion of discussion threads

### Requirement 3: Reading Discussions

**User Story:** As any user, I want to read comments about a tuition centre, so that I can learn from other parents' experiences.

#### Acceptance Criteria

1. WHEN a user views a discussion thread, THE Discussion_System SHALL display all non-hidden comments
2. THE Discussion_System SHALL order comments from oldest to newest
3. THE Discussion_System SHALL display anonymous comments with a generic label instead of the author's name
4. THE Discussion_System SHALL allow unauthenticated users to read comments

### Requirement 4: Writing Comments

**User Story:** As a parent, I want to post comments and questions about a tuition centre, so that I can share my experience or get information.

#### Acceptance Criteria

1. WHEN an authenticated parent submits a comment with valid text, THE Discussion_System SHALL create and store the comment
2. WHEN a parent submits a comment, THE Discussion_System SHALL allow the parent to choose anonymous or identified mode
3. IF a comment body is empty or contains only whitespace, THEN THE Discussion_System SHALL reject the comment
4. WHEN a comment is created, THE Discussion_System SHALL record the author, timestamp, and anonymity preference
5. THE Discussion_System SHALL sanitize comment text to prevent HTML or script injection

### Requirement 5: Centre Participation

**User Story:** As a tuition centre, I want to reply to parent comments, so that I can clarify information and engage with the community.

#### Acceptance Criteria

1. WHEN an authenticated centre account submits a comment, THE Discussion_System SHALL create and store the comment with the centre's identity
2. THE Discussion_System SHALL prevent centre accounts from posting anonymously
3. WHEN a centre comment is displayed, THE Discussion_System SHALL clearly indicate it is from the centre

### Requirement 6: Content Moderation

**User Story:** As an admin, I want to hide inappropriate comments, so that I can maintain a trustworthy community.

#### Acceptance Criteria

1. WHEN an admin marks a comment as hidden, THE Discussion_System SHALL set a hidden flag on that comment
2. WHEN retrieving comments for display, THE Discussion_System SHALL exclude comments where the hidden flag is true
3. WHEN an admin unhides a comment, THE Discussion_System SHALL set the hidden flag to false
4. THE Discussion_System SHALL preserve all comment data when hiding content

### Requirement 7: UI Integration

**User Story:** As a user, I want to access a centre's discussion from the centre details modal, so that I can easily find community feedback.

#### Acceptance Criteria

1. WHEN a user opens a tuition centre details modal, THE UI SHALL display a "Community Discussion" option below the WhatsApp and Website options
2. WHEN a user clicks the Community Discussion option, THE UI SHALL navigate to the discussion thread page
3. WHEN displaying a discussion thread, THE UI SHALL show the centre name and tags at the top
4. WHEN an authenticated user views a discussion thread, THE UI SHALL display a comment input form

### Requirement 8: Anonymous Identity Protection

**User Story:** As a parent, I want to post anonymously, so that I can share honest feedback without revealing my identity publicly.

#### Acceptance Criteria

1. WHEN a parent chooses to post anonymously, THE Discussion_System SHALL store the user ID internally but not expose it in public APIs
2. WHEN displaying an anonymous comment, THE UI SHALL show "Anonymous Parent" instead of the user's name
3. WHEN an admin views comments, THE Discussion_System SHALL reveal the true author of anonymous comments for moderation purposes
4. THE Discussion_System SHALL maintain the link between anonymous comments and user accounts

### Requirement 9: Data Integrity

**User Story:** As a system, I want to maintain referential integrity, so that the database remains consistent.

#### Acceptance Criteria

1. WHEN a tuition centre is deleted, THE Discussion_System SHALL preserve the associated discussion thread and comments
2. WHEN a user account is deleted, THE Discussion_System SHALL preserve their comments but mark the author as deleted
3. THE Discussion_System SHALL enforce foreign key constraints between comments and discussion threads
4. THE Discussion_System SHALL enforce foreign key constraints between discussion threads and tuition centres
