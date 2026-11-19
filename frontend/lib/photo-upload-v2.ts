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
 * Upload photo to Circle with progress tracking and automatic retries
 */
export async function uploadPhotoToCircle(
  localUri: string,
  circleId: string,
  caption: string,
  onProgress?: (progress: UploadProgress) => void,
  retryCount: number = 0,
): Promise<UploadResult> {
  const MAX_RETRIES = 2;

  try {
    // Stage 1: Process image
    onProgress?.({
      stage: 'processing',
      progress: 10,
      message: 'Preparing your photo...',
    });

    const manipulated = await manipulateAsync(
      localUri,
      [{ resize: { width: 1280 } }],
      { compress: 0.8, format: SaveFormat.JPEG, base64: true },
    );

    if (!manipulated.base64) {
      return {
        success: false,
        error: 'Failed to process image',
      };
    }

    const base64Data = manipulated.base64;

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
      stage: 'processing',
      progress: 30,
      message: 'Image ready',
    });

    // Stage 2: Upload to storage
    onProgress?.({
      stage: 'uploading',
      progress: 40,
      message: 'Uploading to cloud storage...',
    });

    const timestamp = Date.now();
    const filePath = `${circleId}/${userId}/${timestamp}.jpg`;
    const backendUrl = getBackendUrl();

    let uploadedPath: string | null = null;
    let downloadUrl: string | null = null;

    // Try direct Supabase upload first
    try {
      const bytes = base64ToUint8Array(base64Data);
      const { data, error } = await supabase.storage
        .from('class-photos')
        .upload(filePath, bytes.buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        uploadedPath = data.path || filePath;
        
        // Get signed URL
        const { data: signedData } = await supabase.storage
          .from('class-photos')
          .createSignedUrl(uploadedPath, 86400 * 7);
        
        if (signedData?.signedUrl) {
          downloadUrl = signedData.signedUrl;
        }

        onProgress?.({
          stage: 'uploading',
          progress: 70,
          message: 'Upload complete',
        });
      }
    } catch (err) {
      console.warn('Direct upload failed, trying backend:', err);
    }

    // Fallback to backend upload
    if (!uploadedPath) {
      try {
        const uploadResponse = await fetch(`${backendUrl}/api/posts/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classId: circleId,
            base64: base64Data,
            contentType: 'image/jpeg',
          }),
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          uploadedPath = uploadResult.photoPath;
          downloadUrl = uploadResult.downloadUrl;

          onProgress?.({
            stage: 'uploading',
            progress: 70,
            message: 'Upload complete',
          });
        }
      } catch (err) {
        console.error('Backend upload failed:', err);
      }
    }

    // If both uploads failed
    if (!uploadedPath) {
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        onProgress?.({
          stage: 'uploading',
          progress: 40,
          message: `Upload failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`,
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return uploadPhotoToCircle(localUri, circleId, caption, onProgress, retryCount + 1);
      }

      return {
        success: false,
        error: 'Upload failed after multiple attempts. Please check your connection.',
      };
    }

    // Stage 3: Create post in database
    onProgress?.({
      stage: 'creating-post',
      progress: 80,
      message: 'Creating post...',
    });

    const postResponse = await fetch(`${backendUrl}/api/posts`, {
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
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json().catch(() => ({}));
      
      // If post creation failed but upload succeeded, we have orphaned storage
      // Log this for cleanup, but don't retry
      console.error('Post creation failed with uploaded photo:', uploadedPath);
      
      return {
        success: false,
        error: errorData.message || 'Failed to create post',
      };
    }

    const postData = await postResponse.json();

    onProgress?.({
      stage: 'creating-post',
      progress: 95,
      message: 'Post created',
    });

    // Stage 4: Save locally (non-blocking)
    try {
      await publishLocalPhoto(
        localUri,
        caption.trim(),
        undefined,
        'General',
        undefined,
        undefined,
        undefined,
      );
    } catch {
      // Non-fatal
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Photo shared successfully!',
    });

    return {
      success: true,
      photoPath: uploadedPath,
      downloadUrl: downloadUrl || uploadedPath,
      postId: postData.post?.id,
    };
  } catch (error) {
    console.error('Upload error:', error);
    
    // Retry on network errors
    if (retryCount < MAX_RETRIES && error instanceof TypeError) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return uploadPhotoToCircle(localUri, circleId, caption, onProgress, retryCount + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Cancel an ongoing upload (placeholder for future implementation)
 */
export function cancelUpload(): void {
  // Future: Implement AbortController for fetch requests
  console.log('Upload cancellation requested');
}
