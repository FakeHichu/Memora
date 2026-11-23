# 06_FEATURE_WORKFLOWS.md

## Major Feature End-to-End Workflows

This section documents the complete user workflows for the Memora application, from onboarding through daily posting and interaction.

---

### 1. Onboarding and Authentication Workflow

```mermaid
flowchart TD
    subgraph Phase 1: App Launch
        A[Expo app starts] --> B{hasSupabaseConfig()}
        B -- Yes --> C[Show login/register screens]
        B -- No --> D[Show local-only usage prompt]
    end
    
    subgraph Phase 2: Authentication
        C --> E[User enters email/password or signs up]
        E --> F[Supabase Auth: signInWithEmail or signUpWithEmail]
        F -->|Success| G[Session stored in AsyncStorage]
        F -->|Failure| H[Show error message]
    end
    
    subgraph Phase 3: Onboarding
        G --> I[Navigate to (onboarding)/welcome screen]
        I --> J[Display welcome message & prompts]
        J --> K[User taps "Continue"]
    end
    
    subgraph Phase 4: Main App
        K --> L[Navigate to (tabs)/home screen]
        L --> M[useFocusEffect triggers loadPosts()]
        M --> N[Render today's prompt, class posts, user status]
    end
```

**Step-by-step Details**:

1. **App launch**: `hasSupabaseConfig()` checks if `EXPO_PUBLIC_SUPABASE_URL` is set
2. **Login screen**: User enters credentials, `signInWithEmail()` calls Supabase Auth
3. **Registration screen**: New user provides name, email, password (8+ chars, upper/lower/digit)
4. **Session management**: Successful auth stores session in AsyncStorage via `useAuth` hook
5. **Onboarding**: Welcome screen with prompt introduction, then navigate to home
6. **Main app**: Home screen loads posts from AsyncStorage, displays today's prompt

---

### 2. Daily Photo Posting Workflow

```mermaid
flowchart TD
    subgraph Step 1: Navigate to Create Screen
        A[User taps "Capture Today's Photo" on home screen] --> B[Navigate to create.tsx]
    end
    
    subgraph Step 2: Photo Selection
        B --> C[handleTakePhoto() or handleChooseFromLibrary()]
        C -->|Camera| D[Request permissions, launch camera via expo-image-picker]
        C -->|Gallery| E[Request permissions, launch image picker]
        D -->|Success| F[Set photoUri, navigate to details step]
        E -->|Success| F[Set photoUri, navigate to details step]
    end
    
    subgraph Step 3: Save Post
        F --> G[handleSave() critical function]
        G --> G1[Validate: photoUri exists?]
        G1 -- No --> H[Return early]
        G1 -- Yes --> G2[Set isSaving=true, clear errorMessage]
        G2 --> G3[Get Supabase session]
        G3 --> G4[Get userId from session]
        G4 --> G5[Get classId from activeClass]
        G5 --> G6[Validate: userId exists?]
        G6 -- No --> H[Show "User not authenticated"]
        G6 -- Yes --> G7[Validate: classId exists?]
        G7 -- No --> H[Show "Please select a class first"]
        G7 -- Yes --> G8[POST /api/daily-posts {classId, userId, photoPath, caption}]
    end
    
    subgraph Step 4: Backend Processing
        G8 -->|requireAuth| M[Verify Bearer token]
        M -->|Invalid/>| N[401 Unauthorized]
        M -->|Valid| O[PostService.createDailyPost()]
        O --> O1[ClassRepository.isMember(classId, userId)?]
        O1 -- No --> P[403 "You must be enrolled member"]
        O1 -- Yes --> O2[todayDate = new Date().toISOString().slice(0, 10).split('T')[0]]
        O2 --> O3[findUserPostForDate(classId, userId, todayDate)?]
        O3 -- Already posted --> Q[409 "One photo per day rule"]
        O3 -- Not posted --> R[createDailyPost(): INSERT daily_posts]
        R --> S[Return created post]
    end
    
    subgraph Step 5: Local Fallback & Success
        S --> T{response status?}
        T -- 409 --> U[Show "You have already posted a photo today"]
        T -- 201 --> V[publishLocalPhoto(): resize 1280px, compress 0.8 quality]
        V --> W[Prepend to AsyncStorage memora.posts.v1]
        V --> X[Show "Memory saved!", navigate home]
        T -- !ok (network error) --> Y[publishLocalPhoto() as offline fallback]
        Y --> Z[Show "Memory saved locally!", navigate home]
    end
```

