# 03_FILE_BY_FILE_ANALYSIS.md

## Complete File-by-File Analysis

This section documents every original source-code file in the Memora project, excluding generated artifacts, vendor directories, and third-party dependency source code.

---

### 1. backend/src/index.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/index.ts`

**Purpose**: Entry point for the backend Express application. Configures the Express app, CORS, body parsing, health checks, and route registration.

**Why This File Exists**: This is the application bootstrap file that must execute first when the backend server starts. It wires together all the middleware, routes, and error handling.

**Responsibilities**:
- Import and configure CORS with frontend URL
- Set up JSON body parsing with 10MB limit
- Define health check endpoint (`/api/health`)
- Define readiness check endpoint (`/api/ready`) that verifies Supabase connectivity
- Mount all API routes under `/api` prefix
- Register global error handler middleware
- Start the HTTP server on configured port

**Imported Modules**:
- `cors` - CORS configuration
- `express` - Express framework
- `{ env }` from `./config/env.js` - Environment configuration
- `{ getSupabaseClient, supabase }` from `./lib/supabase.js` - Supabase client instances
- `{ errorHandler }` from `./middleware/error.middleware.js` - Error handling middleware
- `{ apiRoutes }` from `./routes/index.js` - Composed route definitions

**Exported Functions/Classes**: None (module executes side effects on import - starts the server)

**Connected Files**:
- `backend/src/config/env.ts` - Environment variables
- `backend/src/middleware/auth.middleware.ts` - Auth middleware used by routes
- `backend/src/middleware/error.middleware.ts` - Error handling
- `backend/src/routes/index.js` - Route composition
- `backend/src/routes/class.routes.ts` - Class routes
- `backend/src/routes/post.routes.ts` - Post routes
- `backend/src/routes/prompt.routes.ts` - Prompt routes
- `backend/src/controllers/class.controller.ts` - Class controllers
- `backend/src/controllers/post.controller.ts` - Post controllers
- `backend/src/controllers/prompt.controller.ts` - Prompt controller
- `backend/src/services/class.service.ts` - Class services
- `backend/src/services/post.service.ts` - Post services
- `backend/src/services/prompt.service.ts` - Prompt services
- `backend/src/repositories/class.repository.ts` - Class repository
- `backend/src/repositories/post.repository.ts` - Post repository
- `backend/src/repositories/prompt.repository.ts` - Prompt repository
- `backend/src/types/index.ts` - Type definitions
- `backend/src/validators/class.validator.ts` - Class validation schemas
- `backend/src/validators/post.validator.ts` - Post validation schemas
- `backend/src/validators/reaction.validator.ts` - Reaction validation schema
- `backend/src/lib/supabase.ts` - Supabase client configuration

**Key Logic**:
- App configures CORS with `origin: env.frontendUrl` and `credentials: true`
- Health endpoint returns service status and timestamp
- Ready endpoint checks Supabase env vars and tests DB connection
- Server listens on `env.port` (default 4000)

**Error Handling**: Global `errorHandler` middleware catches all unhandled errors and returns JSON with `ok: false` and error message.

**Potential Issues**:
- If Supabase is not configured, the ready endpoint returns 503, but the server still starts (degraded mode)
- No rate limiting configured at the app level

---

### 2. backend/src/config/env.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/config/env.ts`

**Purpose**: Environment variable configuration loader. Reads `.env` file and exposes configuration as a typed object.

**Why This File Exists**: To centralize environment variable access and provide defaults, avoiding scattered `process.env` calls across the codebase.

**Responsibilities**:
- Load dotenv configuration from `../.env` relative to the file location
- Expose configuration object with:
  - `port`: Number, defaults to 4000
  - `supabaseUrl`: String, from `EXPO_PUBLIC_SUPABASE_URL` env var
  - `supabaseServiceRoleKey`: String, from `SUPABASE_SERVICE_ROLE_KEY` env var
  - `frontendUrl`: String, defaults to `http://localhost:8081`

**Imported Modules**:
- `* as dotenv` from "dotenv" - Environment variable loader
- `path` from "path" - Path resolution

**Exported**: `env` object with configured values

**Connected Files**:
- `backend/src/index.ts` - Uses `env` to configure port, CORS origin, Supabase connectivity

**Key Logic**:
- `dotenv.config({ path: path.resolve(path.dirname(new URL(import.meta.url).pathname), '../.env') })`
- Reads `process.env.PORT ?? 4000` for port
- Reads `process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''` for Supabase URL
- Reads `process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''` for service role key
- Reads `process.env.FRONTEND_URL ?? 'http://localhost:8081'` for frontend URL

**Edge Cases**:
- All env vars have fallback defaults, preventing complete startup failure
- Empty strings supplied if env vars not set (could cause later failures)

---

### 3. backend/src/middleware/auth.middleware.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/middleware/auth.middleware.ts`

**Purpose**: Express middleware that verifies Bearer token authentication via Supabase Auth.

**Why This File Exists**: To protect routes that require authenticated users, ensuring only valid Supabase sessions can access protected endpoints.

**Responsibilities**:
- Extract `authorization` header from request
- Match Bearer token pattern (`^Bearer\s+(.+)$/i`)
- If no token: return 401 "Authorization bearer token is required"
- If Supabase not configured: return 503 "Backend Supabase is not configured"
- Verify token via `supabase.auth.getUser(accessToken)`
- If invalid/expired token: return 401 "Access token is invalid or expired"
- On success: attach `req.userId = data.user.id` and call `next()`

**Imported Modules**:
- `type { RequestHandler }` from "express" - Express RequestHandler type
- `{ supabase }` from `../lib/supabase.js` - Supabase client instance
- `{ AuthenticatedRequest }` from `../types/index.js` - Custom request type with `userId`

**Exported**: `requireAuth` - Express RequestHandler function

**Connected Files**:
- All route controllers import and use `requireAuth` to protect endpoints
- `backend/src/controllers/post.controller.ts` - Uses on all endpoints
- `backend/src/controllers/class.controller.ts` - Uses on all endpoints
- `backend/src/routes/*.ts` - Apply middleware to routes

**Key Logic**:
```typescript
const authorization = req.header("authorization");
const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
if (!accessToken) { return res.status(401).json({ ok: false, message: "Authorization bearer token is required" }); }
if (!supabase) { return res.status(503).json({ ok: false, message: "Backend Supabase is not configured" }); }
const { data, error } = await supabase.auth.getUser(accessToken);
if (error || !data.user) { return res.status(401).json({ ok: false, message: "Access token is invalid or expired" }); }
(req as AuthenticatedRequest).userId = data.user.id;
next();
```

**Error Handling**: Returns specific error messages for different failure cases:
- 401 No token provided
- 401 Invalid/expired token
- 503 Supabase not configured

