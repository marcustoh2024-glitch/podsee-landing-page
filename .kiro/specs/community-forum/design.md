# Design Document: Community Discussion Forum

## Overview

The community discussion feature enables parents and tuition centres to engage in structured conversations about specific tuition centres. Each centre has exactly one discussion thread where authenticated users can post comments, ask questions, and share experiences. The system emphasizes trust and calm interaction over viral engagement, with support for anonymous posting and content moderation.

This feature integrates into the existing Next.js application with Prisma ORM and SQLite database, following established patterns for API routes and service layers.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Discussion Page  │  │  Comment Form    │                │
│  │  Component       │  │  Component       │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/discussions/[centreId]         (GET, POST)     │  │
│  │  /api/discussions/[centreId]/[id]    (PATCH)         │  │
│  │  /api/auth/login                     (POST)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DiscussionService                                    │  │
│  │  - getOrCreateThread()                                │  │
│  │  - getComments()                                      │  │
│  │  - createComment()                                    │  │
│  │  - hideComment()                                      │  │
│  │  AuthService                                          │  │
│  │  - authenticate()                                     │  │
│  │  - validateSession()                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Prisma)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Models: User, DiscussionThread, Comment             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                         │
└─────────────────────────────────────────────────────────────┘
```

### Design Rationale

**Service Layer Pattern**: Following the existing `TuitionCentreService` pattern, we introduce `DiscussionService` and `AuthService` to encapsulate business logic and keep API routes thin. This improves testability and maintainability.

**One Thread Per Centre**: Each tuition centre has exactly one discussion thread, created automatically. This simplifies the data model and ensures all conversations about a centre are centralized, making it easier for users to find relevant information.

**Soft Deletion**: Comments are never physically deleted, only marked as hidden. This preserves data integrity, supports audit trails, and allows for potential un-hiding of content.

**Anonymous by Choice**: Users can choose to post anonymously on a per-comment basis. The system stores the user ID internally for moderation but doesn't expose it in public APIs, balancing transparency with privacy.

## Components and Interfaces

### Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(PARENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  comments      Comment[]
  
  @@index([email])
}

enum UserRole {
  PARENT
  CENTRE
  ADMIN
}

model DiscussionThread {
  id              String         @id @default(uuid())
  tuitionCentreId String         @unique
  tuitionCentre   TuitionCentre  @relation(fields: [tuitionCentreId], references: [id], onDelete: Restrict)
  createdAt       DateTime       @default(now())
  comments        Comment[]
  
  @@index([tuitionCentreId])
}

model Comment {
  id                String           @id @default(uuid())
  discussionThreadId String
  discussionThread  DiscussionThread @relation(fields: [discussionThreadId], references: [id], onDelete: Cascade)
  authorId          String?
  author            User?            @relation(fields: [authorId], references: [id], onDelete: SetNull)
  body              String
  isAnonymous       Boolean          @default(false)
  isHidden          Boolean          @default(false)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  
  @@index([discussionThreadId, createdAt])
  @@index([isHidden])
}
```

**Schema Design Decisions**:

1. **User.role**: Distinguishes between parents, centres, and admins using an enum. This enables role-based access control and different UI behaviors.

2. **DiscussionThread.tuitionCentreId unique**: Enforces the one-thread-per-centre constraint at the database level.

3. **Comment.authorId nullable**: When a user account is deleted, we set authorId to null but preserve the comment. This satisfies Requirement 9.2.

4. **Comment.isAnonymous**: Boolean flag that controls whether the author's identity is exposed in public APIs. The authorId is always stored for moderation.

5. **onDelete: Restrict for DiscussionThread**: Prevents accidental deletion of tuition centres that have discussions, satisfying Requirement 9.1.

6. **onDelete: SetNull for Comment.author**: Preserves comments when user accounts are deleted, satisfying Requirement 9.2.

### API Endpoints

#### GET /api/discussions/[centreId]

Retrieves the discussion thread and all non-hidden comments for a tuition centre.

**Request**:
```
GET /api/discussions/abc-123-def
```

**Response** (200 OK):
```json
{
  "thread": {
    "id": "thread-uuid",
    "tuitionCentreId": "abc-123-def",
    "tuitionCentre": {
      "id": "abc-123-def",
      "name": "Example Tuition Centre",
      "location": "Tampines"
    }
  },
  "comments": [
    {
      "id": "comment-uuid-1",
      "body": "Great experience with this centre!",
      "isAnonymous": false,
      "author": {
        "id": "user-uuid",
        "email": "parent@example.com",
        "role": "PARENT"
      },
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "comment-uuid-2",
      "body": "How are the class sizes?",
      "isAnonymous": true,
      "author": null,
      "createdAt": "2026-01-16T14:20:00Z"
    }
  ]
}
```

