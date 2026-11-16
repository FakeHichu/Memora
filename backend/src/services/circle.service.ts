import { CircleRepository } from "../repositories/circle.repository.js";
import { StorageService } from "../storage/storage.service.js";
import type { CircleEntity, CirclePostEntity } from "../types/index.js";

export class CircleService {
  static async createCircle(
    classId: string,
    userId: string,
    name: string,
    description?: string | null,
  ): Promise<CircleEntity> {
    const circle = await CircleRepository.createCircle(classId, name, userId, description);
    // Add creator as owner
    await CircleRepository.addMember(circle.id, userId, "owner");
    return circle;
  }

  static async getUserCircles(userId: string): Promise<CircleEntity[]> {
    return await CircleRepository.getUserCircles(userId);
  }

  static async getCirclesByClass(classId: string, userId: string): Promise<CircleEntity[]> {
    return await CircleRepository.getCirclesByClass(classId, userId);
  }

  static async joinCircle(circleId: string, userId: string): Promise<void> {
    const circle = await CircleRepository.findCircleById(circleId);
    if (!circle) {
      throw new Error("Circle not found");
    }
    const isMember = await CircleRepository.isMember(circleId, userId);
    if (isMember) {
      throw new Error("You are already a member of this circle");
    }
    await CircleRepository.addMember(circleId, userId, "member");
  }

  static async createCirclePost(
    circleId: string,
    userId: string,
    photoPath: string,
    caption?: string | null,
  ): Promise<CirclePostEntity> {
    // Verify membership
    const isMember = await CircleRepository.isMember(circleId, userId);
    if (!isMember) {
      throw new Error("You must be a member of this circle to post");
    }
    return await CircleRepository.createPost(circleId, userId, photoPath, caption);
  }

  static async getCircleFeed(circleId: string, userId: string): Promise<{
    posts: Array<any>;
    circle: CircleEntity | null;
    memberCount: number;
  }> {
    // Verify membership
    const isMember = await CircleRepository.isMember(circleId, userId);
    if (!isMember) {
      throw new Error("You must be a member of this circle to view posts");
    }

    const circle = await CircleRepository.findCircleById(circleId);
    const posts = await CircleRepository.getCirclePosts(circleId);
    const memberCount = await CircleRepository.getMemberCount(circleId);

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const reactions = await CircleRepository.getPostReactions(post.id);
        const reactionsMap: Record<string, number> = {};
        reactions.forEach((r) => {
          reactionsMap[r.reaction_type] = (reactionsMap[r.reaction_type] || 0) + 1;
        });
        const userReaction = reactions.find((r) => r.user_id === userId)?.reaction_type || null;

        let photoUrl = post.photo_path;
        try {
          photoUrl = await StorageService.createSignedDownloadUrl(post.photo_path, 86400);
        } catch {
          // Fallback to original path
        }

        return {
          id: post.id,
          circleId: post.circle_id,
          userId: post.user_id,
          photoUrl,
          photo_path: post.photo_path,
          caption: post.caption,
          created_at: post.created_at,
          updated_at: post.updated_at,
          reactionsMap,
          userReaction,
        };
      })
    );

    return {
      posts: enrichedPosts,
      circle,
      memberCount,
    };
  }

  static async updatePostCaption(
    postId: string,
    userId: string,
    caption?: string | null,
  ): Promise<CirclePostEntity> {
    const post = await CircleRepository.findPostById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.user_id !== userId) {
      throw new Error("You can only edit your own posts");
    }
    return await CircleRepository.updatePostCaption(postId, caption);
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    const post = await CircleRepository.findPostById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.user_id !== userId) {
      throw new Error("You can only delete your own posts");
    }
    await CircleRepository.softDeletePost(postId);
  }

  static async toggleReaction(
    postId: string,
    userId: string,
    reactionType: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect",
  ): Promise<any> {
    const post = await CircleRepository.findPostById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const isMember = await CircleRepository.isMember(post.circle_id, userId);
    if (!isMember) {
      throw new Error("You must be a member of this circle to react");
    }

    const result = await CircleRepository.toggleReaction(postId, userId, reactionType);
    const allReactions = await CircleRepository.getPostReactions(postId);
    const reactionsMap: Record<string, number> = {};
    allReactions.forEach((r) => {
      reactionsMap[r.reaction_type] = (reactionsMap[r.reaction_type] || 0) + 1;
    });
    const userReaction = allReactions.find((r) => r.user_id === userId)?.reaction_type || null;

    return {
      action: result.action,
      reactionsMap,
      userReaction,
    };
  }

  static async setActiveCircle(userId: string, circleId: string): Promise<void> {
    const isMember = await CircleRepository.isMember(circleId, userId);
    if (!isMember) {
      throw new Error("You must be a member of this circle");
    }
    await CircleRepository.setActiveCircle(userId, circleId);
  }

  static async getActiveCircle(userId: string): Promise<CircleEntity | null> {
    return await CircleRepository.getUserActiveCircleWithDetails(userId);
  }
}