**Edge Cases**:
- Token malformed (not Bearer format)
- Token expired but still matched by regex
- Supabase client not initialized (returns 503)

---

### 4. backend/src/middleware/error.middleware.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/middleware/error.middleware.ts`

**Purpose**: Global Express error handler middleware that catches and formats all errors.

**Why This File Exists**: To provide consistent error response format across all endpoints, preventing raw error messages from leaking to clients.

**Responsibilities**:
- Log error to console with `[API Error]:` prefix
- Determine status code from `err.status` or default to 500
- Return JSON response with `ok: false`, `message`, and optional `details`

**Imported Modules**:
- `type { ErrorRequestHandler }` from "express" - Express error handler type

**Exported**: `errorHandler` - Express ErrorRequestHandler function

**Connected Files**:
- `backend/src/index.ts` - Registered as app-wide error handler
- All controller methods that call `next(err)` pass errors to this handler

**Key Logic**:
```typescript
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("[API Error]:", err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    ok: false,
    message: err.message || "An unexpected internal error occurred",
  });
};
```

**Error Format**: Consistent JSON format:
```json
{
  "ok": false,
  "message": "error message",
  "details": "optional error details"
}
```

**Edge Cases**:
- Errors without `.message` property fall back to "An unexpected internal error occurred"
- Errors without `.status` property fall back to 500

---

### 5. backend/src/controllers/post.controller.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/controllers/post.controller.ts`

**Purpose**: HTTP controller for post-related operations. Contains handlers for creating, reading, updating, and deleting daily posts, as well as reactions and comments.

**Why This File Exists**: To handle HTTP requests for the core "daily photo" functionality, delegating business logic to `PostService`.

**Responsibilities**:
- `createPost()`: Create a new daily post (with daily limit enforcement via 409 conflict)
- `getTodayFeed()`: Get today's feed for a class (includes reactions, comments, signed URLs)
- `updateCaption()`: Update post caption (ownership verification)
- `deletePost()`: Delete a post (ownership/class membership verification)
- `toggleReaction()`: Toggle like/reaction on a post
- `createComment()`: Create a comment on a post
- `getComments()`: Get all comments for a post
- `updateComment()`: Update a comment (author ownership check)
- `deleteComment()`: Delete a comment (author ownership check)
- `toggleCommentReaction()`: Toggle reaction on a comment

**Imported Modules**:
- `{ Response, NextFunction }` from "express"
- `{ PostService }` from "../services/post.service.js"
- `{ AuthenticatedRequest }` from "../types/index.js"
- `createPostSchema`, `updateCaptionSchema` from "../validators/post.validator.js"
- `reactionSchema` from "../validators/reaction.validator.js"

**Exported Class**: `PostController` with static methods

**Connected Files**:
- `backend/src/services/post.service.ts` - Business logic delegation
- `backend/src/repositories/post.repository.ts` - Database operations (called via service)
- `backend/src/middleware/auth.middleware.ts` - Applied to all endpoints
- `backend/src/routes/post.routes.ts` - Route definitions
- `backend/src/validators/post.validator.ts` - Input validation schemas
- `backend/src/validators/reaction.validator.ts` - Reaction type validation

**Key Methods**:

**createPost**:
1. Parse and validate body using `createPostSchema`
2. If validation fails: return 400 with errors
3. Call `PostService.createDailyPost(classId, req.userId, photoPath, caption, promptId)`
4. On daily limit error (message includes "One photo per day"): return 409 conflict
5. On success: return 201 with created post
6. On other errors: pass to error middleware via `next(err)`

**getTodayFeed**:
1. Extract `classId` from query/params
2. Call `PostService.getTodayFeed(classId, req.userId)`
3. Return formatted feed with posts, userPostedToday flag

**updateCaption**:
1. Extract `postId` from params
2. Validate body using `updateCaptionSchema`
3. If invalid: return 400
4. Call `PostService.updateCaption(postId, req.userId, caption)`
5. Ownership check inside service (post.user_id !== userId → 403)
6. Return updated post

**deletePost**:
1. Extract `postId` from params
2. Call `PostService.deletePost(postId, req.userId)`
3. Ownership/membership check inside service
4. Return success message

**toggleReaction**:
1. Extract `postId` from params
2. Validate body using `reactionSchema`
3. If invalid: return 400
4. Call `PostService.toggleReaction(postId, req.userId, reactionType)`
5. Membership check inside service
6. Return result (action: "added"|"removed", reaction)

**createComment**:
1. Extract `postId` from params
2. Get `content` from request body
3. If content empty: return 400
4. Call `PostService.createComment(postId, req.userId, content)`
5. Return created comment

**getComments**:
1. Extract `postId` from params
2. Call `PostService.getCommentsForPost(postId, req.userId)`
3. Return comments

**updateComment**:
1. Extract `commentId` from params
2. Get `content` from request body
3. Call `PostService.updateComment(commentId, req.userId, content)`
4. Author ownership check inside service
5. Return updated comment

**deleteComment**:
1. Extract `commentId` from params
2. Call `PostService.deleteComment(commentId, req.userId)`
3. Author ownership check inside service
4. Return success message

**toggleCommentReaction**:
1. Extract `commentId` from params
2. Get `reactionType` from request body
3. If missing: return 400
4. Call `PostService.toggleCommentReaction(commentId, req.userId, reactionType)`
5. Membership and author checks inside service
6. Return result

**Error Handling**:
- Validation errors: 400 with error details
- Daily limit: 409 conflict
- Forbidden (ownership/membership): handled in service, propagated as 403
- Not found: handled in service, propagated as 404
- All other errors: passed to `next(err)` → errorHandler middleware

**Potential Issues**:
- Comment creation doesn't validate parentId (hardcoded to `undefined`)
- Error messages from service include "One photo per day rule" which is caught by specific check in createPost, but other errors are generic

---

### 6. backend/src/controllers/class.controller.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/controllers/class.controller.ts`

**Purpose**: HTTP controller for class/group management operations.

**Why This File Exists**: To handle HTTP requests for class creation, joining, and member management.

**Responsibilities**:
- `createClass()`: Create a new class/group
- `joinClass()`: Join a class using invite code
- `getUserClasses()`: Get all classes user is member of
- `getClassDetails()`: Get class details with membership check
- `getClassMembers()`: Get class member list

**Imported Modules**:
- `{ Response, NextFunction }` from "express"
- `{ ClassService }` from "../services/class.service.js"
- `{ AuthenticatedRequest }` from "../types/index.js"
- `createClassSchema`, `joinClassSchema` from "../validators/class.validator.js"

**Exported Class**: `ClassController` with static methods

