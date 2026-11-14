import { ClassRepository } from "../repositories/class.repository.js";
import { PostRepository } from "../repositories/post.repository.js";
import { StorageService } from "../storage/storage.service.js";
import { getSupabaseClient } from "../lib/supabase.js";
import type { DailyPostEntity, ReactionEntity, CommentEntity, CommentReactionEntity } from "../types/index.js";
export class PostService {
  static async createDailyPost(
    classId: string,
    userId: string,
    photoPath: string,
    caption?: string | null,
    promptId?: string | null,
  ): Promise<DailyPostEntity> {
    const isMember = await ClassRepository.isMember(classId, userId);
    if (!isMember) {
      const err = new Error(
        "You must be an enrolled member of this class to post.",
      );
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    // Use UTC midnight slice to avoid timezone-dependent "today" date
    // This ensures a user in any timezone sees "today" consistently
    const todayDate = new Date().toISOString().slice(0, 10).split('T')[0];
    const existing = await PostRepository.findUserPostForDate(
      classId,
      userId,
      todayDate,
    );
    if (existing) {
      const err = new Error(
        "One photo per day rule: You have already posted for today.",
      );
      (err as unknown as { status: number }).status = 409;
      throw err;
    }
    return PostRepository.createDailyPost(
      classId,
      userId,
      photoPath,
      todayDate,
      promptId,
      caption,
    );
  }
  static async getTodayFeed(
    classId: string,
    userId: string,
  ): Promise<{
    userPostedToday: boolean;
    posts: Array<
      DailyPostEntity & {
        photoUrl?: string;
        authorName?: string;
        reactionsMap?: Record<string, number>;
        userReaction?: string | null;
        comments?: Array<{ id: string; content: string; authorName: string }>;
      }
    >;
  }> {
    const isMember = await ClassRepository.isMember(classId, userId);
    if (!isMember) {
      const err = new Error("Access denied to private class feed.");
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    const todayDate = new Date().toISOString().slice(0, 10);
    const userTodayPost = await PostRepository.findUserPostForDate(
      classId,
      userId,
      todayDate,
    );
    const userPostedToday = Boolean(userTodayPost);
    let rawPosts = await PostRepository.getClassPostsForDate(
      classId,
      todayDate,
    );

    // If no posts today yet, also include recent posts for the class feed
    if (rawPosts.length === 0) {
      rawPosts = await PostRepository.getClassPosts(classId, 30);
    }

    const client = getSupabaseClient();
    const userIds = Array.from(new Set(rawPosts.map((p: any) => p.user_id)));
    const profileMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const { data: profiles } = await client
          .from("profiles")
          .select("id, username, display_name, avatar_path")
          .in("id", userIds);
        if (profiles) {
          for (const pr of profiles) {
            profileMap.set(pr.id, pr);
          }
        }
      } catch {
        // fallback
      }
    }

    // Safely query comments if table exists
    const postIds = rawPosts.map((p: any) => p.id);
    const commentsByPostId = new Map<string, any[]>();
    if (postIds.length > 0) {
      try {
        const { data: commentsData } = await client
          .from("comments")
          .select("id, post_id, user_id, content, created_at")
          .in("post_id", postIds);
        if (commentsData) {
          for (const c of commentsData) {
            const list = commentsByPostId.get(c.post_id) || [];
            list.push(c);
            commentsByPostId.set(c.post_id, list);
          }
        }
      } catch {
        // Comments table may not exist yet, fallback to empty
      }
    }

    const formatted = await Promise.all(
      rawPosts.map(async (post: any) => {
        let photoUrl: string | undefined;
        try {
          photoUrl = await StorageService.createSignedDownloadUrl(
            post.photo_path,
            86400, // 24 hours
          );
        } catch {
          photoUrl = post.photo_path;
        }
        const reactions = (post.reactions || []) as ReactionEntity[];
        const reactionsMap: Record<string, number> = {};
        let userReaction: string | null = null;
        for (const r of reactions) {
          reactionsMap[r.reaction_type] =
            (reactionsMap[r.reaction_type] || 0) + 1;
          if (r.user_id === userId) {
            userReaction = r.reaction_type;
          }
        }
        const authorProfile = profileMap.get(post.user_id) || post.profiles;
        const authorName =
          authorProfile?.display_name || authorProfile?.username || "Classmate";
        const authorAvatar = authorProfile?.avatar_path || null;

        // Get comments for this post
        const postComments = commentsByPostId.get(post.id) || post.comments || [];
        const comments = postComments.map((c: any) => {
          const commenterProfile = profileMap.get(c.user_id) || c.profiles;
          return {
            id: c.id,
            content: c.content,
            authorName:
              commenterProfile?.display_name || commenterProfile?.username || "Classmate",
          };
        });

        return {
          ...post,
          photoUrl,
          authorName,
          authorAvatar,
          reactionsMap,
          userReaction,
          comments,
        };
      }),
    );
    return {
      userPostedToday,
      posts: formatted,
    };
  }