**Error Responses**:
- 400: Invalid centre ID format
- 404: Tuition centre not found
- 500: Server error

**Design Notes**:
- Unauthenticated users can read comments (Requirement 3.4)
- Anonymous comments have `author: null` in the response
- Comments are ordered oldest to newest (Requirement 3.2)
- Hidden comments are excluded (Requirement 3.1)

#### POST /api/discussions/[centreId]

Creates a new comment in the discussion thread. Requires authentication.

**Request**:
```json
{
  "body": "This is my comment",
  "isAnonymous": false
}
```

**Headers**:
```
Authorization: Bearer <session-token>
```

**Response** (201 Created):
```json
{
  "comment": {
    "id": "comment-uuid",
    "body": "This is my comment",
    "isAnonymous": false,
    "author": {
      "id": "user-uuid",
      "email": "parent@example.com",
      "role": "PARENT"
    },
    "createdAt": "2026-01-17T09:15:00Z"
  }
}
```

**Error Responses**:
- 400: Invalid request body (empty body, missing fields)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (centre trying to post anonymously)
- 404: Tuition centre not found
- 500: Server error

**Design Notes**:
- Body is sanitized to prevent XSS (Requirement 4.5)
- Empty or whitespace-only bodies are rejected (Requirement 4.3)
- Centre accounts cannot post anonymously (Requirement 5.2)
- Thread is created automatically if it doesn't exist (Requirement 2.1)

#### PATCH /api/discussions/[centreId]/[commentId]

Hides or unhides a comment. Admin-only endpoint.

**Request**:
```json
{
  "isHidden": true
}
```

**Headers**:
```
Authorization: Bearer <admin-session-token>
```

**Response** (200 OK):
```json
{
  "comment": {
    "id": "comment-uuid",
    "isHidden": true,
    "updatedAt": "2026-01-17T10:00:00Z"
  }
}
```

**Error Responses**:
- 400: Invalid request body
- 401: Unauthorized
- 403: Forbidden (non-admin user)
- 404: Comment not found
- 500: Server error

**Design Notes**:
- Only admins can hide/unhide comments (Requirement 6)
- Comment data is preserved (Requirement 6.4)

#### POST /api/auth/login

Authenticates a user and returns a session token.

**Request**:
```json
{
  "email": "parent@example.com",
  "password": "securepassword"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "parent@example.com",
    "role": "PARENT"
  },
  "token": "jwt-session-token"
}
```

**Error Responses**:
- 400: Invalid request body
- 401: Invalid credentials
- 500: Server error

**Design Notes**:
- Uses JWT for session management
- Password is hashed using bcrypt
- Token includes user ID and role for authorization

### Service Layer

#### DiscussionService

```javascript
class DiscussionService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get or create discussion thread for a tuition centre
   * @param {string} centreId - Tuition centre UUID
   * @returns {Promise<DiscussionThread>}
   */
  async getOrCreateThread(centreId) {
    // Implementation details
  }

  /**
   * Get all non-hidden comments for a discussion thread
   * @param {string} threadId - Discussion thread UUID
   * @returns {Promise<Comment[]>}
   */
  async getComments(threadId) {
    // Implementation details
  }

  /**
   * Create a new comment
   * @param {Object} data - Comment data
   * @param {string} data.threadId - Discussion thread UUID
   * @param {string} data.authorId - User UUID
   * @param {string} data.body - Comment text
   * @param {boolean} data.isAnonymous - Anonymous flag
   * @param {string} data.authorRole - User role
   * @returns {Promise<Comment>}
   */
  async createComment(data) {
    // Implementation details
  }

  /**
   * Hide or unhide a comment
   * @param {string} commentId - Comment UUID
   * @param {boolean} isHidden - Hidden flag
   * @returns {Promise<Comment>}
   */
  async hideComment(commentId, isHidden) {
    // Implementation details
  }
}
```

#### AuthService

```javascript
class AuthService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: User, token: string}>}
   */
  async authenticate(email, password) {
    // Implementation details
  }

  /**
   * Validate session token and return user
   * @param {string} token - JWT session token
   * @returns {Promise<User>}
   */
  async validateSession(token) {
    // Implementation details
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>}
   */
  async hashPassword(password) {
    // Implementation details
  }
}
```

### Frontend Components

#### DiscussionPage Component

Displays the discussion thread for a tuition centre.

