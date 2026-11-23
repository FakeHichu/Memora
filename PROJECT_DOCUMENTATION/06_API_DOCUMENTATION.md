# 07_API_DOCUMENTATION.md

## All API Endpoints with Request/Response Details

This section documents every API endpoint in the Memora backend, including request formats, response schemas, and error handling.

---

### Base URL
`http://localhost:4000/api` (or configured port from env)

All routes are prefixed with `/api`. See route composition in `backend/src/routes/index.js`.

---

### Authentication Endpoints

#### POST /api/auth/signin
**Description**: User sign in with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses**:
- `200 OK`: `{ ok: true, user: UserRecord, session: SessionData }`
- `401 Unauthorized`: `{ ok: false, message: "Invalid email or password" }`
- `401 Unauthorized`: `{ ok: false, message: "Please verify your email before signing in" }`

---

#### POST /api/auth/signup
**Description**: New user registration.

**Request**:
```json
{
  "name": "Full Name",
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Responses**:
- `201 Created`: `{ ok: true, user: UserRecord, session: SessionData }`
- `400 Bad Request`: `{ ok: false, message: "This email is already registered" }`
- `400 Bad Request`: `{ ok: false, message: "Password must be at least 8 characters and contain uppercase, lowercase, and digit" }`
- `400 Bad Request`: `{ ok: false, message: "Passwords do not match" }`

---

#### POST /api/auth/signout
**Description**: User sign out, clear session.

**Responses**:
- `200 OK`: `{ ok: true, message: "Signed out successfully" }`

---

### Classes Endpoints

#### GET /api/classes/user-classes
**Description**: Get all classes created by the authenticated user.

**Authentication**: Requires Bearer token (requireAuth middleware)

**Responses**:
- `200 OK`: `{ ok: true, classes: ClassEntity[] }`
- `401 Unauthorized`: `{ ok: false, message: "Authorization bearer token is required" }`

---

#### POST /api/classes
**Description**: Create a new class.

**Request**:
```json
{
  "name": "Math 101",
  "schoolName": "Springfield High",
  "academicYear": 2024
}
```

**Authentication**: Requires Bearer token

**Responses**:
- `201 Created`: `{ ok: true, class: ClassEntity }`
- `400 Bad Request`: Validation errors from Zod (invalid name, academicYear out of range)
- `401 Unauthorized`: No token or invalid token

---

#### POST /api/classes/join
**Description**: Join a class using invite code.

**Request**:
```json
{
  "joinCode": "grp-abcd1234"  // auto-uppercased and trimmed
}
```

**Authentication**: Requires Bearer token

**Responses**:
- `200 OK`: `{ ok: true, class: ClassEntity, member: ClassMemberEntity, alreadyJoined: boolean }`
- `400 Bad Request`: Validation errors (joinCode wrong length)
- `403 Forbidden`: "You must be an enrolled member of this class" / "This class has been archived"
- `404 Not Found`: "Class not found"

---

### Posts Endpoints

#### GET /api/today-feed?classId={uuid}
**Description**: Get today's feed for a class, including posts, reactions, comments, and signed photo URLs.

**Authentication**: Requires Bearer token

**Query Parameters**:
- `classId`: UUID of the class

**Responses**:
- `200 OK`:
```json
{
  "ok": true,
  "userPostedToday": boolean,
  "posts": [
    {
      "id": "uuid",
      "class_id": "uuid",
      "user_id": "uuid",
      "photo_path": "string (signed URL or path)",
      "prompt_id": "uuid | null",
      "post_date": "YYYY-MM-DD",
      "caption": "string | null",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "reactions": {
        "heart": number,
        "laugh": number,
        "cry": number,
        "fire": number,
        "dead": number,
        "respect": number
      },
      "userReaction": "heart|laugh|cry|fire|dead|respect|null",
      "author": { display_name: string, username: string, avatar_path: string },
      "comments": [...],
      "isPreview": boolean
    }
  ]
}
```
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "Access denied to private class feed." (user not member of class)

---

#### POST /api/daily-posts
**Description**: Create a new daily post (one photo per day per class per user).

**Request**:
```json
{
  "classId": "uuid",
  "userId": "uuid",
  "photoPath": "string (local path or URI)",
  "caption": "optional string (max 280 chars)",
  "promptId": "optional uuid"
}
```

**Authentication**: Requires Bearer token

**Responses**:
- `201 Created`: `{ ok: true, post: DailyPostEntity }`
- `400 Bad Request`: Validation errors (invalid classId UUID, empty photoPath, etc.)
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "You must be an enrolled member of this class to post."
- `409 Conflict`: "One photo per day rule: You have already posted for today."

---

#### POST /api/daily-posts/{postId}/caption
**Description**: Update post caption.

**Request**:
```json
{
  "caption": "New caption text"
}
```

**Authentication**: Requires Bearer token

**Responses**:
- `200 OK`: `{ ok: true, post: DailyPostEntity with updated caption }`
- `400 Bad Request`: Validation errors (caption exceeds 280 chars)
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "Only the author can edit this post."
- `404 Not Found`: "Post not found."

---

#### POST /api/posts/{postId}/delete
**Description**: Delete a post (soft delete via deleted_at).

**Authentication**: Requires Bearer token

**Responses**:
- `200 OK`: `{ ok: true, message: "Post deleted successfully" }`
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "Not authorized to delete this post." (not owner and not member)
- `404 Not Found`: "Post not found."

---

#### GET /api/posts/{postId}/comments
**Description**: Get all comments for a post.

**Authentication**: Requires Bearer token

**Responses**:
- `200 OK`: `{ ok: true, comments: CommentEntity[] }`
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "No comments accessible" (user not member of class)
- `404 Not Found`: "Post not found."

---

### Reactions Endpoints

#### POST /api/reactions
**Description**: Toggle reaction on a post.

**Request**:
```json
{
  "postId": "uuid",
  "reactionType": "heart"  // must be one of: heart, laugh, cry, fire, dead, respect
}
```

**Authentication**: Requires Bearer token

**Responses**:
- `200 OK`: `{ ok: true, action: "added"|"removed", reaction: ReactionEntity|null }`
- `400 Bad Request`: Validation errors (invalid reactionType)
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "You must be a member of the class to react."
- `404 Not Found`: "Post not found."

---

#### POST /api/comments/{commentId}/reaction
**Description**: Toggle reaction on a comment.

**Request**:
```json
{
  "reactionType": "heart"
}
```

**Authentication**: Requires Bearer token

**Responses**:
- `200 OK`: `{ ok: true, action: "added"|"removed", reaction: ReactionEntity|null }`
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: No token or invalid token
- `403 Forbidden`: "You must be a member to react." / "Only the author can edit this comment"
- `404 Not Found`: "Comment not found." / "Post not found."

---

### Prompts Endpoints

#### GET /api/prompt/today
**Description**: Get today's daily prompt.

**Responses**:
- `200 OK`: `{ ok: true, prompt: { id: string, prompt_text: string, prompt_date: string } }`
- `503 Service Unavailable`: If Supabase not configured

---

### Health & Readiness Endpoints

#### GET /api/health
**Description**: Check service health status.

**Responses**:
- `200 OK`: `{ ok: true, status: "healthy", timestamp: ISO_string }`

#### GET /api/ready
**Description**: Check readiness - verifies Supabase connectivity.

**Responses**:
- `200 OK`: `{ ok: true, ready: true }` (Supabase connected)
- `503 Service Unavailable`: `{ ok: false, ready: false, message: "Backend Supabase is not configured" }`

---

### Error Response Format

All API errors follow consistent format:
```json
{
  "ok": false,
  "message": "Error description",
  "details": "optional additional context"
}
```

Status codes:
- `400`: Bad request (validation errors)
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (membership/ownership violation)
- `404`: Not found
- `409`: Conflict (daily post limit exceeded)
- `503`: Service unavailable (Supabase not configured)

All errors are processed through `backend/src/middleware/error.middleware.ts` which ensures consistent JSON format.