**Critical Business Rule**: One photo per day per class per user
- Enforced by backend via `findUserPostForDate()` + 409 response
- Frontend catches 409 and shows appropriate error
- No double-posting possible at API level

**photo processing**:
- Resize to 1280px width
- Compress at 0.8 quality (JPEG)
- Store in `memora-photos/` directory via expo-file-system
- Prepend to AsyncStorage `memora.posts.v1`

---

### 3. Class Management Workflow

```mermaid
flowchart TD
    subgraph Create Class
        A[Class Screen: "Create a class"] --> B[Enter class name (min 2 chars), school name (optional), academic year (2000-2100)]
        B --> C[POST /api/classes<br/>{name, schoolName, academicYear}]
        C --> D[requireAuth middleware]
        D -->|Valid token| E[ClassService.createClass()]
        E --> F[ClassRepository.createClassWithOwner()]
        F --> G[Insert into classes table]
        H[Add creator as owner member via class_members]
        G & H --> I[Return created class]
    end
    
    subgraph Join Class
        J[Class Screen: "Join a class"] --> K[Enter join code]
        K --> L[POST /api/classes/join<br/>{joinCode}]
        L --> D[requireAuth middleware]
        D -->|Valid token| M[ClassService.joinClassByCode()]
        M --> N[ClassRepository.findByJoinCode(uppercase(joinCode))]
        N -- Not found --> O[Throw "Class not found"]
        N -- Found --> P[Check if archived]
        P -- Archived --> Q[Throw "This class has been archived"]
        P -- Not archived --> R[Check isMember(userId)]
        R -- Already member --> S[Return class + member + alreadyJoined: true]
        R -- Not member --> T[addClassMember() via class_members table]
        T --> U[Return class + member + alreadyJoined: false]
    end
    
    subgraph View Classes
        V[Home screen or Class Screen] --> W[refreshClasses() useEffect]
        W --> X[GET /api/classes/user-classes<br/>{created_by: userId}]
        X --> Y[Return list of created classes]
        Z[Class detail screen] --> AA[selectClass(classId)]
        AA --> AB[Navigate to class detail]
        AB --> AC[View members, posts, class details]
    end
```

**Join Code Format**:
- Generated as: `GRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}` for groups
- Or `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}` for invitations
- User enters code, system uppercases and trims automatically (via Zod transform)

**Validation**:
- Create class: name min 2 chars, max 80; academicYear int 2000-2100
- Join code: min 4 chars, max 16 chars (uppercase+trimmed)

---

### 4. Reaction and Comment Workflow

```mermaid
flowchart TD
    subgraph Post Reaction
        A[View post in home feed] --> B[Tap reaction emoji]
        B --> C[handleReact(postId, emoji) in home.tsx]
        C --> D{Supabase configured?}
        D -- No --> E[No-op, local only]
        D -- Yes --> F[POST /api/reactions {postId, reactionType}]
        F --> G[requireAuth middleware]
        G -->|Valid| H[PostService.toggleReaction()]
        H --> I[PostRepository.findById(postId)?]
        I -- Not found --> J[404 Post not found]
        I -- Found --> K[ClassRepository.isMember(post.class_id, userId)?]
        K -- No --> L[403 "You must be a member"]
        K -- Yes --> L[PostRepository.toggleReaction()]
        L --> M{Reaction exists?}
        M -- Yes --> N[Delete reaction<br/>{action: "removed", reaction: null}]
        M -- No --> O[Insert new reaction<br/>{action: "added", reaction: created}]
    end
    
    subgraph Comment Creation
        P[View post comments] --> Q[Tap "Add comment"]
        R[Enter comment text] --> S[POST /api/posts/{postId}/comments<br/>{content}]
        S --> T[requireAuth middleware]
        T -->|Valid| U[PostService.createComment()]
        U --> V[PostRepository.createComment(postId, userId, content, parentId)]
        V --> W[INSERT into comments table]
        W --> X[Return created comment]
    end
    
    subgraph Comment Reaction
        Y[View comments on post] --> Z[Tap reaction on comment]
        Z --> AA[toggleCommentReaction(commentId, reactionType)]
        AA --> BB[PostRepository.findByCommentId(commentId)?]
        BB -- Not found --> CC[Return {action: "added", reaction: null}]
        BB -- Found --> DD[PostRepository.findById(comment.post_id)?]
        DD -- Post not found --> EE[Return {action: "added", reaction: null}]
        DD -- Found --> EE1[ClassRepository.isMember(post.class_id, userId)?]
        EE1 -- No --> FF[403 "You must be a member to react"]
        EE1 -- Yes --> GG[PostRepository.toggleCommentReaction()]
        GG -- Existing --> HH[Delete reaction, {action: "removed", reaction: null}]
        GG -- New --> II[Insert reaction, {action: "added", reaction: created}]
    end
```

