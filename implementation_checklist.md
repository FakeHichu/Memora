# Memora Project — Implementation Checklist

## Project Overview
- **Framework**: Expo React Native with Expo Router
- **Backend**: Express server with Supabase integration
- **Database**: Supabase PostgreSQL with migrations
- **Auth**: Supabase Auth (email/password)
- **State**: React Query + AsyncStorage

## Phase 1: Project Inspection ✅
- [x] Inspect project structure
- [x] Read README, implementation plan, design system
- [x] Inspect frontend, backend, database migrations
- [x] Identify technology stack
- [x] Inspect Supabase integration
- [x] Identify incomplete/broken features
- [x] Identify reusable components
- [x] Check database migrations applied to Supabase

## Phase 2: Design System
- [ ] Centralize theme system with tokens
- [ ] Implement dark theme (#0B0813 deep purple palette)
- [ ] Implement light theme (#F7F2E9 warm minimalist palette)
- [ ] Add theme selection in Settings
- [ ] Support System Default, Light, Dark
- [ ] Save user theme persistently
- [ ] Apply theme consistently across all screens
- [ ] Avoid hardcoding colors in components
- [ ] Ensure text contrast and accessibility
- [ ] Make UI elements adapt to active theme
- [ ] Create reusable design tokens (colors, typography, spacing, shadows, border radii, component sizes)

## Phase 3: Reusable UI Components
- [ ] Navigation components: FloatingBottomNavigation, NavigationTab, HeaderBar, BackButton, ProfileAvatar, NotificationButton
- [ ] Card components: MemoryCard, DailyMemoryCard, ClassCard, PhotoGridCard, ProfileCard, CollectionCard, EmptyStateCard
- [ ] Input components: SearchBar, RoundedTextInput, PasswordInput, FormInput, CaptionInput
- [ ] Button components: PrimaryButton, SecondaryButton, IconButton, FloatingActionButton, PillButton
- [ ] Photo components: MemoryImage, PhotoGrid, PhotoPreview, ImageViewer, UploadProgressIndicator
- [ ] Feedback components: LoadingIndicator, SkeletonLoader, ErrorState, SuccessMessage, ConfirmationDialog, ToastNotification
- [ ] ThemeSwitcher, UserAvatar, ReactionButton, MemberAvatarGroup, DateBadge, ClassJoinCodeCard
- [ ] Use consistent sizing and spacing
- [ ] Support both themes
- [ ] Include proper loading and disabled states
- [ ] Use existing dependencies
- [ ] Avoid unnecessary packages
- [ ] Keep components reusable and maintainable
- [ ] Do not duplicate components across screens

## Phase 4: Login and Authentication Redesign
- [ ] Memora logo and branding on login screen
- [ ] Welcome heading and short description
- [ ] Email input with validation
- [ ] Password input with show/hide button
- [ ] Remember Me checkbox (FUNCTIONAL - not visual only)
  - [ ] When enabled, retain session across app restarts using Supabase + AsyncStorage
  - [ ] When disabled, clearly defined session policy that does NOT retain user after restart
  - [ ] Do NOT store passwords in AsyncStorage
  - [ ] Do NOT store authentication tokens manually
  - [ ] Restore and validate session on app start
- [ ] Forgot Password option
- [ ] Login button with loading state
- [ ] Create Account option
- [ ] Appropriate validation messages
- [ ] Registration screen with: display name, email, password, confirm password
- [ ] Validation for registration
- [ ] Duplicate username/email handling
- [ ] Successful registration feedback
- [ ] Authentication requirements:
  - [ ] Use existing Supabase Auth integration
  - [ ] Maintain correct authenticated user ID
  - [ ] Handle expired sessions
  - [ ] Handle network errors
  - [ ] Prevent duplicate login submissions
  - [ ] Redirect authenticated users appropriately
  - [ ] Prevent unauthenticated users from accessing protected screens

## Phase 5: Splash Screen and Loading Experience
- [ ] Branded Memora startup experience
- [ ] Display Memora logo
- [ ] Show application name
- [ ] Short tagline: "Your memories, together"
- [ ] Use selected theme
- [ ] Subtle loading animation
- [ ] Initialize authentication session
- [ ] Load user profile and initial data
- [ ] Navigate to appropriate screen
- [ ] Display for ~2-3 seconds on initial cold launch only
- [ ] Do NOT add artificial delay to every screen navigation
- [ ] Do NOT show startup screen every tab change
- [ ] Use existing Expo splash-screen functionality
- [ ] Handle initialization failures gracefully

## Phase 6: FIX CREATE CLASS FUNCTIONALITY (CRITICAL)
- [ ] **Investigate why Create Class fails**
- [ ] Migration 002 `create_class_with_owner()` function: only grants execute to `service_role`
- [ ] Frontend calls backend API -> ClassService.createClass -> ClassRepository.createClassWithOwner using supabaseAdmin
- [ ] **DO NOT expose service-role key in frontend**
- [ ] **Safe approach**: Use `auth.uid()` in the database function to determine creator, not user-supplied ID
- [ ] OR use properly authenticated backend/Edge Function
- [ ] Class creation workflow:
  - [ ] User opens Classes section
  - [ ] User selects Create Class
  - [ ] Creation form appears
  - [ ] User enters: class name, school/institution, academic year
  - [ ] Fields validated
  - [ ] Submit to backend
  - [ ] Unique join code generated
  - [ ] Class inserted into `classes` table
  - [ ] Creator automatically added to `class_members` with `owner` role
  - [ ] Return newly created class info
  - [ ] Class appears in user's class list
  - [ ] Join code displayed with copy button
  - [ ] Owner can manage the class
- [ ] Success criteria:
  - [ ] Class creation works from actual mobile app
  - [ ] Unique join code generated
  - [ ] Creator becomes class owner
  - [ ] Class visible after creation
  - [ ] Class remains available after restart
  - [ ] Errors displayed clearly
  - [ ] Database contains correct records

## Phase 7: FIX JOIN CLASS FUNCTIONALITY (CRITICAL)
- [ ] **Investigate why Join Class fails**
- [ ] Expected workflow:
  - [ ] Authenticated user opens Classes
  - [ ] Selects Join Class
  - [ ] Form appears requesting join code
  - [ ] User enters code
  - [ ] Validate code format
  - [ ] Normalize code consistently (uppercase handling)
  - [ ] Verify class exists and is active
  - [ ] Check if user is already a member
  - [ ] Add user to `class_members` with `member` role
  - [ ] Return class details
  - [ ] Class appears in user's class list
  - [ ] User can access class memories per membership permissions
- [ ] Join Class validation:
  - [ ] Invalid join code
  - [ ] Non-existent class
  - [ ] Archived class
  - [ ] Already joined class
  - [ ] Network failure
  - [ ] Unauthorized request
  - [ ] Database constraint errors
  - [ ] Duplicate membership attempts
- [ ] **Never allow user to join by changing frontend class ID**
- [ ] **Backend must validate join code and use authenticated user ID**
- [ ] Security:
  - [ ] Use secure database functions or backend operations
  - [ ] Do NOT expose service-role credentials
  - [ ] User cannot assign themselves owner role
  - [ ] User cannot join without valid join code
  - [ ] User cannot read another class's private data
  - [ ] User cannot modify another user's membership
- [ ] Class list should display: class name, school name, academic year, member count, user's role, class avatar
- [ ] Add refresh functionality and proper loading indicators

## Phase 8: Supabase Database and Storage Audit
- [ ] Inspect existing schema
- [ ] Verify every migration (001, 002, 003)
- [ ] Identify missing tables, columns, constraints, indexes, policies
- [ ] Verify RLS enabled on all tables with private user/class info
- [ ] Create appropriate policies for every required operation
- [ ] Users can access only authorized class data
- [ ] Users can upload only their own photos to classes they belong to
- [ ] Private images accessed through authorized access or signed URLs
- [ ] Verify Storage policies match actual upload path
- [ ] Keep `class-photos` bucket PRIVATE
- [ ] Create new numbered migration files if schema changes needed
- [ ] Make migrations safe and repeatable
- [ ] Document how to apply migrations
- [ ] Verify resulting schema
- [ ] Do NOT use service-role key in frontend code

## Phase 9: Home Screen Redesign
- [ ] Personalized greeting
- [ ] User avatar
- [ ] Notifications button
- [ ] Daily memory heading
- [ ] Daily prompt or memory invitation
- [ ] Photo upload or camera action
- [ ] Recent class memories
- [ ] Latest posts from user's classes
- [ ] Memory cards with image previews
- [ ] Reactions and comments
- [ ] Clean floating bottom navigation
- [ ] Visually rich image-focused layout
- [ ] Not overly crowded

## Phase 10: Class Screen Redesign
- [ ] My Classes heading
- [ ] Search classes
- [ ] Create Class button (FUNCTIONAL)
- [ ] Join Class button (FUNCTIONAL)
- [ ] Class cards
- [ ] Class avatars
- [ ] Member count
- [ ] Academic year
- [ ] Role indicator
- [ ] Join code access for authorized owners/admins
- [ ] Empty state for users who haven't joined a class
- [ ] Create Class and Join Class must be fully functional, not placeholders

## Phase 11: Other Existing Screens
- [ ] Onboarding - inspect and improve
- [ ] Discover - inspect and improve
- [ ] Daily Memories - inspect and improve
- [ ] Posts - inspect and improve
- [ ] Camera - inspect and improve
- [ ] Collections - inspect and improve
- [ ] Favorites - inspect and improve
- [ ] Search - inspect and improve
- [ ] Notifications - inspect and improve
- [ ] Profile - inspect and improve
- [ ] Settings - inspect and improve
- [ ] Class details - inspect and improve
- [ ] Member list - inspect and improve
- [ ] Photo viewer - inspect and improve
- [ ] Prioritize usability, consistency, and planned features

## Phase 12: Performance and App Stability
- [ ] Efficient Supabase queries
- [ ] Pagination for memory feeds
- [ ] Avoid unnecessary repeated API requests
- [ ] Use image compression where appropriate
- [ ] Use thumbnails for image-heavy feeds
- [ ] Use lazy loading
- [ ] Handle slow networks
- [ ] Show upload progress
- [ ] Prevent duplicate submissions
- [ ] Handle offline and reconnect states gracefully
- [ ] Avoid unnecessary background processes
- [ ] Avoid loading all class posts at once
- [ ] Optimize for ~90 initial members, not much larger

## Phase 13: Testing
### Authentication tests
- [ ] Register a new user
- [ ] Log in
- [ ] Remember Me enabled
- [ ] Restart application and verify session restoration
- [ ] Remember Me disabled
- [ ] Log out
- [ ] Invalid password
- [ ] Expired session
- [ ] Network failure

### Class tests
- [ ] Create a class
- [ ] Verify database records
- [ ] Verify owner membership
- [ ] Copy join code
- [ ] Join using valid code from another account
- [ ] Join using invalid code
- [ ] Join using already-used code
- [ ] Attempt duplicate membership
- [ ] Verify class list updates
- [ ] Verify membership permissions
- [ ] Verify data remains after restarting the application

### UI tests
- [ ] Dark theme
- [ ] Light theme
- [ ] Theme persistence
- [ ] Login screen
- [ ] Loading screen
- [ ] Home screen
- [ ] Classes screen
- [ ] Bottom navigation
- [ ] Small screen layout
- [ ] Keyboard behavior
- [ ] Loading and error states

- [ ] Run lint, TypeScript, and build checks
- [ ] Fix errors introduced by changes

## Phase 14: Development Rules
1. Do not rewrite the entire project unnecessarily
2. Preserve existing React Native and Expo architecture
3. Preserve existing Supabase configuration
4. Reuse existing dependencies
5. Do not introduce unnecessary packages
6. Never expose Supabase service-role credentials
7. Do not disable RLS to make a feature work
8. Do not use mock data as replacement for production functionality
9. Do not create visual-only buttons
10. Do not leave placeholder implementations
11. Do not silently ignore errors
12. Do not remove existing working functionality
13. Do not commit secrets or .env files
14. Do not claim a feature works unless tested
15. Keep code modular, typed, and maintainable

## Final Deliverables
1. Summary of existing project architecture
2. Summary of redesigned UI components
3. List of changed and newly created files
4. Database migrations added or modified
5. Authentication improvements
6. Create Class implementation details
7. Join Class implementation details
8. RLS and Security changes
9. Tests performed and results
10. Any remaining issues requiring manual configuration

## Instructions
- Starting the frontend: `cd frontend && npm start` or `npm run android`
- Starting the backend: `cd backend && npm run dev`
- Running database migrations: apply SQL files from `database/migrations/` to Supabase project
- Running the app in Android Studio emulator: `npm run android`
- Testing Create Class and Join Class: follow the workflows above