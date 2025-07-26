"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useConfigStore } from "../general/use-config-store";
import { useTimeEntriesActions, useTimeEntriesStore } from "../general/use-time-entries-store";
import { useUser } from "@stackframe/stack";
import { DietasCounter } from "./dietas-counter";
import { HourBreakdownCard } from "./hour-breakdown-card";
import { TimeEntry } from "./time-entry";

interface TimeRegistrationDrawerProps {
  date: Date;
  children: React.ReactNode;
}

export function TimeRegistrationDrawer({ date, children }: TimeRegistrationDrawerProps) {
  const user = useUser();
  
  // Get current rates from config store
  const { pernoctaPrice } = useConfigStore();

  // Get day data from store
  const { getDayData, syncDayToDatabase } = useTimeEntriesStore();
  const { addTimeEntry, removeTimeEntry, updateTimeEntry, setDietasCount, setIsPernocta } =
    useTimeEntriesActions();

  const dayData = getDayData(date);
  const timeEntries = dayData?.timeEntries || [];
  const dietasCount = dayData?.dietasCount || 0;
  const isPernocta = dayData?.isPernocta || false;
  const hourBreakdown = dayData?.hourBreakdown || {
    normal: 0,
    saturday: 0,
    sunday: 0,
    pernocta: 0,
    extra: 0,
    total: 0,
  };
  const totalEarnings = dayData?.totalEarnings || 0;

  const handleSave = async () => {
    // Validate that at least one time entry has both start and end times
    const hasValidEntry = timeEntries.some((entry) => entry.startTime && entry.endTime);

    if (!hasValidEntry) {
      toast.error("Por favor, completa al menos un período de trabajo");
      return;
    }

    // Immediately sync to database
    if (user) {
      try {
        await syncDayToDatabase(user, date);
        toast.success("Horas guardadas correctamente");
      } catch (error) {
        toast.error("Error al guardar en la base de datos");
        console.error("Failed to save to database:", error);
      }
    } else {
      toast.success("Horas guardadas correctamente");
    }
  };
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="fixed right-0 bottom-0 left-0 max-h-[60dvh]">
        <DrawerTitle className="sr-only">Registrar Horas</DrawerTitle>
        <ScrollArea className="overflow-auto p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Registrar Horas</h2>
              <p className="text-muted-foreground text-sm">
                {date.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Time Entries */}
            {timeEntries.map((entry, index) => (
              <TimeEntry
                key={entry.id}
                entry={entry}
                index={index}
                canRemove={timeEntries.length > 1}
                onRemove={(id) => removeTimeEntry(date, id)}
                onUpdate={(id, field, value) => updateTimeEntry(date, id, field, value)}
              />
            ))}

            {/* Add Time Entry Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => addTimeEntry(date)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Período
            </Button>

            {/* Dietas Counter */}
            <DietasCounter count={dietasCount} onChange={(count) => setDietasCount(date, count)} />

            {/* Pernocta Checkbox */}
            <Card className="p-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pernocta"
                    checked={isPernocta}
                    onCheckedChange={(checked) => setIsPernocta(date, checked === true)}
                  />
                  <Label htmlFor="pernocta" className="text-sm font-medium">
                    Pernocta (€{(parseFloat(pernoctaPrice) || 0).toFixed(2)})
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Hour Breakdown Card */}
            <HourBreakdownCard
              hourBreakdown={hourBreakdown}
              dietasCount={dietasCount}
              totalEarnings={totalEarnings}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <DrawerClose asChild>
                <Button className="w-full" onClick={handleSave}>
                  Guardar Horas
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </DrawerClose>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
