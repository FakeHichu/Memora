import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

export type LocalPhotoPost = {
  id: string;
  uri: string;
  caption: string;
  createdAt: string;
};

let photoDraft: string | null = null;
const postsStorageKey = 'camera-app.posts.v1';
const photosDirectory = Platform.OS === 'web' ? null : new Directory(Paths.document, 'class-photos');

export function setPhotoDraft(uri: string) {
  photoDraft = uri;
}

export function getPhotoDraft() {
  return photoDraft;
}

export function clearPhotoDraft() {
  photoDraft = null;
}

export async function publishLocalPhoto(uri: string, caption: string) {
  const id = `${Date.now()}`;
  const image = await manipulateAsync(
    uri,
    [{ resize: { width: 1280 } }],
    { compress: 0.78, format: SaveFormat.JPEG, base64: Platform.OS === 'web' },
  );

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
    createdAt: new Date().toISOString(),
  };

  const posts = await getLocalPhotoPosts();
  await AsyncStorage.setItem(postsStorageKey, JSON.stringify([post, ...posts]));
  clearPhotoDraft();
  return [post, ...posts];
}

export async function getLocalPhotoPosts(): Promise<LocalPhotoPost[]> {
  const savedPosts = await AsyncStorage.getItem(postsStorageKey);
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

export async function clearLocalPhotoPosts() {
  const posts = await getLocalPhotoPosts();

  if (Platform.OS !== 'web') {
    for (const post of posts) {
      const file = new File(post.uri);
      if (file.exists) file.delete();
    }
  }

  await AsyncStorage.removeItem(postsStorageKey);
}
