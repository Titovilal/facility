"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Plus } from "lucide-react";
import { TimeEntry } from "./time-entry";
import { DietasCounter } from "./dietas-counter";
import { HourBreakdownCard } from "./hour-breakdown-card";
import { toast } from "sonner";
import { useConfigStore } from "@/components/general/use-config-store";

type TimeEntryType = {
  id: string;
  startTime: string;
  endTime: string;
};

type HourBreakdown = {
  normal: number;
  saturday: number;
  sunday: number;
  pernocta: number;
  extra: number;
  total: number;
};

interface TimeRegistrationDrawerProps {
  date: Date;
  timeEntries: TimeEntryType[];
  dietasCount: number;
  isPernocta: boolean;
  hourBreakdown: HourBreakdown;
  totalEarnings: number;
  onAddTimeEntry: () => void;
  onRemoveTimeEntry: (id: string) => void;
  onUpdateTimeEntry: (id: string, field: "startTime" | "endTime", value: string) => void;
  onDietasChange: (count: number) => void;
  onPernoctaChange: (checked: boolean) => void;
}

export function TimeRegistrationDrawer({
  date,
  timeEntries,
  dietasCount,
  isPernocta,
  hourBreakdown,
  totalEarnings,
  onAddTimeEntry,
  onRemoveTimeEntry,
  onUpdateTimeEntry,
  onDietasChange,
  onPernoctaChange,
}: TimeRegistrationDrawerProps) {
  // Get current rates from config store
  const { pernoctaPrice } = useConfigStore();

  const handleSave = () => {
    // Validate that at least one time entry has both start and end times
    const hasValidEntry = timeEntries.some(entry => entry.startTime && entry.endTime);
    
    if (!hasValidEntry) {
      toast.error("Por favor, completa al menos un período de trabajo");
      return;
    }
    
    toast.success("Horas guardadas correctamente");
    // The data is already being saved to the store through the onChange handlers
  };
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Clock className="mr-2 h-4 w-4" />
          Registrar Horas
        </Button>
      </DrawerTrigger>

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
                onRemove={onRemoveTimeEntry}
                onUpdate={onUpdateTimeEntry}
              />
            ))}

            {/* Add Time Entry Button */}
            <Button
              type="button"
              variant="outline"
              onClick={onAddTimeEntry}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Período
            </Button>

            {/* Dietas Counter */}
            <DietasCounter count={dietasCount} onChange={onDietasChange} />

            {/* Pernocta Checkbox */}
            <Card className="p-0">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pernocta" 
                    checked={isPernocta}
                    onCheckedChange={(checked) => onPernoctaChange(checked === true)}
                  />
                  <Label htmlFor="pernocta" className="text-sm font-medium">
                    Pernocta (€{parseFloat(pernoctaPrice).toFixed(2)}/h)
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