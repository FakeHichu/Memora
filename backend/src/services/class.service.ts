import { ClassRepository } from "../repositories/class.repository.js";
import type {
  GroupEntity,
  GroupMemberEntity,
  ClassEntity,
  ClassMemberEntity,
} from "../types/index.js";
export class ClassService {
  // --- Groups ---

  static async createGroup(
    name: string,
    userId: string,
    description?: string | null,
    isPrivate: boolean = true,
    inviteOnly: boolean = false,
  ): Promise<GroupEntity> {
    return ClassRepository.createGroup(
      name,
      userId,
      description,
      isPrivate,
      inviteOnly,
    );
  }

  static async joinGroupByCode(
    joinCode: string,
    userId: string,
  ): Promise<{ groupEntity: GroupEntity; member: GroupMemberEntity; alreadyJoined: boolean }> {
    const cleanCode = joinCode.trim().toUpperCase();
    const groupEntity = await ClassRepository.findGroupByJoinCode(cleanCode);
    if (!groupEntity) {
      throw new Error(
        "Group not found. Please verify the invite code.",
      );
    }
    if (groupEntity.status === 'archived') {
      throw new Error("This group has been archived and cannot be joined.");
    }
    const isAlreadyMember = await ClassRepository.isMember(
      groupEntity.id,
      userId,
    );
    if (isAlreadyMember) {
      const existingMember = await ClassRepository.getMembers(groupEntity.id);
      const member = existingMember.find((m) => m.user_id === userId);
      // member can be undefined if find returns undefined, handle gracefully
      return {
        groupEntity,
        member: member || { id: "", group_id: groupEntity.id, user_id: userId, role: "member", joined_at: new Date().toISOString() },
        alreadyJoined: true,
      };
    }
    const member = await ClassRepository.addMember(
      groupEntity.id,
      userId,
      "member",
    );
    return { groupEntity, member, alreadyJoined: false };
  }

  static async getGroupMembers(
    groupId: string,
    userId: string,
  ): Promise<GroupMemberEntity[]> {
    const isMember = await ClassRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new Error("You do not have access to view members of this group.");
    }
    return ClassRepository.getMembers(groupId);
  }

  // --- Classes (existing) ---

  static async createClass(
    name: string,
    schoolName: string | null,
    academicYear: number,
    userId: string,
  ): Promise<ClassEntity> {
    // These methods need to exist in ClassRepository
    return ClassRepository.createClassWithOwner(
      name,
      userId,
      academicYear,
      schoolName ?? null,
    );
  }

  static async joinClassByCode(
    joinCode: string,
    userId: string,
  ): Promise<{ classEntity: ClassEntity; member: ClassMemberEntity; alreadyJoined: boolean }> {
    const cleanCode = joinCode.trim().toUpperCase();
    const classEntity = await ClassRepository.findByJoinCode(cleanCode);
    if (!classEntity) {
      throw new Error(
        "Class not found. Please verify the 8-character invite code.",
      );
    }
    if (classEntity.status === 'archived') {
      throw new Error("This class has been archived and cannot be joined.");
    }
    // Use the correct method for checking class membership
    const isAlreadyMember = await ClassRepository.isClassMember(
      classEntity.id,
      userId,
    );
    if (isAlreadyMember) {
      const existingMember = await ClassRepository.getClassMembers(classEntity.id);
      const member = existingMember.find((m) => m.user_id === userId) || {
        id: "",
        class_id: classEntity.id,
        user_id: userId,
        role: "member",
        joined_at: new Date().toISOString(),
      };
      return { classEntity, member, alreadyJoined: true };
    }
    const member = await ClassRepository.addClassMember(
      classEntity.id,
      userId,
      "member",
    );
    return { classEntity, member, alreadyJoined: false };
  }

  static async getClassDetails(
    classId: string,
    userId: string,
  ): Promise<ClassEntity> {
    // Use the correct method for checking class membership
    const isMember = await ClassRepository.isClassMember(classId, userId);
    if (!isMember) {
      throw new Error("You do not have access to this private class.");
    }
    const classEntity = await ClassRepository.findById(classId);
    if (!classEntity) {
      throw new Error("Class not found.");
    }
    return classEntity;
  }

  static async getClassMembers(
    classId: string,
    userId: string,
  ): Promise<ClassMemberEntity[]> {
    // Use the correct method for checking class membership
    const isMember = await ClassRepository.isClassMember(classId, userId);
    if (!isMember) {
      throw new Error("You do not have access to view members of this class.");
    }
    return ClassRepository.getClassMembers(classId);
  }

  static async getUserClasses(userId: string): Promise<ClassEntity[]> {
    return ClassRepository.getUserClasses(userId);
  }
}