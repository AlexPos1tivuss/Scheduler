import LessonCard from "../LessonCard";

export default function LessonCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-background">
      <LessonCard
        subject="Математический анализ"
        teacher="Петрова Анна Сергеевна"
        room="Ауд. 205"
        group="БИО-21"
        startTime="09:00"
        endTime="10:25"
      />
      <LessonCard
        subject="Программирование"
        teacher="Сидоров Петр Иванович"
        room="Компьютерный класс 301"
        group="БИО-21"
        startTime="10:35"
        endTime="12:00"
      />
      <LessonCard
        subject="Иностранный язык"
        teacher="Иванова Мария Дмитриевна"
        room="Ауд. 112"
        group="БИО-21"
        startTime="12:20"
        endTime="13:45"
      />
    </div>
  );
}
