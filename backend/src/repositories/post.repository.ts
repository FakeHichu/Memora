import { getSupabaseClient } from "../lib/supabase.js";
import type { DailyPostEntity, ReactionEntity } from "../types/index.js";

export class PostRepository {
  static async createDailyPost(
    classId: string,
    userId: string,
    photoPath: string,
    postDate: string,
    promptId?: string | null,
    caption?: string | null,
  ): Promise<DailyPostEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_posts")
      .insert({
        class_id: classId,
        user_id: userId,
        photo_path: photoPath,
        post_date: postDate,
        prompt_id: promptId || null,
        caption: caption || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as DailyPostEntity;
  }

  static async findUserPostForDate(
    classId: string,
    userId: string,
    postDate: string,
  ): Promise<DailyPostEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_posts")
      .select("*")
      .eq("class_id", classId)
      .eq("user_id", userId)
      .eq("post_date", postDate)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;
    return data as DailyPostEntity | null;
  }

  static async getClassPostsForDate(
    classId: string,
    postDate: string,
  ): Promise<DailyPostEntity[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_posts")
      .select(
        "*, reactions (*), profiles:user_id (display_name, username, avatar_path)",
      )
      .eq("class_id", classId)
      .eq("post_date", postDate)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as DailyPostEntity[];
  }

  static async findById(postId: string): Promise<DailyPostEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_posts")
      .select("*")
      .eq("id", postId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;
    return data as DailyPostEntity | null;
  }

  static async updateCaption(
    postId: string,
    caption?: string | null,
  ): Promise<DailyPostEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("daily_posts")
      .update({
        caption: caption || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return data as DailyPostEntity;
  }

  static async softDelete(postId: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from("daily_posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", postId);

    if (error) throw error;
  }

  static async toggleReaction(
    postId: string,
    userId: string,
    reactionType: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect",
  ): Promise<{ action: "added" | "removed"; reaction: ReactionEntity | null }> {
    const client = getSupabaseClient();

    const { data: existing } = await client
      .from("reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType)
      .maybeSingle();

    if (existing) {
      await client.from("reactions").delete().eq("id", existing.id);
      return { action: "removed", reaction: null };
    }

    const { data: created, error } = await client
      .from("reactions")
      .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
      .select()
      .single();

    if (error) throw error;
    return { action: "added", reaction: created as ReactionEntity };
  }
}
