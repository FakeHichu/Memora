import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import type { 
  GroupEntity, 
  GroupMemberEntity, 
  GroupInvitationEntity, 
  MemoraUserProfile,
  ClassEntity,
  ClassMemberEntity,
  DailyPostEntity
} from "../types/index.js";
const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
export class ClassRepository {
  // --- Groups ---

  static async createGroup(
    name: string,
    userId: string,
    description?: string | null,
    isPrivate: boolean = true,
    inviteOnly: boolean = false,
  ): Promise<GroupEntity> {
    const cleanCode = `GRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: newGroup, error } = await supabaseAdmin
      .from("groups")
      .insert({
        name,
        description,
        is_private: isPrivate,
        invite_only: inviteOnly,
        join_code: cleanCode,
        created_by: userId,
        status: "active",
      })
      .select("*")
      .single();
    if (error) throw error;
    if (!newGroup) throw new Error("Group creation failed - no data returned");
    // Add creator as owner
    await supabaseAdmin.from("group_members").insert({
      group_id: newGroup.id,
      user_id: userId,
      role: "owner",
    });
    return newGroup as GroupEntity;
  }

  static async findGroupByJoinCode(joinCode: string): Promise<GroupEntity | null> {
    const upperCode = joinCode.toUpperCase().trim();
    const { data, error } = await supabaseAdmin
      .from("groups")
      .select("*")
      .eq("join_code", upperCode)
      .maybeSingle();
    if (error) throw error;
    return data as GroupEntity | null;
  }

  static async isMember(groupId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  static async isClassMember(classId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("class_members")
      .select("id")
      .eq("class_id", classId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  static async addMember(
    groupId: string,
    userId: string,
    role: "owner" | "admin" | "member" = "member",
  ): Promise<GroupMemberEntity> {
    const { data, error } = await supabaseAdmin
      .from("group_members")
      .upsert(
        { group_id: groupId, user_id: userId, role },
        { onConflict: "group_id,user_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return data as GroupMemberEntity;
  }

  static async addClassMember(
    classId: string,
    userId: string,
    role: "owner" | "admin" | "member" = "member",
  ): Promise<ClassMemberEntity> {
    const { data, error } = await supabaseAdmin
      .from("class_members")
      .upsert(
        { class_id: classId, user_id: userId, role },
        { onConflict: "class_id,user_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return data as ClassMemberEntity;
  }

  static async getMembers(groupId: string): Promise<GroupMemberEntity[]> {
    const { data, error } = await supabaseAdmin
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return data as GroupMemberEntity[];
  }

  static async getClassMembers(classId: string): Promise<ClassMemberEntity[]> {
    const { data, error } = await supabaseAdmin
      .from("class_members")
      .select("*")
      .eq("class_id", classId)
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return (data || []) as ClassMemberEntity[];
  }

  static async removeMember(
    groupId: string,
    userId: string,
    adminId: string,
  ): Promise<boolean> {
    // Check if admin
    const isAdmin = await supabaseAdmin
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", adminId)
      .single();
    if (isAdmin.data?.role !== 'admin' && adminId !== userId) {
      return false;
    }
    const { error } = await supabaseAdmin
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  }

  static async getUserGroups(userId: string): Promise<GroupEntity[]> {
    const { data, error } = await supabaseAdmin
      .from("group_members")
      .select("groups (*)")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || [])
      .map((row: any) => row.groups as GroupEntity)
      .filter(Boolean);
  }

  // --- Class (Entity) operations ---

  static async createClassWithOwner(
    name: string,
    userId: string,
    academicYear: number,
    schoolName?: string | null,
  ): Promise<ClassEntity> {
    // Use the atomic database RPC function to ensure class and owner membership
    // are created together, preventing orphaned classes
    const { data: newClass, error } = await supabaseAdmin
      .rpc("create_class_with_owner", {
        class_name: name,
        class_school_name: schoolName || null,
        class_academic_year: academicYear,
        owner_user_id: userId,
      });
    
    if (error) throw error;
    if (!newClass) throw new Error("Class creation failed - no data returned");
    
    return newClass as ClassEntity;
  }

  static async findByJoinCode(joinCode: string): Promise<ClassEntity | null> {
    const upperCode = joinCode.toUpperCase().trim();
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("*")
      .eq("join_code", upperCode)
      .maybeSingle();
    if (error) throw error;
    return data as ClassEntity | null;
  }

  static async findById(classId: string): Promise<ClassEntity | null> {
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("*")
      .eq("id", classId)
      .maybeSingle();
    if (error) throw error;
    return data as ClassEntity | null;
  }

  static async getUserClasses(userId: string): Promise<ClassEntity[]> {
    // Retrieve ALL classes the user is a member of (not just ones they created)
    const { data, error } = await supabaseAdmin
      .from("class_members")
      .select("classes (*)")
      .eq("user_id", userId);
    
    if (error) throw error;
    
    return (data || [])
      .map((row: any) => row.classes as ClassEntity)
      .filter(Boolean);
  }

  // --- Group Invitations ---

  static async createInvitation(
    groupId: string,
    inviterId: string,
    email: string,
  ): Promise<GroupInvitationEntity> {
    const code = `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const { data, error } = await supabaseAdmin
      .from("group_invitations")
      .insert({
        group_id: groupId,
        inviter_id: inviterId,
        email,
        code,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();
    if (error) throw error;
    return data as GroupInvitationEntity;
  }

  static async consumeInvitation(
    groupId: string,
    code: string,
    userId: string,
  ): Promise<{ alreadyJoined: boolean; member: GroupMemberEntity }> {
    // Check if code exists and not consumed
    const { data: invitation, error } = await supabaseAdmin
      .from("group_invitations")
      .select("*")
      .eq("group_id", groupId)
      .eq("code", code)
      .is("consumed_at", null)
      .maybeSingle();
    if (error || !invitation) {
      throw new Error("Invalid or expired invitation code.");
    }
    // Check if user already a member
    const isMember = await supabaseAdmin
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();
    if (isMember.data) {
      const { data: member } = await supabaseAdmin
        .from("group_members")
        .select("*")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();
      return { alreadyJoined: true, member: member as GroupMemberEntity };
    }
    // Consume invitation and add member
    await supabaseAdmin
      .from("group_invitations")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", invitation.id);
    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from("group_members")
      .upsert(
        { group_id: groupId, user_id: userId, role: "member" },
        { onConflict: "group_id,user_id" },
      )
      .select()
      .single();
    if (upsertError) throw upsertError;
    return { alreadyJoined: false, member: upsertData as GroupMemberEntity };
  }

  // --- Bridge between classes and groups ---

  static async linkClassToGroup(
    classId: string,
    groupId: string,
  ): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from("class_group_bridge")
      .insert({ class_id: classId, group_id: groupId });
    if (error && error.code !== '23505') { // duplicate key is OK
      throw error;
    }
    return true;
  }

  static async unlinkClassFromGroup(
    classId: string,
    groupId: string,
  ): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from("class_group_bridge")
      .delete().eq("class_id", classId).eq("group_id", groupId);
    if (error) throw error;
    return true;
  }

  static async getGroupsForClass(
    classId: string,
  ): Promise<GroupEntity[]> {
    const { data, error } = await supabaseAdmin
      .from("class_group_bridge")
      .select("groups (*)")
      .eq("class_id", classId);
    if (error) throw error;
    return (data || [])
      .map((row: any) => row.groups as GroupEntity)
      .filter(Boolean);
  }
}