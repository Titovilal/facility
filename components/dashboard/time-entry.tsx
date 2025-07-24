"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

type TimeEntryType = {
  id: string;
  startTime: string;
  endTime: string;
};

interface TimeEntryProps {
  entry: TimeEntryType;
  index: number;
  canRemove: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: "startTime" | "endTime", value: string) => void;
}

export function TimeEntry({ entry, index, canRemove, onRemove, onUpdate }: TimeEntryProps) {
  const calculateDuration = () => {
    if (!entry.startTime || !entry.endTime) return null;

    const start = new Date(`2000-01-01T${entry.startTime}`);
    const end = new Date(`2000-01-01T${entry.endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  const duration = calculateDuration();

  return (
    <Card className="py-0">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Período {index + 1}</Label>
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(entry.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`start-${entry.id}`} className="text-muted-foreground text-xs">
                Hora Inicio
              </Label>
              <Input
                id={`start-${entry.id}`}
                type="time"
                value={entry.startTime}
                onChange={(e) => onUpdate(entry.id, "startTime", e.target.value)}
                className="text-center [&::-webkit-calendar-picker-indicator]:opacity-0"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`end-${entry.id}`} className="text-muted-foreground text-xs">
                Hora Fin
              </Label>
              <Input
                id={`end-${entry.id}`}
                type="time"
                value={entry.endTime}
                onChange={(e) => onUpdate(entry.id, "endTime", e.target.value)}
                className="text-center [&::-webkit-calendar-picker-indicator]:opacity-0"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          {duration && <div className="text-muted-foreground text-center text-sm">{duration}h</div>}
        </div>
      </CardContent>
    </Card>
  );
}
