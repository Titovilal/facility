/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOrCreateUserConfig, updateUserConfigFields } from "@/db/actions/config";
import { useUser } from "@stackframe/stack";
import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  // Salario Base
  annualSalary: string;
  monthlyNet: string;
  paymentType: string;

  // Tarifas por Hora
  normalRate: string;
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

  // Loading state
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAnnualSalary: (value: string) => void;
  setMonthlyNet: (value: string) => void;
  setPaymentType: (value: string) => void;
  setNormalRate: (value: string) => void;
  setExtraRate: (value: string) => void;
  setSaturdayRate: (value: string) => void;
  setSundayRate: (value: string) => void;
  setDailyHourLimit: (value: string) => void;
  setHasDieta: (value: boolean) => void;
  setDietaPrice: (value: string) => void;
  setHasPernocta: (value: boolean) => void;
  setPernoctaPrice: (value: string) => void;
  setMaxVacationDays: (value: string) => void;

  // Database sync actions
  initializeFromDatabase: (user: any) => Promise<void>;
  syncToDatabase: (user: any, field: string, value: string | boolean) => Promise<void>;

  // Computed values
  getGovernmentTake: () => {
    annualNet: number;
    governmentTake: number;
    governmentPercentage: number;
  };
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial values
      annualSalary: "0",
      monthlyNet: "0",
      paymentType: "0",
      normalRate: "0",
      extraRate: "0",
      saturdayRate: "0",
      sundayRate: "0",
      dailyHourLimit: "0",
      hasDieta: false,
      dietaPrice: "0",
      hasPernocta: false,
      pernoctaPrice: "0",
      maxVacationDays: "0",
      isLoading: false,
      isInitialized: false,

      // Actions
      setAnnualSalary: (value) => set({ annualSalary: value }),
      setMonthlyNet: (value) => set({ monthlyNet: value }),
      setPaymentType: (value) => set({ paymentType: value }),
      setNormalRate: (value) => set({ normalRate: value }),
      setExtraRate: (value) => set({ extraRate: value }),
      setSaturdayRate: (value) => set({ saturdayRate: value }),
      setSundayRate: (value) => set({ sundayRate: value }),
      setDailyHourLimit: (value) => set({ dailyHourLimit: value }),
      setHasDieta: (value) => set({ hasDieta: value }),
      setDietaPrice: (value) => set({ dietaPrice: value }),
      setHasPernocta: (value) => set({ hasPernocta: value }),
      setPernoctaPrice: (value) => set({ pernoctaPrice: value }),
      setMaxVacationDays: (value) => set({ maxVacationDays: value }),

      // Database sync actions
      initializeFromDatabase: async (user) => {
        if (!user || get().isInitialized) return;

        set({ isLoading: true });
        try {
          const config = await getOrCreateUserConfig(user);
          set({
            annualSalary: config.annualSalary,
            monthlyNet: config.monthlyNet,
            paymentType: config.paymentType,
            normalRate: config.normalRate,
            extraRate: config.extraRate,
            saturdayRate: config.saturdayRate,
            sundayRate: config.sundayRate,
            dailyHourLimit: config.dailyHourLimit,
            hasDieta: config.hasDieta,
            dietaPrice: config.dietaPrice,
            hasPernocta: config.hasPernocta,
            pernoctaPrice: config.pernoctaPrice,
            maxVacationDays: config.maxVacationDays,
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
      getGovernmentTake: () => {
        const state = get();
        const annualGross = parseFloat(state.annualSalary) || 0;
        const monthlyNetAmount = parseFloat(state.monthlyNet) || 0;
        const pagas = parseInt(state.paymentType);
        const annualNet = monthlyNetAmount * pagas;
        const governmentTake = annualGross - annualNet;
        const governmentPercentage = annualGross > 0 ? (governmentTake / annualGross) * 100 : 0;

        return {
          annualNet,
          governmentTake,
          governmentPercentage,
        };
      },
    }),
    {
      name: "facility-config-storage",
    }
  )
);

// Hook to initialize config store with user data
export const useInitializeConfig = () => {
  const user = useUser();
  const initializeFromDatabase = useConfigStore((state) => state.initializeFromDatabase);
  const isInitialized = useConfigStore((state) => state.isInitialized);

  React.useEffect(() => {
    if (user && !isInitialized) {
      initializeFromDatabase(user);
    }
  }, [user, isInitialized, initializeFromDatabase]);
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
    setMonthlyNet: createSyncedSetter("monthlyNet", store.setMonthlyNet),
    setPaymentType: createSyncedSetter("paymentType", store.setPaymentType),
    setNormalRate: createSyncedSetter("normalRate", store.setNormalRate),
    setExtraRate: createSyncedSetter("extraRate", store.setExtraRate),
    setSaturdayRate: createSyncedSetter("saturdayRate", store.setSaturdayRate),
    setSundayRate: createSyncedSetter("sundayRate", store.setSundayRate),
    setDailyHourLimit: createSyncedSetter("dailyHourLimit", store.setDailyHourLimit),
    setHasDieta: createSyncedSetter("hasDieta", store.setHasDieta),
    setDietaPrice: createSyncedSetter("dietaPrice", store.setDietaPrice),
    setHasPernocta: createSyncedSetter("hasPernocta", store.setHasPernocta),
    setPernoctaPrice: createSyncedSetter("pernoctaPrice", store.setPernoctaPrice),
    setMaxVacationDays: createSyncedSetter("maxVacationDays", store.setMaxVacationDays),
  };
};
