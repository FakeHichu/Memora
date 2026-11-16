import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export interface MemoraUserProfile {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassEntity {
  id: string;
  name: string;
  school_name?: string | null;
  academic_year: number;
  join_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: "active" | "archived";
  member_count?: number;
}

export interface ClassMemberEntity {
  id: string;
  class_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface GroupEntity {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  is_private: boolean;
  invite_only: boolean;
  join_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: "active" | "archived";
}

export interface GroupMemberEntity {
  id: string;
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface GroupInvitationEntity {
  id: string;
  group_id: string;
  inviter_id: string;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
  consumed_at?: string | null;
}

export interface DailyPromptEntity {
  id: string;
  prompt_text: string;
  prompt_date: string;
  created_at: string;
}

export interface DailyPostEntity {
  id: string;
  class_id: string;
  user_id: string;
  photo_path: string;
  prompt_id?: string | null;
  post_date: string;
  caption?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ReactionEntity {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect";
  created_at: string;
}

export interface CommentEntity {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  is_edited: boolean;
  edited_at?: string | null;
  created_at: string;
}

export interface CommentReactionEntity {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect";
  created_at: string;
}

export interface CircleEntity {
  id: string;
  class_id: string;
  name: string;
  description?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: "active" | "archived";
}

export interface CircleMemberEntity {
  id: string;
  circle_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface CirclePostEntity {
  id: string;
  circle_id: string;
  user_id: string;
  photo_path: string;
  caption?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CirclePostReactionEntity {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect";
  created_at: string;
}

export interface UserActiveCircleEntity {
  user_id: string;
  circle_id: string;
  last_accessed: string;
  updated_at: string;
}
