import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export type MemoryCategory = 'All' | 'People' | 'Places' | 'Events' | 'General';

export type LocalPhotoPost = {
  id: string;
  uri: string;
  caption: string;
  title?: string;
  prompt?: string;
  category?: MemoryCategory;
  tags?: string[];
  location?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  collectionId?: string;
  createdAt: string;
  updatedAt?: string;
  reactions?: Record<string, number>;
  userReaction?: string | null;
};

export type LocalProfile = {
  name: string;
  handle: string;
  bio: string;
  email: string;
};

export type LocalCollection = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
  coverMemoryId?: string;
};

export type ExportedData = {
  version: '1';
  exportedAt: string;
  posts: LocalPhotoPost[];
  collections: LocalCollection[];
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const legacyPostsStorageKey = 'camera-app.posts.v1';
const postsStorageKey = 'memora.posts.v1';
const profileStorageKey = 'memora.profile.v1';
const collectionsStorageKey = 'memora.collections.v1';
const recentSearchesKey = 'memora.recent-searches.v1';
const recentlyViewedKey = 'memora.recently-viewed.v1';

// ============================================================================
// IN-MEMORY DRAFT STATE
// ============================================================================

let photoDraft: string | null = null;
let promptDraft: string | null = null;

const photosDirectory =
  Platform.OS === 'web' ? null : new Directory(Paths.document, 'memora-photos');

// ============================================================================
// DRAFT MANAGEMENT
// ============================================================================

export function setPhotoDraft(uri: string, prompt?: string) {
  photoDraft = uri;
  if (prompt) {
    promptDraft = prompt;
  }
}

export function getPhotoDraft() {
  return photoDraft;
}

export function getPromptDraft() {
  return promptDraft;
}

export function clearPhotoDraft() {
  photoDraft = null;
  promptDraft = null;
}

// ============================================================================
// CORE POST OPERATIONS
// ============================================================================

export async function publishLocalPhoto(
  uri: string,
  caption: string,
  prompt?: string,
  category: MemoryCategory = 'General',
  title?: string,
  tags?: string[],
  location?: string,
) {
  const id = `${Date.now()}`;
  const image = await manipulateAsync(uri, [{ resize: { width: 1280 } }], {
    compress: 0.8,
    format: SaveFormat.JPEG,
    base64: Platform.OS === 'web',
  });

  let storedUri = image.uri;
  if (Platform.OS === 'web') {
    if (!image.base64) throw new Error('Could not prepare the photo for local storage.');
    storedUri = `data:image/jpeg;base64,${image.base64}`;
  } else {
    if (!photosDirectory) throw new Error('Local photo storage is unavailable.');
    if (!photosDirectory.exists) photosDirectory.create({ intermediates: true, idempotent: true });
    const destination = new File(photosDirectory, `${id}.jpg`);
    await new File(image.uri).copy(destination);
    storedUri = destination.uri;
  }

  const post: LocalPhotoPost = {
    id,
    uri: storedUri,
    caption,
    title: title || undefined,
    prompt: prompt || promptDraft || undefined,
    category,
    tags: tags || [],
    location: location || undefined,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reactions: {},
    userReaction: null,
  };

  const posts = await getLocalPhotoPosts();
  const updatedPosts = [post, ...posts];
  await AsyncStorage.setItem(postsStorageKey, JSON.stringify(updatedPosts));
  clearPhotoDraft();
  return updatedPosts;
}

export async function getLocalPhotoPosts(): Promise<LocalPhotoPost[]> {
  let savedPosts = await AsyncStorage.getItem(postsStorageKey);
  if (!savedPosts) {
    // Check legacy key
    savedPosts = await AsyncStorage.getItem(legacyPostsStorageKey);
    if (savedPosts) {
      await AsyncStorage.setItem(postsStorageKey, savedPosts);
    }
  }

  if (!savedPosts) return [];

  try {
    const posts = JSON.parse(savedPosts) as LocalPhotoPost[];
    // Migrate old posts: ensure new fields exist
    return posts.map((p) => ({
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      tags: [],
      ...p,
    }));
  } catch {
    await AsyncStorage.removeItem(postsStorageKey);
    return [];
  }
}

export async function getLocalPhotoPost(id: string): Promise<LocalPhotoPost | null> {
  const posts = await getLocalPhotoPosts();
  return posts.find((post) => post.id === id) ?? null;
}

async function savePostsToStorage(posts: LocalPhotoPost[]): Promise<void> {
  await AsyncStorage.setItem(postsStorageKey, JSON.stringify(posts));
}

async function updatePost(
  id: string,
  updater: (post: LocalPhotoPost) => LocalPhotoPost,
): Promise<LocalPhotoPost | null> {
  const posts = await getLocalPhotoPosts();
  let updatedPost: LocalPhotoPost | null = null;

  const nextPosts = posts.map((post) => {
    if (post.id === id) {
      updatedPost = updater(post);
      return updatedPost;
    }
    return post;
  });

  if (updatedPost) {
    await savePostsToStorage(nextPosts);
  }

  return updatedPost;
}

export async function updateLocalPhotoCaption(
  id: string,
  caption: string,
): Promise<LocalPhotoPost | null> {
  return updatePost(id, (post) => ({
    ...post,
    caption,
    updatedAt: new Date().toISOString(),
  }));
}

export async function updateLocalPhotoPost(
  id: string,
  updates: Partial<Pick<LocalPhotoPost, 'title' | 'caption' | 'tags' | 'category' | 'location' | 'collectionId'>>,
): Promise<LocalPhotoPost | null> {
  return updatePost(id, (post) => ({
    ...post,
    ...updates,
    updatedAt: new Date().toISOString(),
  }));
}

export async function deleteLocalPhotoPost(id: string): Promise<boolean> {
  const posts = await getLocalPhotoPosts();
  const target = posts.find((p) => p.id === id);
  if (!target) return false;

  if (Platform.OS !== 'web' && target.uri) {
    try {
      const file = new File(target.uri);
      if (file.exists) file.delete();
    } catch (e) {
      console.warn('Failed to delete file from disk:', e);
    }
  }

  const filtered = posts.filter((p) => p.id !== id);
  await savePostsToStorage(filtered);
  return true;
}

export async function clearLocalPhotoPosts() {
  const posts = await getLocalPhotoPosts();

  if (Platform.OS !== 'web') {
    for (const post of posts) {
      try {
        const file = new File(post.uri);
        if (file.exists) file.delete();
      } catch (e) {
        console.warn('Failed to delete post file:', e);
      }
    }
  }

  await AsyncStorage.removeItem(postsStorageKey);
  await AsyncStorage.removeItem(legacyPostsStorageKey);
}

// ============================================================================
// REACTIONS
// ============================================================================

export async function toggleLocalPhotoReaction(
  id: string,
  reactionEmoji: string,
): Promise<LocalPhotoPost | null> {
  const posts = await getLocalPhotoPosts();
  let updatedPost: LocalPhotoPost | null = null;

  const nextPosts = posts.map((post) => {
    if (post.id === id) {
      const reactions = { ...(post.reactions || {}) };
      const currentReaction = post.userReaction;

      if (currentReaction === reactionEmoji) {
        // Toggle off
        reactions[reactionEmoji] = Math.max(0, (reactions[reactionEmoji] || 1) - 1);
        if (reactions[reactionEmoji] === 0) delete reactions[reactionEmoji];
        updatedPost = { ...post, reactions, userReaction: null };
      } else {
        // Remove previous reaction if any
        if (currentReaction && reactions[currentReaction]) {
          reactions[currentReaction] = Math.max(0, reactions[currentReaction] - 1);
          if (reactions[currentReaction] === 0) delete reactions[currentReaction];
        }
        // Add new reaction
        reactions[reactionEmoji] = (reactions[reactionEmoji] || 0) + 1;
        updatedPost = { ...post, reactions, userReaction: reactionEmoji };
      }

      return updatedPost;
    }
    return post;
  });

  if (updatedPost) {
    await savePostsToStorage(nextPosts);
  }

  return updatedPost;
}

// ============================================================================
// FAVORITES
// ============================================================================

export async function toggleFavorite(id: string): Promise<LocalPhotoPost | null> {
  return updatePost(id, (post) => ({
    ...post,
    isFavorite: !post.isFavorite,
    updatedAt: new Date().toISOString(),
  }));
}

export async function getFavoritePosts(): Promise<LocalPhotoPost[]> {
  const posts = await getLocalPhotoPosts();
  return posts.filter((p) => p.isFavorite && !p.isArchived);
}

// ============================================================================
// PIN
// ============================================================================

export async function togglePin(id: string): Promise<LocalPhotoPost | null> {
  return updatePost(id, (post) => ({
    ...post,
    isPinned: !post.isPinned,
    updatedAt: new Date().toISOString(),
  }));
}

// ============================================================================
// ARCHIVE
// ============================================================================

export async function archivePost(id: string): Promise<LocalPhotoPost | null> {
  return updatePost(id, (post) => ({
    ...post,
    isArchived: true,
    isPinned: false,
    updatedAt: new Date().toISOString(),
  }));
}

export async function unarchivePost(id: string): Promise<LocalPhotoPost | null> {
  return updatePost(id, (post) => ({
    ...post,
    isArchived: false,
    updatedAt: new Date().toISOString(),
  }));
}

export async function getArchivedPosts(): Promise<LocalPhotoPost[]> {
  const posts = await getLocalPhotoPosts();
  return posts.filter((p) => p.isArchived);
}

// ============================================================================
// TAGS
// ============================================================================

export async function addTagToPost(id: string, tag: string): Promise<LocalPhotoPost | null> {
  const normalized = tag.toLowerCase().trim();
  if (!normalized) return null;
  return updatePost(id, (post) => {
    const existingTags = post.tags || [];
    if (existingTags.includes(normalized)) return post;
    return {
      ...post,
      tags: [...existingTags, normalized],
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function removeTagFromPost(id: string, tag: string): Promise<LocalPhotoPost | null> {
  const normalized = tag.toLowerCase().trim();
  return updatePost(id, (post) => ({
    ...post,
    tags: (post.tags || []).filter((t) => t !== normalized),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getLocalPhotoPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    if (!post.isArchived) {
      for (const tag of post.tags || []) {
        tagSet.add(tag);
      }
    }
  }
  return Array.from(tagSet).sort();
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

export type BulkAction = 'delete' | 'archive' | 'unarchive' | 'favorite' | 'unfavorite' | 'pin' | 'unpin';

export async function bulkAction(ids: string[], action: BulkAction): Promise<void> {
  const posts = await getLocalPhotoPosts();

  if (action === 'delete') {
    // Delete files from disk first
    if (Platform.OS !== 'web') {
      for (const id of ids) {
        const post = posts.find((p) => p.id === id);
        if (post?.uri) {
          try {
            const file = new File(post.uri);
            if (file.exists) file.delete();
          } catch (e) {
            console.warn('Failed to delete file from disk:', e);
          }
        }
      }
    }
    const filtered = posts.filter((p) => !ids.includes(p.id));
    await savePostsToStorage(filtered);
    return;
  }

  const idSet = new Set(ids);
  const now = new Date().toISOString();

  const updatedPosts = posts.map((post) => {
    if (!idSet.has(post.id)) return post;

    switch (action) {
      case 'archive':
        return { ...post, isArchived: true, isPinned: false, updatedAt: now };
      case 'unarchive':
        return { ...post, isArchived: false, updatedAt: now };
      case 'favorite':
        return { ...post, isFavorite: true, updatedAt: now };
      case 'unfavorite':
        return { ...post, isFavorite: false, updatedAt: now };
      case 'pin':
        return { ...post, isPinned: true, updatedAt: now };
      case 'unpin':
        return { ...post, isPinned: false, updatedAt: now };
      default:
        return post;
    }
  });

  await savePostsToStorage(updatedPosts);
}

// ============================================================================
// COLLECTIONS
// ============================================================================

async function getCollectionsRaw(): Promise<LocalCollection[]> {
  const stored = await AsyncStorage.getItem(collectionsStorageKey);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as LocalCollection[];
  } catch {
    return [];
  }
}

export async function getCollections(): Promise<LocalCollection[]> {
  return getCollectionsRaw();
}

export async function getCollection(id: string): Promise<LocalCollection | null> {
  const collections = await getCollections();
  return collections.find((c) => c.id === id) ?? null;
}

export async function createCollection(
  name: string,
  description?: string,
  color?: string,
): Promise<LocalCollection> {
  const collection: LocalCollection = {
    id: `collection_${Date.now()}`,
    name: name.trim(),
    description: description?.trim(),
    color,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const collections = await getCollectionsRaw();
  const updated = [collection, ...collections];
  await AsyncStorage.setItem(collectionsStorageKey, JSON.stringify(updated));
  return collection;
}

export async function updateCollection(
  id: string,
  updates: Partial<Pick<LocalCollection, 'name' | 'description' | 'color' | 'coverMemoryId'>>,
): Promise<LocalCollection | null> {
  const collections = await getCollectionsRaw();
  let updatedCollection: LocalCollection | null = null;

  const next = collections.map((c) => {
    if (c.id === id) {
      updatedCollection = { ...c, ...updates, updatedAt: new Date().toISOString() };
      return updatedCollection;
    }
    return c;
  });

  if (updatedCollection) {
    await AsyncStorage.setItem(collectionsStorageKey, JSON.stringify(next));
  }

  return updatedCollection;
}

export async function deleteCollection(id: string, unassignMemories = true): Promise<boolean> {
  const collections = await getCollectionsRaw();
  const exists = collections.some((c) => c.id === id);
  if (!exists) return false;

  const filtered = collections.filter((c) => c.id !== id);
  await AsyncStorage.setItem(collectionsStorageKey, JSON.stringify(filtered));

  if (unassignMemories) {
    const posts = await getLocalPhotoPosts();
    const updated = posts.map((p) =>
      p.collectionId === id ? { ...p, collectionId: undefined, updatedAt: new Date().toISOString() } : p,
    );
    await savePostsToStorage(updated);
  }

  return true;
}

export async function assignMemoryToCollection(
  postId: string,
  collectionId: string | null,
): Promise<LocalPhotoPost | null> {
  return updatePost(postId, (post) => ({
    ...post,
    collectionId: collectionId ?? undefined,
    updatedAt: new Date().toISOString(),
  }));
}

export async function getPostsInCollection(collectionId: string): Promise<LocalPhotoPost[]> {
  const posts = await getLocalPhotoPosts();
  return posts.filter((p) => p.collectionId === collectionId && !p.isArchived);
}

// ============================================================================
// EXPORT / IMPORT
// ============================================================================

export async function exportAllData(): Promise<ExportedData> {
  const [posts, collections] = await Promise.all([getLocalPhotoPosts(), getCollections()]);
  return {
    version: '1',
    exportedAt: new Date().toISOString(),
    posts,
    collections,
  };
}

export function exportDataAsJSON(data: ExportedData): string {
  return JSON.stringify(data, null, 2);
}

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export async function importData(jsonString: string): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { imported: 0, skipped: 0, errors: ['Invalid JSON format.'] };
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('version' in parsed) ||
    !('posts' in parsed)
  ) {
    return { imported: 0, skipped: 0, errors: ['Invalid Memora export format.'] };
  }

  const exportData = parsed as ExportedData;

  if (exportData.version !== '1') {
    return {
      imported: 0,
      skipped: 0,
      errors: [`Unsupported export version: ${exportData.version}`],
    };
  }

  if (!Array.isArray(exportData.posts)) {
    return { imported: 0, skipped: 0, errors: ['No posts array found.'] };
  }

  const existingPosts = await getLocalPhotoPosts();
  const existingIds = new Set(existingPosts.map((p) => p.id));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const newPosts: LocalPhotoPost[] = [];

  for (const post of exportData.posts) {
    if (typeof post !== 'object' || !post || !('id' in post) || !('uri' in post)) {
      errors.push(`Skipped invalid post entry.`);
      skipped++;
      continue;
    }

    const typedPost = post as LocalPhotoPost;
    if (existingIds.has(typedPost.id)) {
      skipped++;
      continue;
    }

    // Validate required fields
    if (!typedPost.id || !typedPost.uri || !typedPost.createdAt) {
      errors.push(`Skipped post missing required fields.`);
      skipped++;
      continue;
    }

    newPosts.push({
      ...typedPost,
      isFavorite: typedPost.isFavorite ?? false,
      isPinned: typedPost.isPinned ?? false,
      isArchived: typedPost.isArchived ?? false,
      tags: typedPost.tags ?? [],
      reactions: typedPost.reactions ?? {},
    });
    imported++;
  }

  if (newPosts.length > 0) {
    const merged = [...newPosts, ...existingPosts];
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    await savePostsToStorage(merged);
  }

  // Import collections too (if present)
  if (Array.isArray(exportData.collections) && exportData.collections.length > 0) {
    const existingCollections = await getCollectionsRaw();
    const existingCollectionIds = new Set(existingCollections.map((c) => c.id));
    const newCollections = exportData.collections.filter((c) => !existingCollectionIds.has(c.id));
    if (newCollections.length > 0) {
      const mergedCollections = [...newCollections, ...existingCollections];
      await AsyncStorage.setItem(collectionsStorageKey, JSON.stringify(mergedCollections));
    }
  }

  return { imported, skipped, errors };
}

// ============================================================================
// RECENTLY VIEWED
// ============================================================================

const MAX_RECENTLY_VIEWED = 20;

export async function recordRecentlyViewed(postId: string): Promise<void> {
  const stored = await AsyncStorage.getItem(recentlyViewedKey);
  const viewed: string[] = stored ? JSON.parse(stored) : [];
  const filtered = viewed.filter((id) => id !== postId);
  const updated = [postId, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
  await AsyncStorage.setItem(recentlyViewedKey, JSON.stringify(updated));
}

export async function getRecentlyViewedPosts(): Promise<LocalPhotoPost[]> {
  const stored = await AsyncStorage.getItem(recentlyViewedKey);
  if (!stored) return [];

  const ids: string[] = JSON.parse(stored);
  const posts = await getLocalPhotoPosts();
  const postMap = new Map(posts.map((p) => [p.id, p]));

  return ids.map((id) => postMap.get(id)).filter((p): p is LocalPhotoPost => p !== undefined);
}

// ============================================================================
// RECENT SEARCHES
// ============================================================================

const MAX_RECENT_SEARCHES = 10;

export async function addRecentSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const stored = await AsyncStorage.getItem(recentSearchesKey);
  const searches: string[] = stored ? JSON.parse(stored) : [];
  const filtered = searches.filter((s) => s !== trimmed);
  const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  await AsyncStorage.setItem(recentSearchesKey, JSON.stringify(updated));
}

export async function getRecentSearches(): Promise<string[]> {
  const stored = await AsyncStorage.getItem(recentSearchesKey);
  if (!stored) return [];
  return JSON.parse(stored) as string[];
}

export async function clearRecentSearches(): Promise<void> {
  await AsyncStorage.removeItem(recentSearchesKey);
}

// ============================================================================
// PROFILE
// ============================================================================

export async function getLocalProfile(): Promise<LocalProfile> {
  const stored = await AsyncStorage.getItem(profileStorageKey);
  if (stored) {
    try {
      return JSON.parse(stored) as LocalProfile;
    } catch {
      // fallback
    }
  }
  return {
    name: 'Memory Keeper',
    handle: '@memora',
    bio: 'Preserving everyday moments that matter.',
    email: '',
  };
}

export async function saveLocalProfile(profile: Partial<LocalProfile>): Promise<LocalProfile> {
  const existing = await getLocalProfile();
  const updated: LocalProfile = { ...existing, ...profile };
  await AsyncStorage.setItem(profileStorageKey, JSON.stringify(updated));
  return updated;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function hasPostedToday(posts: LocalPhotoPost[]): boolean {
  const todayStr = new Date().toISOString().slice(0, 10);
  return posts.some((post) => post.createdAt.slice(0, 10) === todayStr && !post.isArchived);
}

export function getTodayPost(posts: LocalPhotoPost[]): LocalPhotoPost | null {
  const todayStr = new Date().toISOString().slice(0, 10);
  return posts.find((post) => post.createdAt.slice(0, 10) === todayStr && !post.isArchived) ?? null;
}

export function computeCurrentStreak(posts: LocalPhotoPost[]): number {
  if (posts.length === 0) return 0;

  const activePosts = posts.filter((p) => !p.isArchived);
  const datesWithPosts = new Set(activePosts.map((p) => p.createdAt.slice(0, 10)));

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    if (datesWithPosts.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // First day (today) can be missed — only break if day > 0
      break;
    }
  }

  return streak;
}

export function getMostActiveMonth(posts: LocalPhotoPost[]): string | null {
  if (posts.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const post of posts) {
    if (!post.isArchived) {
      const d = new Date(post.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  if (!top) return null;

  const [yearMonthStr] = top;
  const [year, month] = yearMonthStr.split('-').map(Number);
  return new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
