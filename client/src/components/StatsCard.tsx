import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "gold" | "success" | "warning";
}

export default function StatsCard({ title, value, icon: Icon, trend, color = "primary" }: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    gold: "text-gold bg-gold/10",
    success: "text-green-600 bg-green-50 dark:bg-green-900/20",
    warning: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="hover-elevate" data-testid={`card-stats-${title.toLowerCase()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground" data-testid="text-stats-title">{title}</p>
              <p className="text-3xl font-bold" data-testid="text-stats-value">{value}</p>
              {trend && (
                <p className={`text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
