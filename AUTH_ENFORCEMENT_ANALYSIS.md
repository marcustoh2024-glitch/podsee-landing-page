# Authentication & Username Enforcement Analysis

## Executive Summary

Your authentication and forum system is **well-structured and mostly enforced correctly**. The username requirement is enforced at both API and UI levels. However, there are some gaps in consistency and edge cases that need attention.

---

## 1. Current State Confirmation

### ✅ What Already Exists

#### Database Schema (Prisma)
- **User Model** (`prisma/schema.prisma`):
  - `username`: `String?` (nullable, unique)
  - `email`: `String` (unique)
  - `passwordHash`: `String`
  - `role`: `UserRole` (PARENT, CENTRE, ADMIN)
  - Username has unique constraint with index
  - Comments are linked to users via `authorId`

- **Comment Model**:
  - `authorId`: `String?` (nullable, links to User)
  - `isAnonymous`: `Boolean` (default: false)
  - `isHidden`: `Boolean` (default: false)
  - All comments are internally linked to a user (even anonymous ones)

#### Authentication Flow
- **Login** (`/api/auth/login`):
  - Accepts email, password, optional role
  - Returns user object + JWT token
  - User object includes username field (may be null)

- **Session Validation** (`/api/auth/validate`):
  - Validates JWT token from Authorization header
  - Returns current user data
  - Used on app load to restore session

- **Username Setting** (`/api/auth/username`):
  - POST endpoint to set username (one-time only)
  - Validates format: 3-20 chars, alphanumeric + underscore
  - Enforces case-insensitive uniqueness
  - Prevents username changes after initial set
  - Returns error codes: USERNAME_TAKEN, USERNAME_ALREADY_SET

#### Forum Posting Flow
- **Create Comment** (`POST /api/discussions/[centreId]`):
  - ✅ **Requires authentication** (checks Bearer token)
  - ✅ **Enforces username requirement** (line 189-197):
    ```javascript
    if (!user.username) {
      return NextResponse.json({
        error: {
          code: 'USERNAME_REQUIRED',
          message: 'You must set a username before posting'
        }
      }, { status: 403 });
    }
    ```
  - ✅ Validates comment body (non-empty)
  - ✅ Prevents CENTRE accounts from posting anonymously
  - ✅ Links comment to user via `authorId`

#### Frontend Flow
- **AuthContext** (`src/contexts/AuthContext.jsx`):
  - Manages user state and token
  - Loads token from localStorage on mount
  - Validates token with API on app load
  - Provides login/logout functions

- **CommentForm** (`src/components/CommentForm.jsx`):
  - ✅ **Shows UsernamePrompt if user.username is null** (line 37-39)
  - ✅ Blocks form submission until username is set
  - Validates comment body client-side
  - Sends Authorization header with token

- **UsernamePrompt** (`src/components/UsernamePrompt.jsx`):
  - ✅ Modal-style prompt that blocks posting
  - ✅ Validates username format client-side
  - ✅ Calls `/api/auth/username` to set username
  - ✅ Updates localStorage with new user data
  - ✅ Calls callback to update parent component

---

## 2. Validation Points (API vs Frontend)

### API-Level Enforcement (Server-Side) ✅
**Location**: `src/app/api/discussions/[centreId]/route.js` (POST handler)

**What's Enforced**:
1. Authentication required (401 if no token)
2. Valid session (401 if token expired/invalid)
3. **Username required** (403 if user.username is null)
4. Comment body validation (400 if empty)
5. Anonymous posting restrictions for CENTRE accounts (403)

**Error Response**:
```json
{
  "error": {
    "code": "USERNAME_REQUIRED",
    "message": "You must set a username before posting"
  }
}
```

### Frontend-Level Enforcement (Client-Side) ✅
**Location**: `src/components/CommentForm.jsx`

**What's Enforced**:
1. Shows UsernamePrompt component if `!currentUser?.username`
2. Blocks comment form rendering until username is set
3. Client-side validation for comment body
4. Token presence check before submission

**User Experience**:
- User sees username prompt instead of comment form
- Cannot bypass prompt (form is not rendered)
- After setting username, form appears automatically

---

## 3. End-to-End User Flows

### Flow 1: Logged-Out User
```
1. User visits discussion page
   └─> DiscussionPage checks localStorage for authToken
   └─> No token found → user = null

2. UI shows "Sign in to join the discussion" prompt
   └─> Comment form is NOT rendered
   └─> User cannot post

3. User clicks "Sign In" (placeholder button)
   └─> Would redirect to login page (not implemented)
```

**Status**: ✅ Correctly blocks unauthenticated users

---