  static async getClassFeed(
    classId: string,
    userId: string,
  ): Promise<{
    userPostedToday: boolean;
    posts: Array<
      DailyPostEntity & {
        photoUrl?: string;
        authorName?: string;
        authorAvatar?: string | null;
        reactionsMap?: Record<string, number>;
        userReaction?: string | null;
        comments?: Array<{ id: string; content: string; authorName: string }>;
      }
    >;
  }> {
    return this.getTodayFeed(classId, userId);
  }
  static async updateCaption(
    postId: string,
    userId: string,
    caption?: string | null,
  ): Promise<DailyPostEntity> {
    const post = await PostRepository.findById(postId);
    if (!post) {
      const err = new Error("Post not found.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }
    if (post.user_id !== userId) {
      const err = new Error("Only the author can edit this post.");
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    return PostRepository.updateCaption(postId, caption);
  }
  static async deletePost(postId: string, userId: string): Promise<void> {
    const post = await PostRepository.findById(postId);
    if (!post) {
      const err = new Error("Post not found.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }
    if (post.user_id !== userId) {
      const isMember = await ClassRepository.isMember(post.class_id, userId);
      if (!isMember) {
        const err = new Error("Not authorized to delete this post.");
        (err as unknown as { status: number }).status = 403;
        throw err;
      }
    }
    await PostRepository.softDelete(postId);
  }
  static async toggleReaction(
    postId: string,
    userId: string,
    reactionType: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect",
  ): Promise<{ action: "added" | "removed"; reaction: ReactionEntity | null }> {
    const post = await PostRepository.findById(postId);
    if (!post) {
      const err = new Error("Post not found.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }
    const isMember = await ClassRepository.isMember(post.class_id, userId);
    if (!isMember) {
      const err = new Error("You must be a member of the class to react.");
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    return PostRepository.toggleReaction(postId, userId, reactionType);
  }

  // --- Comments ---

  static async createComment(
    postId: string,
    userId: string,
    content: string,
    parentId?: string | null,
  ): Promise<CommentEntity> {
    return PostRepository.createComment(postId, userId, content, parentId);
  }
  static async getCommentsForPost(
    postId: string,
    userId: string,
  ): Promise<CommentEntity[]> {
    // Check membership
    const post = await PostRepository.findById(postId);
    if (!post) return [];
    const isMember = await ClassRepository.isMember(post.class_id, userId);
    if (!isMember) return [];
    return PostRepository.getCommentsForPost(postId);
  }
  static async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<CommentEntity | null> {
    const comment = await PostRepository.findByCommentId(commentId);
    if (!comment) {
      const err = new Error("Comment not found.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }
    if (comment.user_id !== userId) {
      const err = new Error("Only the author can edit this comment.");
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    return PostRepository.updateComment(commentId, userId, content);
  }
  static async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await PostRepository.findByCommentId(commentId);
    if (!comment) {
      const err = new Error("Comment not found.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }
    if (comment.user_id !== userId) {
      const err = new Error("Only the author can delete this comment.");
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    await PostRepository.deleteComment(commentId, userId);
  }
  static async toggleCommentReaction(
    commentId: string,
    userId: string,
    reactionType: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect",
  ): Promise<{ action: "added" | "removed"; reaction: CommentReactionEntity | null }> {
    // Check membership
    const comment = await PostRepository.findByCommentId(commentId);
    if (!comment) {
      const err = new Error("Comment not found.");
      (err as unknown as { status: number }).status = 404;
      throw err;
    }
    const post = await PostRepository.findById(comment.post_id);
    if (!post) return { action: "added", reaction: null };
    const isMember = await ClassRepository.isMember(post.class_id, userId);
    if (!isMember) {
      const err = new Error("You must be a member to react.");
      (err as unknown as { status: number }).status = 403;
      throw err;
    }
    return PostRepository.toggleCommentReaction(commentId, userId, reactionType);
  }
}