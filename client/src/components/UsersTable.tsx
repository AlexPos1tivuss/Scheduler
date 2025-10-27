import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  role: "admin" | "teacher" | "student";
  active: boolean;
}

export default function UsersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  //todo: remove mock functionality
  const mockUsers: User[] = [
    { id: "1", lastName: "Иванов", firstName: "Иван", middleName: "Иванович", role: "admin", active: true },
    { id: "2", lastName: "Петрова", firstName: "Анна", middleName: "Сергеевна", role: "teacher", active: true },
    { id: "3", lastName: "Сидоров", firstName: "Петр", middleName: "Иванович", role: "teacher", active: true },
    { id: "4", lastName: "Смирнова", firstName: "Мария", middleName: "Дмитриевна", role: "teacher", active: true },
    { id: "5", lastName: "Козлов", firstName: "Владимир", middleName: "Васильевич", role: "teacher", active: false },
    { id: "6", lastName: "Васильев", firstName: "Алексей", middleName: "Петрович", role: "student", active: true },
  ];

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: { label: "Администратор", className: "bg-primary/10 text-primary" },
      teacher: { label: "Преподаватель", className: "bg-gold/10 text-gold-foreground" },
      student: { label: "Студент", className: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
    };
    const variant = variants[role as keyof typeof variants];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <Card data-testid="card-users-table">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Управление пользователями</CardTitle>
            <CardDescription>Создание и редактирование учетных записей</CardDescription>
          </div>
          <Button data-testid="button-add-user">
            <Plus className="w-4 h-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по ФИО..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-role-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Все роли" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              <SelectItem value="admin">Администраторы</SelectItem>
              <SelectItem value="teacher">Преподаватели</SelectItem>
              <SelectItem value="student">Студенты</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm">ФИО</th>
                  <th className="text-left p-4 font-semibold text-sm">Роль</th>
                  <th className="text-left p-4 font-semibold text-sm">Статус</th>
                  <th className="text-right p-4 font-semibold text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`border-t hover-elevate ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                    data-testid={`row-user-${user.id}`}
                  >
                    <td className="p-4">
                      <div className="font-medium" data-testid={`text-user-name-${user.id}`}>
                        {user.lastName} {user.firstName} {user.middleName}
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">
                      {user.active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                          Неактивен
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" data-testid={`button-edit-${user.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-delete-${user.id}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
