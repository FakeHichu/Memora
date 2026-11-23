# 05_APPLICATION_EXECUTION_FLOW.md

## Startup Sequence and Execution Diagrams

This section documents the startup sequences and execution flows for both the backend and frontend applications.

---

### Backend Startup Sequence

```mermaid
flowchart TD
    A[Process Start] --> B[load dotenv from ../.env]
    B --> C[Read env vars: PORT, EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FRONTEND_URL]
    C --> D{supabaseUrl && supabaseServiceRoleKey?}
    D -- Yes --> E[Create supabase client via createClient()]<br/>with auth: {persistSession: false, autoRefreshToken: false}
    D -- No --> F[supabase = null]
    E --> G[Create Express app]
    G --> H[Configure CORS: origin=env.frontendUrl, credentials:true]
    G --> I[Body parser: express.json({ limit: '10mb' })]
    G --> J[Health endpoint: GET /api/health]
    G --> K[Ready endpoint: GET /api/ready]<br/>{ checks SUPABASE_URL and tests DB connection }
    G --> L[Mount apiRoutes under /api prefix]<br/>- class routes<br/>- post routes<br/>- prompt routes
    G --> M[Register errorHandler middleware]
    N[Server listen on env.port (default 4000)]
    
    style D fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style F fill:#ffebee,stroke:#b71c1c,stroke-width:2px
```

**Detailed Steps**:

1. **dotenv loading** (`backend/src/config/env.ts`): 
   - `dotenv.config({ path: path.resolve(path.dirname(new URL(import.meta.url).pathname), '../.env') })`
   - All `process.env` values are populated from `.env` file

2. **Supabase client creation** (`backend/src/lib/supabase.ts`):
   - If `env.supabaseUrl && env.supabaseServiceRoleKey`: create admin client
   - Else: `supabase = null`

3. **Express app configuration** (`backend/src/index.ts`):
   - CORS with `origin: env.frontendUrl` and `credentials: true`
   - JSON body parsing with 10MB limit
   - Health check endpoint at `/api/health`
   - Readiness check at `/api/ready`

4. **Route mounting** (`backend/src/routes/index.js`):
   - All API routes mounted under `/api` prefix
   - Class routes, post routes, prompt routes composed and registered

5. **Error handler registration** (`backend/src/middleware/error.middleware.ts`):
   - Global error handler catches all unhandled errors
   - Returns JSON `{ok: false, message, details}` with appropriate status code

6. **Server start**:
   - `app.listen(env.port, () => console.log(`Memora API running on port ${env.port}`))`
   - Default port: 4000

---

### Frontend Startup Sequence (Expo RN)

```mermaid
flowchart TD
    A[Expo App Launch] --> B[ThemeProvider initialization]
    B --> C[useAuth hook: initialize Supabase session]
    C --> D{hasSupabaseConfig?}
    D -- Yes --> E[Show Supabase auth UI (login/register)]
    D -- No --> F[Show "continue locally" path]
    E --> G[User signs in/up]
    G --> H[Navigate to onboarding welcome screen]
    F --> H
    H --> I[useFocusEffect on home screen]
    I --> J[loadPosts(): AsyncStorage fetch]
    J --> K[Render feed with today's prompt, class posts, reactions]
    K --> L[User interactions (react, create post, etc.)]
```

**Detailed Steps**:

1. **App initialization**: ThemeProvider sets up light/dark mode persistence
2. **Auth state**: `useAuth` hook initializes Supabase session from storage
3. **Config check**: `hasSupabaseConfig()` determines if Supabase credentials are set
4. **Auth flow**: 
   - If configured: show login/register screens
   - If not: allow local-only usage
5. **Onboarding**: After successful auth, navigate to welcome screen
6. **Home screen focus**: `useFocusEffect` triggers `loadPosts()`
7. **Feed rendering**: Display today's prompt, user's posting status, classmates' posts

---

### API Route Execution Flow

