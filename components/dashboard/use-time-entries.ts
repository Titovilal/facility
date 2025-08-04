/* eslint-disable react-hooks/exhaustive-deps */
import { clearDayData as dbClearDayData } from "@/db/actions/time-entries";
import { useUser } from "@stackframe/stack";
import React, { useEffect } from "react";
import { useConfigStore } from "../navbar/use-config-store";
import { useTimeEntriesStore } from "./use-time-entries-store";

const formatDateKey = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Invalid date provided to formatDateKey");
  }
  // Use UTC to avoid timezone issues when formatting dates
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Hook to load month data from database when needed
export const useLoadMonthData = (year: number, month: number) => {
  const user = useUser();
  const loadMonthFromDatabase = useTimeEntriesStore((state) => state.loadMonthFromDatabase);
  const isLoading = useTimeEntriesStore((state) => state.isLoading);
  const [loadedMonths, setLoadedMonths] = React.useState<Set<string>>(new Set());
  const getMonthlyEarnings = useTimeEntriesStore((state) => state.getMonthlyEarnings);
  const getDayData = useTimeEntriesStore((state) => state.getDayData);

  React.useEffect(() => {
    if (user) {
      const monthKey = `${year}-${month}`;
      if (!loadedMonths.has(monthKey)) {
        loadMonthFromDatabase(user, year, month);
        setLoadedMonths((prev) => new Set(prev).add(monthKey));
      }
    }
  }, [user, year, month, loadMonthFromDatabase, loadedMonths, getMonthlyEarnings, getDayData]);

  return isLoading;
};

// Hook to load day data from database when needed
export const useLoadDayData = (date: Date | undefined) => {
  const user = useUser();
  const loadDayFromDatabase = useTimeEntriesStore((state) => state.loadDayFromDatabase);
  const isLoading = useTimeEntriesStore((state) => state.isLoading);
  const loadedDates = useTimeEntriesStore((state) => state.loadedDates);

  useEffect(() => {
    if (user && date) {
      const dateKey = formatDateKey(date);
      const loadedDatesSet = loadedDates instanceof Set ? loadedDates : new Set();
      if (!loadedDatesSet.has(dateKey)) {
        loadDayFromDatabase(user, date);
      }
    }
  }, [user, date, loadedDates, loadDayFromDatabase]);

  return isLoading;
};

// Hook for time entries actions with database sync
export const useTimeEntriesActions = () => {
  const user = useUser();
  const store = useTimeEntriesStore();

  const createSyncedAction = <T extends unknown[]>(action: (date: Date, ...args: T) => void) => {
    return (date: Date, ...args: T) => {
      action(date, ...args);
      if (user) {
        // Debounced sync to avoid too many database calls
        setTimeout(() => {
          store.syncDayToDatabase(user, date);
        }, 500);
      }
    };
  };

  return {
    setTimeEntries: createSyncedAction(store.setTimeEntries),
    addTimeEntry: createSyncedAction(store.addTimeEntry),
    removeTimeEntry: createSyncedAction(store.removeTimeEntry),
    updateTimeEntry: createSyncedAction(store.updateTimeEntry),
    setDietasCount: createSyncedAction(store.setDietasCount),
    setIsPernocta: createSyncedAction(store.setIsPernocta),
    setVacationType: createSyncedAction(store.setVacationType),
    clearDayData: async (date: Date) => {
      if (user) {
        try {
          await dbClearDayData(user, formatDateKey(date));
        } catch (error) {
          console.error("Failed to clear day data from database:", error);
        }
      }
      store.clearDayData(date);
    },
  };
};

// Hook for date management
export const useDateManagement = () => {
  const { selectedDate, setSelectedDate } = useTimeEntriesStore();
  const [displayedMonth, setDisplayedMonth] = React.useState(new Date());

  // Initialize selectedDate if it's not valid
  React.useEffect(() => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      setSelectedDate(new Date());
    }
  }, [selectedDate, setSelectedDate]);

  // Update displayed month when selectedDate changes (for initial load)
  React.useEffect(() => {
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setDisplayedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    displayedMonth,
    setDisplayedMonth,
  };
};

