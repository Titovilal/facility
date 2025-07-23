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
import { useConfigStore } from "./use-config-store";
import { toast } from "sonner";

function ConfigurationForm() {
  const {
    annualSalary,
    monthlyNet,
    normalRate,
    extraRate,
    saturdayRate,
    sundayRate,
    dietaPrice,
    pernoctaPrice,
    paymentType,
    dailyHourLimit,
    hasDieta,
    hasPernocta,
    setAnnualSalary,
    setMonthlyNet,
    setNormalRate,
    setExtraRate,
    setSaturdayRate,
    setSundayRate,
    setDietaPrice,
    setPernoctaPrice,
    setPaymentType,
    setDailyHourLimit,
    setHasDieta,
    setHasPernocta,
    getGovernmentTake,
  } = useConfigStore();

  const { annualNet, governmentTake, governmentPercentage } = getGovernmentTake();

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
            <Label htmlFor="monthly-net" className="text-muted-foreground text-xs">
              Salario Neto Mensual (€) (Percibido)
            </Label>
            <Input
              id="monthly-net"
              type="number"
              step="10"
              value={monthlyNet}
              onChange={(e) => setMonthlyNet(e.target.value)}
              className="text-center"
            />
          </div>

          {/* Cálculo automático */}
          <div className="bg-muted mt-3 space-y-1 rounded-md p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Neto Anual:</span>
              <span className="font-medium">€{annualNet.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retención Gobierno:</span>
              <span className="font-medium">€{governmentTake.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">% Retención:</span>
              <span className="font-medium">{governmentPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarifas de Horas */}
      <Card className="py-0">
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-medium">Tarifas por Hora (€)</h3>

          <div className="space-y-2">
            <Label htmlFor="normal-rate" className="text-muted-foreground text-xs">
              Horas Normales
            </Label>
            <Input
              id="normal-rate"
              type="number"
              step="0.01"
              value={normalRate}
              onChange={(e) => setNormalRate(e.target.value)}
              className="text-center"
            />
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}

export function ConfigurationDrawer() {
  const handleSave = () => {
    toast.success("Configuración guardada correctamente");
    // The data is already being saved to the store through the onChange handlers
  };

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
                <Button className="w-full" onClick={handleSave}>
                  Guardar Configuración
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </DrawerClose>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