**Props**:
- `centreId`: Tuition centre UUID

**State**:
- `thread`: Discussion thread data
- `comments`: Array of comments
- `isLoading`: Loading state
- `error`: Error message

**Behavior**:
- Fetches discussion data on mount
- Displays centre name and tags at top (Requirement 7.3)
- Shows comment form if user is authenticated (Requirement 7.4)
- Renders comments in chronological order
- Displays "Anonymous Parent" for anonymous comments (Requirement 8.2)

#### CommentForm Component

Form for submitting new comments.

**Props**:
- `centreId`: Tuition centre UUID
- `onCommentCreated`: Callback function

**State**:
- `body`: Comment text
- `isAnonymous`: Anonymous checkbox state
- `isSubmitting`: Submission state
- `error`: Error message

**Behavior**:
- Validates input before submission
- Sanitizes HTML/script content
- Disables anonymous option for centre accounts (Requirement 5.2)
- Shows success/error feedback

## Data Models

### User Model

```typescript
interface User {
  id: string;              // UUID
  email: string;           // Unique email address
  passwordHash: string;    // Bcrypt hashed password
  role: 'PARENT' | 'CENTRE' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Email must be valid format
- Password must be at least 8 characters
- Role defaults to PARENT

### DiscussionThread Model

```typescript
interface DiscussionThread {
  id: string;              // UUID
  tuitionCentreId: string; // Foreign key (unique)
  createdAt: Date;
}
```

**Invariants**:
- Each tuition centre has exactly one thread
- Threads cannot be deleted

### Comment Model

```typescript
interface Comment {
  id: string;                 // UUID
  discussionThreadId: string; // Foreign key
  authorId: string | null;    // Foreign key (nullable)
  body: string;               // Comment text (sanitized)
  isAnonymous: boolean;       // Anonymous flag
  isHidden: boolean;          // Soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Body must not be empty or whitespace-only
- Body must be sanitized (no HTML/script tags)
- Centre accounts cannot set isAnonymous to true

**Invariants**:
- If authorId is null, the user account was deleted
- Hidden comments are never returned in public APIs

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Authentication Properties

Property 1: Valid credentials create or retrieve user
*For any* valid email and password combination, authenticating should return a user account (either newly created or existing)
**Validates: Requirements 1.1**

Property 2: Successful authentication issues token
*For any* user who successfully authenticates, the system should return a valid session token
**Validates: Requirements 1.2**

Property 3: Valid tokens authorize write operations
*For any* user with a valid session token, the system should allow comment creation and other write operations
**Validates: Requirements 1.3**

### Discussion Thread Properties

Property 4: One thread per centre invariant
*For any* tuition centre in the system, querying its discussion threads should return exactly one thread
**Validates: Requirements 2.1, 2.2**

Property 5: Thread retrieval returns correct thread
*For any* tuition centre, retrieving its discussion thread should return the thread associated with that specific centre
**Validates: Requirements 2.3**

Property 6: Threads cannot be deleted
*For any* discussion thread, attempting to delete it should fail and the thread should remain in the database
**Validates: Requirements 2.4**

### Comment Display Properties

Property 7: Hidden comments are excluded
*For any* discussion thread, retrieving comments should return only comments where isHidden is false
**Validates: Requirements 3.1, 6.2**

Property 8: Comments are chronologically ordered
*For any* discussion thread with multiple comments, the returned comments should be ordered by createdAt timestamp from oldest to newest
**Validates: Requirements 3.2**

Property 9: Anonymous comments hide author identity
*For any* comment where isAnonymous is true, the public API response should not expose the author's identity (author field should be null or generic)
**Validates: Requirements 3.3, 8.2**

### Comment Creation Properties

Property 10: Valid comments are stored
*For any* authenticated parent with valid comment text, creating a comment should result in the comment being stored in the database with all required fields
**Validates: Requirements 4.1, 4.4**

Property 11: Anonymity preference is respected
*For any* parent creating a comment, the isAnonymous flag should be stored exactly as specified in the request
**Validates: Requirements 4.2**

Property 12: Whitespace-only comments are rejected
*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), attempting to create a comment with that body should be rejected
**Validates: Requirements 4.3**

Property 13: HTML and scripts are sanitized
*For any* comment body containing HTML tags or script elements, the stored comment should have those elements removed or escaped
**Validates: Requirements 4.5**

### Centre Account Properties

Property 14: Centre comments store correct role
*For any* authenticated centre account creating a comment, the stored comment should be associated with a user whose role is CENTRE
**Validates: Requirements 5.1, 5.3**

