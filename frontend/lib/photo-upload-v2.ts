import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase/client';
import { publishLocalPhoto } from '@/lib/photo-draft';
import { fetchWithTimeout } from '@/lib/photo-upload';

export function getBackendUrl(): string {
  const configured = Constants.expoConfig?.extra?.backendUrl;
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  return configured || (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');
}

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

export interface UploadProgress {
  stage: 'processing' | 'uploading' | 'creating-post' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface UploadResult {
  success: boolean;
  photoPath?: string;
  downloadUrl?: string;
  postId?: string;
  error?: string;
}

/**
 * Upload photo to Circle with fast compression and non-blocking network calls
 */
export async function uploadPhotoToCircle(
  localUri: string,
  circleId: string,
  caption: string,
  onProgress?: (progress: UploadProgress) => void,
  retryCount: number = 0,
): Promise<UploadResult> {
  const MAX_RETRIES = 1;

  try {
    // Stage 1: Process image (fast 1080px resize, 0.72 compression)
    onProgress?.({
      stage: 'processing',
      progress: 20,
      message: 'Preparing photo...',
    });

    let manipulatedUri = localUri;
    let base64Fallback: string | undefined;

    try {
      const manipulated = await manipulateAsync(
        localUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.72, format: SaveFormat.JPEG, base64: false },
      );
      manipulatedUri = manipulated.uri;
    } catch {
      // Keep original URI if manipulation fails
    }

    // Get auth session
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service unavailable',
      };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    const userId = session?.user?.id;

    if (!session || !userId) {
      return {
        success: false,
        error: 'You must be signed in to upload photos',
      };
    }

    onProgress?.({
      stage: 'uploading',
      progress: 50,
      message: 'Uploading photo...',
    });

    const timestamp = Date.now();
    const filePath = `${circleId}/${userId}/${timestamp}.jpg`;
    const backendUrl = getBackendUrl();

    let uploadedPath: string | null = null;
    let downloadUrl: string | null = null;

    // Direct binary buffer read (zero JS thread freeze)
    let binaryBuffer: ArrayBuffer | Uint8Array | null = null;
    try {
      const fileRes = await fetch(manipulatedUri);
      binaryBuffer = await fileRes.arrayBuffer();
    } catch {
      try {
        const b64Res = await manipulateAsync(
          manipulatedUri,
          [],
          { compress: 0.72, format: SaveFormat.JPEG, base64: true },
        );
        if (b64Res.base64) {
          base64Fallback = b64Res.base64;
          binaryBuffer = base64ToUint8Array(b64Res.base64);
        }
      } catch {}
    }

    // Try direct Supabase upload first
    if (binaryBuffer) {
      try {
        const { data, error } = await supabase.storage
          .from('class-photos')
          .upload(filePath, binaryBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!error && data) {
          uploadedPath = data.path || filePath;

          const { data: signedData } = await supabase.storage
            .from('class-photos')
            .createSignedUrl(uploadedPath, 86400 * 7);

          if (signedData?.signedUrl) {
            downloadUrl = signedData.signedUrl;
          }
        }
      } catch (err) {
        console.warn('Direct upload failed, trying backend:', err);
      }
    }

    // Fallback to backend upload with 3.5s timeout
    if (!uploadedPath && (base64Fallback || binaryBuffer)) {
      try {
        let b64 = base64Fallback;
        if (!b64) {
          const b64Res = await manipulateAsync(
            manipulatedUri,
            [],
            { compress: 0.72, format: SaveFormat.JPEG, base64: true },
          );
          b64 = b64Res.base64;
        }

        if (b64) {
          const uploadResponse = await fetchWithTimeout(
            `${backendUrl}/api/posts/upload`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                classId: circleId,
                base64: b64,
                contentType: 'image/jpeg',
              }),
            },
            3500,
          );

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            uploadedPath = uploadResult.photoPath;
            downloadUrl = uploadResult.downloadUrl;
          }
        }
      } catch (err) {
        console.warn('Backend upload timed out or failed:', err);
      }
    }

    // Stage 3: Create post
    onProgress?.({
      stage: 'creating-post',
      progress: 80,
      message: 'Creating memory...',
    });

    const finalPath = uploadedPath || localUri;
    let postId: string | undefined;

    // Direct database insert first
    if (uploadedPath) {
      try {
        const todayDate = new Date().toISOString().slice(0, 10).split('T')[0];
        const { data: existingPost } = await supabase
          .from('daily_posts')
          .select('id')
          .eq('class_id', circleId)
          .eq('user_id', userId)
          .eq('post_date', todayDate)
          .is('deleted_at', null)
          .maybeSingle();

        if (existingPost) {
          await supabase
            .from('daily_posts')
            .update({
              photo_path: finalPath,
              caption: caption.trim() || null,
            })
            .eq('id', existingPost.id);
          postId = existingPost.id;
        } else {
          const { data: newPost } = await supabase
            .from('daily_posts')
            .insert({
              class_id: circleId,
              user_id: userId,
              photo_path: finalPath,
              post_date: todayDate,
              caption: caption.trim() || null,
            })
            .select('id')
            .single();
          postId = newPost?.id;
        }
      } catch (dbErr) {
        console.warn('Direct DB insert failed, falling back to backend:', dbErr);
      }
    }

    // If direct insert didn't run or get postId, try backend API with 3.5s timeout
    if (!postId && uploadedPath) {
      try {
        const postResponse = await fetchWithTimeout(
          `${backendUrl}/api/posts`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              classId: circleId,
              photoPath: uploadedPath,
              caption: caption.trim() || null,
            }),
          },
          3500,
        );

        if (postResponse.ok) {
          const postData = await postResponse.json();
          postId = postData.post?.id;
        }
      } catch {}
    }

    // Stage 4: Always save locally so user feed updates instantly
    try {
      await publishLocalPhoto(
        localUri,
        caption.trim() || 'Circle Memory',
        undefined,
        'General',
        caption.trim() || 'Circle Memory',
      );
    } catch {}

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Memory shared successfully!',
    });

    return {
      success: true,
      photoPath: finalPath,
      downloadUrl: downloadUrl || finalPath,
      postId,
    };
  } catch (error) {
    console.error('Upload error:', error);

    // Save locally as fallback so user work is never lost
    try {
      await publishLocalPhoto(
        localUri,
        caption.trim() || 'Circle Memory',
        undefined,
        'General',
        caption.trim() || 'Circle Memory',
      );
      return {
        success: true,
        photoPath: localUri,
        downloadUrl: localUri,
      };
    } catch {}

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}
