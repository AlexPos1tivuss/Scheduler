import StatsCard from "../StatsCard";
import { Users, Calendar, BookOpen, DoorOpen } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-background">
      <StatsCard title="Всего пользователей" value={245} icon={Users} color="primary" trend={{ value: 12, isPositive: true }} />
      <StatsCard title="Занятий в неделю" value={168} icon={Calendar} color="gold" />
      <StatsCard title="Предметов" value={42} icon={BookOpen} color="success" />
      <StatsCard title="Аудиторий" value={28} icon={DoorOpen} color="warning" />
    </div>
  );
}
