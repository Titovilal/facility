"use client";

import { useConfigStore } from "@/components/general/use-config-store";
import { Card, CardContent } from "@/components/ui/card";

type HourBreakdown = {
  normal: number;
  saturday: number;
  sunday: number;
  pernocta: number;
  extra: number;
  total: number;
};

interface HourBreakdownCardProps {
  hourBreakdown: HourBreakdown;
  dietasCount: number;
  totalEarnings: number;
}

export function HourBreakdownCard({
  hourBreakdown,
  dietasCount,
  totalEarnings,
}: HourBreakdownCardProps) {
  // Get current rates from config store
  const { getNormalRate, extraRate, saturdayRate, sundayRate, dietaPrice, pernoctaPrice } =
    useConfigStore();

  const rates = {
    normal: getNormalRate() || 0,
    saturday: parseFloat(saturdayRate) || 0,
    sunday: parseFloat(sundayRate) || 0,
    pernocta: parseFloat(pernoctaPrice) || 0,
    extra: parseFloat(extraRate) || 0,
  };

  const dietaPriceNum = parseFloat(dietaPrice) || 0;

  return (
    <Card className="bg-muted/50">
      <CardContent className="px-4 py-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total de Horas</span>
            <span className="text-lg font-bold">{hourBreakdown.total.toFixed(1)}h</span>
          </div>

          {hourBreakdown.normal > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Normales (€{rates.normal.toFixed(2)}/h)</span>
              <span>
                {hourBreakdown.normal.toFixed(2)}h - €
                {(hourBreakdown.normal * rates.normal).toFixed(2)}
              </span>
            </div>
          )}

          {hourBreakdown.saturday > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Sábado (€{rates.saturday}/h)</span>
              <span>
                {hourBreakdown.saturday.toFixed(1)}h - €
                {(hourBreakdown.saturday * rates.saturday).toFixed(2)}
              </span>
            </div>
          )}

          {hourBreakdown.sunday > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Domingo (€{rates.sunday}/h)</span>
              <span>
                {hourBreakdown.sunday.toFixed(1)}h - €
                {(hourBreakdown.sunday * rates.sunday).toFixed(2)}
              </span>
            </div>
          )}

          {hourBreakdown.extra > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>Horas Extra (€{rates.extra}/h)</span>
              <span>
                {hourBreakdown.extra.toFixed(1)}h - €
                {(hourBreakdown.extra * rates.extra).toFixed(2)}
              </span>
            </div>
          )}

          {dietasCount > 0 && (
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>
                Dietas ({dietasCount % 1 === 0 ? dietasCount.toFixed(0) : dietasCount.toFixed(1)} x
                €{dietaPriceNum.toFixed(2)})
              </span>
              <span>€{(dietasCount * dietaPriceNum).toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-2 font-semibold">
            <span>Total del Día</span>
            <span className="text-lg">€{totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
