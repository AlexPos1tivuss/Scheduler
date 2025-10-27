import EntityGrid from "../EntityGrid";

interface Entity {
  id: string;
  name: string;
  details?: string;
  metadata?: Record<string, string | number>;
}

export default function EntityGridExample() {
  //todo: remove mock functionality
  const mockGroups: Entity[] = [
    { id: "1", name: "БИО-21", details: "Биоинформатика", metadata: { Курс: "2", Студентов: 25 } },
    { id: "2", name: "ИНФ-22", details: "Информатика", metadata: { Курс: "1", Студентов: 28 } },
    { id: "3", name: "МАТ-20", details: "Математика", metadata: { Курс: "3", Студентов: 22 } },
    { id: "4", name: "ФИЗ-21", details: "Физика", metadata: { Курс: "2", Студентов: 24 } },
  ];

  const mockSubjects: Entity[] = [
    { id: "1", name: "Математический анализ", details: "МА", metadata: { Длительность: "85 мин" } },
    { id: "2", name: "Программирование", details: "ПРОГ", metadata: { Длительность: "85 мин" } },
    { id: "3", name: "Базы данных", details: "БД", metadata: { Длительность: "85 мин" } },
  ];

  const mockAudiences: Entity[] = [
    { id: "1", name: "Аудитория 205", details: "Лекционная", metadata: { Вместимость: 50, Тип: "Лекционная" } },
    { id: "2", name: "Компьютерный класс 301", details: "Практическая", metadata: { Вместимость: 25, Компьютеров: 25 } },
    { id: "3", name: "Аудитория 112", details: "Семинарская", metadata: { Вместимость: 30, Тип: "Семинарская" } },
  ];

  return (
    <div className="p-6 bg-background space-y-8">
      <EntityGrid
        title="Группы"
        description="Управление учебными группами"
        entities={mockGroups}
        onAdd={() => console.log("Add group")}
        onEdit={(id) => console.log("Edit group", id)}
        onDelete={(id) => console.log("Delete group", id)}
      />
      <EntityGrid
        title="Предметы"
        description="Управление учебными предметами"
        entities={mockSubjects}
        onAdd={() => console.log("Add subject")}
        onEdit={(id) => console.log("Edit subject", id)}
        onDelete={(id) => console.log("Delete subject", id)}
      />
      <EntityGrid
        title="Аудитории"
        description="Управление учебными аудиториями"
        entities={mockAudiences}
        onAdd={() => console.log("Add audience")}
        onEdit={(id) => console.log("Edit audience", id)}
        onDelete={(id) => console.log("Delete audience", id)}
      />
    </div>
  );
}
