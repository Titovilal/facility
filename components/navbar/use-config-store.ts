/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOrCreateUserConfig, updateUserConfigFields } from "@/db/actions/config";
import { useUser } from "@stackframe/stack";
import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  // Salario Base
  annualSalary: string;
  weeklyHours: string;
  paymentType: string;

  // Tarifas por Hora
  extraRate: string;
  saturdayRate: string;
  sundayRate: string;

  // Límite de horas
  dailyHourLimit: string;

  // Dietas y Pernocta
  hasDieta: boolean;
  dietaPrice: string;
  hasPernocta: boolean;
  pernoctaPrice: string;

  // Vacaciones
  maxVacationDays: string;

  // Segunda paga (14 pagas)
  segundaPagaMonths: string;

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAnnualSalary: (value: string) => void;
  setWeeklyHours: (value: string) => void;
  setPaymentType: (value: string) => void;
  setExtraRate: (value: string) => void;
  setSaturdayRate: (value: string) => void;
  setSundayRate: (value: string) => void;
  setDailyHourLimit: (value: string) => void;
  setHasDieta: (value: boolean) => void;
  setDietaPrice: (value: string) => void;
  setHasPernocta: (value: boolean) => void;
  setPernoctaPrice: (value: string) => void;
  setMaxVacationDays: (value: string) => void;
  setSegundaPagaMonths: (value: string) => void;

  // Database sync actions
  initializeFromDatabase: (user: any) => Promise<void>;
  syncToDatabase: (user: any, field: string, value: string | boolean) => Promise<void>;

  // Computed values
  getNormalRate: () => number;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial values
      annualSalary: "0",
      weeklyHours: "40",
      paymentType: "12",
      extraRate: "0",
      saturdayRate: "0",
      sundayRate: "0",
      dailyHourLimit: "0",
      hasDieta: false,
      dietaPrice: "0",
      hasPernocta: false,
      pernoctaPrice: "0",
      maxVacationDays: "0",
      segundaPagaMonths: "6,12",
      isLoading: false,
      isInitialized: false,

      // Actions
      setAnnualSalary: (value) => set({ annualSalary: value }),
      setWeeklyHours: (value) => set({ weeklyHours: value }),
      setPaymentType: (value) => set({ paymentType: value }),
      setExtraRate: (value) => set({ extraRate: value }),
      setSaturdayRate: (value) => set({ saturdayRate: value }),
      setSundayRate: (value) => set({ sundayRate: value }),
      setDailyHourLimit: (value) => set({ dailyHourLimit: value }),
      setHasDieta: (value) => set({ hasDieta: value }),
      setDietaPrice: (value) => set({ dietaPrice: value }),
      setHasPernocta: (value) => set({ hasPernocta: value }),
      setPernoctaPrice: (value) => set({ pernoctaPrice: value }),
      setMaxVacationDays: (value) => set({ maxVacationDays: value }),
      setSegundaPagaMonths: (value) => set({ segundaPagaMonths: value }),

      // Database sync actions
      initializeFromDatabase: async (user) => {
        if (!user) return;

        set({ isLoading: true });
        try {
          const config = await getOrCreateUserConfig(user);
          set({
            annualSalary: config.annualSalary,
            weeklyHours: config.weeklyHours,
            paymentType: config.paymentType,
            extraRate: config.extraRate,
            saturdayRate: config.saturdayRate,
            sundayRate: config.sundayRate,
            dailyHourLimit: config.dailyHourLimit,
            hasDieta: config.hasDieta,
            dietaPrice: config.dietaPrice,
            hasPernocta: config.hasPernocta,
            pernoctaPrice: config.pernoctaPrice,
            maxVacationDays: config.maxVacationDays,
            segundaPagaMonths: config.segundaPagaMonths,
            isInitialized: true,
          });
        } catch (error) {
          console.error("Failed to initialize config from database:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      syncToDatabase: async (user, field, value) => {
        if (!user) return;

        try {
          await updateUserConfigFields(user, { [field]: value });
        } catch (error) {
          console.error(`Failed to sync ${field} to database:`, error);
        }
      },

      // Computed function
      getNormalRate: () => {
        const state = get();
        const annualSalary = parseFloat(state.annualSalary) || 0;
        const weeklyHours = parseFloat(state.weeklyHours) || 40;
        const annualHours = weeklyHours * 52;
        return annualHours > 0 ? annualSalary / annualHours : 0;
      },
    }),
    {
      name: "facility-config-storage",
      partialize: (state) => ({
        // Solo persistir valores de configuración, no el estado de inicialización
        annualSalary: state.annualSalary,
        weeklyHours: state.weeklyHours,
        paymentType: state.paymentType,
        extraRate: state.extraRate,
        saturdayRate: state.saturdayRate,
        sundayRate: state.sundayRate,
        dailyHourLimit: state.dailyHourLimit,
        hasDieta: state.hasDieta,
        dietaPrice: state.dietaPrice,
        hasPernocta: state.hasPernocta,
        pernoctaPrice: state.pernoctaPrice,
        maxVacationDays: state.maxVacationDays,
        segundaPagaMonths: state.segundaPagaMonths,
        // NO persistir isInitialized para permitir refrescos desde DB
      }),
    }
  )
);

// Hook to initialize config store with user data
export const useInitializeConfig = () => {
  const user = useUser();
  const initializeFromDatabase = useConfigStore((state) => state.initializeFromDatabase);

  React.useEffect(() => {
    if (user) {
      initializeFromDatabase(user);
    }
  }, [user, initializeFromDatabase]);
};

// Hook for config setters with database sync
export const useConfigActions = () => {
  const user = useUser();
  const store = useConfigStore();

  const createSyncedSetter = (field: keyof ConfigState, setter: (value: any) => void) => {
    return async (value: any) => {
      setter(value);
      if (user) {
        try {
          await updateUserConfigFields(user, { [field]: value });
        } catch (error) {
          console.error(`Failed to sync ${String(field)} to database:`, error);
        }
      }
    };
  };

  return {
    setAnnualSalary: createSyncedSetter("annualSalary", store.setAnnualSalary),
    setWeeklyHours: createSyncedSetter("weeklyHours", store.setWeeklyHours),
    setPaymentType: createSyncedSetter("paymentType", store.setPaymentType),
    setExtraRate: createSyncedSetter("extraRate", store.setExtraRate),
    setSaturdayRate: createSyncedSetter("saturdayRate", store.setSaturdayRate),
    setSundayRate: createSyncedSetter("sundayRate", store.setSundayRate),
    setDailyHourLimit: createSyncedSetter("dailyHourLimit", store.setDailyHourLimit),
    setHasDieta: createSyncedSetter("hasDieta", store.setHasDieta),
    setDietaPrice: createSyncedSetter("dietaPrice", store.setDietaPrice),
    setHasPernocta: createSyncedSetter("hasPernocta", store.setHasPernocta),
    setPernoctaPrice: createSyncedSetter("pernoctaPrice", store.setPernoctaPrice),
    setMaxVacationDays: createSyncedSetter("maxVacationDays", store.setMaxVacationDays),
    setSegundaPagaMonths: createSyncedSetter("segundaPagaMonths", store.setSegundaPagaMonths),
  };
};
