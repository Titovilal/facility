"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useConfigStore } from "@/components/general/use-config-store";

type HourBreakdown = {
  normal: number;
  saturday: number;
  sunday: number;
  pernocta: number;
  nocturnal: number;
  total: number;
};

interface HourBreakdownCardProps {
  hourBreakdown: HourBreakdown;
  dietasCount: number;
  totalEarnings: number;
}

export function HourBreakdownCard({ hourBreakdown, dietasCount, totalEarnings }: HourBreakdownCardProps) {
  // Get current rates from config store
  const {
    normalRate,
    extraRate,
    saturdayRate,
    sundayRate,
    dietaPrice,
    pernoctaPrice,
  } = useConfigStore();

  const rates = {
    normal: parseFloat(normalRate),
    saturday: parseFloat(saturdayRate),
    sunday: parseFloat(sundayRate),
    pernocta: parseFloat(pernoctaPrice),
    nocturnal: parseFloat(extraRate),
  };

  const dietaPriceNum = parseFloat(dietaPrice);

  return (
    <Card className="bg-muted/50">
      <CardContent className="px-4 py-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total de Horas</span>
            <span className="text-lg font-bold">
              {hourBreakdown.total.toFixed(1)}h
            </span>
          </div>

          {hourBreakdown.normal > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Normales (€{rates.normal}/h)</span>
              <span>{hourBreakdown.normal.toFixed(1)}h - €{(hourBreakdown.normal * rates.normal).toFixed(2)}</span>
            </div>
          )}

          {hourBreakdown.saturday > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Sábado (€{rates.saturday}/h)</span>
              <span>{hourBreakdown.saturday.toFixed(1)}h - €{(hourBreakdown.saturday * rates.saturday).toFixed(2)}</span>
            </div>
          )}

          {hourBreakdown.sunday > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Domingo (€{rates.sunday}/h)</span>
              <span>{hourBreakdown.sunday.toFixed(1)}h - €{(hourBreakdown.sunday * rates.sunday).toFixed(2)}</span>
            </div>
          )}

          {hourBreakdown.pernocta > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Pernocta (€{rates.pernocta}/h)</span>
              <span>{hourBreakdown.pernocta.toFixed(1)}h - €{(hourBreakdown.pernocta * rates.pernocta).toFixed(2)}</span>
            </div>
          )}

          {hourBreakdown.nocturnal > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Nocturnas (€{rates.nocturnal}/h)</span>
              <span>{hourBreakdown.nocturnal.toFixed(1)}h - €{(hourBreakdown.nocturnal * rates.nocturnal).toFixed(2)}</span>
            </div>
          )}

          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Dietas ({dietasCount % 1 === 0 ? dietasCount.toFixed(0) : dietasCount.toFixed(1)} x €{dietaPriceNum.toFixed(2)})</span>
            <span>€{(dietasCount * dietaPriceNum).toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between border-t pt-2 font-semibold">
            <span>Total del Día</span>
            <span className="text-lg">€{totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}