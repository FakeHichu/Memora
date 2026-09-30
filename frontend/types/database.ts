export type UserRole = 'owner' | 'admin' | 'member';
export type ClassStatus = 'active' | 'archived';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'removed';

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
}
