# Requirements Document

## Introduction

This document specifies the requirements for a community forum feature that allows parents to ask questions and discuss tuition centres in Singapore. Each tuition centre has exactly one discussion thread where parents can post comments, ask questions, and receive replies from other parents or the centre itself. The forum prioritizes calm, trustworthy interactions and word-of-mouth information sharing.

## Glossary

- **Forum_System**: The complete community discussion system
- **Discussion_Thread**: A single comment section permanently associated with one tuition centre
- **Comment**: A text-based message posted by a user in a discussion thread
- **Parent_User**: A user who browses and discusses tuition centres
- **Centre_User**: A user representing a tuition centre who can respond to discussions
- **Admin_User**: A user with moderation privileges (system administrator)
- **Anonymous_Mode**: A posting mode where the user's identity is hidden in the UI but tracked internally
- **Hidden_Content**: Content that has been soft-deleted by moderation and is invisible to regular users

## Requirements

### Requirement 1: User Authentication

**User Story:** As a parent or tuition centre, I want to sign in using my email, so that I can participate in discussions.

#### Acceptance Criteria

1. WHEN a user provides valid email credentials, THE Forum_System SHALL authenticate the user and create a session
2. WHEN a user attempts to write a comment without authentication, THE Forum_System SHALL prevent the action and prompt for login
3. WHEN a user signs up, THE Forum_System SHALL create a user account with email, password, and user type (parent or centre)
4. THE Forum_System SHALL store user credentials securely with hashed passwords

### Requirement 2: Discussion Thread Management

**User Story:** As a system, I want each tuition centre to have exactly one discussion thread, so that all conversations about a centre are centralized.

#### Acceptance Criteria

1. WHEN a tuition centre is accessed for the first time, THE Forum_System SHALL automatically create one discussion thread for that centre
2. THE Forum_System SHALL ensure each tuition centre has exactly one discussion thread
3. WHEN a discussion thread is created, THE Forum_System SHALL link it permanently to the tuition centre
4. THE Forum_System SHALL prevent deletion of discussion threads by regular users

### Requirement 3: Reading Forum Content

**User Story:** As any visitor, I want to read all comments in a centre's discussion, so that I can learn from other parents' experiences without needing to log in.

#### Acceptance Criteria

1. WHEN an unauthenticated user views a discussion thread, THE Forum_System SHALL display all visible comments
2. WHEN displaying comments, THE Forum_System SHALL order them from oldest to newest
3. WHEN content is marked as hidden, THE Forum_System SHALL exclude it from public display
4. THE Forum_System SHALL display anonymous comments with a label like "Anonymous parent"

### Requirement 4: Writing Comments

**User Story:** As a logged-in parent, I want to post comments and questions in a centre's discussion, so that I can share experiences and get answers.

#### Acceptance Criteria

1. WHEN a logged-in user submits a comment with valid text, THE Forum_System SHALL create and save the comment
2. WHEN a user submits an empty comment, THE Forum_System SHALL reject it and maintain current state
3. WHEN a parent posts a comment, THE Forum_System SHALL allow them to choose anonymous or identified mode
4. WHEN a centre user posts a comment, THE Forum_System SHALL display their centre identity
5. THE Forum_System SHALL sanitize all comment text to prevent HTML or script injection

### Requirement 5: Anonymous Posting

**User Story:** As a parent, I want to post anonymously, so that I can share honest feedback without revealing my identity publicly.

#### Acceptance Criteria

1. WHEN a parent chooses anonymous mode, THE Forum_System SHALL hide their identity in the UI
2. WHEN a comment is posted anonymously, THE Forum_System SHALL still link it internally to the user account
3. WHEN displaying an anonymous comment, THE Forum_System SHALL show "Anonymous parent" instead of the user name
4. WHEN a centre user posts, THE Forum_System SHALL not allow anonymous mode

### Requirement 6: Content Moderation

**User Story:** As an admin, I want to hide inappropriate comments, so that I can maintain a trustworthy and safe discussion environment.

#### Acceptance Criteria

1. WHEN an admin marks a comment as hidden, THE Forum_System SHALL set a hidden flag on that comment
2. WHEN a comment is hidden, THE Forum_System SHALL exclude it from public listings
3. WHEN an admin restores hidden content, THE Forum_System SHALL make it visible again
4. THE Forum_System SHALL preserve all hidden content in the database for audit purposes

### Requirement 7: User Interface Integration

**User Story:** As a parent viewing tuition centres, I want to easily access the community discussion, so that I can read what others are saying.

#### Acceptance Criteria

1. WHEN a user clicks on a tuition centre, THE Forum_System SHALL display a modal with centre details
2. WHEN the modal is displayed, THE Forum_System SHALL show a "Community Discussion" option below WhatsApp and Website links
3. WHEN a user clicks "Community Discussion", THE Forum_System SHALL navigate to the discussion thread for that centre
4. WHEN viewing a discussion thread, THE Forum_System SHALL display the centre name and tags at the top

### Requirement 8: Data Integrity

**User Story:** As a system, I want to maintain referential integrity between users, centres, and comments, so that data remains consistent.

#### Acceptance Criteria

1. WHEN a comment is created, THE Forum_System SHALL link it to both a user and a discussion thread
2. WHEN a discussion thread is created, THE Forum_System SHALL link it to exactly one tuition centre
3. THE Forum_System SHALL prevent orphaned comments that reference non-existent users or threads
4. WHEN querying comments, THE Forum_System SHALL efficiently retrieve associated user and centre information
