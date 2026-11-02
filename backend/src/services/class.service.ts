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
    // Normalize the code consistently, including uppercase handling
    const cleanCode = joinCode.trim().toUpperCase();

    // Find class by join code
    const classEntity = await ClassRepository.findByJoinCode(cleanCode);
    if (!classEntity) {
      throw new Error(
        "Class not found. Please verify the 8-character invite code.",
      );
    }

    // Check if the class is archived
    if (classEntity.status === 'archived') {
      throw new Error("This class has been archived and cannot be joined.");
    }

    // Check if the user is already a member
    const isAlreadyMember = await ClassRepository.isMember(
      classEntity.id,
      userId,
    );
    if (isAlreadyMember) {
      // User is already a member - return the existing class and membership info
      const existingMember = await ClassRepository.getMembers(classEntity.id);
      const member = existingMember.find((m) => m.user_id === userId);
      return { classEntity, member, alreadyJoined: true };
    }

    // Add the user to class_members with 'member' role
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