**Connected Files**:
- `backend/src/services/class.service.ts` - Business logic delegation
- `backend/src/repositories/class.repository.ts` - Database operations
- `backend/src/validators/class.validator.ts` - Input validation schemas
- `backend/src/middleware/auth.middleware.ts` - Applied to all endpoints
- `backend/src/routes/class.routes.ts` - Route definitions

**Key Methods**:

**createClass**:
1. Parse and validate body using `createClassSchema`
2. If invalid: return 400 with errors
3. Call `ClassService.createClass(name, schoolName, academicYear, req.userId)`
4. Return created class

**joinClass**:
1. Parse and validate body using `joinClassSchema`
2. If invalid: return 400 with errors
3. Call `ClassService.joinClassByCode(parsedData.joinCode, req.userId)`
4. If already joined: return class + member + `alreadyJoined: true`
5. If new join: return class + member + `alreadyJoined: false`

**getUserClasses**:
1. Call `ClassService.getUserClasses(req.userId)`
2. Return list of classes

**getClassDetails**:
1. Extract `classId` from params
2. Call `ClassService.getClassDetails(classId, req.userId)`
3. Membership check inside service
4. Return class details

**getClassMembers**:
1. Extract `classId` from params
2. Call `ClassService.getClassMembers(classId, req.userId)`
3. Membership check inside service
4. Return member list

**Error Handling**:
- Validation errors: 400
- Class not found: 404 (from service)
- Not a member: 403 (from service)
- Other errors: passed to `next(err)` → errorHandler

---

### 7. backend/src/controllers/prompt.controller.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/controllers/prompt.controller.ts`

**Purpose**: HTTP controller for prompt-related operations.

**Why This File Exists**: To serve today's daily prompt to frontend clients.

**Responsibilities**:
- `getTodayPrompt()`: Get today's prompt from database or generate fallback

**Imported Modules**:
- `{ Request, Response, NextFunction }` from "express"
- `{ PromptService }` from "../services/prompt.service.js"

**Exported Class**: `PromptController` with static methods

**Connected Files**:
- `backend/src/services/prompt.service.ts` - Business logic
- `backend/src/routes/prompt.routes.ts` - Route definitions

**Key Method**:

**getTodayPrompt**:
1. Call `PromptService.getTodayPrompt()`
2. Return prompt object

**Error Handling**: Passes errors to `next(err)` → errorHandler middleware.

---

### 8. backend/src/services/post.service.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/services/post.service.ts`

**Purpose**: Business logic service for all post-related operations. Contains the core rules for daily posting, feed generation, reactions, comments, and captions.

**Why This File Exists**: To encapsulate business rules so controllers remain thin and logic is testable outside of HTTP context.

**Responsibilities**:
- `createDailyPost()`: Enforce one-photo-per-day rule, check class membership, create post
- `getTodayFeed()`: Generate today's feed with reactions, comments, author names, signed photo URLs
- `updateCaption()`: Validate ownership before caption update
- `deletePost()`: Validate ownership or class membership before deletion
- `toggleReaction()`: Check membership, toggle reaction in database
- `createComment()`: Delegate to repository
- `getCommentsForPost()`: Check membership, fetch comments
- `updateComment()`: Validate author ownership
- `deleteComment()`: Validate author ownership
- `toggleCommentReaction()`: Check membership, toggle comment reaction

**Imported Modules**:
- `{ ClassRepository }` from "../repositories/class.repository.js"
- `{ PostRepository }` from "../repositories/post.repository.js"
- `{ StorageService }` from "../storage/storage.service.js"
- Type interfaces from `../types/index.js`

**Exported Class**: `PostService` with static methods

**Connected Files**:
- `backend/src/repositories/post.repository.ts` - Database operations
- `backend/src/repositories/class.repository.ts` - Membership checks
- `backend/src/storage/storage.service.js` - Signed URL generation
- `backend/src/controllers/post.controller.ts` - HTTP handlers
- `backend/src/routes/post.routes.ts` - Route definitions

**Key Methods**:

**createDailyPost(classId, userId, photoPath, caption?, prompt?)**:
1. Check if user is member of class via `ClassRepository.isMember(classId, userId)`
2. If not member: throw 403 "You must be an enrolled member of this class to post."
3. Calculate `todayDate = new Date().toISOString().slice(0, 10).split('T')[0]`
   - **Note**: Uses client-local date (known timezone issue per audits)
4. Check if user already posted today via `PostRepository.findUserPostForDate(classId, userId, todayDate)`
5. If already posted: throw 409 "One photo per day rule: You have already posted for today."
6. Call `PostRepository.createDailyPost(classId, userId, photoPath, todayDate, promptId, caption)`
7. Return created post entity

**getTodayFeed(classId, userId)**:
1. Check if user is member of class via `ClassRepository.isMember(classId, userId)`
2. If not member: throw 403 "Access denied to private class feed."
3. Calculate `todayDate = new Date().toISOString().slice(0, 10)` (same timezone issue)
4. Check if user posted today: `findUserPostForDate`
5. Get all class posts for date via `PostRepository.getClassPostsForDate(classId, todayDate)`
6. For each post, format:
   - Generate signed download URL for photo (3600s expiry)
   - Build reactionsMap (count per reaction type)
   - Determine userReaction (if user already reacted)
   - Get author name from profiles
   - Fetch comments for post
7. Return `{ userPostedToday, posts: formatted[] }`

**updateCaption(postId, userId, caption?)**:
1. Find post by ID via `PostRepository.findById(postId)`
2. If not found: throw 404 "Post not found."
3. If post.user_id !== userId: throw 403 "Only the author can edit this post."
4. Call `PostRepository.updateCaption(postId, caption)`
5. Return updated post

**deletePost(postId, userId)**:
1. Find post by ID via `PostRepository.findById(postId)`
2. If not found: throw 404 "Post not found."
3. Ownership check: if post.user_id !== userId, check class membership
4. If not owner and not member: throw 403 "Not authorized to delete this post."
5. Call `PostRepository.softDelete(postId)` (sets deleted_at)
6. Return void

**toggleReaction(postId, userId, reactionType)**:
1. Find post by ID via `PostRepository.findById(postId)`
2. If not found: throw 404 "Post not found."
3. Check class membership: `ClassRepository.isMember(post.class_id, userId)`
4. If not member: throw 403 "You must be a member of the class to react."
5. Call `PostRepository.toggleReaction(postId, userId, reactionType)`
6. Return `{ action: "added"|"removed", reaction }`

**createComment(postId, userId, content, parentId?)**:
1. Delegate to `PostRepository.createComment(postId, userId, content, parentId)`
2. Return created comment

**getCommentsForPost(postId, userId)**:
1. Find post by ID via `PostRepository.findById(postId)`
2. If not found: return `[]`
3. Check class membership: `ClassRepository.isMember(post.class_id, userId)`
4. If not member: return `[]` (no comments accessible)
5. Call `PostRepository.getCommentsForPost(postId)`
6. Return comments

