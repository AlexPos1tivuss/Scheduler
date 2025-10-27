import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "./pages/home";
import LoginPage from "@/components/LoginPage";
import UsersPage from "./pages/users";
import GroupsPage from "./pages/groups";
import SubjectsPage from "./pages/subjects";
import AudiencesPage from "./pages/audiences";
import SchedulePage from "./pages/schedule";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/groups" component={GroupsPage} />
      <Route path="/subjects" component={SubjectsPage} />
      <Route path="/audiences" component={AudiencesPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