Property 15: Centres cannot post anonymously
*For any* centre account attempting to create a comment with isAnonymous set to true, the request should be rejected
**Validates: Requirements 5.2**

### Moderation Properties

Property 16: Hiding sets flag
*For any* comment, when an admin marks it as hidden, the isHidden flag should be set to true
**Validates: Requirements 6.1**

Property 17: Unhiding restores visibility
*For any* hidden comment, when an admin unhides it, the isHidden flag should be set to false and the comment should appear in subsequent queries
**Validates: Requirements 6.3**

Property 18: Hiding preserves data
*For any* comment, hiding it should not modify any fields except isHidden and updatedAt
**Validates: Requirements 6.4**

### Privacy Properties

Property 19: Anonymous comments store author internally
*For any* anonymous comment, the authorId should be stored in the database but not exposed in public API responses
**Validates: Requirements 8.1**

Property 20: Admins can see anonymous authors
*For any* anonymous comment, when retrieved through an admin endpoint, the true author information should be included
**Validates: Requirements 8.3**

Property 21: Anonymous comments maintain referential integrity
*For any* anonymous comment, the authorId foreign key relationship should be maintained in the database
**Validates: Requirements 8.4**

### Data Integrity Properties

Property 22: Centre deletion preserves discussions
*For any* tuition centre with a discussion thread and comments, deleting the centre should fail due to the onDelete: Restrict constraint, preserving all discussion data
**Validates: Requirements 9.1**

Property 23: User deletion preserves comments
*For any* user with comments, deleting the user should set the authorId to null on all their comments while preserving the comment data
**Validates: Requirements 9.2**

Property 24: Invalid thread foreign keys are rejected
*For any* comment with a discussionThreadId that doesn't exist, attempting to create the comment should be rejected by the database
**Validates: Requirements 9.3**

Property 25: Invalid centre foreign keys are rejected
*For any* discussion thread with a tuitionCentreId that doesn't exist, attempting to create the thread should be rejected by the database
**Validates: Requirements 9.4**

## Error Handling

### Input Validation Errors

**Empty Comment Body** (400 Bad Request):
- Triggered when comment body is empty or whitespace-only
- Response includes error code `INVALID_COMMENT_BODY`
- Prevents database pollution with meaningless content

**Invalid Centre ID** (400 Bad Request):
- Triggered when centre ID is not a valid UUID format
- Response includes error code `INVALID_ID_FORMAT`
- Provides early validation before database query

**Missing Authentication** (401 Unauthorized):
- Triggered when write operations are attempted without valid token
- Response includes error code `UNAUTHORIZED`
- Protects write endpoints from anonymous access

**Centre Anonymous Attempt** (403 Forbidden):
- Triggered when centre account tries to post anonymously
- Response includes error code `FORBIDDEN_ANONYMOUS_CENTRE`
- Enforces business rule about centre transparency

### Database Errors

**Centre Not Found** (404 Not Found):
- Triggered when discussion is requested for non-existent centre
- Response includes error code `CENTRE_NOT_FOUND`
- Helps users identify invalid centre references

**Comment Not Found** (404 Not Found):
- Triggered when moderation is attempted on non-existent comment
- Response includes error code `COMMENT_NOT_FOUND`
- Prevents silent failures in moderation operations

**Foreign Key Violation** (500 Internal Server Error):
- Triggered when database constraints are violated
- Response includes error code `DATABASE_ERROR`
- Logged for debugging but not exposed to users

**Unique Constraint Violation** (500 Internal Server Error):
- Triggered when attempting to create duplicate thread for centre
- Should not occur in normal operation due to getOrCreate pattern
- Logged for debugging

### Authentication Errors

**Invalid Credentials** (401 Unauthorized):
- Triggered when email/password combination is incorrect
- Response includes error code `INVALID_CREDENTIALS`
- Generic message to prevent user enumeration

**Expired Token** (401 Unauthorized):
- Triggered when JWT token has expired
- Response includes error code `TOKEN_EXPIRED`
- Client should redirect to login

**Invalid Token** (401 Unauthorized):
- Triggered when JWT token is malformed or tampered
- Response includes error code `INVALID_TOKEN`
- Client should redirect to login

### Authorization Errors

**Insufficient Permissions** (403 Forbidden):
- Triggered when non-admin tries to hide/unhide comments
- Response includes error code `INSUFFICIENT_PERMISSIONS`
- Protects admin-only operations

## Testing Strategy

### Dual Testing Approach

This feature will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Specific authentication scenarios (valid login, invalid password)
- Edge cases (empty strings, special characters, boundary values)
- Error conditions (missing fields, invalid formats)
- Integration points between API routes and services