**updateComment(commentId, userId, content)**:
1. Find comment by ID via `PostRepository.findByCommentId(commentId)`
2. If not found: throw 404 "Comment not found."
3. If comment.user_id !== userId: throw 403 "Only the author can edit this comment."
4. Call `PostRepository.updateComment(commentId, userId, content)`
5. Return updated comment

**deleteComment(commentId, userId)**:
1. Find comment by ID via `PostRepository.findByCommentId(commentId)`
2. If not found: throw 404 "Comment not found."
3. If comment.user_id !== userId: throw 403 "Only the author can delete this comment."
4. Call `PostRepository.deleteComment(commentId, userId)`
5. Return void

**toggleCommentReaction(commentId, userId, reactionType)**:
1. Find comment by ID via `PostRepository.findByCommentId(commentId)`
2. If not found: throw 404 "Comment not found."
3. Find parent post via `PostRepository.findById(comment.post_id)`
4. If not found: return `{ action: "added", reaction: null }`
5. Check class membership: `ClassRepository.isMember(post.class_id, userId)`
6. If not member: throw 403 "You must be a member to react."
6. Call `PostRepository.toggleCommentReaction(commentId, userId, reactionType)`
7. Return `{ action: "added"|"removed", reaction }`

**Error Handling**:
- 403: Membership/ownership violations
- 404: Post/comment not found
- 409: Daily post limit exceeded
- Errors passed to controller → errorHandler

**Critical Logic - Daily Post Enforcement**:
- Uses `new Date().toISOString().slice(0, 10)` for "today" date
- **Known issue**: Timezone-dependent - user in UTC+14 could post at different "today" than UTC-12
- No server-side date normalization

**Critical Logic - Class Membership**:
- Every operation checks `ClassRepository.isMember()` before proceeding
- Ensures only class members can post, view feed, react

**Storage Integration**:
- `getTodayFeed()` uses `StorageService.createSignedDownloadUrl(post.photo_path, 3600)` to generate temporary photo URLs
- Falls back to `post.photo_path` if signed URL generation fails

---

### 9. backend/src/services/class.service.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/services/class.service.ts`

**Purpose**: Business logic service for class/group management operations.

**Why This File Exists**: To encapsulate class/group business rules and delegate to repository for database operations.

**Responsibilities**:
- `createGroup()`: Create new group with owner membership
- `joinGroupByCode()`: Join group by invite code
- `getGroupMembers()`: List group members
- `createClass()`: Create class (delegates to repository with owner membership)
- `joinClassByCode()`: Join class by invite code
- `getClassDetails()`: Get class details with membership check
- `getClassMembers()`: Get class members
- `getUserClasses()`: Get user's classes

**Imported Modules**:
- `{ ClassRepository }` from "../repositories/class.repository.js"
- Type interfaces from `../types/index.js`

**Exported Class**: `ClassService` with static methods

**Connected Files**:
- `backend/src/repositories/class.repository.ts` - Database operations
- `backend/src/controllers/class.controller.ts` - HTTP handlers
- `backend/src/routes/class.routes.ts` - Route definitions

**Key Methods**:

**createGroup(name, userId, description?, isPrivate?, inviteOnly?)**:
1. Generate unique join code: `GRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
2. Insert into `groups` table
3. Add creator as owner member via `ClassRepository.addMember()`
4. Return created group

**joinGroupByCode(joinCode, userId)**:
1. Clean code: trim + uppercase
2. Find group by join code via `ClassRepository.findGroupByJoinCode()`
3. If not found: throw "Group not found"
4. If archived: throw "This group has been archived"
5. Check if user already member via `ClassRepository.isMember()`
6. If already member: return existing member info
7. If new member: add member via `ClassRepository.addMember()`
8. Return group + member + alreadyJoined status

**getGroupMembers(groupId, userId)**:
1. Check if user is member via `ClassRepository.isMember()`
2. If not: throw "You do not have access to view members"
3. Return member list with profile data

**createClass(name, schoolName, academicYear, userId)**:
1. Delegate to `ClassRepository.createClassWithOwner()`
2. Creates class + adds creator as owner

**joinClassByCode(joinCode, userId)**:
1. Clean code: trim + uppercase
2. Find class by join code via `ClassRepository.findByJoinCode()`
3. If not found: throw "Class not found"
4. If archived: throw "This class has been archived"
5. Check if already member via `ClassRepository.isMember()`
6. If already member: return existing member
7. If new member: add member via `ClassRepository.addClassMember()`
8. Return class + member + alreadyJoined status

**getClassDetails(classId, userId)**:
1. Check if user is member via `ClassRepository.isMember()`
2. If not: throw "You do not have access to this private class."
3. Find class by ID via `ClassRepository.findById()`
4. If not found: throw "Class not found."
5. Return class entity

**getClassMembers(classId, userId)**:
1. Check if user is member via `ClassRepository.isMember()`
2. If not: throw "You do not have access to view members"
3. Return member list with profile data

**getUserClasses(userId)**:
1. Query classes where `created_by = userId`
2. Return list

**Error Handling**:
- Group/class not found: appropriate error message
- Already member: handled gracefully
- Not a member: 403 error propagated to controller

---

### 10. backend/src/services/prompt.service.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/services/prompt.service.ts`

**Purpose**: Service for managing daily prompts.

**Why This File Exists**: To provide today's prompt to users creating daily posts.

**Responsibilities**:
- `getTodayPrompt()`: Get today's prompt from database or generate fallback

**Imported Modules**:
- `{ PromptRepository }` from "../repositories/prompt.repository.js"
- Type interfaces from `../types/index.js`
- `FALLBACK_PROMPTS` array of 10 default prompts

**Exported Class**: `PromptService` with static methods

**Connected Files**:
- `backend/src/repositories/prompt.repository.ts` - Database operations
- `backend/src/controllers/prompt.controller.ts` - HTTP handlers
- `backend/src/routes/prompt.routes.ts` - Route definitions

**Key Method**:

**getTodayPrompt()**:
1. Calculate `todayDate = new Date().toISOString().slice(0, 10)` (same timezone pattern)
2. Try to get existing prompt for today via `PromptRepository.getPromptForDate(todayDate)`
3. If existing prompt: return it
4. Calculate `dayOfYear` from start of year
5. Select prompt from `FALLBACK_PROMPTS[dayOfYear % FALLBACK_PROMPTS.length]`
6. Try to create prompt in database via `PromptRepository.createPrompt(promptText, todayDate)`
7. On creation failure: retry by getting prompt for date
8. On retry failure: return fallback object with virtual prompt ID

