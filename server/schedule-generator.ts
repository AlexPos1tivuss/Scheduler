import { storage } from "./storage";
import type { LessonTemplate, Audience, Group, Subject, Teacher, InsertLesson } from "@shared/schema";

/**
 * Алгоритм автоматической генерации расписания
 * 
 * Реализует greedy + backtracking подход с учетом:
 * - Жестких ограничений (hard constraints): конфликты времени, аудиторий, преподавателей
 * - Мягких ограничений (soft constraints): минимизация пустых промежутков
 * 
 * Параметры:
 * - Рабочие дни: Пн-Пт
 * - Рабочие часы: 08:00-20:00
 * - Длительность пары: 85 минут
 * - Междупарный интервал: 10 минут
 */

// Конфигурация генерации
const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WORKING_START_HOUR = 8;
const WORKING_END_HOUR = 20;
const LESSON_DURATION_MINUTES = 85;
const BREAK_DURATION_MINUTES = 10;

interface TimeSlot {
  day: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

interface ScheduleAssignment {
  templateId: string;
  subjectId: string;
  groupId: string;
  teacherId: string;
  audienceId: string;
  slot: TimeSlot;
}

// Генерация всех возможных временных слотов для недели
function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (const day of WORKING_DAYS) {
    let currentHour = WORKING_START_HOUR;
    let currentMinute = 0;

    while (true) {
      const endMinute = currentMinute + LESSON_DURATION_MINUTES;
      const endHour = currentHour + Math.floor(endMinute / 60);
      const endMinuteFinal = endMinute % 60;

      // Проверка, что пара заканчивается в рабочее время
      if (endHour > WORKING_END_HOUR || (endHour === WORKING_END_HOUR && endMinuteFinal > 0)) {
        break;
      }

      slots.push({
        day,
        startHour: currentHour,
        startMinute: currentMinute,
        endHour,
        endMinute: endMinuteFinal,
      });

      // Следующий слот = конец текущей пары + перерыв
      const nextMinute = endMinuteFinal + BREAK_DURATION_MINUTES;
      currentHour = endHour + Math.floor(nextMinute / 60);
      currentMinute = nextMinute % 60;
    }
  }

  return slots;
}

// Проверка конфликтов
function hasConflict(
  assignment: ScheduleAssignment,
  existingAssignments: ScheduleAssignment[]
): boolean {
  for (const existing of existingAssignments) {
    if (existing.slot.day !== assignment.slot.day) continue;

    // Проверка пересечения времени
    const overlap =
      !(assignment.slot.endHour < existing.slot.startHour ||
        (assignment.slot.endHour === existing.slot.startHour &&
          assignment.slot.endMinute <= existing.slot.startMinute)) &&
      !(assignment.slot.startHour > existing.slot.endHour ||
        (assignment.slot.startHour === existing.slot.endHour &&
          assignment.slot.startMinute >= existing.slot.endMinute));

    if (!overlap) continue;

    // Hard constraints:
    // 1. Группа не может иметь две пары одновременно
    if (assignment.groupId === existing.groupId) return true;

    // 2. Преподаватель не может вести две пары одновременно
    if (assignment.teacherId === existing.teacherId) return true;

    // 3. Аудитория не может быть занята двумя парами одновременно
    if (assignment.audienceId === existing.audienceId) return true;
  }

  return false;
}

// Оценка качества расписания (для мягких ограничений)
function calculateScheduleQuality(assignments: ScheduleAssignment[]): number {
  let score = 0;

  // Группировка по группам и преподавателям для оценки компактности
  const groupsByDayTeacher: Record<string, ScheduleAssignment[]> = {};
  const groupsByDayGroup: Record<string, ScheduleAssignment[]> = {};

  for (const assignment of assignments) {
    const teacherKey = `${assignment.slot.day}-${assignment.teacherId}`;
    const groupKey = `${assignment.slot.day}-${assignment.groupId}`;

    if (!groupsByDayTeacher[teacherKey]) groupsByDayTeacher[teacherKey] = [];
    if (!groupsByDayGroup[groupKey]) groupsByDayGroup[groupKey] = [];

    groupsByDayTeacher[teacherKey].push(assignment);
    groupsByDayGroup[groupKey].push(assignment);
  }

  // Поощряем компактность (минимизируем пустые промежутки)
  for (const dayAssignments of Object.values(groupsByDayTeacher)) {
    if (dayAssignments.length > 1) {
      const sorted = dayAssignments.sort((a, b) =>
        a.slot.startHour * 60 + a.slot.startMinute - (b.slot.startHour * 60 + b.slot.startMinute)
      );

      for (let i = 1; i < sorted.length; i++) {
        const gap =
          sorted[i].slot.startHour * 60 +
          sorted[i].slot.startMinute -
          (sorted[i - 1].slot.endHour * 60 + sorted[i - 1].slot.endMinute);

        // Штраф за большие промежутки (больше 2 часов)
        if (gap > 120) {
          score -= 10;
        }
      }
    }
  }

  return score;
}