**Property-Based Tests**: Verify universal properties across all inputs
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Catch unexpected edge cases through fuzzing

Both testing approaches are complementary and necessary for high confidence in correctness.

### Property-Based Testing Configuration

**Library**: fast-check (already in devDependencies)

**Configuration**:
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: community-forum, Property {number}: {property_text}`

**Example Test Structure**:
```javascript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: community-forum', () => {
  it('Property 12: Whitespace-only comments are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1 }),
        async (whitespaceBody) => {
          const result = await discussionService.createComment({
            threadId: 'valid-thread-id',
            authorId: 'valid-user-id',
            body: whitespaceBody,
            isAnonymous: false,
            authorRole: 'PARENT'
          });
          
          expect(result.error).toBeDefined();
          expect(result.error.code).toBe('INVALID_COMMENT_BODY');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Organization

**Service Layer Tests**:
- `src/lib/services/discussionService.test.js` - Unit tests
- `src/lib/services/discussionService.property.test.js` - Property tests
- `src/lib/services/authService.test.js` - Unit tests
- `src/lib/services/authService.property.test.js` - Property tests

**API Route Tests**:
- `src/app/api/discussions/[centreId]/route.test.js` - Unit tests
- `src/app/api/discussions/[centreId]/route.property.test.js` - Property tests
- `src/app/api/auth/login/route.test.js` - Unit tests

**Integration Tests**:
- `src/app/api/discussions/integration.test.js` - End-to-end API tests

### Property Test Coverage

Each correctness property listed in this document must be implemented as a property-based test:
- Properties 1-3: Authentication properties
- Properties 4-6: Discussion thread properties
- Properties 7-9: Comment display properties
- Properties 10-13: Comment creation properties
- Properties 14-15: Centre account properties
- Properties 16-18: Moderation properties
- Properties 19-21: Privacy properties
- Properties 22-25: Data integrity properties

### Unit Test Focus Areas

Unit tests should focus on:
- Specific authentication examples (valid login, password mismatch)
- API endpoint integration (request parsing, response formatting)
- Error handling paths (missing fields, invalid tokens)
- Database transaction behavior (rollbacks, commits)
- Sanitization logic (specific XSS patterns)

### Testing Best Practices

1. **Test Isolation**: Each test should set up its own data and clean up afterward
2. **Mock External Dependencies**: Use in-memory database for tests when possible
3. **Clear Test Names**: Describe what is being tested and expected outcome
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Property Test Generators**: Write smart generators that constrain to valid input space
6. **Avoid Over-Mocking**: Test real functionality, not mocks

## Implementation Notes

### Security Considerations

**Password Storage**: Use bcrypt with salt rounds of 10 or higher for password hashing. Never store plain text passwords.

**XSS Prevention**: Sanitize all user-generated content before storage. Use a library like DOMPurify or implement whitelist-based sanitization.

**SQL Injection**: Prisma provides parameterized queries by default, protecting against SQL injection. Never concatenate user input into raw queries.

**JWT Security**: 
- Use strong secret key (minimum 256 bits)
- Set reasonable expiration (e.g., 24 hours)
- Include user ID and role in payload
- Validate signature on every request

**Rate Limiting**: Consider implementing rate limiting on authentication and comment creation endpoints to prevent abuse.

### Performance Considerations

**Database Indexes**: 
- Index on `Comment.discussionThreadId` and `Comment.createdAt` for efficient comment retrieval
- Index on `Comment.isHidden` for efficient filtering
- Index on `User.email` for authentication lookups

**Pagination**: For threads with many comments, implement cursor-based pagination to avoid loading all comments at once.

**Caching**: Consider caching discussion threads and comments with short TTL (e.g., 1 minute) to reduce database load.

### Migration Strategy

**Database Migration**:
1. Create Prisma migration for new models (User, DiscussionThread, Comment)
2. Run migration on development database
3. Seed with test data for development
4. Test all endpoints thoroughly
5. Run migration on production with backup

**Backward Compatibility**:
- New feature doesn't affect existing tuition centre functionality
- TuitionCentre model gets new optional relation to DiscussionThread
- No breaking changes to existing APIs

### Future Enhancements

**Potential Features** (not in current scope):
- Comment editing and deletion by authors
- Nested replies (threading)
- Upvoting/downvoting comments
- Email notifications for new comments
- Rich text formatting in comments
- Image attachments
- Search within discussions
- User reputation system

These features are intentionally excluded from the initial implementation to maintain simplicity and focus on core functionality.
