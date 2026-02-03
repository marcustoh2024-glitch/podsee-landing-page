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