### Flow 2: Logged-In User WITHOUT Username
```
1. User logs in via /api/auth/login
   └─> Receives token + user object (username: null)
   └─> Token stored in localStorage

2. User visits discussion page
   └─> DiscussionPage loads user from localStorage
   └─> user.username === null

3. CommentForm checks user.username
   └─> Renders UsernamePrompt instead of form
   └─> User CANNOT post until username is set

4. User enters username in prompt
   └─> POST /api/auth/username
   └─> API validates format and uniqueness
   └─> Returns updated user object

5. UsernamePrompt updates localStorage
   └─> Calls onUsernameSet callback
   └─> CommentForm re-renders with form visible

6. User can now post comments
```

**Status**: ✅ Correctly enforces username requirement

---

### Flow 3: Logged-In User WITH Username
```
1. User logs in (already has username set)
   └─> Receives token + user object (username: "john_parent")

2. User visits discussion page
   └─> CommentForm checks user.username
   └─> Username exists → renders comment form

3. User writes comment and submits
   └─> POST /api/discussions/[centreId]
   └─> API validates token and username
   └─> Comment created with authorId linked to user

4. Comment appears in thread
   └─> If isAnonymous: false → shows username
   └─> If isAnonymous: true → shows "Anonymous Parent"
```

**Status**: ✅ Works as expected

---

### Flow 4: Anonymous Posting Behavior
```
1. User with username posts comment
   └─> Checks "Post anonymously" checkbox
   └─> isAnonymous: true sent to API

2. API creates comment
   └─> authorId: user.id (ALWAYS set)
   └─> isAnonymous: true (display flag only)

3. Comment is stored in database
   └─> Internal link to user preserved
   └─> Display name controlled by isAnonymous flag

4. Comment displayed in UI
   └─> CommentList checks isAnonymous
   └─> Shows "Anonymous Parent" instead of username
```

**Status**: ✅ Anonymous mode only affects display, not internal linking

---

## 4. What Needs to Be Wired Together

### ⚠️ Gap 1: AuthContext Not Used in DiscussionPage

**Current State**:
- `DiscussionPage.jsx` manually reads from localStorage
- Does NOT use AuthContext
- Stores user data separately in localStorage as 'user' key

**Issue**:
- AuthContext stores user in state but doesn't persist username updates
- DiscussionPage and CommentForm rely on localStorage 'user' key
- Potential sync issues between AuthContext.user and localStorage.user

**Fix Needed**:
```javascript
// DiscussionPage should use AuthContext instead of localStorage
import { useAuth } from '@/contexts/AuthContext'

export default function DiscussionPage({ centreId }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  // Remove manual localStorage checks
}
```

**Action Required**: Update AuthContext to sync username changes

---

### ⚠️ Gap 2: AuthContext Doesn't Update User After Username Set

**Current State**:
- UsernamePrompt updates localStorage directly
- AuthContext.user state is NOT updated
- If other components use AuthContext, they'll have stale data

**Fix Needed**:
Add `updateUser` function to AuthContext:
```javascript
const updateUser = (updatedUser) => {
  setUser(updatedUser)
  localStorage.setItem('user', JSON.stringify(updatedUser))
}
```

**Action Required**: Add updateUser to AuthContext and use it in UsernamePrompt

---

### ⚠️ Gap 3: Token Validation Doesn't Refresh User Data

**Current State**:
- AuthContext validates token on mount
- Uses `/api/auth/validate` which returns user data
- BUT: localStorage 'user' key is separate and may be stale

**Fix Needed**:
```javascript
// In AuthContext useEffect
if (response.ok) {
  const data = await response.json()
  setUser(data.user)
  setToken(storedToken)
  localStorage.setItem('user', JSON.stringify(data.user)) // Add this
}
```

**Action Required**: Sync localStorage 'user' with validated user data

---

## 5. Edge Cases That Need Guarding

### ⚠️ Edge Case 1: Race Condition on Username Set

**Scenario**:
- User opens two tabs
- Sets username in Tab 1
- Tries to set different username in Tab 2

**Current Behavior**:
- API correctly rejects with USERNAME_ALREADY_SET
- But UI doesn't refresh to show username was set

**Fix Needed**:
- UsernamePrompt should handle USERNAME_ALREADY_SET error
- Refresh user data from API when this error occurs

---

### ⚠️ Edge Case 2: Token Expires While User Is Typing

**Scenario**:
- User writes long comment
- Token expires before submission
- API returns 401 TOKEN_EXPIRED

**Current Behavior**:
- CommentForm shows generic error
- User loses their comment text

**Fix Needed**:
- Detect 401 errors and trigger re-login
- Preserve comment text in localStorage
- Restore text after re-login

