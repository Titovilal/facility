"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Utensils } from "lucide-react";
import { useConfigStore } from "@/components/general/use-config-store";

interface DietasCounterProps {
  count: number;
  onChange: (count: number) => void;
}

export function DietasCounter({ count, onChange }: DietasCounterProps) {
  const { dietaPrice } = useConfigStore();
  
  const handleDecrement = () => {
    onChange(Math.max(0, count - 0.5));
  };

  const handleIncrement = () => {
    onChange(count + 0.5);
  };

  return (
    <Card className="p-0">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="text-muted-foreground h-4 w-4" />
            <Label className="text-sm font-medium">Dietas (€{parseFloat(dietaPrice).toFixed(2)} c/u)</Label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDecrement}
              className="h-12 w-12 flex-shrink-0 rounded-xl"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">
                {count % 1 === 0 ? count.toFixed(0) : count.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-xs">
                Dietas del día
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleIncrement}
              className="h-12 w-12 flex-shrink-0 rounded-xl"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}