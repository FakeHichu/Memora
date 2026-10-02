import { ClassRepository } from "../repositories/class.repository.js";
import { PostRepository } from "../repositories/post.repository.js";
import { StorageService } from "../storage/storage.service.js";
import type { DailyPostEntity, ReactionEntity } from "../types/index.js";

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

    const todayDate = new Date().toISOString().slice(0, 10);

    // Enforce ONE PHOTO PER DAY RULE
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

    const rawPosts = await PostRepository.getClassPostsForDate(
      classId,
      todayDate,
    );

    // Format posts with signed URLs and reaction aggregation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = await Promise.all(
      rawPosts.map(async (post: any) => {
        let photoUrl: string | undefined;
        try {
          photoUrl = await StorageService.createSignedDownloadUrl(
            post.photo_path,
            3600,
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

        const authorProfile = post.profiles;
        const authorName =
          authorProfile?.display_name || authorProfile?.username || "Classmate";

        return {
          ...post,
          photoUrl,
          authorName,
          reactionsMap,
          userReaction,
        };
      }),
    );

    return {
      userPostedToday,
      posts: formatted,
    };
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
}
