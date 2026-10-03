import { getSupabaseClient } from "../lib/supabase.js";

export class StorageService {
  static readonly BUCKET_NAME = "class-photos";

  static async createSignedUploadUrl(
    filePath: string,
  ): Promise<{ signedUrl: string; token: string; path: string }> {
    const client = getSupabaseClient();
    const { data, error } = await client.storage
      .from(this.BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (error) throw error;
    return {
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    };
  }

  static async createSignedDownloadUrl(
    filePath: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    const client = getSupabaseClient();
    const { data, error } = await client.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  }
}
