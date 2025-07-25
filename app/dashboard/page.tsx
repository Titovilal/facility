"use client";

import { TimeRegistrationDrawer } from "@/components/dashboard/time-registration-drawer";
import { Navbar } from "@/components/general/navbar";
import { useTimeEntriesStore } from "@/components/general/use-time-entries-store";
import { Calendar } from "@/components/ui/calendar";
import { getOrCreateProfile } from "@/db/actions/profiles";
import type { Profile } from "@/db/schemas/profiles";
import { configFile } from "@/lib/config";
import { useUser } from "@stackframe/stack";
import { CalendarIcon, ChevronRight, Clock, Euro, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showHours, setShowHours] = useState(false);
  const router = useRouter();

  // Zustand stores
  const {
    selectedDate,
    setSelectedDate,
    getDayData,
    addTimeEntry,
    removeTimeEntry,
    updateTimeEntry,
    setDietasCount,
    setIsPernocta,
    getMonthlyHours,
    getMonthlyEarnings,
  } = useTimeEntriesStore();

  // Get current day data - ensure selectedDate is a valid Date
  const currentDayData =
    selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())
      ? getDayData(selectedDate)
      : null;

  // Initialize selectedDate if it's not valid
  useEffect(() => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      setSelectedDate(new Date());
    }
  }, [selectedDate, setSelectedDate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const userProfile = await getOrCreateProfile(user, {});
        setProfile(userProfile);
      } catch (error) {
        toast.error("No se pudo cargar el perfil");
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  // ! The user has not authenticated yet, redirecting to auth page from config
  useEffect(() => {
    if (!user) {
      router.push(configFile.authPage);
    }
  }, [user, router]);
  if (!user) return null;

  // Get current monthly summary - use current date if selectedDate is invalid
  const currentDate =
    selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())
      ? selectedDate
      : new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthlyHours = getMonthlyHours(currentYear, currentMonth);
  const monthlyEarnings = getMonthlyEarnings(currentYear, currentMonth);

  return (
    <div className="bg-background min-h-screen">
      <Navbar profile={profile} user={user} />

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          {/* Dashboard Content */}
          <div className="space-y-4 md:space-y-6">
            {/* Day Metrics - First */}
            <div className="lg:col-span-2">
              {selectedDate && currentDayData ? (
                <div className="space-y-4">
                  <TimeRegistrationDrawer
                    date={selectedDate}
                    timeEntries={currentDayData.timeEntries}
                    dietasCount={currentDayData.dietasCount}
                    isPernocta={currentDayData.isPernocta}
                    hourBreakdown={currentDayData.hourBreakdown}
                    totalEarnings={currentDayData.totalEarnings}
                    onAddTimeEntry={() => selectedDate && addTimeEntry(selectedDate)}
                    onRemoveTimeEntry={(id) => selectedDate && removeTimeEntry(selectedDate, id)}
                    onUpdateTimeEntry={(id, field, value) =>
                      selectedDate && updateTimeEntry(selectedDate, id, field, value)
                    }
                    onDietasChange={(count) => selectedDate && setDietasCount(selectedDate, count)}
                    onPernoctaChange={(isPernocta) =>
                      selectedDate && setIsPernocta(selectedDate, isPernocta)
                    }
                  >
                    <div className="hover:bg-accent/50 active:bg-accent group border-border/50 bg-card flex cursor-pointer items-center justify-between rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {selectedDate.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {currentDayData.hourBreakdown.total.toFixed(1)}h trabajadas
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <div className="text-lg font-bold">
                            €{currentDayData.totalEarnings.toFixed(2)}
                          </div>
                          <div className="text-muted-foreground text-xs">Sueldo bruto</div>
                        </div>
                        <ChevronRight className="text-muted-foreground/50 group-hover:text-muted-foreground h-5 w-5 transition-colors" />
                      </div>
                    </div>
                  </TimeRegistrationDrawer>
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Selecciona un día en el calendario</p>
                </div>
              )}
            </div>
            {/* Calendar Section */}
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold md:text-xl">
                  <CalendarIcon className="h-5 w-5" />
                  Calendario de Horas
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHours(false)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                      !showHours
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Euro className="h-4 w-4" />
                    €
                  </button>
                  <button
                    onClick={() => setShowHours(true)}
                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                      showHours
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    h
                  </button>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                showOutsideDays={false}
                showHours={showHours}
                className="w-full p-0 [--cell-size:theme(spacing.12)] md:[--cell-size:theme(spacing.10)]"
              />
            </div>

            {/* Monthly Summary */}
            <div className="p-4 pt-0">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5" />
                Resumen del Mes
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Normales</span>
                  <span className="font-medium">{monthlyHours.normal.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Extra</span>
                  <span className="font-medium">{monthlyHours.extra.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Sábado</span>
                  <span className="font-medium">{monthlyHours.saturday.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Domingo</span>
                  <span className="font-medium">{monthlyHours.sunday.toFixed(1)}h</span>
                </div>
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total Horas</span>
                    <span>{monthlyHours.total.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Total Ingresos</span>
                    <span>€{monthlyEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
