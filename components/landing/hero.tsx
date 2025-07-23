"use client";

import { Button } from "@/components/ui/button";
import { Clock, Timer } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-6 text-center md:max-w-3xl md:space-y-8">
        {/* Badge */}
        <div className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium md:gap-2 md:px-4 md:py-2 md:text-sm">
          <Timer className="h-3 w-3 md:h-4 md:w-4" />
          Control de Horas Laborales
        </div>

        {/* Main heading */}
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-6xl">
            Nunca más te <span className="text-primary">Timen las Horas</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-xl">
            Registra tus horas de trabajo con precisión. Horas normales, nocturnas y festivas en un
            solo lugar.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-center md:gap-4">
          <Link href="/auth" className="w-full md:w-auto">
            <Button size="lg" className="w-full px-6 md:w-auto md:px-8">
              <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
