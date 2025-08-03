/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getDayDataFromEntries,
  getTimeEntriesForDate,
  syncTimeEntriesForDate,
} from "@/db/actions/time-entries";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useConfigStore } from "../navbar/use-config-store";

export type TimeEntry = {
  id: string;
  startTime: string;
  endTime: string;
};

export type VacationType = "none" | "full_day" | "half_day";

export type HourBreakdown = {
  normal: number;
  saturday: number;
  sunday: number;
  pernocta: number;
  extra: number;
  total: number;
};

export type DayData = {
  date: string; // YYYY-MM-DD format
  timeEntries: TimeEntry[];
  dietasCount: number;
  isPernocta: boolean;
  vacationType: VacationType;
  hourBreakdown: HourBreakdown;
  totalEarnings: number;
};

export type MonthlyData = {
  [dateKey: string]: DayData; // dateKey format: YYYY-MM-DD
};

interface TimeEntriesState {
  // Data storage
  monthlyData: MonthlyData;

  // Current selected date
  selectedDate: Date | undefined;

  // Loading state
  isLoading: boolean;
  loadedDates: Set<string>;

  // Actions for day management
  setSelectedDate: (date: Date | undefined) => void;

  // Actions for time entries
  getDayData: (date: Date) => DayData;
  setTimeEntries: (date: Date, timeEntries: TimeEntry[]) => void;
  addTimeEntry: (date: Date) => void;
  removeTimeEntry: (date: Date, entryId: string) => void;
  updateTimeEntry: (
    date: Date,
    entryId: string,
    field: "startTime" | "endTime",
    value: string
  ) => void;

  // Actions for dietas and pernocta
  setDietasCount: (date: Date, count: number) => void;
  setIsPernocta: (date: Date, isPernocta: boolean) => void;

  // Actions for vacation
  setVacationType: (date: Date, vacationType: VacationType) => void;

  // Actions for calculations
  calculateHourBreakdown: (
    date: Date,
    timeEntries: TimeEntry[],
    isPernocta: boolean
  ) => HourBreakdown;
  calculateEarnings: (
    hourBreakdown: HourBreakdown,
    dietasCount: number,
    rates?: {
      normal: number;
      saturday: number;
      sunday: number;
      pernocta: number;
      extra: number;
      dieta: number;
    },
    isPernocta?: boolean
  ) => number;
  updateDayCalculations: (date: Date) => void;

  // Database sync actions
  loadDayFromDatabase: (user: any, date: Date) => Promise<void>;
  loadMonthFromDatabase: (user: any, year: number, month: number) => Promise<void>;
  syncDayToDatabase: (user: any, date: Date) => Promise<void>;

  // Monthly summary functions
  getMonthlyHours: (year: number, month: number) => HourBreakdown;
  getMonthlyEarnings: (year: number, month: number) => number;
  getMonthlyDays: (year: number, month: number) => DayData[];
  getMonthlyDietas: (year: number, month: number) => { count: number; totalCost: number };
  getMonthlyPernocta: (year: number, month: number) => { count: number; totalCost: number };

  // Vacation functions
  getYearlyVacationStats: (year: number) => {
    fullDays: number;
    halfDays: number;
    totalVacationDays: number;
    vacationDays: DayData[];
  };
  getMonthlyVacationStats: (
    year: number,
    month: number
  ) => {
    fullDays: number;
    halfDays: number;
    totalVacationDays: number;
    vacationDays: DayData[];
  };

  // Utility functions
  clearDayData: (date: Date) => void;
  clearMonthData: (year: number, month: number) => void;
  exportMonthData: (
    year: number,
    month: number
  ) => {
    year: number;
    month: number;
    days: DayData[];
    summary: {
      hours: HourBreakdown;
      totalEarnings: number;
      workingDays: number;
    };
  };
}

const formatDateKey = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date provided to formatDateKey");
  }
  // Use UTC to avoid timezone issues when formatting dates
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultDayData = (date: Date): DayData => ({
  date: formatDateKey(date),
  timeEntries: [
    {
      id: crypto.randomUUID(),
      startTime: "",
      endTime: "",
    },
  ],
  dietasCount: 0,
  isPernocta: false,
  vacationType: "none",
  hourBreakdown: {
    normal: 0,
    saturday: 0,
    sunday: 0,
    pernocta: 0,
    extra: 0,
    total: 0,
  },
  totalEarnings: 0,
});

