import type { Request } from "express";

// Auth interfaces
export interface AuthenticatedRequest extends Request {
  userId: string;
}

export interface UserRecord {
  id: string;
  email: string | null;
  user_metadata: {
    full_name?: string | null;
    username?: string | null;
    avatar_path?: string | null;
  };
  app_metadata: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  banned_at: string | null;
  email_confirmed_at: string | null;
}

// Extended user profile for Memora
export interface MemoraUserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

// Group/Class interfaces
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
}

export interface ClassMemberEntity {
  id: string;
  class_id: string;
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
  consumed_at: string | null;
  created_at: string;
}

// Event interfaces
export interface EventEntity {
  id: string;
  group_id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventAlbumEntity {
  id: string;
  event_id: string;
  group_id: string;
  title: string;
  description?: string | null;
  cover_photo?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AlbumPhotoEntity {
  id: string;
  album_id: string;
  user_id: string;
  photo_path: string;
  caption?: string | null;
  created_at: string;
}

// Memory/Post interfaces (extended)
export interface DailyPostEntity {
  id: string;
  class_id: string; // can be class_id or group_id
  user_id: string;
  photo_path: string;
  prompt_id?: string | null;
  post_date: string;
  caption?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface DailyPromptEntity {
  id: string;
  prompt_text: string;
  prompt_date: string;
  created_at: string;
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
  updated_at: string;
}

export interface CommentReactionEntity {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: "heart" | "laugh" | "cry" | "fire" | "dead" | "respect";
  created_at: string;
}

// Notification interfaces
export interface NotificationEntity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  read_at?: string | null;
  created_at: string;
}

// Time capsule interfaces
export interface TimeCapsuleEntity {
  id: string;
  group_id?: string | null;
  creator_id: string;
  title: string;
  description?: string | null;
  unlock_date: string;
  is_group_capsule: boolean;
  participant_ids: string[];
  status: "pending" | "unlocked" | "expired";
  created_at: string;
  updated_at: string;
}

export interface TimeCapsuleItemEntity {
  id: string;
  capsule_id: string;
  user_id: string;
  post_id?: string | null;
  content_type: "photo" | "video" | "message";
  content_path?: string | null;
  created_at: string;
}

// Yearbook interfaces
export interface YearbookEntity {
  id: string;
  group_id: string;
  year: number;
  title?: string | null;
  generated_at?: string | null;
  cover_photo?: string | null;
  generated_by?: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface YearbookMemberEntity {
  id: string;
  yearbook_id: string;
  user_id: string;
  can_view: boolean;
  can_contribute: boolean;
  role: "owner" | "admin" | "member";
  added_at: string;
}

// Search and filter interfaces
export interface SearchFilters {
  query?: string;
  filter?: "all" | "users" | "groups" | "posts" | "albums";
  category?: string;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  items: T[];
  next_cursor?: string;
  has_more: boolean;
}

// API response interfaces
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  message: string;
  status?: number;
}

export interface PaginatedApiResponse<T> {
  ok: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}