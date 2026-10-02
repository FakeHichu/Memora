export type UserRole = 'owner' | 'admin' | 'member';
export type ClassStatus = 'active' | 'archived';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'removed';
export type ReactionType = 'heart' | 'laugh' | 'cry' | 'fire' | 'dead' | 'respect';

export interface Profile {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  school_name?: string | null;
  academic_year: number;
  join_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: ClassStatus;
  member_count?: number;
}

export interface ClassMemberRecord {
  id: string;
  class_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile?: Profile;
  streak_count?: number;
}

export interface DailyPromptRecord {
  id: string;
  prompt_text: string;
  prompt_date: string;
  created_at: string;
}

export interface DailyPostRecord {
  id: string;
  class_id: string;
  user_id: string;
  photo_path: string;
  photo_url?: string;
  prompt_id?: string | null;
  prompt_text?: string | null;
  post_date: string;
  caption?: string | null;
  category?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  reactions?: Record<string, number>;
  user_reaction?: string | null;
}

export interface ReactionRecord {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  created_at: string;
}