export const useTimeEntriesStore = create<TimeEntriesState>()(
  persist(
    (set, get) => ({
      monthlyData: {},
      selectedDate: new Date(),
      isLoading: false,
      loadedDates: new Set(),

      setSelectedDate: (date) => set({ selectedDate: date }),

      getDayData: (date) => {
        const dateKey = formatDateKey(date);
        const state = get();
        return state.monthlyData[dateKey] || defaultDayData(date);
      },

      setTimeEntries: (date, timeEntries) => {
        const dateKey = formatDateKey(date);
        set((state) => ({
          monthlyData: {
            ...state.monthlyData,
            [dateKey]: {
              ...state.getDayData(date),
              timeEntries,
            },
          },
        }));
        get().updateDayCalculations(date);
      },

      addTimeEntry: (date) => {
        const dayData = get().getDayData(date);
        const newEntry: TimeEntry = {
          id: crypto.randomUUID(),
          startTime: "",
          endTime: "",
        };
        get().setTimeEntries(date, [...dayData.timeEntries, newEntry]);
      },

      removeTimeEntry: (date, entryId) => {
        const dayData = get().getDayData(date);
        if (dayData.timeEntries.length > 1) {
          const filteredEntries = dayData.timeEntries.filter((entry) => entry.id !== entryId);
          get().setTimeEntries(date, filteredEntries);
        }
      },

      updateTimeEntry: (date, entryId, field, value) => {
        const dayData = get().getDayData(date);
        const updatedEntries = dayData.timeEntries.map((entry) =>
          entry.id === entryId ? { ...entry, [field]: value } : entry
        );
        get().setTimeEntries(date, updatedEntries);
      },

      setDietasCount: (date, count) => {
        const dateKey = formatDateKey(date);
        set((state) => ({
          monthlyData: {
            ...state.monthlyData,
            [dateKey]: {
              ...state.getDayData(date),
              dietasCount: count,
            },
          },
        }));
        get().updateDayCalculations(date);
      },

      setIsPernocta: (date, isPernocta) => {
        const dateKey = formatDateKey(date);
        set((state) => ({
          monthlyData: {
            ...state.monthlyData,
            [dateKey]: {
              ...state.getDayData(date),
              isPernocta,
            },
          },
        }));
        get().updateDayCalculations(date);
      },

      setVacationType: (date, vacationType) => {
        const dateKey = formatDateKey(date);
        set((state) => ({
          monthlyData: {
            ...state.monthlyData,
            [dateKey]: {
              ...state.getDayData(date),
              vacationType,
            },
          },
        }));
        get().updateDayCalculations(date);
      },

      calculateHourBreakdown: (date, timeEntries, isPernocta) => {
        const dayData = get().getDayData(date);
        const vacationType = dayData.vacationType;

        const breakdown: HourBreakdown = {
          normal: 0,
          saturday: 0,
          sunday: 0,
          pernocta: 0,
          extra: 0,
          total: 0,
        };

        // Handle vacation days
        if (vacationType === "full_day") {
          const dayOfWeek = date.getDay();
          const vacationHours = 8;

          if (dayOfWeek === 0) {
            // Sunday
            breakdown.sunday = vacationHours;
          } else if (dayOfWeek === 6) {
            // Saturday
            breakdown.saturday = vacationHours;
          } else {
            // Normal weekday
            breakdown.normal = vacationHours;
          }

          breakdown.total = vacationHours;
          return breakdown;
        }

        if (vacationType === "half_day") {
          const dayOfWeek = date.getDay();
          const vacationHours = 4;

          if (dayOfWeek === 0) {
            // Sunday
            breakdown.sunday = vacationHours;
          } else if (dayOfWeek === 6) {
            // Saturday
            breakdown.saturday = vacationHours;
          } else {
            // Normal weekday
            breakdown.normal = vacationHours;
          }

          breakdown.total = vacationHours;
        }

        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        let totalHours = vacationType === "half_day" ? 4 : 0;

        timeEntries.forEach((entry) => {
          if (entry.startTime && entry.endTime) {
            const start = new Date(`2000-01-01T${entry.startTime}`);
            const end = new Date(`2000-01-01T${entry.endTime}`);

            // Handle overnight shifts
            const isOvernight = end < start;
            if (isOvernight) {
              end.setDate(end.getDate() + 1);
            }

            const diffMs = end.getTime() - start.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            // Categorize hours based on day type
            if (dayOfWeek === 0) {
              // Sunday
              breakdown.sunday += diffHours;
            } else if (dayOfWeek === 6) {
              // Saturday
              breakdown.saturday += diffHours;
            } else {
              // Normal weekday
              breakdown.normal += diffHours;
            }

            // Add pernocta hours if enabled
            if (isPernocta) {
              breakdown.pernocta += diffHours;
            }

            totalHours += diffHours;
          }
        });

        // Get daily hour limit from config
        const { dailyHourLimit } = useConfigStore.getState();
        const dailyLimit = parseFloat(dailyHourLimit) || 8;

        // Handle overtime for all days (normal weekdays, Saturdays, and Sundays)
        // Move excess hours to extra category
        if (breakdown.normal > dailyLimit) {
          const excessHours = breakdown.normal - dailyLimit;
          breakdown.normal = dailyLimit;
          breakdown.extra += excessHours;
        }

        // Important: Ensure weekend hours beyond dailyLimit are marked as extra
        if (breakdown.saturday > dailyLimit) {
          const excessHours = breakdown.saturday - dailyLimit;
          breakdown.saturday = dailyLimit;
          breakdown.extra += excessHours;
        }

        if (breakdown.sunday > dailyLimit) {
          const excessHours = breakdown.sunday - dailyLimit;
          breakdown.sunday = dailyLimit;
          breakdown.extra += excessHours;
        }

        breakdown.total = isNaN(totalHours) ? 0 : totalHours;

        // Ensure all breakdown values are valid numbers
        Object.keys(breakdown).forEach((key) => {
          const value = breakdown[key as keyof HourBreakdown];
          if (isNaN(value)) {
            breakdown[key as keyof HourBreakdown] = 0;
          }
        });

        return breakdown;
      },

      calculateEarnings: (hourBreakdown, dietasCount, rates, isPernocta = false) => {
        const defaultRates = {
          normal: 15.6,
          saturday: 23.4,
          sunday: 31.2,
          pernocta: 25.0,
          extra: 23.4,
          dieta: 5.0,
        };

        const finalRates = rates || defaultRates;

        const earnings =
          (hourBreakdown.normal || 0) * (finalRates.normal || 0) +
          (hourBreakdown.saturday || 0) * (finalRates.saturday || 0) +
          (hourBreakdown.sunday || 0) * (finalRates.sunday || 0) +
          (hourBreakdown.extra || 0) * (finalRates.extra || 0) +
          (dietasCount || 0) * (finalRates.dieta || 0) +
          (isPernocta ? finalRates.pernocta || 0 : 0);

        return isNaN(earnings) ? 0 : earnings;
      },

      updateDayCalculations: (date) => {
        const dateKey = formatDateKey(date);
        const dayData = get().getDayData(date);
        const hourBreakdown = get().calculateHourBreakdown(
          date,
          dayData.timeEntries,
          dayData.isPernocta
        );

        // Get current rates from config store
        const configState = useConfigStore.getState();
        const rates = {
          normal: configState.getNormalRate(),
          saturday: parseFloat(configState.saturdayRate),
          sunday: parseFloat(configState.sundayRate),
          pernocta: parseFloat(configState.pernoctaPrice),
          extra: parseFloat(configState.extraRate),
          dieta: parseFloat(configState.dietaPrice),
        };

        const totalEarnings = get().calculateEarnings(
          hourBreakdown,
          dayData.dietasCount,
          rates,
          dayData.isPernocta
        );

        set((state) => ({
          monthlyData: {
            ...state.monthlyData,
            [dateKey]: {
              ...dayData,
              hourBreakdown,
              totalEarnings,
            },
          },
        }));
      },

      // Database sync actions
      loadMonthFromDatabase: async (user, year, month) => {
        if (!user) return;

        set({ isLoading: true });
        try {
          // Get all days of the month
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const monthDays = [];

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);
            monthDays.push({ date, dateKey });
          }

          // Load all days in parallel
          const dayDataPromises = monthDays.map(async ({ dateKey }) => {
            try {
              const timeEntries = await getTimeEntriesForDate(user, dateKey);
              const dayDataFromEntries = getDayDataFromEntries(timeEntries);

              if (timeEntries.length > 0) {
                const date = new Date(dateKey);
                const dayData: DayData = {
                  date: dateKey,
                  timeEntries: timeEntries.map((entry: any) => ({
                    id: entry.id,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                  })),
                  dietasCount: dayDataFromEntries?.dietasCount ?? 0,
                  isPernocta: dayDataFromEntries?.isPernocta ?? false,
                  vacationType: dayDataFromEntries?.vacationType ?? "none",
                  hourBreakdown: { normal: 0, saturday: 0, sunday: 0, pernocta: 0, extra: 0, total: 0 },
                  totalEarnings: 0,
                };

                // Calculate hour breakdown and earnings
                const hourBreakdown = get().calculateHourBreakdown(date, dayData.timeEntries, dayData.isPernocta);
                const configState = useConfigStore.getState();
                const rates = {
                  normal: configState.getNormalRate(),
                  saturday: parseFloat(configState.saturdayRate),
                  sunday: parseFloat(configState.sundayRate),
                  pernocta: parseFloat(configState.pernoctaPrice),
                  extra: parseFloat(configState.extraRate),
                  dieta: parseFloat(configState.dietaPrice),
                };
                const totalEarnings = get().calculateEarnings(hourBreakdown, dayData.dietasCount, rates, dayData.isPernocta);

                return {
                  dateKey,
                  dayData: {
                    ...dayData,
                    hourBreakdown,
                    totalEarnings,
                  },
                };
              }
              return { dateKey, dayData: null };
            } catch (error) {
              console.error(`Failed to load data for ${dateKey}:`, error);
              return { dateKey, dayData: null };
            }
          });

          const results = await Promise.all(dayDataPromises);

          // Clear existing month data and update with fresh data from database
          set((state) => {
            const newMonthlyData = { ...state.monthlyData };
            const currentLoadedDates =
              state.loadedDates instanceof Set ? state.loadedDates : new Set<string>();
            const newLoadedDates = new Set<string>();

            // Preserve loaded dates from other months
            currentLoadedDates.forEach((dateKey) => {
              const date = new Date(dateKey);
              if (date.getFullYear() !== year || date.getMonth() !== month) {
                newLoadedDates.add(String(dateKey));
              }
            });

            // Clear existing month data to ensure integrity
            Object.keys(newMonthlyData).forEach((dateKey) => {
              const date = new Date(dateKey);
              if (date.getFullYear() === year && date.getMonth() === month) {
                delete newMonthlyData[dateKey];
              }
            });

            // Add fresh data from database
            results.forEach(({ dateKey, dayData }) => {
              newLoadedDates.add(dateKey);
              if (dayData) {
                newMonthlyData[dateKey] = dayData;
              }
            });

            return {
              ...state,
              monthlyData: newMonthlyData,
              loadedDates: newLoadedDates,
            };
          });
        } catch (error) {
          console.error("Failed to load month data from database:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      loadDayFromDatabase: async (user, date) => {
        if (!user) return;

        const dateKey = formatDateKey(date);
        const { loadedDates } = get();

        // Ensure loadedDates is a Set
        const loadedDatesSet = loadedDates instanceof Set ? loadedDates : new Set();

        if (loadedDatesSet.has(dateKey)) return;

        set({ isLoading: true });
        try {
          const timeEntries = await getTimeEntriesForDate(user, dateKey);
          const dayDataFromEntries = getDayDataFromEntries(timeEntries);

          if (timeEntries.length > 0) {
            const dayData: DayData = {
              date: dateKey,
              timeEntries: timeEntries.map((entry: any) => ({
                id: entry.id,
                startTime: entry.startTime,
                endTime: entry.endTime,
              })),
              dietasCount: dayDataFromEntries?.dietasCount ?? 0,
              isPernocta: dayDataFromEntries?.isPernocta ?? false,
              vacationType: dayDataFromEntries?.vacationType ?? "none",
              hourBreakdown: { normal: 0, saturday: 0, sunday: 0, pernocta: 0, extra: 0, total: 0 },
              totalEarnings: 0,
            };

            // Calculate hour breakdown and earnings
            const hourBreakdown = get().calculateHourBreakdown(date, dayData.timeEntries, dayData.isPernocta);
            const configState = useConfigStore.getState();
            const rates = {
              normal: configState.getNormalRate(),
              saturday: parseFloat(configState.saturdayRate),
              sunday: parseFloat(configState.sundayRate),
              pernocta: parseFloat(configState.pernoctaPrice),
              extra: parseFloat(configState.extraRate),
              dieta: parseFloat(configState.dietaPrice),
            };
            const totalEarnings = get().calculateEarnings(hourBreakdown, dayData.dietasCount, rates, dayData.isPernocta);

            const finalDayData = {
              ...dayData,
              hourBreakdown,
              totalEarnings,
            };

            set((state) => {
              const currentLoadedDates =
                state.loadedDates instanceof Set ? state.loadedDates : new Set<string>();
              const newLoadedDates = new Set<string>();
              currentLoadedDates.forEach((date) => newLoadedDates.add(String(date)));
              newLoadedDates.add(dateKey);
              return {
                monthlyData: {
                  ...state.monthlyData,
                  [dateKey]: finalDayData,
                },
                loadedDates: newLoadedDates,
              };
            });
          } else {
            set((state) => {
              const currentLoadedDates =
                state.loadedDates instanceof Set ? state.loadedDates : new Set<string>();
              const newLoadedDates = new Set<string>();
              currentLoadedDates.forEach((date) => newLoadedDates.add(String(date)));
              newLoadedDates.add(dateKey);
              return {
                loadedDates: newLoadedDates,
              };
            });
          }
        } catch (error) {
          console.error("Failed to load day data from database:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncDayToDatabase: async (user, date) => {
        if (!user) return;

        const dateKey = formatDateKey(date);
        const dayData = get().getDayData(date);

        try {
          // Sync time entries with day-level data
          await syncTimeEntriesForDate(user, dateKey, dayData.timeEntries, {
            dietasCount: dayData.dietasCount,
            isPernocta: dayData.isPernocta,
            vacationType: dayData.vacationType,
          });
        } catch (error) {
          console.error("Failed to sync day data to database:", error);
        }
      },

      getMonthlyHours: (year, month) => {
        const state = get();
        const monthlyBreakdown: HourBreakdown = {
          normal: 0,
          saturday: 0,
          sunday: 0,
          pernocta: 0,
          extra: 0,
          total: 0,
        };

        Object.values(state.monthlyData).forEach((dayData) => {
          const dayDate = new Date(dayData.date);
          if (dayDate.getFullYear() === year && dayDate.getMonth() === month) {
            // Include all days including vacation days in the hour counts
            Object.keys(monthlyBreakdown).forEach((key) => {
              const value = dayData.hourBreakdown[key as keyof HourBreakdown];
              monthlyBreakdown[key as keyof HourBreakdown] += isNaN(value) ? 0 : value;
            });
          }
        });

        return monthlyBreakdown;
      },

      getMonthlyEarnings: (year, month) => {
        const { monthlyData } = get();
        let totalEarnings = 0;

        Object.values(monthlyData).forEach((dayData) => {
          const dayDate = new Date(dayData.date);
          if (dayDate.getFullYear() === year && dayDate.getMonth() === month) {
            // Include all days, including vacation days, in earnings calculation
            const earnings = isNaN(dayData.totalEarnings) ? 0 : dayData.totalEarnings;
            totalEarnings += earnings;
          }
        });

        return totalEarnings;
      },

      getMonthlyDays: (year, month) => {
        const { monthlyData } = get();
        return Object.values(monthlyData).filter((dayData) => {
          const dayDate = new Date(dayData.date);
          return dayDate.getFullYear() === year && dayDate.getMonth() === month;
        });
      },

      getMonthlyDietas: (year, month) => {
        const { monthlyData } = get();
        const configState = useConfigStore.getState();
        const dietaPrice = parseFloat(configState.dietaPrice) || 0;

        let totalCount = 0;

        Object.values(monthlyData).forEach((dayData) => {
          const dayDate = new Date(dayData.date);
          if (dayDate.getFullYear() === year && dayDate.getMonth() === month) {
            if (dayData.vacationType === "none") {
              totalCount += dayData.dietasCount || 0;
            }
          }
        });

        return {
          count: totalCount,
          totalCost: totalCount * dietaPrice,
        };
      },

      getMonthlyPernocta: (year, month) => {
        const { monthlyData } = get();
        const configState = useConfigStore.getState();
        const pernoctaPrice = parseFloat(configState.pernoctaPrice) || 0;

        let totalCount = 0;

        Object.values(monthlyData).forEach((dayData) => {
          const dayDate = new Date(dayData.date);
          if (dayDate.getFullYear() === year && dayDate.getMonth() === month) {
            if (dayData.vacationType === "none" && dayData.isPernocta) {
              totalCount += 1;
            }
          }
        });

        return {
          count: totalCount,
          totalCost: totalCount * pernoctaPrice,
        };
      },

      getYearlyVacationStats: (year) => {
        const { monthlyData } = get();
        const vacationDays = Object.values(monthlyData).filter((dayData) => {
          const dayDate = new Date(dayData.date);
          return dayDate.getFullYear() === year && dayData.vacationType !== "none";
        });

        const fullDays = vacationDays.filter((day) => day.vacationType === "full_day").length;
        const halfDays = vacationDays.filter((day) => day.vacationType === "half_day").length;
        const totalVacationDays = fullDays + halfDays * 0.5;

        return {
          fullDays,
          halfDays,
          totalVacationDays,
          vacationDays: vacationDays.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        };
      },

      getMonthlyVacationStats: (year, month) => {
        const { monthlyData } = get();
        const vacationDays = Object.values(monthlyData).filter((dayData) => {
          const dayDate = new Date(dayData.date);
          return (
            dayDate.getFullYear() === year &&
            dayDate.getMonth() === month &&
            dayData.vacationType !== "none"
          );
        });

        const fullDays = vacationDays.filter((day) => day.vacationType === "full_day").length;
        const halfDays = vacationDays.filter((day) => day.vacationType === "half_day").length;
        const totalVacationDays = fullDays + halfDays * 0.5;

        return {
          fullDays,
          halfDays,
          totalVacationDays,
          vacationDays: vacationDays.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        };
      },

      clearDayData: async (date) => {
        const dateKey = formatDateKey(date);
        set((state) => {
          const newMonthlyData = { ...state.monthlyData };
          const currentLoadedDates =
            state.loadedDates instanceof Set ? state.loadedDates : new Set<string>();
          const newLoadedDates = new Set<string>();
          currentLoadedDates.forEach((date) => newLoadedDates.add(String(date)));
          delete newMonthlyData[dateKey];
          newLoadedDates.delete(dateKey);
          return {
            monthlyData: newMonthlyData,
            loadedDates: newLoadedDates,
          };
        });
      },

      clearMonthData: (year, month) => {
        set((state) => {
          const newMonthlyData = { ...state.monthlyData };
          Object.keys(newMonthlyData).forEach((dateKey) => {
            const date = new Date(dateKey);
            if (date.getFullYear() === year && date.getMonth() === month) {
              delete newMonthlyData[dateKey];
            }
          });
          return { monthlyData: newMonthlyData };
        });
      },

      exportMonthData: (year, month) => {
        const monthlyDays = get().getMonthlyDays(year, month);
        const monthlyHours = get().getMonthlyHours(year, month);
        const monthlyEarnings = get().getMonthlyEarnings(year, month);

        // Count all working days including vacation days
        const workingDays = monthlyDays.length;

        return {
          year,
          month,
          days: monthlyDays,
          summary: {
            hours: monthlyHours,
            totalEarnings: monthlyEarnings,
            workingDays,
          },
        };
      },
    }),
    {
      name: "facility-time-entries-storage",
      partialize: (state) => ({
        monthlyData: state.monthlyData,
        selectedDate: state.selectedDate,
      }),
    }
  )
);