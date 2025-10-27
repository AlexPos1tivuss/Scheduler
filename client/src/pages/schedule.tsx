import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SchedulePage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["/api/schedule"],
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/schedule/generate", { 
        method: "POST",
        credentials: "include"
      });
      const result = await res.json();
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
        toast({
          title: "Расписание сгенерировано",
          description: `Размещено занятий: ${result.placedLessons}`,
        });
      } else {
        toast({
          title: "Ошибка генерации",
          description: result.error || "Не удалось сгенерировать расписание",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("ru-RU", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Расписание занятий
          </h1>
          <p className="text-muted-foreground">
            Просмотр, редактирование и генерация расписания
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          data-testid="button-generate-schedule"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? "Генерация..." : "Сгенерировать заново"}
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Список занятий</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Расписание пусто. Сгенерируйте расписание.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата и время</TableHead>
                  <TableHead>Предмет</TableHead>
                  <TableHead>Группа</TableHead>
                  <TableHead>Преподаватель</TableHead>
                  <TableHead>Аудитория</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson: any) => (
                  <TableRow key={lesson.id} data-testid={`row-lesson-${lesson.id}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDateTime(lesson.startAt)}</span>
                        <span className="text-xs text-muted-foreground">
                          до {formatDateTime(lesson.endAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{lesson.subject?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lesson.group?.name || "—"}</Badge>
                    </TableCell>
                    <TableCell>{lesson.teacher ? `${lesson.teacher.lastName} ${lesson.teacher.firstName[0]}.` : "—"}</TableCell>
                    <TableCell>{lesson.audience?.name || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
