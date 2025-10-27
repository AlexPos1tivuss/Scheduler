import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { login: loginMutation, loginError, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
      return;
    }
    loginMutation({ login, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-blue-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Система расписания МИТСО</CardTitle>
            <CardDescription>Введите ваши данные для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">ФИО (Логин)</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Иванов Иван Иванович"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  data-testid="input-login"
                  className="h-11"
                  disabled={isLoggingIn}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                  className="h-11"
                  disabled={isLoggingIn}
                  required
                />
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription data-testid="text-error">
                    {loginError.message || "Ошибка при входе в систему"}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full h-11"
                data-testid="button-login"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Вход..." : "Войти в систему"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg text-xs space-y-2">
              <p className="font-semibold">Тестовые учетные записи:</p>
              <div className="space-y-1">
                <p><strong>Администратор:</strong> Иванов Иван Иванович / admin123</p>
                <p><strong>Преподаватель:</strong> Петрова Анна Сергеевна / teacher123</p>
                <p><strong>Студент:</strong> Тестовый Студент1 Петрович / student123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
