import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase/client';
import { publishLocalPhoto, type MemoryCategory } from '@/lib/photo-draft';

export function getBackendUrl(): string {
  const configured = Constants.expoConfig?.extra?.backendUrl;
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  return configured || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');
}

/**
 * Converts a base64 string to a Uint8Array for cross-platform binary uploads
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  const arrayLength = Math.floor((len * 3) / 4);
  const bytes = new Uint8Array(arrayLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const enc1 = lookup[clean.charCodeAt(i)];
    const enc2 = lookup[clean.charCodeAt(i + 1)];
    const enc3 = lookup[clean.charCodeAt(i + 2)];
    const enc4 = lookup[clean.charCodeAt(i + 3)];
    bytes[p++] = (enc1 << 2) | (enc2 >> 4);
    if (i + 2 < len) bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
    if (i + 3 < len) bytes[p++] = ((enc3 & 3) << 6) | (enc4 & 63);
  }
  return bytes;
}

export interface UploadResult {
  photoPath: string;
  downloadUrl?: string;
}

/**
 * Uploads a photo to the circle's storage bucket.
 * Follows RLS path requirement: ${classId}/${userId}/${timestamp}.jpg
 * Falls back to backend upload endpoint if direct client storage upload is rejected.
 */
export async function uploadCirclePhoto(
  localUri: string,
  classId: string,
  userId: string,
  accessToken: string,
): Promise<UploadResult> {
  // 1. Process image to standard size, compression, and base64
  const manipulated = await manipulateAsync(
    localUri,
    [{ resize: { width: 1280 } }],
    { compress: 0.8, format: SaveFormat.JPEG, base64: true },
  );

  const base64Data = manipulated.base64;
  const timestamp = Date.now();
  const filePath = `${classId}/${userId}/${timestamp}.jpg`;
  const backendUrl = getBackendUrl();

  // 2. Try direct Supabase storage upload if base64 and client exist
  if (supabase && base64Data) {
    try {
      const bytes = base64ToUint8Array(base64Data);
      const { data, error } = await supabase.storage
        .from('class-photos')
        .upload(filePath, bytes.buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        // Try getting signed URL or public URL
        let downloadUrl = filePath;
        const { data: signedData } = await supabase.storage
          .from('class-photos')
          .createSignedUrl(filePath, 86400 * 7);
        if (signedData?.signedUrl) {
          downloadUrl = signedData.signedUrl;
        }
        return { photoPath: data.path || filePath, downloadUrl };
      }
    } catch {
      // Fall through to backend upload endpoint
    }
  }

  // 3. Fallback: Upload via backend service role
  if (base64Data) {
    const response = await fetch(`${backendUrl}/api/posts/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classId,
        base64: base64Data,
        contentType: 'image/jpeg',
      }),
    });

    if (response.ok) {
      const resJson = await response.json();
      return {
        photoPath: resJson.photoPath || filePath,
        downloadUrl: resJson.downloadUrl,
      };
    }
  }

  // If both failed, use local path as last-ditch fallback
  return { photoPath: manipulated.uri || localUri };
}

export interface PostMemoryOptions {
  category?: MemoryCategory;
  title?: string;
  tags?: string[];
  location?: string;
  prompt?: string;
}

/**
 * Full flow: Uploads image to circle storage and creates the post inside the circle
 */
export async function postMemoryToCircle(
  classId: string,
  localUri: string,
  caption: string,
  options: PostMemoryOptions = {},
): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) {
    throw new Error('Supabase client is not available.');
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  const session = sessionData?.session;
  const userId = session?.user?.id;

  if (sessionErr || !session || !userId) {
    throw new Error('You must be signed in to post in a circle.');
  }

  // 1. Upload photo to circle storage
  const uploadResult = await uploadCirclePhoto(
    localUri,
    classId,
    userId,
    session.access_token,
  );

  const backendUrl = getBackendUrl();

  // 2. Post to backend
  const postRes = await fetch(`${backendUrl}/api/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      classId,
      photoPath: uploadResult.photoPath,
      caption: caption.trim() || undefined,
    }),
  });

  if (postRes.status === 409) {
    const errorData = await postRes.json();
    return {
      ok: false,
      message: errorData.message || 'You have already posted in this circle today.',
    };
  }

  if (!postRes.ok) {
    const errorData = await postRes.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to publish post to circle.');
  }

  // 3. Also record locally so user's local history is updated
  try {
    await publishLocalPhoto(
      localUri,
      caption.trim(),
      options.prompt,
      options.category || 'General',
      options.title,
      options.tags,
      options.location,
    );
  } catch {
    // Non-fatal if local save fails
  }

  return { ok: true };
}

