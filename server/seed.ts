import { db } from "./db";
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Начинается заполнение базы данных тестовыми данными...");

  try {
    // 1. Создать администратора
    console.log("Создание администратора...");
    const admin = await storage.createUser({
      role: "ADMIN",
      firstName: "Иван",
      lastName: "Иванов",
      middleName: "Иванович",
      login: "Иванов Иван Иванович",
      passwordHash: await hashPassword("admin123"),
      active: true,
    });
    console.log(`✓ Администратор создан: ${admin.login}`);

    // 2. Создать группы
    console.log("\nСоздание групп...");
    const group1 = await storage.createGroup({
      name: "БИО-21",
      year: 2021,
      course: 2,
      studentCount: 25,
    });
    const group2 = await storage.createGroup({
      name: "ИНФ-22",
      year: 2022,
      course: 1,
      studentCount: 28,
    });
    const group3 = await storage.createGroup({
      name: "МАТ-20",
      year: 2020,
      course: 3,
      studentCount: 22,
    });
    console.log(`✓ Создано групп: 3`);

    // 3. Создать преподавателей
    console.log("\nСоздание преподавателей...");
    const teachers = [];
    
    const teacher1User = await storage.createUser({
      role: "TEACHER",
      firstName: "Анна",
      lastName: "Петрова",
      middleName: "Сергеевна",
      login: "Петрова Анна Сергеевна",
      passwordHash: await hashPassword("teacher123"),
      active: true,
    });
    const teacher1 = await storage.createTeacher({ userId: teacher1User.id });
    teachers.push(teacher1);

    const teacher2User = await storage.createUser({
      role: "TEACHER",
      firstName: "Петр",
      lastName: "Сидоров",
      middleName: "Иванович",
      login: "Сидоров Петр Иванович",
      passwordHash: await hashPassword("teacher123"),
      active: true,
    });
    const teacher2 = await storage.createTeacher({ userId: teacher2User.id });
    teachers.push(teacher2);

    const teacher3User = await storage.createUser({
      role: "TEACHER",
      firstName: "Владимир",
      lastName: "Козлов",
      middleName: "Васильевич",
      login: "Козлов Владимир Васильевич",
      passwordHash: await hashPassword("teacher123"),
      active: true,
    });
    const teacher3 = await storage.createTeacher({ userId: teacher3User.id });
    teachers.push(teacher3);

    const teacher4User = await storage.createUser({
      role: "TEACHER",
      firstName: "Мария",
      lastName: "Смирнова",
      middleName: "Дмитриевна",
      login: "Смирнова Мария Дмитриевна",
      passwordHash: await hashPassword("teacher123"),
      active: true,
    });
    const teacher4 = await storage.createTeacher({ userId: teacher4User.id });
    teachers.push(teacher4);

    console.log(`✓ Создано преподавателей: ${teachers.length}`);

    // 4. Создать студентов
    console.log("\nСоздание студентов...");
    const students = [];

    for (let i = 1; i <= 3; i++) {
      const studentUser = await storage.createUser({
        role: "STUDENT",
        firstName: `Студент${i}`,
        lastName: `Тестовый`,
        middleName: "Петрович",
        login: `Тестовый Студент${i} Петрович`,
        passwordHash: await hashPassword("student123"),
        active: true,
      });
      const student = await storage.createStudent({
        userId: studentUser.id,
        groupId: group1.id,
      });
      students.push(student);
    }

    console.log(`✓ Создано студентов: ${students.length}`);

    // 5. Создать предметы
    console.log("\nСоздание предметов...");
    const subject1 = await storage.createSubject({
      name: "Математический анализ",
      shortName: "МА",
      defaultDurationMinutes: 85,
    });
    const subject2 = await storage.createSubject({
      name: "Программирование",
      shortName: "ПРОГ",
      defaultDurationMinutes: 85,
    });
    const subject3 = await storage.createSubject({
      name: "Базы данных",
      shortName: "БД",
      defaultDurationMinutes: 85,
    });
    const subject4 = await storage.createSubject({
      name: "Английский язык",
      shortName: "АНГ",
      defaultDurationMinutes: 85,
    });
    const subject5 = await storage.createSubject({
      name: "Физика",
      shortName: "ФИЗ",
      defaultDurationMinutes: 85,
    });
    console.log(`✓ Создано предметов: 5`);

    // 6. Создать аудитории
    console.log("\nСоздание аудиторий...");
    const audience1 = await storage.createAudience({
      name: "Аудитория 205",
      capacity: 50,
      resources: { проектор: "да", доска: "да" },
    });
    const audience2 = await storage.createAudience({
      name: "Компьютерный класс 301",
      capacity: 25,
      resources: { компьютеры: 25, проектор: "да" },
    });
    const audience3 = await storage.createAudience({
      name: "Аудитория 112",
      capacity: 30,
      resources: { проектор: "да", доска: "да" },
    });
    const audience4 = await storage.createAudience({
      name: "Аудитория 108",
      capacity: 40,
      resources: { лабораторное_оборудование: "да" },
    });
    console.log(`✓ Создано аудиторий: 4`);

    // 7. Создать шаблоны занятий
    console.log("\nСоздание шаблонов занятий...");
    const templates = [];

    // Математика для БИО-21 (3 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject1.id,
      groupId: group1.id,
      teacherId: teachers[0].id,
      weeklyFrequency: 3,
      preferredDays: [],
      preferredTimes: [],
    }));

    // Программирование для БИО-21 (2 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject2.id,
      groupId: group1.id,
      teacherId: teachers[1].id,
      weeklyFrequency: 2,
      preferredDays: [],
      preferredTimes: [],
    }));

    // Базы данных для БИО-21 (2 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject3.id,
      groupId: group1.id,
      teacherId: teachers[2].id,
      weeklyFrequency: 2,
      preferredDays: [],
      preferredTimes: [],
    }));

    // Английский язык для БИО-21 (2 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject4.id,
      groupId: group1.id,
      teacherId: teachers[3].id,
      weeklyFrequency: 2,
      preferredDays: [],
      preferredTimes: [],
    }));

    // Физика для БИО-21 (2 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject5.id,
      groupId: group1.id,
      teacherId: teachers[0].id,
      weeklyFrequency: 2,
      preferredDays: [],
      preferredTimes: [],
    }));

    // Математика для ИНФ-22 (2 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject1.id,
      groupId: group2.id,
      teacherId: teachers[0].id,
      weeklyFrequency: 2,
      preferredDays: [],
      preferredTimes: [],
    }));

    // Программирование для ИНФ-22 (3 пары в неделю)
    templates.push(await storage.createLessonTemplate({
      subjectId: subject2.id,
      groupId: group2.id,
      teacherId: teachers[1].id,
      weeklyFrequency: 3,
      preferredDays: [],
      preferredTimes: [],
    }));

    console.log(`✓ Создано шаблонов занятий: ${templates.length}`);

    console.log("\n✅ База данных успешно заполнена тестовыми данными!");
    console.log("\n📋 Данные для входа:");
    console.log("Администратор:");
    console.log("  Логин: Иванов Иван Иванович");
    console.log("  Пароль: admin123");
    console.log("\nПреподаватель:");
    console.log("  Логин: Петрова Анна Сергеевна");
    console.log("  Пароль: teacher123");
    console.log("\nСтудент:");
    console.log("  Логин: Тестовый Студент1 Петрович");
    console.log("  Пароль: student123");

  } catch (error) {
    console.error("❌ Ошибка при заполнении базы данных:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\nГотово! Закрываем соединение...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Критическая ошибка:", error);
    process.exit(1);
  });
