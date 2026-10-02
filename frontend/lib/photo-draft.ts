import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

export type MemoryCategory = 'All' | 'People' | 'Places' | 'Events' | 'General';

export type LocalPhotoPost = {
  id: string;
  uri: string;
  caption: string;
  prompt?: string;
  category?: MemoryCategory;
  createdAt: string;
  reactions?: Record<string, number>;
  userReaction?: string | null;
};

export type LocalProfile = {
  name: string;
  handle: string;
  bio: string;
  email: string;
};

let photoDraft: string | null = null;
let promptDraft: string | null = null;

const legacyPostsStorageKey = 'camera-app.posts.v1';
const postsStorageKey = 'memora.posts.v1';
const profileStorageKey = 'memora.profile.v1';

const photosDirectory =
  Platform.OS === 'web' ? null : new Directory(Paths.document, 'memora-photos');

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

export async function publishLocalPhoto(
  uri: string,
  caption: string,
  prompt?: string,
  category: MemoryCategory = 'General',
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
    prompt: prompt || promptDraft || undefined,
    category,
    createdAt: new Date().toISOString(),
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
    return JSON.parse(savedPosts) as LocalPhotoPost[];
  } catch {
    await AsyncStorage.removeItem(postsStorageKey);
    return [];
  }
}

export async function getLocalPhotoPost(id: string): Promise<LocalPhotoPost | null> {
  const posts = await getLocalPhotoPosts();
  return posts.find((post) => post.id === id) ?? null;
}

export async function updateLocalPhotoCaption(
  id: string,
  caption: string,
): Promise<LocalPhotoPost | null> {
  const posts = await getLocalPhotoPosts();
  let updatedPost: LocalPhotoPost | null = null;

  const nextPosts = posts.map((post) => {
    if (post.id === id) {
      updatedPost = { ...post, caption };
      return updatedPost;
    }
    return post;
  });

  if (updatedPost) {
    await AsyncStorage.setItem(postsStorageKey, JSON.stringify(nextPosts));
  }

  return updatedPost;
}

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
    await AsyncStorage.setItem(postsStorageKey, JSON.stringify(nextPosts));
  }

  return updatedPost;
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
  await AsyncStorage.setItem(postsStorageKey, JSON.stringify(filtered));
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

export function hasPostedToday(posts: LocalPhotoPost[]): boolean {
  const todayStr = new Date().toISOString().slice(0, 10);
  return posts.some((post) => post.createdAt.slice(0, 10) === todayStr);
}

export function getTodayPost(posts: LocalPhotoPost[]): LocalPhotoPost | null {
  const todayStr = new Date().toISOString().slice(0, 10);
  return posts.find((post) => post.createdAt.slice(0, 10) === todayStr) ?? null;
}

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
    name: 'Class Memory Keeper',
    handle: '@memora_keeper',
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
