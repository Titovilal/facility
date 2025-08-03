"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useConfigActions, useConfigStore, useInitializeConfig } from "./use-config-store";

function ConfigurationForm() {
  // Initialize config from database
  useInitializeConfig();

  const {
    annualSalary,
    weeklyHours,
    extraRate,
    saturdayRate,
    sundayRate,
    dietaPrice,
    pernoctaPrice,
    paymentType,
    dailyHourLimit,
    hasDieta,
    hasPernocta,
    maxVacationDays,
    segundaPagaMonths,
    getNormalRate,
  } = useConfigStore();

  // Use synced actions that save to database
  const {
    setAnnualSalary,
    setWeeklyHours,
    setExtraRate,
    setSaturdayRate,
    setSundayRate,
    setDietaPrice,
    setPernoctaPrice,
    setPaymentType,
    setDailyHourLimit,
    setHasDieta,
    setHasPernocta,
    setMaxVacationDays,
    setSegundaPagaMonths,
  } = useConfigActions();

  const normalRate = getNormalRate();

  // Mapa de meses para evitar repetición
  const monthsMap = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  return (
    <div className="space-y-4">
      {/* Salario Base */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">Salario Base</h3>

          <div className="space-y-2">
            <Label htmlFor="annual-salary" className="text-muted-foreground text-xs">
              Salario Bruto Anual (€)
            </Label>
            <Input
              id="annual-salary"
              type="number"
              step="100"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly-hours" className="text-muted-foreground text-xs">
              Horas de trabajo por semana
            </Label>
            <Input
              id="weekly-hours"
              type="number"
              step="1"
              min="1"
              max="60"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              className="text-center"
            />
          </div>

          {/* Cálculo automático del precio por hora normal */}
          <div className="bg-muted mt-3 space-y-1 rounded-md p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio hora normal:</span>
              <span className="font-medium">€{normalRate.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarifas de Horas */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">Tarifas por Hora (€)</h3>

          <div className="space-y-2">
            <Label htmlFor="extra-rate" className="text-muted-foreground text-xs">
              Horas Extra (solo después de {dailyHourLimit}h/día)
            </Label>
            <Input
              id="extra-rate"
              type="number"
              step="0.01"
              value={extraRate}
              onChange={(e) => setExtraRate(e.target.value)}
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saturday-rate" className="text-muted-foreground text-xs">
              Horas Sábado
            </Label>
            <Input
              id="saturday-rate"
              type="number"
              step="0.01"
              value={saturdayRate}
              onChange={(e) => setSaturdayRate(e.target.value)}
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sunday-rate" className="text-muted-foreground text-xs">
              Horas Domingo
            </Label>
            <Input
              id="sunday-rate"
              type="number"
              step="0.01"
              value={sundayRate}
              onChange={(e) => setSundayRate(e.target.value)}
              className="text-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Otras Configuraciones */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">Otras Configuraciones</h3>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-dieta"
              checked={hasDieta}
              onCheckedChange={(checked) => setHasDieta(checked === true)}
            />
            <Label htmlFor="has-dieta" className="text-sm font-medium">
              Cobro dietas
            </Label>
          </div>

          {hasDieta && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="dieta-price" className="text-muted-foreground text-xs">
                Precio por Dieta (€)
              </Label>
              <Input
                id="dieta-price"
                type="number"
                step="0.01"
                value={dietaPrice}
                onChange={(e) => setDietaPrice(e.target.value)}
                className="text-center"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-pernocta"
              checked={hasPernocta}
              onCheckedChange={(checked) => setHasPernocta(checked === true)}
            />
            <Label htmlFor="has-pernocta" className="text-sm font-medium">
              Duermo en el trabajo (pernocta)
            </Label>
          </div>

          {hasPernocta && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="pernocta-price" className="text-muted-foreground text-xs">
                Precio Pernocta (€)
              </Label>
              <Input
                id="pernocta-price"
                type="number"
                step="0.01"
                value={pernoctaPrice}
                onChange={(e) => setPernoctaPrice(e.target.value)}
                className="text-center"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="daily-limit" className="text-muted-foreground text-xs">
              Horas a partir de las cuales se perciben como extra
            </Label>
            <Input
              id="daily-limit"
              type="number"
              min="1"
              max="12"
              value={dailyHourLimit}
              onChange={(e) => setDailyHourLimit(e.target.value)}
              className="text-center"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-type" className="text-muted-foreground text-xs">
              Tipo de Pago
            </Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Pagas</SelectItem>
                <SelectItem value="14">14 Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === "14" && (
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs">Meses de Segunda Paga</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="primera-paga-extra" className="text-muted-foreground text-xs">
                    Primera Paga Extra
                  </Label>
                  <Select
                    value={segundaPagaMonths.split(",")[0] || "6"}
                    onValueChange={(value) => {
                      const months = segundaPagaMonths.split(",").filter(Boolean);
                      const newMonths = [value, months[1] || "12"].sort(
                        (a, b) => parseInt(a) - parseInt(b)
                      );
                      setSegundaPagaMonths(newMonths.join(","));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthsMap.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segunda-paga-extra" className="text-muted-foreground text-xs">
                    Segunda Paga Extra
                  </Label>
                  <Select
                    value={segundaPagaMonths.split(",")[1] || "12"}
                    onValueChange={(value) => {
                      const months = segundaPagaMonths.split(",").filter(Boolean);
                      const newMonths = [months[0] || "6", value].sort(
                        (a, b) => parseInt(a) - parseInt(b)
                      );
                      setSegundaPagaMonths(newMonths.join(","));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthsMap.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="max-vacation-days" className="text-muted-foreground text-xs">
              Días máximos de vacaciones al año
            </Label>
            <Input
              id="max-vacation-days"
              type="number"
              min="1"
              value={maxVacationDays}
              onChange={(e) => setMaxVacationDays(e.target.value)}
              className="text-center"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ConfigurationDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="fixed right-0 bottom-0 left-0 max-h-[60dvh]">
        <DrawerTitle className="sr-only">Configuración</DrawerTitle>
        <ScrollArea className="overflow-auto p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Configuración</h2>
            </div>

            <ConfigurationForm />

            <div className="flex flex-col gap-2 pt-2">
              <DrawerClose asChild>
                <Button className="w-full">Cerrar</Button>
              </DrawerClose>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
