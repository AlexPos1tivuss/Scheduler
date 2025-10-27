import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAudienceSchema, type Audience } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export default function AudiencesPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);

  const { data: audiences = [], isLoading } = useQuery<Audience[]>({
    queryKey: ["/api/audiences"],
  });

  const createForm = useForm({
    resolver: zodResolver(insertAudienceSchema),
    defaultValues: {
      name: "",
      capacity: 30,
      resources: {},
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertAudienceSchema),
    defaultValues: {
      name: "",
      capacity: 30,
      resources: {},
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAudienceSchema>) => {
      const res = await apiRequest("/api/audiences", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audiences"] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({ title: "Аудитория создана" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest(`/api/audiences/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audiences"] });
      setIsEditOpen(false);
      setSelectedAudience(null);
      toast({ title: "Аудитория обновлена" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/audiences/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audiences"] });
      setIsDeleteOpen(false);
      setSelectedAudience(null);
      toast({ title: "Аудитория удалена" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (audience: Audience) => {
    setSelectedAudience(audience);
    editForm.reset({
      name: audience.name,
      capacity: audience.capacity,
      resources: audience.resources || {},
    });
    setIsEditOpen(true);
  };

  const handleDelete = (audience: Audience) => {
    setSelectedAudience(audience);
    setIsDeleteOpen(true);
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
            Управление аудиториями
          </h1>
          <p className="text-muted-foreground">
            Добавление, редактирование и удаление аудиторий
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-audience">
          <Plus className="w-4 h-4 mr-2" />
          Добавить аудиторию
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Список аудиторий</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Вместимость</TableHead>
                  <TableHead>Ресурсы</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audiences.map((audience) => (
                  <TableRow key={audience.id} data-testid={`row-audience-${audience.id}`}>
                    <TableCell className="font-medium">{audience.name}</TableCell>
                    <TableCell>{audience.capacity}</TableCell>
                    <TableCell>
                      {audience.resources && typeof audience.resources === 'object' && Object.keys(audience.resources).length > 0
                        ? Object.keys(audience.resources).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(audience)}
                        data-testid={`button-edit-${audience.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(audience)}
                        data-testid={`button-delete-${audience.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent data-testid="dialog-create-audience">
          <DialogHeader>
            <DialogTitle>Добавить аудиторию</DialogTitle>
            <DialogDescription>Создайте новую аудиторию</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ауд. 205" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вместимость</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-capacity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="resources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ресурсы (опционально)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Проектор, компьютер" data-testid="input-resources" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent data-testid="dialog-edit-audience">
          <DialogHeader>
            <DialogTitle>Редактировать аудиторию</DialogTitle>
            <DialogDescription>Изменить данные аудитории</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                updateMutation.mutate({ id: selectedAudience!.id, data })
              )}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вместимость</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-capacity-edit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="resources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ресурсы</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-resources-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent data-testid="dialog-delete-audience">
          <DialogHeader>
            <DialogTitle>Удалить аудиторию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить аудиторию <strong>{selectedAudience?.name}</strong>? Это
              действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(selectedAudience!.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