```mermaid
sequenceDiagram
    participant C as Client (Expo RN)
    participant E as Express Server
    participant M as Middleware
    participant S as Service
    participant R as Repository
    participant DB as Supabase DB

    C->>E[POST /api/daily-posts]
    E->>M[requireAuth middleware]
    M->>S[PostService.createDailyPost()]
    S->>R[PostRepository.findUserPostForDate()]
    R->>DB[SELECT from daily_posts]
    DB-->>R[Post data or null]
    R-->>S{[already posted?]}
    S--|Yes|E[409 Conflict<br/>"One photo per day rule"]
    S--|No|R[PostRepository.createDailyPost()]
    R->>DB[INSERT into daily_posts]
    DB-->>R[Created post]
    R-->>S[Return post entity]
    S-->>E[201 Created<br/>post data]
    E-->>C[Success response]
    
    alt User not member
        S->>R[ClassRepository.isMember()]
        R-->>S[False]
        S->>E[403 Forbidden]
    end
```

---

### Daily Post Creation Flow (Expanded)

```mermaid
flowchart TD
    A[User taps "Save" in create.tsx] --> B[Validate: photoUri, Supabase, classId, userId]
    B -- Missing field --> C[Show error message]
    B -- All fields present --> D[POST /api/daily-posts {classId, userId, photoPath, caption}]
    D --> E{requireAuth middleware}
    E -- No token --> F[401 Unauthorized]
    E -- Valid token --> G[PostService.createDailyPost()]
    G --> H{ClassRepository.isMember(classId, userId)?}
    H -- No --> I[Throw 403 "You must be enrolled member"]
    H -- Yes --> J{PostRepository.findUserPostForDate(classId, userId, todayDate)?}
    J -- Already posted --> K[409 Conflict "One photo per day rule"]
    J -- Not posted --> L[PostRepository.createDailyPost()]
    L --> M[Insert into daily_posts table]
    M --> N[Return created post]
    N --> O[publishLocalPhoto(): resize, compress, store locally]
    O --> P[Show success: "Memory saved!"]
    P --> Q[Navigate home]
    
    style K fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    style I fill:#ffebee,stroke:#b71c1c,stroke-width:2px
```

---

### Feed Generation Flow (getTodayFeed)

```mermaid
flowchart TD
    A[POST /api/today-feed?classId=...] --> B[requireAuth middleware]
    B -- Fail --> C[401 Unauthorized]
    B -- Success --> C[PostService.getTodayFeed(classId, userId)]
    C --> D{ClassRepository.isMember(classId, userId)?}
    D -- No --> E[403 "Access denied to private class feed"]
    D -- Yes --> F[Calculate todayDate = new Date().toISOString().slice(0, 10)]
    F --> G[PostRepository.getClassPostsForDate(classId, todayDate)]
    G --> H[For each post: format feed item]
    H --> I[Generate signed download URL: StorageService.createSignedDownloadUrl(post.photo_path, 3600)]
    I --> J[Build reactionsMap: count per reaction type]
    J --> K[Determine userReaction: if user already reacted]
    K --> L[Get author name from profiles table]
    L --> M[Fetch comments for post]
    M --> N[Return {userPostedToday, posts: formatted[]}]
```

---

### Reaction Toggle Flow

```mermaid
flowchart TD
    A[POST /api/reactions {postId, reactionType}] --> B[requireAuth middleware]
    B -- Fail --> C[401 Unauthorized]
    B -- Success --> D[PostService.toggleReaction(postId, userId, reactionType)]
    D --> E{PostRepository.findById(postId)?}
    E -- Not found --> F[404 Post not found]
    E -- Found --> F{ClassRepository.isMember(post.class_id, userId)?}
    F -- No --> G[403 "You must be a member of the class to react"]
    F -- Yes --> H[PostRepository.toggleReaction(postId, userId, reactionType)]
    H --> I{Reaction exists?}
    I -- Yes --> J[Delete reaction<br/>Return {action: "removed", reaction: null}]
    I -- No --> K[Insert new reaction<br/>Return {action: "added", reaction: created}]
```

---