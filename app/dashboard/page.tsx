"use client";

import { TimeRegistrationDrawer } from "@/components/dashboard/time-registration-drawer";
import { useDateManagement, useDashboardData } from "@/components/dashboard/use-time-entries";
import { Navbar } from "@/components/navbar/navbar";
import { useInitializeConfig } from "@/components/navbar/use-config-store";
import { Calendar } from "@/components/ui/calendar";
import { getOrCreateProfile } from "@/db/actions/profiles";
import type { Profile } from "@/db/schemas/profiles";
import { configFile } from "@/lib/config";
import { useUser } from "@stackframe/stack";
import { CalendarIcon, ChevronRight, Clock, Euro, Plane, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showHours, setShowHours] = useState(false);
  const router = useRouter();

  // Initialize stores with database data
  useInitializeConfig();

  // Date management
  const { selectedDate, setSelectedDate, displayedMonth, setDisplayedMonth } = useDateManagement();

  // Dashboard data calculations
  const {
    currentDayData,
    monthlyHours,
    monthlyEarnings,
    monthlyDietas,
    monthlyPernocta,
    monthlyVacations,
    minimumExpectedIncome,
    isObjectiveMet,
    earningsDifference,
    totalHoursEarnings,
    totalAllowances,
    totalAllowancesCount,
    configData,
  } = useDashboardData(displayedMonth);

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
                  <TimeRegistrationDrawer date={selectedDate}>
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
                <button
                  onClick={() => setShowHours(!showHours)}
                  className="bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors"
                >
                  {showHours ? (
                    <>
                      <Clock className="h-4 w-4" />h
                    </>
                  ) : (
                    <>
                      <Euro className="h-4 w-4" />€
                    </>
                  )}
                </button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onMonthChange={(month) => {
                  if (month) {
                    setDisplayedMonth(month);
                  }
                }}
                showOutsideDays={false}
                showHours={showHours}
                className="w-full p-0 [--cell-size:theme(spacing.12)] md:[--cell-size:theme(spacing.10)]"
              />
            </div>

            {/* Monthly Summary */}
            <div className="p-4 pt-0">
              <div className="mb-4 text-center">
                <h2 className="text-lg font-semibold">Resumen Mensual</h2>
                <p className="text-muted-foreground text-sm">
                  {displayedMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </p>
              </div>

              <div className="space-y-4">
                {/* Work Hours Card */}
                <div className="bg-card rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Horas Trabajadas</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Normales</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.normal.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{configData.getNormalRate().toFixed(2)}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.normal * configData.getNormalRate()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extra</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.extra.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{configData.extraRate}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.extra * configData.extraRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sábado</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.saturday.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{configData.saturdayRate}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.saturday * configData.saturdayRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domingo</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.sunday.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{configData.sundayRate}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.sunday * configData.sundayRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {monthlyVacations.totalVacationDays > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vacaciones</span>
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            {(
                              monthlyVacations.fullDays * 8 +
                              monthlyVacations.halfDays * 4
                            ).toFixed(1)}
                            h{" "}
                            <span className="text-muted-foreground text-xs">
                              (€{configData.getNormalRate().toFixed(2)}/h)
                            </span>
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            €
                            {(
                              (monthlyVacations.fullDays * 8 + monthlyVacations.halfDays * 4) *
                              configData.getNormalRate()
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total</span>
                      <div className="flex flex-col items-end">
                        <span>{monthlyHours.total.toFixed(1)}h</span>
                        <span className="text-xs font-medium text-green-600">
                          €{totalHoursEarnings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allowances Card - Only shown if at least one of hasDieta or hasPernocta is true */}
                {(configData.hasDieta || configData.hasPernocta) && (
                  <div className="bg-card rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Euro className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Complementos</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {configData.hasDieta && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dietas</span>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {monthlyDietas.count}{" "}
                              <span className="text-muted-foreground text-xs">
                                (€{configData.dietaPrice}/u)
                              </span>
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              €{monthlyDietas.totalCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      {configData.hasPernocta && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Noches</span>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {monthlyPernocta.count}{" "}
                              <span className="text-muted-foreground text-xs">
                                (€{configData.pernoctaPrice}/u)
                              </span>
                            </span>
                            <span className="text-xs font-medium text-green-600">
                              €{monthlyPernocta.totalCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total</span>
                        <div className="flex flex-col items-end">
                          <span>
                            {totalAllowancesCount}{" "}
                            complementos
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            €{totalAllowances.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vacations Card */}
                {monthlyVacations.totalVacationDays > 0 && (
                  <div className="bg-card rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Plane className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Vacaciones</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {monthlyVacations.fullDays > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Días completos</span>
                          <span className="font-medium">{monthlyVacations.fullDays}</span>
                        </div>
                      )}
                      {monthlyVacations.halfDays > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Medios días</span>
                          <span className="font-medium">{monthlyVacations.halfDays}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total días</span>
                        <span className="text-purple-600">
                          {monthlyVacations.totalVacationDays}
                        </span>
                      </div>
                      {monthlyVacations.vacationDays.length > 0 && (
                        <div className="pt-1">
                          <span className="text-muted-foreground text-xs">
                            Fechas:{" "}
                            {monthlyVacations.vacationDays
                              .map((day: { date: string }) => {
                                const date = new Date(day.date);
                                return date.getDate();
                              })
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Earnings Summary Card */}
                <div className="bg-card rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Resumen Económico</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mínimo Esperado</span>
                      <span className="font-medium text-blue-600">
                        €{minimumExpectedIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total Ingresos</span>
                      <span className="text-green-600">€{monthlyEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground text-xs">
                        {isObjectiveMet
                          ? "✓ Objetivo alcanzado"
                          : "⚠ Por debajo del objetivo"}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isObjectiveMet
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {isObjectiveMet ? "+" : ""}€
                        {earningsDifference.toFixed(2)}
                      </span>
                    </div>
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
