import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ClassEntity, ClassMemberEntity } from "../types/index.js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export class ClassRepository {
  static async createClassWithOwner(
    name: string,
    schoolName: string | null,
    academicYear: number,
    ownerUserId: string,
  ): Promise<ClassEntity> {
    const client: SupabaseClient = supabaseAdmin;

    // Generate a unique 8-character join code
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const joinCode = `MEM-${randomBytes.toString('hex').substring(0, 8).toUpperCase()}`;

    // Insert into classes table
    const { data: newClass, error: classError } = await client
      .from("classes")
      .insert({
        name,
        school_name: schoolName,
        academic_year: academicYear,
        join_code: joinCode,
        created_by: ownerUserId,
        status: "active",
      })
      .select("*")
      .single();

    if (classError) throw classError;
    if (!newClass) throw new Error("Class creation failed - no data returned");

    // Add creator as owner in class_members table
    const { error: memberError } = await client
      .from("class_members")
      .insert({
        class_id: newClass.id,
        user_id: ownerUserId,
        role: "owner",
      });

    if (memberError) throw memberError;

    return newClass as ClassEntity;
  }

  static async findByJoinCode(joinCode: string): Promise<ClassEntity | null> {
    const client: SupabaseClient = supabaseAdmin;
    const upperCode = joinCode.toUpperCase().trim();

    const { data, error } = await client
      .from("classes")
      .select("*")
      .eq("join_code", upperCode)
      .maybeSingle();

    if (error) throw error;
    return data as ClassEntity | null;
  }

  static async findById(classId: string): Promise<ClassEntity | null> {
    const client: SupabaseClient = supabaseAdmin;
    const { data, error } = await client
      .from("classes")
      .select("*")
      .eq("id", classId)
      .maybeSingle();

    if (error) throw error;
    return data as ClassEntity | null;
  }

  static async getUserClasses(userId: string): Promise<ClassEntity[]> {
    const client: SupabaseClient = supabaseAdmin;
    const { data, error } = await client
      .from("class_members")
      .select("class_id, classes (*)")
      .eq("user_id", userId);

    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || [])
      .map((row: any) => row.classes as ClassEntity)
      .filter(Boolean);
  }

  static async isMember(classId: string, userId: string): Promise<boolean> {
    const client: SupabaseClient = supabaseAdmin;
    const { data, error } = await client
      .from("class_members")
      .select("id")
      .eq("class_id", classId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  static async addMember(
    classId: string,
    userId: string,
    role: "owner" | "admin" | "member" = "member",
  ): Promise<ClassMemberEntity> {
    const client: SupabaseClient = supabaseAdmin;
    const { data, error } = await client
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

  static async getMembers(classId: string): Promise<ClassMemberEntity[]> {
    const client: SupabaseClient = supabaseAdmin;
    const { data, error } = await client
      .from("class_members")
      .select("*, profiles:user_id (*)")
      .eq("class_id", classId)
      .order("joined_at", { ascending: true });

    if (error) throw error;
    return data as ClassMemberEntity[];
  }
}
