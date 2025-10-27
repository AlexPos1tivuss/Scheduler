import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubjectSchema, type Subject, type User } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubjectsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["/api/lesson-templates"],
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [weeklyFrequency, setWeeklyFrequency] = useState(2);

  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups"],
  });

  const createForm = useForm({
    resolver: zodResolver(insertSubjectSchema),
    defaultValues: {
      name: "",
      shortName: "",
      defaultDurationMinutes: 85,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertSubjectSchema),
    defaultValues: {
      name: "",
      shortName: "",
      defaultDurationMinutes: 85,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSubjectSchema>) => {
      const res = await apiRequest("/api/subjects", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({ title: "Предмет создан" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest(`/api/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsEditOpen(false);
      setSelectedSubject(null);
      toast({ title: "Предмет обновлен" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/subjects/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsDeleteOpen(false);
      setSelectedSubject(null);
      toast({ title: "Предмет удален" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const assignTeacherMutation = useMutation({
    mutationFn: async ({
      subjectId,
      teacherId,
      groupId,
      weeklyFrequency,
    }: {
      subjectId: string;
      teacherId: string;
      groupId: string;
      weeklyFrequency: number;
    }) => {
      const teacher = users.find((u) => u.id === teacherId && u.role === "TEACHER");
      if (!teacher) throw new Error("Teacher not found");

      const res = await apiRequest("/api/lesson-templates", {
        method: "POST",
        body: JSON.stringify({
          subjectId,
          teacherId,
          groupId,
          weeklyFrequency,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lesson-templates"] });
      setIsAssignOpen(false);
      setSelectedTeacherId("");
      setSelectedGroupId("");
      setWeeklyFrequency(2);
      toast({ title: "Преподаватель назначен на предмет" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    editForm.reset({
      name: subject.name,
      shortName: subject.shortName,
      defaultDurationMinutes: subject.defaultDurationMinutes,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  const handleAssignTeacher = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsAssignOpen(true);
  };

  const getSubjectTemplates = (subjectId: string) => {
    return templates.filter((t: any) => t.subjectId === subjectId);
  };

  const teachers = users.filter((u) => u.role === "TEACHER");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Управление предметами
          </h1>
          <p className="text-muted-foreground">
            Добавление предметов и распределение по преподавателям
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-create-subject"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить предмет
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Список предметов</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Сокращение</TableHead>
                  <TableHead>Длительность (мин)</TableHead>
                  <TableHead>Назначений</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => {
                  const subjectTemplates = getSubjectTemplates(subject.id);
                  return (
                    <TableRow key={subject.id} data-testid={`row-subject-${subject.id}`}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.shortName}</TableCell>
                      <TableCell>{subject.defaultDurationMinutes}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subjectTemplates.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAssignTeacher(subject)}
                          data-testid={`button-assign-${subject.id}`}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(subject)}
                          data-testid={`button-edit-${subject.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subject)}
                          data-testid={`button-delete-${subject.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent data-testid="dialog-create-subject">
          <DialogHeader>
            <DialogTitle>Добавить предмет</DialogTitle>
            <DialogDescription>
              Создайте новый учебный предмет
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((data) =>
                createMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название предмета</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Математический анализ" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сокращение</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Мат. анализ" data-testid="input-shortname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="defaultDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длительность (минуты)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent data-testid="dialog-edit-subject">
          <DialogHeader>
            <DialogTitle>Редактировать предмет</DialogTitle>
            <DialogDescription>
              Изменить данные предмета
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                updateMutation.mutate({ id: selectedSubject!.id, data })
              )}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название предмета</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сокращение</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-shortname-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="defaultDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длительность (минуты)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-duration-edit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent data-testid="dialog-delete-subject">
          <DialogHeader>
            <DialogTitle>Удалить предмет</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить предмет{" "}
              <strong>{selectedSubject?.name}</strong>? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(selectedSubject!.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent data-testid="dialog-assign-teacher">
          <DialogHeader>
            <DialogTitle>Назначить преподавателя</DialogTitle>
            <DialogDescription>
              Предмет: <strong>{selectedSubject?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Выберите преподавателя</label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger data-testid="select-teacher">
                  <SelectValue placeholder="Выберите преподавателя" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.lastName} {user.firstName} {user.middleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Выберите группу</label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
              >
                <SelectTrigger data-testid="select-group">
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group: any) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Часов в неделю</label>
              <Input
                type="number"
                value={weeklyFrequency}
                onChange={(e) => setWeeklyFrequency(parseInt(e.target.value))}
                min={1}
                max={10}
                data-testid="input-weekly-frequency"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignOpen(false);
                setSelectedTeacherId("");
                setSelectedGroupId("");
                setWeeklyFrequency(2);
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={() =>
                assignTeacherMutation.mutate({
                  subjectId: selectedSubject!.id,
                  teacherId: selectedTeacherId,
                  groupId: selectedGroupId,
                  weeklyFrequency,
                })
              }
              disabled={
                !selectedTeacherId ||
                !selectedGroupId ||
                assignTeacherMutation.isPending
              }
              data-testid="button-confirm-assign"
            >
              {assignTeacherMutation.isPending ? "Назначение..." : "Назначить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
