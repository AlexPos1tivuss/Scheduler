import { useState } from "react";
import UserFormDialog from "../UserFormDialog";
import { Button } from "@/components/ui/button";

export default function UserFormDialogExample() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div className="p-6 bg-background flex gap-4">
      <Button onClick={() => setOpenCreate(true)} data-testid="button-open-create">
        Создать пользователя
      </Button>
      <Button onClick={() => setOpenEdit(true)} variant="outline" data-testid="button-open-edit">
        Редактировать пользователя
      </Button>

      <UserFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        mode="create"
      />

      <UserFormDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        mode="edit"
        user={{
          id: "1",
          firstName: "Иван",
          lastName: "Иванов",
          middleName: "Иванович",
          role: "teacher",
        }}
      />
    </div>
  );
}
