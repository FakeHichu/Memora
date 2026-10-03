import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export interface UserProfile {
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
}

export interface ClassMemberEntity {
  id: string;
  class_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
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

export interface ReportEntity {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description?: string | null;
  status: "pending" | "reviewed" | "dismissed" | "removed";
  created_at: string;
}
