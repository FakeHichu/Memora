import { ClassRepository } from "../repositories/class.repository.js";
import type { ClassEntity, ClassMemberEntity } from "../types/index.js";
export class ClassService {
  static async createClass(
    name: string,
    schoolName: string | null,
    academicYear: number,
    userId: string,
  ): Promise<ClassEntity> {
    return ClassRepository.createClassWithOwner(
      name,
      schoolName,
      academicYear,
      userId,
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
    const isAlreadyMember = await ClassRepository.isMember(
      classEntity.id,
      userId,
    );
    if (isAlreadyMember) {
      const existingMember = await ClassRepository.getMembers(classEntity.id);
      const member = existingMember.find((m) => m.user_id === userId);
      return { classEntity, member, alreadyJoined: true };
    }
    const member = await ClassRepository.addMember(
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
    const isMember = await ClassRepository.isMember(classId, userId);
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
    const isMember = await ClassRepository.isMember(classId, userId);
    if (!isMember) {
      throw new Error("You do not have access to view members of this class.");
    }
    return ClassRepository.getMembers(classId);
  }
  static async getUserClasses(userId: string): Promise<ClassEntity[]> {
    return ClassRepository.getUserClasses(userId);
  }
}