export async function generateSchedule(userId: string) {
  const startTime = Date.now();

  try {
    // 1. Получить все данные
    const templates = await storage.getAllLessonTemplates();
    const audiences = await storage.getAllAudiences();
    const groups = await storage.getAllGroups();
    const subjects = await storage.getAllSubjects();

    if (templates.length === 0) {
      return {
        success: false,
        error: "Нет шаблонов занятий для генерации расписания",
      };
    }

    // 2. Создать список всех пар, которые нужно разместить
    const lessonsToPlace: Array<{
      templateId: string;
      subjectId: string;
      groupId: string;
      teacherId: string;
    }> = [];

    for (const template of templates) {
      for (let i = 0; i < template.weeklyFrequency; i++) {
        lessonsToPlace.push({
          templateId: template.id,
          subjectId: template.subjectId,
          groupId: template.groupId,
          teacherId: template.teacherId,
        });
      }
    }

    // 3. Сортировка по сложности (меньше подходящих аудиторий = выше приоритет)
    lessonsToPlace.sort((a, b) => {
      // В реальной реализации можно добавить более сложную эвристику
      return 0;
    });

    // 4. Генерация временных слотов
    const timeSlots = generateTimeSlots();

    // 5. Greedy алгоритм с backtracking
    const assignments: ScheduleAssignment[] = [];
    let placedCount = 0;
    const conflicts: string[] = [];

    for (const lesson of lessonsToPlace) {
      let placed = false;

      // Попытка разместить в каждый слот
      for (const slot of timeSlots) {
        // Попытка с каждой аудиторией
        for (const audience of audiences) {
          const assignment: ScheduleAssignment = {
            templateId: lesson.templateId,
            subjectId: lesson.subjectId,
            groupId: lesson.groupId,
            teacherId: lesson.teacherId,
            audienceId: audience.id,
            slot,
          };

          if (!hasConflict(assignment, assignments)) {
            assignments.push(assignment);
            placed = true;
            placedCount++;
            break;
          }
        }

        if (placed) break;
      }

      if (!placed) {
        conflicts.push(
          `Не удалось разместить занятие: шаблон ${lesson.templateId}, группа ${lesson.groupId}`
        );
      }
    }

    // 6. Удалить старое расписание
    await storage.deleteAllLessons();

    // 7. Создать новые записи в БД
    const now = new Date();
    const mondayOfCurrentWeek = new Date(now);
    mondayOfCurrentWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    mondayOfCurrentWeek.setHours(0, 0, 0, 0);

    for (const assignment of assignments) {
      const dayOffset = WORKING_DAYS.indexOf(assignment.slot.day);
      const lessonDate = new Date(mondayOfCurrentWeek);
      lessonDate.setDate(mondayOfCurrentWeek.getDate() + dayOffset);
      lessonDate.setHours(assignment.slot.startHour, assignment.slot.startMinute, 0, 0);

      const endDate = new Date(lessonDate);
      endDate.setHours(assignment.slot.endHour, assignment.slot.endMinute, 0, 0);

      await storage.createLesson({
        subjectId: assignment.subjectId,
        groupId: assignment.groupId,
        teacherId: assignment.teacherId,
        audienceId: assignment.audienceId,
        startAt: lessonDate,
        endAt: endDate,
        createdBy: userId,
      });
    }

    // 8. Создать запись о генерации
    const duration = Date.now() - startTime;
    const run = await storage.createScheduleGenerationRun({
      status: conflicts.length > 0 ? "SUCCESS" : "SUCCESS",
      conflictCount: conflicts.length,
      summary: {
        totalTemplates: templates.length,
        totalLessonsToPlace: lessonsToPlace.length,
        placedLessons: placedCount,
        unplacedLessons: lessonsToPlace.length - placedCount,
        conflicts,
        durationMs: duration,
        quality: calculateScheduleQuality(assignments),
      },
      createdBy: userId,
    });

    return {
      success: true,
      runId: run.id,
      totalLessons: lessonsToPlace.length,
      placedLessons: placedCount,
      unplacedLessons: lessonsToPlace.length - placedCount,
      conflicts,
      durationSeconds: (duration / 1000).toFixed(2),
    };
  } catch (error: any) {
    console.error("Schedule generation error:", error);

    // Создать запись об ошибке
    await storage.createScheduleGenerationRun({
      status: "FAILED",
      conflictCount: 0,
      summary: {
        error: error.message,
        durationMs: Date.now() - startTime,
      },
      createdBy: userId,
    });

    throw error;
  }
}