// Hook for dashboard data calculations
export const useDashboardData = (displayedMonth: Date) => {
  const {
    selectedDate,
    getDayData,
    getMonthlyHours,
    getMonthlyEarnings,
    getMonthlyDietas,
    getMonthlyPernocta,
    getMonthlyVacationStats,
    monthlyData, // Add this to force re-computation when data changes
  } = useTimeEntriesStore();

  const {
    annualSalary,
    paymentType,
    segundaPagaMonths,
    extraRate,
    saturdayRate,
    sundayRate,
    hasDieta,
    dietaPrice,
    hasPernocta,
    pernoctaPrice,
    getNormalRate,
  } = useConfigStore();

  const displayedYear = displayedMonth.getFullYear();
  const displayedMonthIndex = displayedMonth.getMonth();

  // Load time entries data from database for displayed month
  useLoadMonthData(displayedYear, displayedMonthIndex);

  // Function to calculate minimum expected monthly income for displayed month
  const calculateMinimumMonthlyIncome = React.useCallback(() => {
    const salary = parseFloat(annualSalary) || 0;
    const payments = parseFloat(paymentType) || 12;
    const baseMonthlyIncome = salary / payments;

    // Check if displayed month is a segunda paga month
    const displayedMonthNumber = (displayedMonth.getMonth() + 1).toString();
    const extraPayMonths = segundaPagaMonths.split(",").filter(Boolean);
    const isExtraPayMonth = extraPayMonths.includes(displayedMonthNumber);

    return isExtraPayMonth ? baseMonthlyIncome * 2 : baseMonthlyIncome;
  }, [annualSalary, paymentType, segundaPagaMonths, displayedMonth]);

  // Get current day data - ensure selectedDate is a valid Date
  const currentDayData = React.useMemo(() => {
    return selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())
      ? getDayData(selectedDate)
      : null;
  }, [selectedDate, getDayData]);

  // Get relevant month data for dependencies
  const relevantMonthData = React.useMemo(() => {
    return Object.values(monthlyData).filter((dayData) => {
      const dayDate = new Date(dayData.date);
      return dayDate.getFullYear() === displayedYear && dayDate.getMonth() === displayedMonthIndex;
    });
  }, [monthlyData, displayedYear, displayedMonthIndex]);

  // Create dependency strings for proper memoization
  const hoursDepString = React.useMemo(
    () =>
      JSON.stringify(
        relevantMonthData.map((d) => ({ date: d.date, total: d.hourBreakdown.total }))
      ),
    [relevantMonthData]
  );

  const earningsDepString = React.useMemo(
    () =>
      JSON.stringify(relevantMonthData.map((d) => ({ date: d.date, earnings: d.totalEarnings }))),
    [relevantMonthData]
  );

  const dietasDepString = React.useMemo(
    () => JSON.stringify(relevantMonthData.map((d) => ({ date: d.date, dietas: d.dietasCount }))),
    [relevantMonthData]
  );

  const pernoctaDepString = React.useMemo(
    () => JSON.stringify(relevantMonthData.map((d) => ({ date: d.date, pernocta: d.isPernocta }))),
    [relevantMonthData]
  );

  const vacationDepString = React.useMemo(
    () =>
      JSON.stringify(relevantMonthData.map((d) => ({ date: d.date, vacation: d.vacationType }))),
    [relevantMonthData]
  );

  // Get monthly summary for displayed month
  const monthlyHours = React.useMemo(
    () => getMonthlyHours(displayedYear, displayedMonthIndex),
    [getMonthlyHours, displayedYear, displayedMonthIndex, hoursDepString]
  );

  const monthlyEarnings = React.useMemo(
    () => getMonthlyEarnings(displayedYear, displayedMonthIndex),
    [getMonthlyEarnings, displayedYear, displayedMonthIndex, earningsDepString]
  );

  const monthlyDietas = React.useMemo(
    () => getMonthlyDietas(displayedYear, displayedMonthIndex),
    [getMonthlyDietas, displayedYear, displayedMonthIndex, dietasDepString]
  );

  const monthlyPernocta = React.useMemo(
    () => getMonthlyPernocta(displayedYear, displayedMonthIndex),
    [getMonthlyPernocta, displayedYear, displayedMonthIndex, pernoctaDepString]
  );

  const monthlyVacations = React.useMemo(
    () => getMonthlyVacationStats(displayedYear, displayedMonthIndex),
    [getMonthlyVacationStats, displayedYear, displayedMonthIndex, vacationDepString]
  );

  const minimumExpectedIncome = React.useMemo(
    () => calculateMinimumMonthlyIncome(),
    [calculateMinimumMonthlyIncome]
  );

  // Derived calculations
  const isObjectiveMet = React.useMemo(
    () => monthlyEarnings >= minimumExpectedIncome,
    [monthlyEarnings, minimumExpectedIncome]
  );

  const earningsDifference = React.useMemo(
    () => monthlyEarnings - minimumExpectedIncome,
    [monthlyEarnings, minimumExpectedIncome]
  );

  // Total hours earnings calculation
  const totalHoursEarnings = React.useMemo(() => {
    return (
      monthlyHours.normal * getNormalRate() +
      monthlyHours.extra * (parseFloat(extraRate) || 0) +
      monthlyHours.saturday * (parseFloat(saturdayRate) || 0) +
      monthlyHours.sunday * (parseFloat(sundayRate) || 0) +
      (monthlyVacations.fullDays * 8 + monthlyVacations.halfDays * 4) * getNormalRate()
    );
  }, [monthlyHours, monthlyVacations, getNormalRate, extraRate, saturdayRate, sundayRate]);

  // Total allowances calculation
  const totalAllowances = React.useMemo(() => {
    return (hasDieta ? monthlyDietas.totalCost : 0) + (hasPernocta ? monthlyPernocta.totalCost : 0);
  }, [hasDieta, hasPernocta, monthlyDietas.totalCost, monthlyPernocta.totalCost]);

  const totalAllowancesCount = React.useMemo(() => {
    return (hasDieta ? monthlyDietas.count : 0) + (hasPernocta ? monthlyPernocta.count : 0);
  }, [hasDieta, hasPernocta, monthlyDietas.count, monthlyPernocta.count]);

  return {
    // Current day data
    currentDayData,
    selectedDate,

    // Monthly summaries
    monthlyHours,
    monthlyEarnings,
    monthlyDietas,
    monthlyPernocta,
    monthlyVacations,

    // Financial calculations
    minimumExpectedIncome,
    isObjectiveMet,
    earningsDifference,
    totalHoursEarnings,
    totalAllowances,
    totalAllowancesCount,

    // Config data for display
    configData: {
      extraRate: parseFloat(extraRate) || 0,
      saturdayRate: parseFloat(saturdayRate) || 0,
      sundayRate: parseFloat(sundayRate) || 0,
      dietaPrice: parseFloat(dietaPrice) || 0,
      pernoctaPrice: parseFloat(pernoctaPrice) || 0,
      getNormalRate,
      hasDieta,
      hasPernocta,
    },

    // Display data
    displayedYear,
    displayedMonthIndex,
  };
};
