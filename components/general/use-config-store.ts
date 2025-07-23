import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      annualSalary: "25000",
      monthlyNet: "1800",
      paymentType: "14",
      normalRate: "15.60",
      extraRate: "23.40",
      saturdayRate: "23.40",
      sundayRate: "31.20",
      dailyHourLimit: "8",
      hasDieta: true,
      dietaPrice: "5.00",
      hasPernocta: true,
      pernoctaPrice: "25.00",
      
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
      name: 'facility-config-storage',
    }
  )
);