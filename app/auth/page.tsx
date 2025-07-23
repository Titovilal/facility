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
    <div className="bg-muted flex min-h-screen items-center justify-center p-4">
      <Link
        href={`/`}
        className="text-primary/80 hover:text-primary absolute top-4 left-4 flex items-center gap-2 text-sm duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <p className="">Back to Home</p>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Welcome to Terturions Template
          </CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleMagicLink} className="space-y-3">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || magicLinkSent}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isLoading || magicLinkSent}
                className="flex w-full items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Magic Link
              </Button>
            </div>
          </form>

          {magicLinkSent && (
            <form onSubmit={handleMagicLinkCode} className="space-y-3">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter code from email"
                  value={magicLinkCode}
                  onChange={(e) => setMagicLinkCode(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2"
                >
                  Sign in with code
                </Button>
              </div>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <Badge>Or continue with</Badge>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
