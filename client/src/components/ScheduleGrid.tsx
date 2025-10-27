import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Lesson {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  group?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface ScheduleGridProps {
  weekDays: string[];
  timeSlots: TimeSlot[];
  lessons: Record<string, Record<string, Lesson | null>>;
}

export default function ScheduleGrid({ weekDays, timeSlots, lessons }: ScheduleGridProps) {
  const getSubjectColor = (subject: string) => {
    return `hsl(${Math.abs(subject.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 65%, 55%)`;
  };

  return (
    <Card data-testid="card-schedule-grid">
      <CardHeader>
        <CardTitle>Расписание на неделю</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-6 gap-2">
            <div className="font-semibold text-sm text-muted-foreground p-2">Время</div>
            {weekDays.map((day) => (
              <div key={day} className="font-semibold text-sm text-center p-2" data-testid={`header-${day}`}>
                {day}
              </div>
            ))}
            
            {timeSlots.map((slot, slotIndex) => (
              <div key={slotIndex} className="contents">
                <div className="p-3 border rounded-md bg-muted/30 text-xs font-mono flex flex-col items-center justify-center">
                  <div className="font-semibold">{slot.start}</div>
                  <div className="text-muted-foreground">{slot.end}</div>
                </div>
                
                {weekDays.map((day) => {
                  const lesson = lessons[day]?.[slotIndex];
                  
                  return (
                    <motion.div
                      key={`${day}-${slotIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: slotIndex * 0.05 }}
                      className="p-2"
                    >
                      {lesson ? (
                        <div
                          className="p-3 rounded-md border-l-4 bg-card hover-elevate h-full"
                          style={{ borderLeftColor: getSubjectColor(lesson.subject) }}
                          data-testid={`lesson-${day}-${slotIndex}`}
                        >
                          <div className="font-semibold text-sm mb-1">{lesson.subject}</div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>{lesson.teacher}</div>
                            <div>{lesson.room}</div>
                            {lesson.group && <Badge variant="outline" className="text-xs mt-1">{lesson.group}</Badge>}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[80px] border border-dashed rounded-md bg-muted/10" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
