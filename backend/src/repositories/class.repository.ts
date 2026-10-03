import { getSupabaseClient } from "../lib/supabase.js";
import type { ClassEntity, ClassMemberEntity } from "../types/index.js";

export class ClassRepository {
  static async createClassWithOwner(
    name: string,
    schoolName: string | null,
    academicYear: number,
    ownerUserId: string,
  ): Promise<ClassEntity> {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc("create_class_with_owner", {
      class_name: name,
      class_school_name: schoolName,
      class_academic_year: academicYear,
      owner_user_id: ownerUserId,
    });

    if (error) throw error;
    return data as ClassEntity;
  }

  static async findByJoinCode(joinCode: string): Promise<ClassEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("classes")
      .select("*")
      .eq("join_code", joinCode.toUpperCase().trim())
      .maybeSingle();

    if (error) throw error;
    return data as ClassEntity | null;
  }

  static async findById(classId: string): Promise<ClassEntity | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("classes")
      .select("*")
      .eq("id", classId)
      .maybeSingle();

    if (error) throw error;
    return data as ClassEntity | null;
  }

  static async getUserClasses(userId: string): Promise<ClassEntity[]> {
    const client = getSupabaseClient();
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
    const client = getSupabaseClient();
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
    const client = getSupabaseClient();
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
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("class_members")
      .select("*, profiles:user_id (*)")
      .eq("class_id", classId)
      .order("joined_at", { ascending: true });

    if (error) throw error;
    return data as ClassMemberEntity[];
  }
}
