import ScheduleGrid from "../ScheduleGrid";

export default function ScheduleGridExample() {
  const weekDays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
  const timeSlots = [
    { start: "09:00", end: "10:25" },
    { start: "10:35", end: "12:00" },
    { start: "12:20", end: "13:45" },
    { start: "14:00", end: "15:25" },
  ];

  const lessons = {
    "Понедельник": {
      0: { id: "1", subject: "Математика", teacher: "Петрова А.С.", room: "Ауд. 205", group: "БИО-21" },
      1: { id: "2", subject: "Программирование", teacher: "Сидоров П.И.", room: "Комп. 301", group: "БИО-21" },
      2: null,
      3: { id: "3", subject: "Физика", teacher: "Иванов И.И.", room: "Ауд. 108", group: "БИО-21" },
    },
    "Вторник": {
      0: { id: "4", subject: "Английский язык", teacher: "Смирнова М.Д.", room: "Ауд. 112", group: "БИО-21" },
      1: null,
      2: { id: "5", subject: "Математика", teacher: "Петрова А.С.", room: "Ауд. 205", group: "БИО-21" },
      3: null,
    },
    "Среда": {
      0: { id: "6", subject: "Программирование", teacher: "Сидоров П.И.", room: "Комп. 301", group: "БИО-21" },
      1: { id: "7", subject: "Базы данных", teacher: "Козлов В.В.", room: "Комп. 302", group: "БИО-21" },
      2: null,
      3: null,
    },
    "Четверг": {
      0: null,
      1: { id: "8", subject: "Английский язык", teacher: "Смирнова М.Д.", room: "Ауд. 112", group: "БИО-21" },
      2: { id: "9", subject: "Физика", teacher: "Иванов И.И.", room: "Ауд. 108", group: "БИО-21" },
      3: null,
    },
    "Пятница": {
      0: { id: "10", subject: "Базы данных", teacher: "Козлов В.В.", room: "Комп. 302", group: "БИО-21" },
      1: null,
      2: { id: "11", subject: "Математика", teacher: "Петрова А.С.", room: "Ауд. 205", group: "БИО-21" },
      3: null,
    },
  };

  return (
    <div className="p-6 bg-background">
      <ScheduleGrid weekDays={weekDays} timeSlots={timeSlots} lessons={lessons} />
    </div>
  );
}
