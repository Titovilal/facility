import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimeEntry = {
  id: string;
  startTime: string;
  endTime: string;
};

export type HourBreakdown = {
  normal: number;
  saturday: number;
  sunday: number;
  pernocta: number;
  nocturnal: number;
  total: number;
};

export type DayData = {
  date: string; // YYYY-MM-DD format
  timeEntries: TimeEntry[];
  dietasCount: number;
  isPernocta: boolean;
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
  
  // Actions for day management
  setSelectedDate: (date: Date | undefined) => void;
  
  // Actions for time entries
  getDayData: (date: Date) => DayData;
  setTimeEntries: (date: Date, timeEntries: TimeEntry[]) => void;
  addTimeEntry: (date: Date) => void;
  removeTimeEntry: (date: Date, entryId: string) => void;
  updateTimeEntry: (date: Date, entryId: string, field: 'startTime' | 'endTime', value: string) => void;
  
  // Actions for dietas and pernocta
  setDietasCount: (date: Date, count: number) => void;
  setIsPernocta: (date: Date, isPernocta: boolean) => void;
  
  // Actions for calculations
  calculateHourBreakdown: (date: Date, timeEntries: TimeEntry[], isPernocta: boolean) => HourBreakdown;
  calculateEarnings: (hourBreakdown: HourBreakdown, dietasCount: number, rates?: {
    normal: number;
    saturday: number;
    sunday: number;
    pernocta: number;
    nocturnal: number;
    dieta: number;
  }) => number;
  updateDayCalculations: (date: Date) => void;
  
  // Monthly summary functions
  getMonthlyHours: (year: number, month: number) => HourBreakdown;
  getMonthlyEarnings: (year: number, month: number) => number;
  getMonthlyDays: (year: number, month: number) => DayData[];
  
  // Utility functions
  clearDayData: (date: Date) => void;
  clearMonthData: (year: number, month: number) => void;
  exportMonthData: (year: number, month: number) => {
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
    throw new Error('Invalid date provided to formatDateKey');
  }
  return date.toISOString().split('T')[0];
};

const defaultDayData = (date: Date): DayData => ({
  date: formatDateKey(date),
  timeEntries: [{
    id: crypto.randomUUID(),
    startTime: '',
    endTime: '',
  }],
  dietasCount: 0,
  isPernocta: false,
  hourBreakdown: {
    normal: 0,
    saturday: 0,
    sunday: 0,
    pernocta: 0,
    nocturnal: 0,
    total: 0,
  },
  totalEarnings: 0,
});

export const useTimeEntriesStore = create<TimeEntriesState>()(
  persist(
    (set, get) => ({
      monthlyData: {},
      selectedDate: new Date(),
      
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
          startTime: '',
          endTime: '',
        };
        get().setTimeEntries(date, [...dayData.timeEntries, newEntry]);
      },
      
      removeTimeEntry: (date, entryId) => {
        const dayData = get().getDayData(date);
        if (dayData.timeEntries.length > 1) {
          const filteredEntries = dayData.timeEntries.filter(entry => entry.id !== entryId);
          get().setTimeEntries(date, filteredEntries);
        }
      },
      
      updateTimeEntry: (date, entryId, field, value) => {
        const dayData = get().getDayData(date);
        const updatedEntries = dayData.timeEntries.map(entry =>
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
      
      calculateHourBreakdown: (date, timeEntries, isPernocta) => {
        const breakdown: HourBreakdown = {
          normal: 0,
          saturday: 0,
          sunday: 0,
          pernocta: 0,
          nocturnal: 0,
          total: 0,
        };
        
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        let totalHours = 0;
        
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
            if (dayOfWeek === 0) { // Sunday
              breakdown.sunday += diffHours;
            } else if (dayOfWeek === 6) { // Saturday
              breakdown.saturday += diffHours;
            } else { // Normal weekday
              breakdown.normal += diffHours;
            }
            
            // Add pernocta hours if enabled
            if (isPernocta) {
              breakdown.pernocta += diffHours;
            }
            
            totalHours += diffHours;
          }
        });
        
        // Handle overtime for normal weekdays only
        if (totalHours > 8 && dayOfWeek !== 0 && dayOfWeek !== 6) {
          const excessHours = totalHours - 8;
          const hoursToMove = Math.min(breakdown.normal, excessHours);
          breakdown.normal -= hoursToMove;
          breakdown.nocturnal += hoursToMove;
        }
        
        breakdown.total = totalHours;
        return breakdown;
      },
      
      calculateEarnings: (hourBreakdown, dietasCount, rates) => {
        const defaultRates = {
          normal: 15.60,
          saturday: 23.40,
          sunday: 31.20,
          pernocta: 23.40,
          nocturnal: 23.40,
          dieta: 5.00,
        };
        
        const finalRates = rates || defaultRates;
        
        const earnings = 
          (hourBreakdown.normal * finalRates.normal) +
          (hourBreakdown.saturday * finalRates.saturday) +
          (hourBreakdown.sunday * finalRates.sunday) +
          (hourBreakdown.pernocta * finalRates.pernocta) +
          (hourBreakdown.nocturnal * finalRates.nocturnal) +
          (dietasCount * finalRates.dieta);
        
        return earnings;
      },
      
      updateDayCalculations: (date) => {
        const dateKey = formatDateKey(date);
        const dayData = get().getDayData(date);
        const hourBreakdown = get().calculateHourBreakdown(date, dayData.timeEntries, dayData.isPernocta);
        const totalEarnings = get().calculateEarnings(hourBreakdown, dayData.dietasCount);
        
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
      
      getMonthlyHours: (year, month) => {
        const state = get();
        const monthlyBreakdown: HourBreakdown = {
          normal: 0,
          saturday: 0,
          sunday: 0,
          pernocta: 0,
          nocturnal: 0,
          total: 0,
        };
        
        Object.values(state.monthlyData).forEach((dayData) => {
          const dayDate = new Date(dayData.date);
          if (dayDate.getFullYear() === year && dayDate.getMonth() === month) {
            Object.keys(monthlyBreakdown).forEach((key) => {
              monthlyBreakdown[key as keyof HourBreakdown] += dayData.hourBreakdown[key as keyof HourBreakdown];
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
            totalEarnings += dayData.totalEarnings;
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
      
      clearDayData: (date) => {
        const dateKey = formatDateKey(date);
        set((state) => {
          const newMonthlyData = { ...state.monthlyData };
          delete newMonthlyData[dateKey];
          return { monthlyData: newMonthlyData };
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
        
        return {
          year,
          month,
          days: monthlyDays,
          summary: {
            hours: monthlyHours,
            totalEarnings: monthlyEarnings,
            workingDays: monthlyDays.length,
          },
        };
      },
    }),
    {
      name: 'facility-time-entries-storage',
    }
  )
);