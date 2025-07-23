import { DocImage } from "@/components/docs/doc-image";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function ProductionSetupPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Production Setup</h1>
          <p className="text-muted-foreground text-xl">
            Configure your Terturions project for production
          </p>
        </div>

        <section>
          <div className="mb-6 flex items-center">
            <Lock className="mr-2 h-6 w-6 text-green-400" />
            <h2 className="text-3xl font-semibold">Production Configuration</h2>
          </div>

          <div className="space-y-4">
            {/* Step 6: Production mode */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">1</span>
                </div>
                Configure Production Mode
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  When you&apos;re ready to deploy your application to production, make sure to
                  switch to production mode in your Stack Auth settings. This ensures that your
                  authentication system operates in a secure environment.
                </p>
                <DocImage
                  src="/docs/images/stack_auth_production_mode.png"
                  alt="Setting production mode"
                  width={800}
                  height={450}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/docs/auth"
            className="inline-flex items-center justify-center text-sm font-medium text-blue-400 hover:underline"
          >
            Back to Authentication Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