**FALLBACK_PROMPTS** (10 prompts):
1. "Show us your current view."
2. "What made you smile today?"
3. "What's on your desk?"
4. "Show us your lunch or study snack."
5. "Something blue."
6. "Something interesting you saw today."
7. "Your after-school life."
8. "Something that represents your day."
9. "Show us something you are working on."
10. "Capture a small moment from today."

**Error Handling**: Graceful fallback if database operations fail

---

### 11. backend/src/repositories/post.repository.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/repositories/post.repository.ts`

**Purpose**: Database operations for the `daily_posts` table and related entities (comments, reactions).

**Why This File Exists**: To abstract Supabase database queries for posts, keeping business logic in services and controllers thin.

**Responsibilities**:
- `createDailyPost()`: Insert new daily post
- `findUserPostForDate()`: Find if user posted today
- `getClassPostsForDate()`: Get all posts for a class on a date
- `findById()`: Find post by ID
- `findByCommentId()`: Find comment by ID
- `updateCaption()`: Update post caption
- `softDelete()`: Mark post as deleted (soft delete via deleted_at)
- `createComment()`: Insert new comment
- `getCommentsForPost()`: Get all comments for a post
- `updateComment()`: Update comment content
- `deleteComment()`: Delete comment
- `toggleCommentReaction()`: Toggle reaction on comment
- `toggleReaction()`: Toggle reaction on post

**Imported Modules**:
- `{ getSupabaseClient }` from "../lib/supabase.js"
- Type interfaces from `../types/index.js`

**Exported Class**: `PostRepository` with static methods

**Connected Files**:
- `backend/src/services/post.service.ts` - Calls these methods
- `backend/src/lib/supabase.js` - Supabase client configuration

**Key Methods**:

**createDailyPost(classId, userId, photoPath, postDate, promptId?, caption?)**:
```typescript
const { data, error } = await client
  .from("daily_posts")
  .insert({
    class_id: classId,
    user_id: userId,
    photo_path: photoPath,
    post_date: postDate,
    prompt_id: promptId || null,
    caption: caption || null,
  })
  .select()
  .single();
if (error) throw error;
return data as DailyPostEntity;
```

**findUserPostForDate(classId, userId, postDate)**:
```typescript
const { data, error } = await client
  .from("daily_posts")
  .select("*")
  .eq("class_id", classId)
  .eq("user_id", userId)
  .eq("post_date", postDate)
  .is("deleted_at", null)
  .maybeSingle();
```

**getClassPostsForDate(classId, postDate)**:
```typescript
const { data, error } = await client
  .from("daily_posts")
  .select(
    "*, reactions (*), profiles:user_id (display_name, username, avatar_path), comments (*)"
  )
  .eq("class_id", classId)
  .eq("post_date", postDate)
  .is("deleted_at", null)
  .order("created_at", { ascending: false });
```

**toggleReaction(postId, userId, reactionType)**:
```typescript
const { data: existing } = await client
  .from("reactions")
  .select("*")
  .eq("post_id", postId)
  .eq("user_id", userId)
  .eq("reaction_type", reactionType)
  .maybeSingle();
if (existing) {
  await client.from("reactions").delete().eq("id", existing.id);
  return { action: "removed", reaction: null };
}
const { data: created } = await client
  .from("reactions")
  .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
  .select()
  .single();
if (error) throw error;
return { action: "added", reaction: created as ReactionEntity };
```

**createComment(postId, userId, content, parentId?)**:
```typescript
const { data, error } = await client
  .from("comments")
  .insert({
    post_id: postId,
    user_id: userId,
    parent_id: parentId || null,
    content,
    is_edited: false,
  })
  .select()
  .single();
```

**getCommentsForPost(postId)**:
```typescript
const { data, error } = await client
  .from("comments")
  .select("*, profiles:user_id (display_name, username, avatar_path), comments (*)")
  .eq("post_id", postId)
  .order("created_at", { ascending: true });
```

**toggleCommentReaction(commentId, userId, reactionType)**:
Checks if reaction exists, deletes if so, or creates new reaction.

**Error Handling**:
- All Supabase errors thrown as Errors
- Callers (services) check error messages and status codes

---

### 12. backend/src/repositories/class.repository.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/repositories/class.repository.ts`

**Purpose**: Database operations for groups, classes, members, and invitations.

**Why This File Exists**: To abstract Supabase database queries for class/group management, keeping service layer clean.

**Responsibilities**:
- Group operations: create, find by join code, isMember, addMember, getMembers
- Class operations: createWithOwner, findByJoinCode, findById, getUserClasses
- Group invitations: create, consume
- Class/group bridging: link/unlink classes to groups
- Bridge: getGroupsForClass

**Imported Modules**:
- `createClient, type SupabaseClient` from '@supabase/supabase-js'
- `{ env }` from '../config/env.js'
- Type interfaces from `../types/index.js`
- Creates `supabaseAdmin` client using service role key

**Key Features**:
- Uses `supabaseAdmin` (service role key) for all operations - bypasses RLS
- All group/class operations check membership via `isMember()`
- Join code generation and validation
- Invitation system with expiration

**Key Methods**:

**isMember(groupId, userId)**:
```typescript
const { data, error } = await supabaseAdmin
  .from("group_members")
  .select("id")
  .eq("group_id", groupId)
  .eq("user_id", userId)
  .maybeSingle();
return Boolean(data);
```

**addMember(groupId, userId, role)**:
```typescript
const { data, error } = await supabaseAdmin
  .from("group_members")
  .upsert(
    { group_id: groupId, user_id: userId, role },
    { onConflict: "group_id,user_id" }
  )
  .select()
  .single();
```

**createClassWithOwner(name, userId, academicYear, schoolName?)**:
1. Insert into `classes` table
2. Add creator as owner member via `class_members` table
3. Return created class

**findGroupByJoinCode(joinCode)**:
```typescript
const { data, error } = await supabaseAdmin
  .from("groups")
  .select("*")
  .eq("join_code", upperCode)
  .maybeSingle();
```

**getUserClasses(userId)**:
```typescript
const { data, error } = await supabaseAdmin
  .from("classes")
  .select("*")
  .eq("created_by", userId);
```

**createInvitation(groupId, inviterId, email)**:
1. Generate unique code: `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
2. Insert into `group_invitations` with 7-day expiration
3. Return invitation

**consumeInvitation(groupId, code, userId)**:
1. Check invitation exists and not consumed
2. If already member: return member info
3. Consume invitation and add member

**Error Handling**:
- Supabase errors thrown as Errors
- Unique constraint violations handled (join code retries)

---

### 13. backend/src/repositories/prompt.repository.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/repositories/prompt.repository.ts`

**Purpose**: Database operations for the `daily_prompts` table.

**Why This File Exists**: To abstract Supabase queries for prompt management.

