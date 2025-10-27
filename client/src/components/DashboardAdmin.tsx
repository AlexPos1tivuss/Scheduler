import { motion } from "framer-motion";
import StatsCard from "./StatsCard";
import { Users, Calendar, BookOpen, DoorOpen, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LessonCard from "./LessonCard";

export default function DashboardAdmin() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Панель администратора</h1>
        <p className="text-muted-foreground">Управление системой расписания МИТСО</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Всего пользователей" value={245} icon={Users} color="primary" trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Занятий в неделю" value={168} icon={Calendar} color="gold" />
        <StatsCard title="Предметов" value={42} icon={BookOpen} color="success" />
        <StatsCard title="Аудиторий" value={28} icon={DoorOpen} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-generation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Генерация расписания
            </CardTitle>
            <CardDescription>Автоматическое составление учебного расписания</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Последняя генерация:</span>
                <span className="font-medium">2 часа назад</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Конфликтов:</span>
                <span className="font-medium text-green-600">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Размещено пар:</span>
                <span className="font-medium">168 из 168</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => window.location.href = "/schedule"} data-testid="button-generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Перейти к расписанию
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-activity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Активность системы
            </CardTitle>
            <CardDescription>Последние изменения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Добавлен новый преподаватель</p>
                  <p className="text-muted-foreground text-xs">15 минут назад</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-gold rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Обновлено расписание группы БИО-21</p>
                  <p className="text-muted-foreground text-xs">1 час назад</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="font-medium">Создана новая аудитория</p>
                  <p className="text-muted-foreground text-xs">2 часа назад</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-upcoming">
        <CardHeader>
          <CardTitle>Ближайшие занятия</CardTitle>
          <CardDescription>Расписание на сегодня</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              room="Комп. 301"
              group="ИНФ-22"
              startTime="10:35"
              endTime="12:00"
            />
            <LessonCard
              subject="Базы данных"
              teacher="Козлов Владимир Васильевич"
              room="Комп. 302"
              group="ИНФ-21"
              startTime="12:20"
              endTime="13:45"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
