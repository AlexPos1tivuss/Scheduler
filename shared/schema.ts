import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "TEACHER", "STUDENT"]);
export const generationStatusEnum = pgEnum("generation_status", ["PENDING", "RUNNING", "SUCCESS", "FAILED"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: roleEnum("role").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name").notNull(),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  middleName: z.string().min(1, "Отчество обязательно"),
  login: z.string().min(1, "Логин обязателен"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createUserSchema = insertUserSchema.omit({ passwordHash: true }).extend({
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type User = typeof users.$inferSelect;

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

// Groups table
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  year: integer("year").notNull(),
  course: integer("course").notNull(),
  studentCount: integer("student_count").notNull().default(0),
});

export const insertGroupSchema = createInsertSchema(groups, {
  name: z.string().min(1, "Название группы обязательно"),
  year: z.number().int().min(2000).max(2100),
  course: z.number().int().min(1).max(6),
}).omit({ id: true });

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
});

export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Subjects table
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  shortName: text("short_name").notNull(),
  defaultDurationMinutes: integer("default_duration_minutes").notNull().default(85),
});

export const insertSubjectSchema = createInsertSchema(subjects, {
  name: z.string().min(1, "Название предмета обязательно"),
  shortName: z.string().min(1, "Краткое название обязательно"),
}).omit({ id: true });

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Audiences table
export const audiences = pgTable("audiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  capacity: integer("capacity").notNull(),
  resources: jsonb("resources").notNull().default({}),
});

export const insertAudienceSchema = createInsertSchema(audiences, {
  name: z.string().min(1, "Название аудитории обязательно"),
  capacity: z.number().int().min(1, "Вместимость должна быть больше 0"),
}).omit({ id: true });

export type InsertAudience = z.infer<typeof insertAudienceSchema>;
export type Audience = typeof audiences.$inferSelect;

// Lesson Templates table
export const lessonTemplates = pgTable("lesson_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  weeklyFrequency: integer("weekly_frequency").notNull().default(1),
  preferredDays: jsonb("preferred_days").notNull().default([]),
  preferredTimes: jsonb("preferred_times").notNull().default([]),
});

export const insertLessonTemplateSchema = createInsertSchema(lessonTemplates, {
  weeklyFrequency: z.number().int().min(1).max(10),
}).omit({ id: true });

export type InsertLessonTemplate = z.infer<typeof insertLessonTemplateSchema>;
export type LessonTemplate = typeof lessonTemplates.$inferSelect;

// Lessons table (actual schedule entries)
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  audienceId: varchar("audience_id").notNull().references(() => audiences.id, { onDelete: "cascade" }),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Schedule Generation Runs table
export const scheduleGenerationRuns = pgTable("schedule_generation_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: generationStatusEnum("status").notNull().default("PENDING"),
  summary: jsonb("summary").notNull().default({}),
  conflictCount: integer("conflict_count").notNull().default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScheduleGenerationRunSchema = createInsertSchema(scheduleGenerationRuns).omit({
  id: true,
  createdAt: true,
});

export type InsertScheduleGenerationRun = z.infer<typeof insertScheduleGenerationRunSchema>;
export type ScheduleGenerationRun = typeof scheduleGenerationRuns.$inferSelect;