**Responsibilities**:
- `getPromptForDate(dateStr)`: Find prompt for specific date
- `createPrompt(promptText, promptDate)`: Create new prompt

**Imported Modules**:
- `{ getSupabaseClient }` from "../lib/supabase.js"
- Type interfaces from `../types/index.js`

**Exported Class**: `PromptRepository` with static methods

**Connected Files**:
- `backend/src/services/prompt.service.ts` - Calls these methods
- `backend/src/routes/prompt.routes.ts` - Route definitions

**Key Methods**:

**getPromptForDate(dateStr)**:
```typescript
const { data, error } = await client
  .from("daily_prompts")
  .select("*")
  .eq("prompt_date", dateStr)
  .maybeSingle();
```

**createPrompt(promptText, promptDate)**:
```typescript
const { data, error } = await client
  .from("daily_prompts")
  .insert({ prompt_text: promptText, prompt_date: promptDate })
  .select()
  .single();
```

---

### 14. backend/src/types/index.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/types/index.ts`

**Purpose**: Central TypeScript type definitions shared across the backend.

**Why This File Exists**: To provide type safety across all layers (controllers, services, repositories) and define the shape of API requests/responses.

**Responsibilities**:
- `AuthenticatedRequest` - Express request with attached `userId`
- `UserRecord` - Supabase user profile interface
- `MemoraUserProfile` - Memora-specific profile data
- `GroupEntity`, `GroupMemberEntity` - Group/class membership types
- `ClassEntity`, `ClassMemberEntity` - Class membership types
- `GroupEntity`, `GroupInvitationEntity` - Invitation types
- `DailyPostEntity`, `DailyPromptEntity` - Post/prompt types
- `ReactionEntity`, `CommentEntity`, `CommentReactionEntity` - Reaction/comment types
- `NotificationEntity`, `TimeCapsuleEntity`, `TimeCapsuleItemEntity` - Advanced entities
- `YearbookEntity`, `YearbookMemberEntity` - Yearbook types
- `SearchFilters`, `PaginationParams`, `PaginationResult` - Query types
- `ApiResponse`, `ApiErrorResponse`, `PaginatedApiResponse` - API response formats

**Imported Modules**:
- `type { Request }` from "express"

**Exported**: 30+ type interfaces

**Connected Files**:
- All backend source files import from this module

**Key Types**:
- `AuthenticatedRequest extends Request { userId: string; }` - Middleware attachment
- `DailyPostEntity` - Includes id, class_id, user_id, photo_path, prompt_id, post_date, caption, created_at, updated_at, deleted_at?
- `ReactionEntity` - id, post_id, user_id, reaction_type, created_at
- `CommentEntity` - id, post_id, user_id, parent_id, content, is_edited, created_at, updated_at
- `ApiResponse<T>` - `{ ok: boolean; data?: T; error?: string; message?: string }`

---

### 15. backend/src/validators/post.validator.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/validators/post.validator.ts`

**Purpose**: Zod validation schemas for post-related API requests.

**Why This File Exists**: To validate incoming request bodies before processing, ensuring data integrity and consistent error messages.

**Responsibilities**:
- `createPostSchema`: Validate daily post creation payload
- `updateCaptionSchema`: Validate caption update payload

**Imported Modules**:
- `{ z }` from "zod" - Validation library

**Exported**: `createPostSchema`, `updateCaptionSchema`

**Key Schemas**:

**createPostSchema**:
```typescript
z.object({
  classId: z.string().uuid("Invalid class ID"),
  photoPath: z.string().min(1, "Photo path is required"),
  promptId: z.string().uuid().optional().nullable(),
  caption: z.string().max(280).optional().nullable(),
});
```

**Validation Rules**:
- `classId`: Must be a valid UUID string
- `photoPath`: Must be non-empty string (min 1 char)
- `promptId`: Optional UUID, if provided must be valid UUID
- `caption`: Optional, max 280 characters if provided

**updateCaptionSchema**:
```typescript
z.object({
  caption: z.string().max(280).nullable().optional(),
});
```

**Validation Rules**:
- `caption`: Optional string, max 280 characters

**Error Handling**: Zod's `parsed.error.flatten()` returns structured error messages

---

### 16. backend/src/validators/class.validator.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/validators/class.validator.ts`

**Purpose**: Zod validation schemas for class/group-related API requests.

**Why This File Exists**: To validate class creation and join code payloads.

**Responsibilities**:
- `createClassSchema`: Validate class creation payload
- `joinClassSchema`: Validate join code payload

**Imported Modules**:
- `{ z }` from "zod"

**Exported**: `createClassSchema`, `joinClassSchema`

**Key Schemas**:

**createClassSchema**:
```typescript
z.object({
  name: z.string().min(2, "Class name must be at least 2 characters").max(80),
  schoolName: z.string().max(120).optional(),
  academicYear: z.number().int().min(2000).max(2100),
});
```

**Validation Rules**:
- `name`: Required, min 2 chars, max 80 chars
- `schoolName`: Optional, max 120 chars
- `academicYear`: Required integer, between 2000-2100

**joinClassSchema**:
```typescript
z.object({
  joinCode: z
    .string()
    .min(4)
    .max(16)
    .transform((val) => val.toUpperCase().trim()),
});
```

**Validation Rules**:
- `joinCode`: Required, min 4 chars, max 16 chars
- `.transform()`: Automatically uppercase and trim the code

---

### 17. backend/src/validators/reaction.validator.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/validators/reaction.validator.ts`

**Purpose**: Zod validation schema for reaction type requests.

**Why This File Exists**: To validate that only valid reaction types are accepted.

**Responsibilities**:
- `reactionSchema`: Validate reaction type

**Imported Modules**:
- `{ z }` from "zod"

**Exported**: `reactionSchema`

**Key Schema**:
```typescript
z.object({
  reactionType: z.enum(["heart", "laugh", "cry", "fire", "dead", "respect"]),
});
```

**Validation Rules**:
- `reactionType`: Must be one of: "heart", "laugh", "cry", "fire", "dead", "respect"
- Any other value fails validation with Zod error

---

### 18. backend/src/lib/supabase.ts

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/backend/src/lib/supabase.ts`

**Purpose**: Supabase client configuration for the backend.

**Why This File Exists**: To create and export Supabase clients used throughout the backend.

**Responsibilities**:
- Create `supabase` client using env vars and service role key (for admin operations)
- Export `getSupabaseClient()` function that throws if Supabase not configured

**Imported Modules**:
- `createClient` from '@supabase/supabase-js'
- `{ env }` from '../config/env.js'

**Exported**:
- `supabase` - Client instance (null if env vars missing)
- `getSupabaseClient()` - Throws if supabase is null

**Key Logic**:
```typescript
export const supabase = env.supabaseUrl && env.supabaseServiceRoleKey
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabase;
}
```

**Error Handling**: Throws descriptive error if Supabase environment variables are not set.

---

### 19. frontend/app/(auth)/login.tsx

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/frontend/app/(auth)/login.tsx`

