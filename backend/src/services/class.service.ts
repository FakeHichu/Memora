import { ClassRepository } from "../repositories/class.repository.js";
import type { ClassEntity, ClassMemberEntity } from "../types/index.js";

export class ClassService {
  static async createClass(
    name: string,
    schoolName: string | null,
    academicYear: number,
    ownerUserId: string,
  ): Promise<ClassEntity> {
    return ClassRepository.createClassWithOwner(
      name,
      schoolName,
      academicYear,
      ownerUserId,
    );
  }

  static async joinClassByCode(
    joinCode: string,
    userId: string,
  ): Promise<{ classEntity: ClassEntity; member: ClassMemberEntity }> {
    const classEntity = await ClassRepository.findByJoinCode(joinCode);
    if (!classEntity) {
      throw new Error(
        "Class not found. Please verify the 8-character invite code.",
      );
    }

    const member = await ClassRepository.addMember(
      classEntity.id,
      userId,
      "member",
    );
    return { classEntity, member };
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
