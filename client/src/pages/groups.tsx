import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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
import { insertGroupSchema, type Group, type User } from "@shared/schema";
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

export default function GroupsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/students"],
  });

  const createForm = useForm({
    resolver: zodResolver(insertGroupSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      course: 1,
      studentCount: 0,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertGroupSchema),
    defaultValues: {
      name: "",
      year: new Date().getFullYear(),
      course: 1,
      studentCount: 0,
    },
  });

  const [selectedStudentId, setSelectedStudentId] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertGroupSchema>) => {
      const res = await apiRequest("/api/groups", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({ title: "Группа создана" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest(`/api/groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsEditOpen(false);
      setSelectedGroup(null);
      toast({ title: "Группа обновлена" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/groups/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsDeleteOpen(false);
      setSelectedGroup(null);
      toast({ title: "Группа удалена" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const assignStudentMutation = useMutation({
    mutationFn: async ({ studentId, groupId }: { studentId: string; groupId: string }) => {
      const student = students.find((s: any) => s.userId === studentId);
      if (!student) throw new Error("Student not found");
      
      const res = await apiRequest(`/api/students/${student.id}`, {
        method: "PUT",
        body: JSON.stringify({ groupId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsAssignOpen(false);
      setSelectedStudentId("");
      toast({ title: "Студент добавлен в группу" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    editForm.reset({
      name: group.name,
      year: group.year,
      course: group.course,
      studentCount: group.studentCount,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  const handleAssignStudent = (group: Group) => {
    setSelectedGroup(group);
    setIsAssignOpen(true);
  };

  const getGroupStudents = (groupId: string) => {
    return students.filter((s: any) => s.groupId === groupId);
  };

  const studentUsers = users.filter((u) => u.role === "STUDENT");
  const unassignedStudents = studentUsers.filter(
    (u) => !students.find((s: any) => s.userId === u.id)
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Управление группами
          </h1>
          <p className="text-muted-foreground">
            Создание групп и распределение студентов
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-create-group"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать группу
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Список групп</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Год</TableHead>
                  <TableHead>Курс</TableHead>
                  <TableHead>Студентов</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  const groupStudents = getGroupStudents(group.id);
                  return (
                    <TableRow key={group.id} data-testid={`row-group-${group.id}`}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.year}</TableCell>
                      <TableCell>{group.course}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{groupStudents.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAssignStudent(group)}
                          data-testid={`button-assign-${group.id}`}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(group)}
                          data-testid={`button-edit-${group.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(group)}
                          data-testid={`button-delete-${group.id}`}
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
        <DialogContent data-testid="dialog-create-group">
          <DialogHeader>
            <DialogTitle>Создать группу</DialogTitle>
            <DialogDescription>
              Добавьте новую учебную группу
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
                    <FormLabel>Название группы</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="БИО-21" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Курс</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-course"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
        <DialogContent data-testid="dialog-edit-group">
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
            <DialogDescription>
              Изменить данные группы
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                updateMutation.mutate({ id: selectedGroup!.id, data })
              )}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название группы</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-year-edit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Курс</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-course-edit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
        <DialogContent data-testid="dialog-delete-group">
          <DialogHeader>
            <DialogTitle>Удалить группу</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить группу{" "}
              <strong>{selectedGroup?.name}</strong>? Это действие нельзя отменить.
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
              onClick={() => deleteMutation.mutate(selectedGroup!.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Student Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent data-testid="dialog-assign-student">
          <DialogHeader>
            <DialogTitle>Добавить студента в группу</DialogTitle>
            <DialogDescription>
              Группа: <strong>{selectedGroup?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Выберите студента</label>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger data-testid="select-student">
                  <SelectValue placeholder="Выберите студента" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedStudents.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.lastName} {user.firstName} {user.middleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {getGroupStudents(selectedGroup?.id || "").length > 0 && (
              <div>
                <label className="text-sm font-medium">Студенты в группе:</label>
                <div className="mt-2 space-y-1">
                  {getGroupStudents(selectedGroup?.id || "").map((student: any) => {
                    const user = users.find((u) => u.id === student.userId);
                    return (
                      <div key={student.id} className="text-sm text-muted-foreground">
                        • {user?.lastName} {user?.firstName}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignOpen(false);
                setSelectedStudentId("");
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={() =>
                assignStudentMutation.mutate({
                  studentId: selectedStudentId,
                  groupId: selectedGroup!.id,
                })
              }
              disabled={!selectedStudentId || assignStudentMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignStudentMutation.isPending ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