**Purpose**: Authentication login screen for the Memora application.

**Why This File Exists**: To provide the user interface for existing users to sign in.

**Responsibilities**:
- Email/password login form
- Supabase Auth integration via `useAuth` hook
- Theme toggle (light/dark)
- "Continue without account" option
- Forgot password link

**Imported Modules**:
- `useAuth` from '@/hooks/useAuth'
- `hasSupabaseConfig` from '@/lib/supabase/client'
- `useAppTheme` from '@/providers/ThemeProvider'
- Various UI components (BackgroundPattern, Icons, Button, TextInput, etc.)

**Exported Component**: `LoginScreen` default export

**Connected Files**:
- `frontend/hooks/useAuth.ts` - Auth state management
- `frontend/lib/supabase/client.ts` - Supabase client
- `frontend/app/(auth)/forgot-password.tsx` - Forgot password screen
- `frontend/app/(onboarding)/welcome.tsx` - Onboarding after login

**Key Logic**:
1. State: email, password, error messages, isSubmitting, form fields
2. `handleLogin()`: Calls `signInWithEmail(email, password)` from useAuth
3. On success: navigate to onboarding welcome screen
4. On failure: display error message based on error type
5. HasSupabaseConfig check: shows either Supabase login form or "continue locally" option

**Error Handling**:
- "Invalid email or password" for bad credentials
- "Please verify your email before signing in" for unconfirmed emails
- Network errors for connectivity issues
- Generic error for other cases

**Edge Cases**:
- `hasSupabaseConfig` check: if no Supabase configured, shows "continue locally" path
- Remember Me toggle stores preference in AsyncStorage
- Theme persistence across sessions

---

### 20. frontend/app/(auth)/register.tsx

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/frontend/app/(auth)/register.tsx`

**Purpose**: User registration screen for the Memora application.

**Why This File Exists**: To provide the user interface for new users to create an account.

**Responsibilities**:
- Full name, email, password, confirm password fields
- Sign up with email via Supabase Auth
- Success/error message handling
- Navigation to onboarding after successful registration

**Imported Modules**:
- `signUpWithEmail` from '@/lib/supabase/auth'
- `useAppTheme` from '@/providers/ThemeProvider'
- Various UI components

**Exported Component**: `RegisterScreen` default export

**Connected Files**:
- `frontend/lib/supabase/auth.ts` - Sign up function
- `frontend/hooks/useAuth.ts` - Auth state (uses signInWithEmail)
- `frontend/app/(onboarding)/welcome.tsx` - Onboarding after registration

**Key Logic**:
1. State: name, email, password, confirmPassword, validation errors, messages
2. `handleRegister()`: Validates all fields, calls `signUpWithEmail()`
3. On success with session: navigate to onboarding after 1s delay
4. On success without session: show message to check email
5. On error: display error message

**Error Handling**:
- "This email is already registered" - shows message to sign in instead
- Generic error message for other failures
- Password validation: 8+ chars, must have upper, lower, digit

**Edge Cases**:
- Password strength validation (8+ chars, upper/lower/digit)
- Confirm password matching
- Email format validation

---

### 21. frontend/app/(tabs)/home.tsx

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/frontend/app/(tabs)/home.tsx`

**Purpose**: Home screen - the main feed screen showing today's memories and class posts.

**Why This File Exists**: This is the primary screen users see when opening the app, showing today's prompt, their posting status, and the class feed.

**Responsibilities**:
- Display today's prompt
- Show user's posting status (have they posted today?)
- Show classmates' posts for today
- Handle photo capture/upload flow
- Display reactions and interactions
- Show streak information
- Search and filter functionality

**Imported Modules**:
- `useAppTheme` from '@/providers/ThemeProvider'
- `useFocusEffect`, `useCallback` from 'react'
- Supabase client for auth state
- `getLocalPhotoPosts`, `hasPostedToday`, etc. from '@/lib/photo-draft'
- `defaultPrompts` from '@/constants/prompts'
- `MemoryCard`, `SectionHeader`, `FilterChips`, `EmptyState` UI components
- `AppHeader`, `Button`, `SearchBar`, `Avatar` UI components
- `Skeleton` loading components
- `useCommandPalette` component

**Exported Component**: `HomeScreen` default export

**Connected Files**:
- `frontend/hooks/useAuth.ts` - Authentication state
- `frontend/lib/photo-draft.ts` - Local photo management, hasPostedToday, computeCurrentStreak
- `frontend/constants/prompts.ts` - Default prompts
- `frontend/components/ui/` - UI components
- `frontend/app/(tabs)/create.tsx` - Create new post screen
- `frontend/app/(tabs)/today.tsx` - Today screen
- `frontend/app/class/[classId].tsx` - Class detail screen

**Key State Variables**:
- `posts`: Local photo posts from AsyncStorage
- `favorites`: Favorite posts
- `isLoading`: Load state
- `reactionsMap`, `userReactions`: Reaction state
- `errorMessage`: Error state
- `selectedFilter`: Filter state ('All', 'People', 'Places', 'Events')
- `searchQuery`: Search input state
- `profileName`: Display name (defaults to "Memory Keeper")
- `todayPrompt`: Today's prompt text

**Key Logic**:

**loadPosts()**:
1. Get local photo posts and favorite posts from AsyncStorage
2. Set state with fetched posts

**handleReact(postId, emoji)**:
1. If no Supabase: return (no-op)
2. Get backend URL from expoConfig
3. Get session from Supabase
4. Get userId from session
5. POST to `/api/reactions` with postId and reactionType
6. On success: update local posts state with new reactions
7. On error: show error message

**matchesSearch(post)**:
1. Check if search query matches post caption, title, location, tags, or date

**Key Flow - Daily Posting**:
- `handleCaptureWithPrompt()`: Sets photo draft with today's prompt, navigates to create screen
- `hasPostedToday(posts)`: Checks if any non-archived post has today's date
- `getTodayPost(posts)`: Gets the post from today
- `getOnThisDayMemories(posts)`: Gets posts from same month/day but different year

**Daily Posting Flow**:
1. User taps "Capture Today's Photo" button
2. Navigate to `create.tsx` screen
3. In create screen, send POST to `/api/daily-posts` with classId, userId, photoPath, caption
4. Backend enforces one-photo-per-day rule (returns 409 if already posted)
5. On 409: show error "You have already posted a photo today"
6. On success: also call `publishLocalPhoto()` to save locally
7. Navigate back to home screen

