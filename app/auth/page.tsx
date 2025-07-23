"use client";

import GoogleIcon from "@/components/general/icons/google-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { configFile } from "@/lib/config";
import { tryCatch } from "@/lib/utils";
import { useStackApp, useUser } from "@stackframe/stack";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AuthPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkCode, setMagicLinkCode] = useState("");
  const [nonce, setNonce] = useState<string | null>(null);
  const app = useStackApp();
  const user = useUser();
  const router = useRouter();

  // ! The user has not authenticated yet, redirecting to auth page from config
  useEffect(() => {
    if (user) {
      router.push(configFile.mainPage);
    }
  }, [user, router]);
  if (user) return null;

  const handleOAuth = async (provider: "google" | "github" | "microsoft") => {
    setIsLoading(true);
    setError("");

    const { error } = await tryCatch(app.signInWithOAuth(provider));
    if (error) {
      setError(error.message || `An error occurred with ${provider} sign-in`);
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await app.sendMagicLinkEmail(email);

      if (result.status === "error") {
        throw new Error(result.error.message);
      }

      // Store the nonce from the response
      if (result.data && result.data.nonce) {
        setNonce(result.data.nonce);
      }

      toast.success("Magic link sent! Please check your email.");
      setMagicLinkSent(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send magic link";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicLinkCode) {
      toast.error("Please enter the code from your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Append the nonce to the code if available
      const codeWithNonce = nonce ? magicLinkCode + nonce : magicLinkCode;
      await app.signInWithMagicLink(codeWithNonce);
      toast.success("Signed in successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid or expired code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center p-3 md:p-4">
      <Link
        href={`/`}
        className="text-primary/80 hover:text-primary absolute top-3 left-3 flex items-center gap-1.5 text-xs duration-200 md:top-4 md:left-4 md:gap-2 md:text-sm"
      >
        <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
        <p>Volver al Inicio</p>
      </Link>
      <Card className="w-full max-w-sm md:max-w-md">
        <CardHeader className="space-y-1 pb-4 md:pb-6">
          <CardTitle className="text-center text-xl font-bold md:text-2xl">Bienvenido a Facility</CardTitle>
          <CardDescription className="text-center text-sm md:text-base">Inicia sesión en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleMagicLink} className="space-y-2 md:space-y-3">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || magicLinkSent}
                className="h-10 text-sm md:h-11 md:text-base"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isLoading || magicLinkSent}
                className="flex w-full items-center justify-center gap-1.5 h-10 text-sm md:gap-2 md:h-11 md:text-base"
              >
                <Mail className="h-3 w-3 md:h-4 md:w-4" />
                Enviar Enlace Mágico
              </Button>
            </div>
          </form>

          {magicLinkSent && (
            <form onSubmit={handleMagicLinkCode} className="space-y-2 md:space-y-3">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Ingresa el código del email"
                  value={magicLinkCode}
                  onChange={(e) => setMagicLinkCode(e.target.value)}
                  disabled={isLoading}
                  className="h-10 text-sm md:h-11 md:text-base"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-1.5 h-10 text-sm md:gap-2 md:h-11 md:text-base"
                >
                  Iniciar Sesión con Código
                </Button>
              </div>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <Badge className="text-xs px-2 py-1">O continúa con</Badge>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-1.5 h-10 text-sm md:gap-2 md:h-11 md:text-base"
          >
            <GoogleIcon />
            Continuar con Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
