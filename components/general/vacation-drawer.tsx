"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useTimeEntriesStore, type VacationType } from "./use-time-entries-store";
import { useConfigStore } from "./use-config-store";
import { CalendarDays, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

function VacationForm() {
  const { setVacationType, getYearlyVacationStats } = useTimeEntriesStore();
  const { maxVacationDays } = useConfigStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [vacationType, setVacationTypeLocal] = useState<VacationType>("full_day");
  const [selectionMode, setSelectionMode] = useState<"single" | "range">("single");

  const currentYear = new Date().getFullYear();
  const vacationStats = getYearlyVacationStats(currentYear);
  const maxDays = parseFloat(maxVacationDays) || 22;
  const remainingDays = maxDays - vacationStats.totalVacationDays;

  const handleApplyVacation = () => {
    if (selectionMode === "single" && selectedDate) {
      setVacationType(selectedDate, vacationType);
      toast.success(`Vacaciones aplicadas para ${selectedDate.toLocaleDateString("es-ES")}`);
    } else if (selectionMode === "range" && dateRange.from) {
      const startDate = dateRange.from;
      const endDate = dateRange.to || dateRange.from;

      const currentDate = new Date(startDate);
      let daysApplied = 0;

      while (currentDate <= endDate) {
        setVacationType(new Date(currentDate), vacationType);
        currentDate.setDate(currentDate.getDate() + 1);
        daysApplied++;
      }

      toast.success(`Vacaciones aplicadas a ${daysApplied} día(s)`);
    } else {
      toast.error("Selecciona una fecha o rango de fechas");
      return;
    }

    // Reset selections
    setSelectedDate(new Date());
    setDateRange({ from: undefined, to: undefined });
  };

  const handleClearVacation = () => {
    if (selectionMode === "single" && selectedDate) {
      setVacationType(selectedDate, "none");
      toast.success(`Vacaciones eliminadas para ${selectedDate.toLocaleDateString("es-ES")}`);
    } else if (selectionMode === "range" && dateRange.from) {
      const startDate = dateRange.from;
      const endDate = dateRange.to || dateRange.from;

      const currentDate = new Date(startDate);
      let daysCleared = 0;

      while (currentDate <= endDate) {
        setVacationType(new Date(currentDate), "none");
        currentDate.setDate(currentDate.getDate() + 1);
        daysCleared++;
      }

      toast.success(`Vacaciones eliminadas de ${daysCleared} día(s)`);
    } else {
      toast.error("Selecciona una fecha o rango de fechas");
    }
  };

  return (
    <div className="space-y-4">
      {/* Resumen de Vacaciones */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4" />
            Resumen {currentYear}
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Días completos</span>
              <span className="font-medium">{vacationStats.fullDays}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Medios días</span>
              <span className="font-medium">{vacationStats.halfDays}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-sm">
              <span className="text-muted-foreground">Total utilizado</span>
              <span className="font-medium">{vacationStats.totalVacationDays}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Días disponibles</span>
              <span
                className={`font-medium ${remainingDays < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {remainingDays}
              </span>
            </div>
          </div>

          {remainingDays < 0 && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              ⚠️ Has excedido el límite de días de vacaciones
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modo de Selección */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">Modo de Selección</h3>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Seleccionar fechas</Label>
            <Select
              value={selectionMode}
              onValueChange={(value: "single" | "range") => {
                setSelectionMode(value);
                setSelectedDate(new Date());
                setDateRange({ from: undefined, to: undefined });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Día individual</SelectItem>
                <SelectItem value="range">Rango de fechas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Vacaciones */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">Tipo de Vacaciones</h3>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Duración</Label>
            <Select
              value={vacationType}
              onValueChange={(value: VacationType) => setVacationTypeLocal(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">Día completo (8h)</SelectItem>
                <SelectItem value="half_day">Medio día (4h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendario */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">
            {selectionMode === "single" ? "Seleccionar Día" : "Seleccionar Rango"}
          </h3>

          {selectionMode === "single" ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              showOutsideDays={false}
              className="w-full"
            />
          ) : (
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
              showOutsideDays={false}
              className="w-full"
            />
          )}

          {/* Información de selección */}
          <div className="bg-muted rounded-md p-3 text-sm">
            {selectionMode === "single" && selectedDate && (
              <div>
                <span className="text-muted-foreground">Fecha seleccionada: </span>
                <span className="font-medium">
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
            )}

            {selectionMode === "range" && (
              <div className="space-y-1">
                {dateRange.from && (
                  <div>
                    <span className="text-muted-foreground">Desde: </span>
                    <span className="font-medium">
                      {dateRange.from.toLocaleDateString("es-ES")}
                    </span>
                  </div>
                )}
                {dateRange.to && (
                  <div>
                    <span className="text-muted-foreground">Hasta: </span>
                    <span className="font-medium">{dateRange.to.toLocaleDateString("es-ES")}</span>
                  </div>
                )}
                {dateRange.from && dateRange.to && (
                  <div>
                    <span className="text-muted-foreground">Total días: </span>
                    <span className="font-medium">
                      {Math.ceil(
                        (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
                      ) + 1}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleApplyVacation}
          className="w-full"
          disabled={
            (selectionMode === "single" && !selectedDate) ||
            (selectionMode === "range" && !dateRange.from)
          }
        >
          Aplicar Vacaciones
        </Button>
        <Button
          onClick={handleClearVacation}
          variant="outline"
          className="w-full"
          disabled={
            (selectionMode === "single" && !selectedDate) ||
            (selectionMode === "range" && !dateRange.from)
          }
        >
          Eliminar Vacaciones
        </Button>
      </div>
    </div>
  );
}

export function VacationDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <CalendarDays className="h-4 w-4" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="fixed right-0 bottom-0 left-0 max-h-[80dvh]">
        <DrawerTitle className="sr-only">Gestión de Vacaciones</DrawerTitle>
        <ScrollArea className="overflow-auto p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Gestión de Vacaciones</h2>
              <p className="text-muted-foreground text-sm">
                Marca días individuales o rangos de fechas como vacaciones
              </p>
            </div>

            <VacationForm />

            <div className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cerrar
                </Button>
              </DrawerClose>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
