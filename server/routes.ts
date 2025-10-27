import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  setAuthCookie, 
  clearAuthCookie,
  requireAuth,
  requireAdmin,
  type AuthRequest
} from "./auth";
import { 
  insertUserSchema,
  createUserSchema,
  insertGroupSchema, 
  insertSubjectSchema, 
  insertAudienceSchema,
  insertLessonTemplateSchema,
  insertLessonSchema,
  insertStudentSchema
} from "@shared/schema";
import { generateSchedule } from "./schedule-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= AUTH ROUTES =============
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        return res.status(400).json({ error: "Логин и пароль обязательны" });
      }

      const user = await storage.getUserByLogin(login);
      if (!user) {
        return res.status(401).json({ error: "Неверный логин или пароль" });
      }

      if (!user.active) {
        return res.status(401).json({ error: "Учетная запись деактивирована" });
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Неверный логин или пароль" });
      }

      const token = generateToken(user);
      setAuthCookie(res, token);

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Ошибка при входе в систему" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", requireAuth as any, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Ошибка при получении данных пользователя" });
    }
  });

  // ============= USER MANAGEMENT ROUTES (Admin only) =============
  
  // Get all users
  app.get("/api/users", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Ошибка при получении пользователей" });
    }
  });

  // Create user
  app.post("/api/users", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { password, ...userData } = validation.data;

      const existingUser = await storage.getUserByLogin(userData.login);
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь с таким логином уже существует" });
      }

      const passwordHash = await hashPassword(password);
      const newUser = await storage.createUser({
        ...userData,
        passwordHash,
      });

      // Create teacher or student record based on role
      if (newUser.role === "TEACHER") {
        await storage.createTeacher({ userId: newUser.id });
      } else if (newUser.role === "STUDENT" && req.body.groupId) {
        await storage.createStudent({ userId: newUser.id, groupId: req.body.groupId });
      }

      const { passwordHash: _, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
  });

  // Update user
  app.put("/api/users/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { password, ...userData } = req.body;

      const updateData: any = { ...userData };
      if (password) {
        updateData.passwordHash = await hashPassword(password);
      }

      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const { passwordHash, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Ошибка при обновлении пользователя" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Ошибка при удалении пользователя" });
    }
  });

  // ============= GROUPS ROUTES =============
  
  app.get("/api/groups", requireAuth as any, async (req, res) => {
    try {
      const groups = await storage.getAllGroups();
      res.json(groups);
    } catch (error: any) {
      console.error("Get groups error:", error);
      res.status(500).json({ error: "Ошибка при получении групп" });
    }
  });

  app.post("/api/groups", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const validation = insertGroupSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const newGroup = await storage.createGroup(validation.data);
      res.json(newGroup);
    } catch (error: any) {
      console.error("Create group error:", error);
      res.status(500).json({ error: "Ошибка при создании группы" });
    }
  });

  app.put("/api/groups/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedGroup = await storage.updateGroup(id, req.body);
      
      if (!updatedGroup) {
        return res.status(404).json({ error: "Группа не найдена" });
      }

      res.json(updatedGroup);
    } catch (error: any) {
      console.error("Update group error:", error);
      res.status(500).json({ error: "Ошибка при обновлении группы" });
    }
  });

  app.delete("/api/groups/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteGroup(id);
      
      if (!success) {
        return res.status(404).json({ error: "Группа не найдена" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete group error:", error);
      res.status(500).json({ error: "Ошибка при удалении группы" });
    }
  });

  // ============= SUBJECTS ROUTES =============
  
  app.get("/api/subjects", requireAuth as any, async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error: any) {
      console.error("Get subjects error:", error);
      res.status(500).json({ error: "Ошибка при получении предметов" });
    }
  });

  app.post("/api/subjects", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const validation = insertSubjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const newSubject = await storage.createSubject(validation.data);
      res.json(newSubject);
    } catch (error: any) {
      console.error("Create subject error:", error);
      res.status(500).json({ error: "Ошибка при создании предмета" });
    }
  });

  app.put("/api/subjects/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSubject = await storage.updateSubject(id, req.body);
      
      if (!updatedSubject) {
        return res.status(404).json({ error: "Предмет не найден" });
      }

      res.json(updatedSubject);
    } catch (error: any) {
      console.error("Update subject error:", error);
      res.status(500).json({ error: "Ошибка при обновлении предмета" });
    }
  });

  app.delete("/api/subjects/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSubject(id);
      
      if (!success) {
        return res.status(404).json({ error: "Предмет не найден" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete subject error:", error);
      res.status(500).json({ error: "Ошибка при удалении предмета" });
    }
  });

  // ============= AUDIENCES ROUTES =============
  
  app.get("/api/audiences", requireAuth as any, async (req, res) => {
    try {
      const audiences = await storage.getAllAudiences();
      res.json(audiences);
    } catch (error: any) {
      console.error("Get audiences error:", error);
      res.status(500).json({ error: "Ошибка при получении аудиторий" });
    }
  });

  app.post("/api/audiences", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const validation = insertAudienceSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const newAudience = await storage.createAudience(validation.data);
      res.json(newAudience);
    } catch (error: any) {
      console.error("Create audience error:", error);
      res.status(500).json({ error: "Ошибка при создании аудитории" });
    }
  });

  app.put("/api/audiences/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedAudience = await storage.updateAudience(id, req.body);
      
      if (!updatedAudience) {
        return res.status(404).json({ error: "Аудитория не найдена" });
      }

      res.json(updatedAudience);
    } catch (error: any) {
      console.error("Update audience error:", error);
      res.status(500).json({ error: "Ошибка при обновлении аудитории" });
    }
  });

  app.delete("/api/audiences/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAudience(id);
      
      if (!success) {
        return res.status(404).json({ error: "Аудитория не найдена" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete audience error:", error);
      res.status(500).json({ error: "Ошибка при удалении аудитории" });
    }
  });

  // ============= LESSON TEMPLATES ROUTES =============
  
  app.get("/api/lesson-templates", requireAuth as any, async (req, res) => {
    try {
      const templates = await storage.getAllLessonTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Get lesson templates error:", error);
      res.status(500).json({ error: "Ошибка при получении шаблонов занятий" });
    }
  });

  app.post("/api/lesson-templates", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const validation = insertLessonTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const newTemplate = await storage.createLessonTemplate(validation.data);
      res.json(newTemplate);
    } catch (error: any) {
      console.error("Create lesson template error:", error);
      res.status(500).json({ error: "Ошибка при создании шаблона занятия" });
    }
  });

  app.put("/api/lesson-templates/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedTemplate = await storage.updateLessonTemplate(id, req.body);
      
      if (!updatedTemplate) {
        return res.status(404).json({ error: "Шаблон занятия не найден" });
      }

      res.json(updatedTemplate);
    } catch (error: any) {
      console.error("Update lesson template error:", error);
      res.status(500).json({ error: "Ошибка при обновлении шаблона занятия" });
    }
  });

  app.delete("/api/lesson-templates/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteLessonTemplate(id);
      
      if (!success) {
        return res.status(404).json({ error: "Шаблон занятия не найден" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete lesson template error:", error);
      res.status(500).json({ error: "Ошибка при удалении шаблона занятия" });
    }
  });

  // ============= SCHEDULE ROUTES =============
  
  // Get schedule with filters
  app.get("/api/schedule", requireAuth as any, async (req, res) => {
    try {
      const { groupId, teacherId, startDate, endDate } = req.query;

      const filters: any = {};
      if (groupId) filters.groupId = groupId as string;
      if (teacherId) filters.teacherId = teacherId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const lessons = await storage.getLessonsByFilters(filters);
      res.json(lessons);
    } catch (error: any) {
      console.error("Get schedule error:", error);
      res.status(500).json({ error: "Ошибка при получении расписания" });
    }
  });

  // Generate schedule
  app.post("/api/schedule/generate", requireAuth as any, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const result = await generateSchedule(req.user!.id);
      res.json(result);
    } catch (error: any) {
      console.error("Generate schedule error:", error);
      res.status(500).json({ error: "Ошибка при генерации расписания" });
    }
  });

  // Get generation run details
  app.get("/api/schedule/run/:runId", requireAuth as any, async (req, res) => {
    try {
      const { runId } = req.params;
      const run = await storage.getScheduleGenerationRunById(runId);
      
      if (!run) {
        return res.status(404).json({ error: "Запуск генерации не найден" });
      }

      res.json(run);
    } catch (error: any) {
      console.error("Get generation run error:", error);
      res.status(500).json({ error: "Ошибка при получении деталей генерации" });
    }
  });

  // Get all generation runs
  app.get("/api/schedule/runs", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const runs = await storage.getAllScheduleGenerationRuns();
      res.json(runs);
    } catch (error: any) {
      console.error("Get generation runs error:", error);
      res.status(500).json({ error: "Ошибка при получении истории генерации" });
    }
  });

  // ============= LESSONS ROUTES (CRUD) =============
  
  app.post("/api/lessons", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertLessonSchema.parse(req.body);
      const newLesson = await storage.createLesson(validatedData);
      res.json(newLesson);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Неверные данные", details: error.errors });
      }
      console.error("Create lesson error:", error);
      res.status(500).json({ error: "Ошибка при создании занятия" });
    }
  });

  app.put("/api/lessons/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLessonSchema.partial().parse(req.body);
      const updatedLesson = await storage.updateLesson(id, validatedData);
      
      if (!updatedLesson) {
        return res.status(404).json({ error: "Занятие не найдено" });
      }

      res.json(updatedLesson);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Неверные данные", details: error.errors });
      }
      console.error("Update lesson error:", error);
      res.status(500).json({ error: "Ошибка при обновлении занятия" });
    }
  });

  app.delete("/api/lessons/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteLesson(id);
      
      if (!success) {
        return res.status(404).json({ error: "Занятие не найдено" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete lesson error:", error);
      res.status(500).json({ error: "Ошибка при удалении занятия" });
    }
  });

  // ============= TEACHERS ROUTES =============
  
  app.get("/api/teachers", requireAuth as any, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error: any) {
      console.error("Get teachers error:", error);
      res.status(500).json({ error: "Ошибка при получении преподавателей" });
    }
  });

  // ============= STUDENTS ROUTES =============
  
  app.get("/api/students", requireAuth as any, async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error: any) {
      console.error("Get students error:", error);
      res.status(500).json({ error: "Ошибка при получении студентов" });
    }
  });

  app.put("/api/students/:id", requireAuth as any, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const updatedStudent = await storage.updateStudent(id, validatedData);
      
      if (!updatedStudent) {
        return res.status(404).json({ error: "Студент не найден" });
      }

      res.json(updatedStudent);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Неверные данные", details: error.errors });
      }
      console.error("Update student error:", error);
      res.status(500).json({ error: "Ошибка при обновлении студента" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
