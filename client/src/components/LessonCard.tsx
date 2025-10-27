import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, MapPin, User, Users } from "lucide-react";

interface LessonCardProps {
  subject: string;
  teacher: string;
  room: string;
  group?: string;
  startTime: string;
  endTime: string;
  color?: string;
}

export default function LessonCard({ subject, teacher, room, group, startTime, endTime, color }: LessonCardProps) {
  const subjectColor = color || `hsl(${Math.abs(subject.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, 50%)`;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card 
        className="hover-elevate overflow-hidden" 
        style={{ borderLeft: `4px solid ${subjectColor}` }}
        data-testid={`card-lesson-${subject}`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight" data-testid="text-subject">{subject}</h3>
            <Badge variant="outline" className="text-xs font-mono shrink-0" data-testid="badge-time">
              {startTime}—{endTime}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate" data-testid="text-teacher">{teacher}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span data-testid="text-room">{room}</span>
            </div>
            {group && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span data-testid="text-group">{group}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
