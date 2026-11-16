import { getSupabaseClient } from "../lib/supabase.js";
import type {
  CircleEntity,
  CircleMemberEntity,
  CirclePostEntity,
  CirclePostReactionEntity,
  UserActiveCircleEntity,
} from "../types/index.js";

export class CircleRepository {
  // Circle CRUD
  static async createCircle(
    classId: string,
    name: string,
    createdBy: string,
    description?: string | null,
  ): Promise<CircleEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circles")
      .insert({
        class_id: classId,
        name,
        description: description || null,
        created_by: createdBy,
      })
      .select()
      .single();
    if (error) throw error;
    return data as CircleEntity;
  }

  static async findCircleById(circleId: string): Promise<CircleEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circles")
      .select("*")
      .eq("id", circleId)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw error;
    return data as CircleEntity | null;
  }

  static async getUserCircles(userId: string): Promise<CircleEntity[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_members")
      .select("circles(*)")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || [])
      .map((row: any) => row.circles)
      .filter(Boolean) as CircleEntity[];
  }

  static async getCirclesByClass(classId: string, userId: string): Promise<CircleEntity[]> {
    const client = getSupabaseClient();
    // Get circles in this class where user is a member
    const { data, error } = await client
      .from("circles")
      .select(`
        *,
        circle_members!inner(user_id)
      `)
      .eq("class_id", classId)
      .eq("circle_members.user_id", userId)
      .eq("status", "active");
    if (error) throw error;
    return (data || []) as CircleEntity[];
  }

  // Circle Members
  static async addMember(
    circleId: string,
    userId: string,
    role: "owner" | "admin" | "member" = "member",
  ): Promise<CircleMemberEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_members")
      .insert({
        circle_id: circleId,
        user_id: userId,
        role,
      })
      .select()
      .single();
    if (error) throw error;
    return data as CircleMemberEntity;
  }

  static async isMember(circleId: string, userId: string): Promise<boolean> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_members")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .maybeSingle();
    return !error && !!data;
  }

  static async getCircleMembers(circleId: string): Promise<CircleMemberEntity[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_members")
      .select("*")
      .eq("circle_id", circleId)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return (data || []) as CircleMemberEntity[];
  }

  static async getMemberCount(circleId: string): Promise<number> {
    const client = getSupabaseClient();
    const { count, error } = await client
      .from("circle_members")
      .select("*", { count: "exact", head: true })
      .eq("circle_id", circleId);
    if (error) return 0;
    return count || 0;
  }

  // Circle Posts
  static async createPost(
    circleId: string,
    userId: string,
    photoPath: string,
    caption?: string | null,
  ): Promise<CirclePostEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_posts")
      .insert({
        circle_id: circleId,
        user_id: userId,
        photo_path: photoPath,
        caption: caption || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as CirclePostEntity;
  }

  static async getCirclePosts(
    circleId: string,
    limit: number = 50,
  ): Promise<CirclePostEntity[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_posts")
      .select("*")
      .eq("circle_id", circleId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as CirclePostEntity[];
  }

  static async findPostById(postId: string): Promise<CirclePostEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_posts")
      .select("*")
      .eq("id", postId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data as CirclePostEntity | null;
  }

  static async updatePostCaption(
    postId: string,
    caption?: string | null,
  ): Promise<CirclePostEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_posts")
      .update({
        caption: caption || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single();
    if (error) throw error;
    return data as CirclePostEntity;
  }

  static async softDeletePost(postId: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from("circle_posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", postId);
    if (error) throw error;
  }

  // Reactions
  static async toggleReaction(
    postId: string,
    userId: string,
    reactionType: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect",
  ): Promise<{ action: "added" | "removed"; reaction: CirclePostReactionEntity | null }> {
    const client = getSupabaseClient();
    const { data: existing } = await client
      .from("circle_post_reactions")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("reaction_type", reactionType)
      .maybeSingle();

    if (existing) {
      await client.from("circle_post_reactions").delete().eq("id", existing.id);
      return { action: "removed", reaction: null };
    }

    const { data: created, error } = await client
      .from("circle_post_reactions")
      .insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
      .select()
      .single();
    if (error) throw error;
    return { action: "added", reaction: created as CirclePostReactionEntity };
  }

  static async getPostReactions(postId: string): Promise<CirclePostReactionEntity[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("circle_post_reactions")
      .select("*")
      .eq("post_id", postId);
    if (error) return [];
    return (data || []) as CirclePostReactionEntity[];
  }

  // User Active Circle
  static async setActiveCircle(userId: string, circleId: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from("user_active_circle")
      .upsert(
        {
          user_id: userId,
          circle_id: circleId,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    if (error) throw error;
  }

  static async getActiveCircle(userId: string): Promise<UserActiveCircleEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("user_active_circle")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return null;
    return data as UserActiveCircleEntity | null;
  }

  static async getUserActiveCircleWithDetails(userId: string): Promise<CircleEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("user_active_circle")
      .select("circles(*)")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return (data as any).circles as CircleEntity;
  }
}
