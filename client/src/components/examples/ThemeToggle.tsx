import ThemeToggle from "../ThemeToggle";

export default function ThemeToggleExample() {
  return (
    <div className="p-6 bg-background flex items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">Переключение темы:</p>
      <ThemeToggle />
    </div>
  );
}
