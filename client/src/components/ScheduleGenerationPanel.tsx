import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleGenerationPanel() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");

  const handleGenerate = () => {
    setIsGenerating(true);
    setStatus("generating");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setStatus("success");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  //todo: remove mock functionality
  const mockResults = {
    totalLessons: 168,
    placedLessons: 168,
    conflicts: 0,
    duration: "2.4",
  };

  return (
    <div className="space-y-6">
      <Card data-testid="card-generation-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Генерация расписания
          </CardTitle>
          <CardDescription>Автоматическое составление учебного расписания с учетом всех ограничений</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Рабочие дни
              </Label>
              <div className="flex flex-wrap gap-2">
                {["Пн", "Вт", "Ср", "Чт", "Пт"].map((day) => (
                  <Badge key={day} variant="outline" className="bg-primary/10 text-primary">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Рабочие часы
              </Label>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">08:00</Badge>
                <span className="text-muted-foreground">—</span>
                <Badge variant="outline">20:00</Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 text-base"
              data-testid="button-generate-schedule"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Генерация расписания...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Сгенерировать расписание
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {(isGenerating || status === "success") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card data-testid="card-generation-progress">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isGenerating ? "Процесс генерации" : "Результаты генерации"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Прогресс</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" data-testid="progress-generation" />
                    <p className="text-sm text-muted-foreground">
                      Размещение занятий с учетом ограничений...
                    </p>
                  </div>
                )}

                {status === "success" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Расписание успешно сгенерировано!</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-primary">{mockResults.placedLessons}/{mockResults.totalLessons}</div>
                        <div className="text-sm text-muted-foreground">Размещено пар</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-green-600">{mockResults.conflicts}</div>
                        <div className="text-sm text-muted-foreground">Конфликтов</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-gold-foreground">{mockResults.duration}с</div>
                        <div className="text-sm text-muted-foreground">Время генерации</div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-sm text-muted-foreground">Успешность</div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" data-testid="button-view-schedule">
                      <Calendar className="w-4 h-4 mr-2" />
                      Просмотреть расписание
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
