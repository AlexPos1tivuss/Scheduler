import { AppSidebar } from "../AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role="admin" userName="Иванов Иван Иванович" />
        <main className="flex-1 overflow-auto p-8 bg-background">
          <h1 className="text-2xl font-bold mb-4">Пример с сайдбаром</h1>
          <p className="text-muted-foreground">
            Сайдбар адаптируется в зависимости от роли пользователя (администратор, преподаватель, студент).
          </p>
        </main>
      </div>
    </SidebarProvider>
  );
}
