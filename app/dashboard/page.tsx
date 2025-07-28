"use client";

import { TimeRegistrationDrawer } from "@/components/dashboard/time-registration-drawer";
import {
  useLoadMonthData,
  useTimeEntriesStore,
} from "@/components/dashboard/use-time-entries-store";
import { Navbar } from "@/components/navbar/navbar";
import { useConfigStore, useInitializeConfig } from "@/components/navbar/use-config-store";
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
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const router = useRouter();

  // Initialize stores with database data
  useInitializeConfig();

  // Configuration store
  const {
    annualSalary,
    paymentType,
    segundaPagaMonths,
    extraRate,
    saturdayRate,
    sundayRate,
    dietaPrice,
    pernoctaPrice,
    getNormalRate,
  } = useConfigStore();

  // Function to calculate minimum expected monthly income for displayed month
  const calculateMinimumMonthlyIncome = () => {
    const salary = parseFloat(annualSalary) || 0;
    const payments = parseFloat(paymentType) || 12;
    const baseMonthlyIncome = salary / payments;

    // Check if displayed month is a segunda paga month
    const displayedMonthNumber = (displayedMonth.getMonth() + 1).toString();
    const extraPayMonths = segundaPagaMonths.split(",").filter(Boolean);
    const isExtraPayMonth = extraPayMonths.includes(displayedMonthNumber);

    return isExtraPayMonth ? baseMonthlyIncome * 2 : baseMonthlyIncome;
  };

  // Zustand stores
  const {
    selectedDate,
    setSelectedDate,
    getDayData,
    getMonthlyHours,
    getMonthlyEarnings,
    getMonthlyDietas,
    getMonthlyPernocta,
    getMonthlyVacationStats,
  } = useTimeEntriesStore();

  // Get displayed month/year for summary calculations
  const displayedYear = displayedMonth.getFullYear();
  const displayedMonthIndex = displayedMonth.getMonth();

  // Load time entries data from database for displayed month
  useLoadMonthData(displayedYear, displayedMonthIndex);

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

  // Update displayed month when selectedDate changes (for initial load)
  useEffect(() => {
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setDisplayedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

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

  // Get monthly summary for displayed month
  const monthlyHours = getMonthlyHours(displayedYear, displayedMonthIndex);
  const monthlyEarnings = getMonthlyEarnings(displayedYear, displayedMonthIndex);
  const monthlyDietas = getMonthlyDietas(displayedYear, displayedMonthIndex);
  const monthlyPernocta = getMonthlyPernocta(displayedYear, displayedMonthIndex);
  const monthlyVacations = getMonthlyVacationStats(displayedYear, displayedMonthIndex);
  const minimumExpectedIncome = calculateMinimumMonthlyIncome();

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
                            (€{getNormalRate().toFixed(2)}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.normal * getNormalRate()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Extra</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.extra.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{parseFloat(extraRate) || 0}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.extra * (parseFloat(extraRate) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sábado</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.saturday.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{parseFloat(saturdayRate) || 0}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.saturday * (parseFloat(saturdayRate) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domingo</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyHours.sunday.toFixed(1)}h{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{parseFloat(sundayRate) || 0}/h)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyHours.sunday * (parseFloat(sundayRate) || 0)).toFixed(2)}
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
                              (€{getNormalRate().toFixed(2)}/h)
                            </span>
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            €
                            {(
                              (monthlyVacations.fullDays * 8 + monthlyVacations.halfDays * 4) *
                              getNormalRate()
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
                          €
                          {(
                            monthlyHours.normal * getNormalRate() +
                            monthlyHours.extra * (parseFloat(extraRate) || 0) +
                            monthlyHours.saturday * (parseFloat(saturdayRate) || 0) +
                            monthlyHours.sunday * (parseFloat(sundayRate) || 0) +
                            (monthlyVacations.fullDays * 8 + monthlyVacations.halfDays * 4) *
                              getNormalRate()
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allowances Card */}
                <div className="bg-card rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Euro className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Complementos</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dietas</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyDietas.count}{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{parseFloat(dietaPrice) || 0}/u)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{monthlyDietas.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Noches</span>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {monthlyPernocta.count}{" "}
                          <span className="text-muted-foreground text-xs">
                            (€{parseFloat(pernoctaPrice) || 0}/u)
                          </span>
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          €{monthlyPernocta.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total</span>
                      <div className="flex flex-col items-end">
                        <span>{monthlyDietas.count + monthlyPernocta.count} complementos</span>
                        <span className="text-xs font-medium text-green-600">
                          €{(monthlyDietas.totalCost + monthlyPernocta.totalCost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

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
                              .map((day) => {
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
                        {monthlyEarnings >= minimumExpectedIncome
                          ? "✓ Objetivo alcanzado"
                          : "⚠ Por debajo del objetivo"}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          monthlyEarnings >= minimumExpectedIncome
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {monthlyEarnings >= minimumExpectedIncome ? "+" : ""}€
                        {(monthlyEarnings - minimumExpectedIncome).toFixed(2)}
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