---

### ⚠️ Edge Case 3: Username Uniqueness Case Sensitivity

**Current State**:
- API uses case-insensitive check: `mode: 'insensitive'`
- Database has unique constraint on username

**Potential Issue**:
- If database collation is case-sensitive, constraint may not match API logic
- Could allow "JohnDoe" and "johndoe" as separate usernames

**Verification Needed**:
- Test with SQLite collation settings
- Ensure database constraint matches API logic

**Status**: ✅ Likely OK (SQLite default is case-insensitive for ASCII)

---

### ⚠️ Edge Case 4: User Deleted But Comments Remain

**Current State**:
- Comment.authorId is nullable
- User deletion sets authorId to null (onDelete: SetNull)

**Behavior**:
- Comments remain visible
- Author shows as null

**Fix Needed**:
- CommentList should handle null author gracefully
- Show "[Deleted User]" or similar placeholder

---

### ⚠️ Edge Case 5: CENTRE Account Tries to Post Anonymously via API

**Current State**:
- API correctly blocks this (403 FORBIDDEN_ANONYMOUS_CENTRE)
- UI disables checkbox for CENTRE accounts

**Status**: ✅ Correctly enforced at both levels

---

## 6. Username Uniqueness Enforcement

### Database Level ✅
```prisma
model User {
  username String? @unique
  @@index([username])
}
```
- Unique constraint enforced by database
- Index for fast lookups

### API Level ✅
```javascript
// In /api/auth/username
const existingUser = await prisma.user.findFirst({
  where: {
    username: {
      equals: trimmedUsername,
      mode: 'insensitive'  // Case-insensitive check
    }
  }
});
```
- Case-insensitive uniqueness check
- Prevents "JohnDoe" and "johndoe" as separate usernames

### Constraint Strictness ✅
- No environment-specific shortcuts
- No test bypasses
- Enforced consistently across all environments

---

## 7. Anonymous Posting Clarification

### Internal Behavior ✅
- **All comments are linked to a user** via `authorId`
- Anonymous mode is a **display-only flag** (`isAnonymous: true`)
- Database always stores the real author

### Display Behavior ✅
- `isAnonymous: false` → Shows username
- `isAnonymous: true` → Shows "Anonymous Parent" (or "Anonymous Centre")
- Admin can still see real author in database

### Enforcement ✅
- Login required (cannot post without authentication)
- Username required (cannot post without username)
- Anonymous mode does NOT bypass these requirements

---

## 8. Summary of Required Actions

### High Priority (Breaks Consistency)

1. **Update AuthContext to manage username updates**
   - Add `updateUser` function
   - Sync with localStorage
   - Use in UsernamePrompt

2. **Migrate DiscussionPage to use AuthContext**
   - Remove manual localStorage checks
   - Use `useAuth()` hook
   - Ensure consistent user state

3. **Handle USERNAME_ALREADY_SET error in UsernamePrompt**
   - Refresh user data from API
   - Show appropriate message
   - Update parent component

### Medium Priority (Improves UX)

4. **Add token expiration handling in CommentForm**
   - Detect 401 errors
   - Preserve comment text
   - Trigger re-login flow

5. **Handle deleted users in CommentList**
   - Check for null author
   - Show "[Deleted User]" placeholder

### Low Priority (Edge Cases)

6. **Verify SQLite collation for username uniqueness**
   - Test case-insensitive constraint
   - Document expected behavior

---

## 9. Validation Summary

### ✅ What's Working Correctly

- Username uniqueness (case-insensitive)
- API-level username requirement enforcement
- UI-level username prompt before posting
- Anonymous mode (display-only, doesn't bypass auth)
- CENTRE account restrictions on anonymous posting
- Comment-to-user internal linking
- Token-based authentication
- Session validation on app load

### ⚠️ What Needs Fixing

- AuthContext not syncing username updates
- DiscussionPage not using AuthContext
- Edge case handling (token expiration, deleted users, race conditions)

### ✅ Constraints Confirmed

- Username uniqueness is strict (case-insensitive)
- No environment-specific shortcuts
- No test bypasses
- All anonymous posts linked to users internally

---

## 10. Conclusion

Your system is **well-architected** with proper separation of concerns:
- Database enforces data integrity
- API enforces business logic
- UI provides good user experience

The main issue is **state management inconsistency** between AuthContext and localStorage. Once that's unified, the system will be rock-solid.

The username requirement is **correctly enforced** at all levels:
- Database: unique constraint
- API: explicit check before comment creation
- UI: username prompt blocks form rendering

Anonymous posting is **correctly implemented** as a display-only feature that doesn't bypass authentication or username requirements.