**Error Handling**:
- Network errors: caught in try/catch
- Daily limit 409: shown as error message
- Other errors: shown as "Could not save memory to server"

**Performance Issues**:
- `getLocalPhotoPosts()` loads ALL posts from AsyncStorage (no pagination)
- `hasPostedToday()` iterates all posts O(n)
- `computeCurrentStreak()` iterates 365 days O(365) constant
- No image caching - images re-fetch each visit

---

### 22. frontend/app/(tabs)/create.tsx

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/frontend/app/(tabs)/create.tsx`

**Purpose**: Create new memory/post screen - where users add details and save their daily photo.

**Why This File Exists**: This is the screen where users capture/import a photo, add title/caption/tags, and save it as today's post.

**Responsibilities**:
- Camera/gallery photo selection
- Photo preview display
- Title, caption, location, tag inputs
- Save memory with daily posting enforcement
- Stepper interface (landing → details)

**Imported Modules**:
- `publishLocalPhoto` from '@/lib/photo-draft'
- `useClass` from '@/hooks/useClass'
- `useToast` from '@/components/ui/Toast'
- Supabase client for auth
- Various UI components

**Exported Component**: `CreateScreen` default export

**Connected Files**:
- `frontend/hooks/useClass.ts` - Active class management
- `frontend/lib/photo-draft.ts` - publishLocalPhoto, hasPostedToday
- `frontend/app/(tabs)/home.tsx` - Home screen (navigated to from here)
- `frontend/app/class/[classId].tsx` - Class detail screen

**Key State Variables**:
- `step`: 'landing' or 'details' stepper state
- `photoUri`: Selected photo URI from camera/gallery
- `caption`, `title`, `location`, `tags`, `category`: Form inputs
- `isSaving`, `isProcessing`: Loading states
- `errorMessage`: Error state
- `activeClass`: Currently selected class

**Key Logic**:

**handleTakePhoto()**:
1. Request camera permissions
2. Launch camera via expo-image-picker
3. On success: set photoUri, navigate to details step

**handleChooseFromLibrary()**:
1. Request photo library permissions
2. Launch image picker
3. On success: set photoUri, navigate to details step

**handleSave()**:
This is the critical function - complex flow:

1. If no photoUri: return early
2. Set isSaving=true, clear errorMessage
3. If no Supabase: throw error "Supabase is not configured."
4. Get session from Supabase auth
5. Get classId from activeClass
6. Get userId from session
7. If no userId: show "User not authenticated" error
8. If no classId: show "Please select a class first" error
9. Construct backend URL from expoConfig
10. POST to `/api/daily-posts` with {classId, userId, photoPath, caption}

**Daily Posting Flow (handleSave)**:
- **If response.status === 409**: Show "You have already posted a photo today" error, stop
- **If !response.ok**: Show error, call `publishLocalPhoto()` as local fallback, navigate home
- **If response.ok**: Call `publishLocalPhoto()` as cache, show success, navigate home

**The Three-Part Save Flow**:
```
POST /api/daily-posts
    │
    ├───> 409 Daily limit reached
    │       │
    │       └─> Show error, do NOT upload
    │
    ├───> !response.ok (network error or other)
    │       │
    │       └─> publishLocalPhoto() as offline fallback
    │           │
    │           └─> Show "Memory saved locally!", navigate home
    │
    └───> 201 Success
            │
            └─> publishLocalPhoto() as local cache
                │
                └─> Show "Memory saved!", navigate home
```

** publishLocalPhoto()** details:
1. Image manipulation: resize to 1280px width, compress 0.8 quality (JPEG)
2. Store locally in `memora-photos/` directory (expo-file-system)
3. Create LocalPhotoPost object with id, uri, caption, category, tags, location
4. Prepend to AsyncStorage `memora.posts.v1`
5. Clear photo draft
6. Return updated posts list

**Edge Cases**:
- No camera permission: show error "Camera permission is required"
- No photo library permission: show error "Photo library permission is required"
- Backend not configured: save locally only, show informative message
- Network errors during save: save locally as fallback, show "Memory saved locally!"

**Stepper Flow**:
- Landing step: Shows "What do you want to remember?" options (Take photo, Choose from gallery)
- Details step: Shows photo preview, title, caption, category pills, location, tags, save button
- Can go back from details to landing (discard changes prompt if form filled)

---

### 23. frontend/app/(tabs)/today.tsx

**File Path**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora/frontend/app/(tabs)/today.tsx`

**Purpose**: Today screen - shows a chronological collection of moments from the user's circle.

**Why This File Exists**: Alternative feed screen showing moments in a different visual layout than the home screen.

**Responsibilities**:
- Display story rail with top posts and class stories
- Show "For you" feed of recent memories
- Handle likes/interactions (local only)
- Show yearbook access
- Display sample/mock data with clear labeling

**Imported Modules**:
- `useAuth` from '@/hooks/useAuth'
- `getLocalPhotoPosts` from '@/lib/photo-draft'
- `previewPosts`, `previewStories` from '@/lib/social-preview' (mock data)
- Various UI components

**Exported Component**: `TodayScreen` default export

**Connected Files**:
- `frontend/hooks/useAuth.ts` - Authentication state
- `frontend/lib/photo-draft.ts` - getLocalPhotoPosts
- `frontend/lib/social-preview.ts` - Mock preview data
- `frontend/components/ui/` - UI components

**Key State Variables**:
- `localPhotoPosts`: Posts from AsyncStorage
- `isLoading`: Load state
- `likedPosts`: Set of liked post IDs (local only)
- `activeStory`, `activeNotice`: Modal state
- `showPreviewNote`: Whether to show "SAMPLE" notice

**Key Logic**:

**useFocusEffect()**:
1. Load local photo posts from AsyncStorage when screen focuses
2. Set loading state

**toggleLike(postId)**:
1. Toggle post ID in local Set
2. No backend call - local only

**feedPosts construction**:
1. Map localPhotoPosts to feed format
2. Spread previewPosts (mock data) with `isPreview: true` flag
3. Combined list shown to user

**Key Visual Elements**:
- Story rail: Top post + class stories (preview data)
- "For you" feed: Recent memories
- Yearbook strip at bottom
- Sample notices: "SAMPLE" marking on preview data
- Search button navigates to discover screen

**Sample/Mock Data Handling**:
- `previewPosts` and `previewStories` are hardcoded mock data from `social-preview.ts`
- Clearly marked with "SAMPLE" or "ON THIS DEVICE" labels
- "NOT CONNECTED TO A LIVE FEED" education text in modal

**Edge Cases**:
- No local posts: show "Your first moment starts here" empty state
- No preview data: show capture link
- Likes are local-only, never persist to backend

---

### 24. frontend/app/(tabs)/class.tsx

*(Need to read this file)*