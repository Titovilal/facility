"use client";

import { ThemeToggle } from "@/components/general/theme-toggle";
import { UserButton } from "@/components/general/user-button";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrCreateProfile } from "@/db/actions/profiles";
import type { Profile } from "@/db/schemas/profiles";
import { configFile } from "@/lib/config";
import { useUser } from "@stackframe/stack";
import { CalendarIcon, Clock, HandHelping, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [horasNormales, setHorasNormales] = useState("");
  const [horasNocturnas, setHorasNocturnas] = useState("");
  const [horasSabado, setHorasSabado] = useState("");
  const [horasDomingo, setHorasDomingo] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const userProfile = await getOrCreateProfile(user, {});
        setProfile(userProfile);
      } catch (error) {
        toast.error("No se pudo cargar el perfil");
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  // ! The user has not authenticated yet, redirecting to auth page from config
  useEffect(() => {
    if (!user) {
      router.push(configFile.authPage);
    }
  }, [user, router]);
  if (!user) return null;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold md:h-8 md:w-8">
              <HandHelping className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold md:text-xl">Facility</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile && <UserButton profile={profile} user={user} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
          {/* Dashboard Content */}
          <div className="space-y-4 md:space-y-6">
            {/* Day Metrics - First */}
            <div className="p-4 lg:col-span-2">
              {date ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {date.toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </h3>
                      <p className="text-muted-foreground text-sm">8h trabajadas</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">€124.80</div>
                      <div className="text-muted-foreground text-xs">Sueldo bruto</div>
                    </div>
                  </div>

                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button className="w-full">
                        <Clock className="mr-2 h-4 w-4" />
                        Registrar Horas
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Registrar Horas</DrawerTitle>
                        <DrawerDescription>
                          {date?.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </DrawerDescription>
                      </DrawerHeader>

                      <div className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="horas-normales">Horas Normales</Label>
                            <span className="text-muted-foreground text-sm">15.60€ / hora</span>
                          </div>
                          <Input
                            id="horas-normales"
                            type="number"
                            placeholder="0"
                            value={horasNormales}
                            onChange={(e) => setHorasNormales(e.target.value)}
                            className="text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="horas-nocturnas">Horas Nocturnas</Label>
                            <span className="text-muted-foreground text-sm">18.72€ / hora</span>
                          </div>
                          <Input
                            id="horas-nocturnas"
                            type="number"
                            placeholder="0"
                            value={horasNocturnas}
                            onChange={(e) => setHorasNocturnas(e.target.value)}
                            className="text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="horas-sabado">Horas Sábado</Label>
                            <span className="text-muted-foreground text-sm">23.40€ / hora</span>
                          </div>
                          <Input
                            id="horas-sabado"
                            type="number"
                            placeholder="0"
                            value={horasSabado}
                            onChange={(e) => setHorasSabado(e.target.value)}
                            className="text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="horas-domingo">Horas Domingo</Label>
                            <span className="text-muted-foreground text-sm">31.20€ / hora</span>
                          </div>
                          <Input
                            id="horas-domingo"
                            type="number"
                            placeholder="0"
                            value={horasDomingo}
                            onChange={(e) => setHorasDomingo(e.target.value)}
                            className="text-base"
                          />
                        </div>
                      </div>

                      <DrawerFooter>
                        <Button className="w-full">Guardar Horas</Button>
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-full">
                            Cancelar
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Selecciona un día en el calendario</p>
                </div>
              )}
            </div>
            {/* Calendar Section */}
            <div className="p-4">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold md:text-xl">
                <CalendarIcon className="h-5 w-5" />
                Calendario de Horas
              </h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full p-0 [--cell-size:theme(spacing.12)] md:[--cell-size:theme(spacing.10)]"
              />
            </div>

            {/* Monthly Summary */}
            <div className="p-4">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5" />
                Resumen del Mes
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Normales</span>
                  <span className="font-medium">160h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Nocturnas</span>
                  <span className="font-medium">24h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horas Festivas</span>
                  <span className="font-medium">8h</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>192h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