**Reaction Types**: "heart", "laugh", "cry", "fire", "dead", "respect" (6 types, validated via Zod enum)

**Comment Reactions**: Same 6 reaction types, togglable on individual comments

**Membership enforcement**: Every reaction operation checks `ClassRepository.isMember()` before proceeding

---

### 5. Today Feed Viewing Workflow

```mermaid
flowchart TD
    A[User navigates to (tabs)/today screen] --> B[useFocusEffect()]
    B --> C[getLocalPhotoPosts(): fetch from AsyncStorage]
    C --> D{local posts exist?}
    D -- No --> E[Show "Your first moment starts here" empty state]
    D -- Yes --> F[Map local posts to feed format]
    F --> G[Spread previewPosts from social-preview.ts (mock data)]
    G --> H[Construct feedPosts: [...localPosts, ...previewPostsWithIsPreview:true]]
    H --> I[Render: story rail + "For you" feed + yearbook strip]
    
    subgraph Interaction
        I --> J[toggleLike(postId): local Set toggle, no backend call]
        J --> K[Update likedPosts state]
        K --> I
        
        L[Tap on post] --> M[Navigate to post detail screen (expo-router)]
        M --> N[PostDetailScreen with full post view]
    end
```

**Mock Data Handling**:
- `previewPosts` and `previewStories` from `lib/social-preview.ts`
- Clearly marked with "SAMPLE" labels
- "NOT CONNECTED TO A LIVE FEED" education text shown in modal
- Users can dismiss the modal and continue with local data only

**Like Behavior**:
- Local-only state toggle (`likedPosts` Set)
- No backend persistence
- Visual feedback only (heart fills/unfills)
- Not synchronized across devices

---

### 6. Edit/Delete Post Workflow

```mermaid
flowchart TD
    A[Navigate to post detail or edit screen] --> B[Load post data from AsyncStorage or API]
    B --> C{Is user the author?}
    C -- Yes --> D[Show edit/delete controls]
    C -- No --> E[Check class membership]
    E -- Member --> F[Show delete control only, or view-only]
    E -- Not member --> G[Hide all controls, read-only view]
    
    subgraph Delete Workflow
        D --> H[Tap delete button]
        H --> I[Confirm deletion]
        I --> J[POST /api/posts/{postId}/delete]
        J --> K[requireAuth middleware]
        K --> L[PostService.deletePost(postId, userId)]
        L --> M[PostRepository.findById(postId)?]
        M -- Not found --> N[404 Post not found]
        M -- Found --> O[post.user_id !== userId?]
        O -- Yes --> P[ClassRepository.isMember(post.class_id, userId)?]
        P -- No --> Q[403 "Not authorized to delete this post"]
        P -- Yes --> R[PostRepository.softDelete(postId)<br/>(sets deleted_at)]
        R --> S[Show success, navigate home]
    end
    
    subgraph Edit Workflow
        D --> T[Tap edit button]
        T --> U[Navigate to edit/[postId] screen]
        U --> V[Pre-fill form with post data]
        V --> W[Update caption or photo]
        W --> X[POST /api/posts/{postId}/caption]
        X --> K[requireAuth middleware]
        K --> L[PostService.updateCaption(postId, userId, caption)]
        L --> M[PostRepository.findById(postId)?]
        M -- Not found --> N[404 Post not found]
        M -- Found --> O[post.user_id !== userId?]
        O -- Yes --> Q[403 "Only the author can edit this post"]
        O -- Yes --> P[PostRepository.updateCaption(postId, caption)]
        P --> Q[Return updated post, show success]
    end
```