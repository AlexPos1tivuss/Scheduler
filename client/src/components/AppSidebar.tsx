import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Calendar, Users, BookOpen, DoorOpen, Settings, LayoutDashboard, FileSpreadsheet, LogOut, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

type UserRole = "admin" | "teacher" | "student";

interface AppSidebarProps {
  role: UserRole;
  userName: string;
}

export function AppSidebar({ role, userName }: AppSidebarProps) {
  const { logout } = useAuth();

  const adminMenuItems = [
    { title: "Главная", url: "/", icon: LayoutDashboard },
    { title: "Пользователи", url: "/users", icon: Users },
    { title: "Группы", url: "/groups", icon: Users },
    { title: "Предметы", url: "/subjects", icon: BookOpen },
    { title: "Аудитории", url: "/audiences", icon: DoorOpen },
    { title: "Расписание", url: "/schedule", icon: Calendar },
  ];

  const teacherMenuItems = [
    { title: "Главная", url: "/", icon: LayoutDashboard },
    { title: "Мое расписание", url: "/schedule", icon: Calendar },
    { title: "Мои предметы", url: "/subjects", icon: BookOpen },
  ];

  const studentMenuItems = [
    { title: "Главная", url: "/", icon: LayoutDashboard },
    { title: "Расписание группы", url: "/schedule", icon: Calendar },
  ];

  const menuItems = role === "admin" ? adminMenuItems : role === "teacher" ? teacherMenuItems : studentMenuItems;

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm truncate">МИТСО</h2>
            <p className="text-xs text-muted-foreground truncate">Расписание</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`sidebar-link-${item.title.toLowerCase()}`}>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t space-y-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
            {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">{userName}</p>
            <p className="text-xs text-muted-foreground">
              {role === "admin" ? "Администратор" : role === "teacher" ? "Преподаватель" : "Студент"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            data-testid="button-logout"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
