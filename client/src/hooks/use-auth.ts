import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export interface User {
  id: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  firstName: string;
  lastName: string;
  middleName: string;
  login: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const [, setLocation] = useLocation();

  // Get current user
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      setLocation("/");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      setLocation("/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    loginError: loginMutation.error as Error | null,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
