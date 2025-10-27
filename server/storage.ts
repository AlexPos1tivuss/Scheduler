import { db } from "./db";
import { 
  users, groups, subjects, audiences, teachers, students, 
  lessonTemplates, lessons, scheduleGenerationRuns,
  type User, type InsertUser,
  type Group, type InsertGroup,
  type Subject, type InsertSubject,
  type Audience, type InsertAudience,
  type Teacher, type InsertTeacher,
  type Student, type InsertStudent,
  type LessonTemplate, type InsertLessonTemplate,
  type Lesson, type InsertLesson,
  type ScheduleGenerationRun, type InsertScheduleGenerationRun
} from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserById(id: string): Promise<User | undefined>;
  getUserByLogin(login: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Teachers
  getTeacherById(id: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  getAllTeachers(): Promise<Teacher[]>;
  
  // Students
  getStudentById(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  
  // Groups
  getGroupById(id: string): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<boolean>;
  getAllGroups(): Promise<Group[]>;
  
  // Subjects
  getSubjectById(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;
  getAllSubjects(): Promise<Subject[]>;
  
  // Audiences
  getAudienceById(id: string): Promise<Audience | undefined>;
  createAudience(audience: InsertAudience): Promise<Audience>;
  updateAudience(id: string, audience: Partial<InsertAudience>): Promise<Audience | undefined>;
  deleteAudience(id: string): Promise<boolean>;
  getAllAudiences(): Promise<Audience[]>;
  
  // Lesson Templates
  getLessonTemplateById(id: string): Promise<LessonTemplate | undefined>;
  createLessonTemplate(template: InsertLessonTemplate): Promise<LessonTemplate>;
  updateLessonTemplate(id: string, template: Partial<InsertLessonTemplate>): Promise<LessonTemplate | undefined>;
  deleteLessonTemplate(id: string): Promise<boolean>;
  getAllLessonTemplates(): Promise<LessonTemplate[]>;
  
  // Lessons
  getLessonById(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  deleteLesson(id: string): Promise<boolean>;
  getLessonsByFilters(filters: {
    groupId?: string;
    teacherId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Lesson[]>;
  deleteAllLessons(): Promise<void>;
  
  // Schedule Generation Runs
  createScheduleGenerationRun(run: InsertScheduleGenerationRun): Promise<ScheduleGenerationRun>;
  getScheduleGenerationRunById(id: string): Promise<ScheduleGenerationRun | undefined>;
  getAllScheduleGenerationRuns(): Promise<ScheduleGenerationRun[]>;
}

class DrizzleStorage implements IStorage {
  // Users
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByLogin(login: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.login, login)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Teachers
  async getTeacherById(id: string): Promise<Teacher | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    return result[0];
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const result = await db.insert(teachers).values(teacher).returning();
    return result[0];
  }

  async getAllTeachers(): Promise<Teacher[]> {
    return db.select().from(teachers);
  }

  // Students
  async getStudentById(id: string): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return result[0];
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const result = await db.insert(students).values(student).returning();
    return result[0];
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const result = await db.update(students).set(student).where(eq(students.id, id)).returning();
    return result[0];
  }

  async getAllStudents(): Promise<Student[]> {
    return db.select().from(students);
  }

  // Groups
  async getGroupById(id: string): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0];
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async updateGroup(id: string, group: Partial<InsertGroup>): Promise<Group | undefined> {
    const result = await db.update(groups).set(group).where(eq(groups.id, id)).returning();
    return result[0];
  }

  async deleteGroup(id: string): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id)).returning();
    return result.length > 0;
  }

  async getAllGroups(): Promise<Group[]> {
    return db.select().from(groups);
  }

  // Subjects
  async getSubjectById(id: string): Promise<Subject | undefined> {
    const result = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
    return result[0];
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const result = await db.insert(subjects).values(subject).returning();
    return result[0];
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject | undefined> {
    const result = await db.update(subjects).set(subject).where(eq(subjects.id, id)).returning();
    return result[0];
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = await db.delete(subjects).where(eq(subjects.id, id)).returning();
    return result.length > 0;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return db.select().from(subjects);
  }

  // Audiences
  async getAudienceById(id: string): Promise<Audience | undefined> {
    const result = await db.select().from(audiences).where(eq(audiences.id, id)).limit(1);
    return result[0];
  }

  async createAudience(audience: InsertAudience): Promise<Audience> {
    const result = await db.insert(audiences).values(audience).returning();
    return result[0];
  }

  async updateAudience(id: string, audience: Partial<InsertAudience>): Promise<Audience | undefined> {
    const result = await db.update(audiences).set(audience).where(eq(audiences.id, id)).returning();
    return result[0];
  }

  async deleteAudience(id: string): Promise<boolean> {
    const result = await db.delete(audiences).where(eq(audiences.id, id)).returning();
    return result.length > 0;
  }

  async getAllAudiences(): Promise<Audience[]> {
    return db.select().from(audiences);
  }

  // Lesson Templates
  async getLessonTemplateById(id: string): Promise<LessonTemplate | undefined> {
    const result = await db.select().from(lessonTemplates).where(eq(lessonTemplates.id, id)).limit(1);
    return result[0];
  }

  async createLessonTemplate(template: InsertLessonTemplate): Promise<LessonTemplate> {
    const result = await db.insert(lessonTemplates).values(template).returning();
    return result[0];
  }

  async updateLessonTemplate(id: string, template: Partial<InsertLessonTemplate>): Promise<LessonTemplate | undefined> {
    const result = await db.update(lessonTemplates).set(template).where(eq(lessonTemplates.id, id)).returning();
    return result[0];
  }

  async deleteLessonTemplate(id: string): Promise<boolean> {
    const result = await db.delete(lessonTemplates).where(eq(lessonTemplates.id, id)).returning();
    return result.length > 0;
  }

  async getAllLessonTemplates(): Promise<LessonTemplate[]> {
    return db.select().from(lessonTemplates);
  }

  // Lessons
  async getLessonById(id: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
    return result[0];
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const result = await db.insert(lessons).values(lesson).returning();
    return result[0];
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const result = await db.update(lessons).set(lesson).where(eq(lessons.id, id)).returning();
    return result[0];
  }

  async deleteLesson(id: string): Promise<boolean> {
    const result = await db.delete(lessons).where(eq(lessons.id, id)).returning();
    return result.length > 0;
  }

  async getLessonsByFilters(filters: {
    groupId?: string;
    teacherId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const conditions = [];
    if (filters.groupId) {
      conditions.push(eq(lessons.groupId, filters.groupId));
    }
    if (filters.teacherId) {
      conditions.push(eq(lessons.teacherId, filters.teacherId));
    }
    if (filters.startDate) {
      conditions.push(gte(lessons.startAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(lessons.endAt, filters.endDate));
    }

    const lessonsData = conditions.length > 0
      ? await db.select().from(lessons).where(and(...conditions))
      : await db.select().from(lessons);

    // Manually join the data
    const result = await Promise.all(
      lessonsData.map(async (lesson) => {
        const [subject] = lesson.subjectId 
          ? await db.select().from(subjects).where(eq(subjects.id, lesson.subjectId))
          : [null];
        const [group] = lesson.groupId
          ? await db.select().from(groups).where(eq(groups.id, lesson.groupId))
          : [null];
        const [audience] = lesson.audienceId
          ? await db.select().from(audiences).where(eq(audiences.id, lesson.audienceId))
          : [null];
        
        let teacher = null;
        if (lesson.teacherId) {
          const [teacherData] = await db.select().from(teachers).where(eq(teachers.id, lesson.teacherId));
          if (teacherData) {
            const [userData] = await db.select().from(users).where(eq(users.id, teacherData.userId));
            teacher = {
              ...teacherData,
              firstName: userData?.firstName,
              middleName: userData?.middleName,
              lastName: userData?.lastName,
            };
          }
        }

        return {
          ...lesson,
          subject,
          group,
          teacher,
          audience,
        };
      })
    );

    return result;
  }

  async deleteAllLessons(): Promise<void> {
    await db.delete(lessons);
  }

  // Schedule Generation Runs
  async createScheduleGenerationRun(run: InsertScheduleGenerationRun): Promise<ScheduleGenerationRun> {
    const result = await db.insert(scheduleGenerationRuns).values(run).returning();
    return result[0];
  }

  async getScheduleGenerationRunById(id: string): Promise<ScheduleGenerationRun | undefined> {
    const result = await db.select().from(scheduleGenerationRuns).where(eq(scheduleGenerationRuns.id, id)).limit(1);
    return result[0];
  }

  async getAllScheduleGenerationRuns(): Promise<ScheduleGenerationRun[]> {
    return db.select().from(scheduleGenerationRuns);
  }
}

export const storage = new DrizzleStorage();
