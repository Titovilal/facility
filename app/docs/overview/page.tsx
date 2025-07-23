import { Zap } from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  const features = [
    "Next.js 15 with App Router",
    "Authentication via Stack Auth",
    "Neon PostgreSQL Database",
    "Drizzle ORM for type-safe queries",
    "Row Level Security (RLS) for data protection",
    "Stripe payment integration",
    "Internationalization (i18n) support",
    "Light/dark theme support",
    "Shadcn/UI components",
    "End-to-end TypeScript type safety",
    "Bun package manager and runtime",
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Project Overview</h1>
          <p className="text-muted-foreground text-xl">
            A comprehensive guide to the Terturions template and its features
          </p>
        </div>

        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-semibold">About Terturions Template</h2>
          </div>
          <div className="space-y-4">
            <p className="text-lg">
              Terturions is a comprehensive Next.js template designed to accelerate development of
              modern web applications. It combines the latest technologies and best practices to
              provide a robust foundation for your projects.
            </p>
            <p className="text-lg">
              This template is built with a focus on developer experience, type safety, and
              performance. It integrates authentication, database connections, and UI components to
              help you build production-ready applications quickly and efficiently.
            </p>
            <p className="text-lg">
              Whether you&apos;re building a SaaS product, an e-commerce platform, or any other web
              application, Terturions provides the core infrastructure so you can focus on building
              your unique features.
            </p>
          </div>
        </section>

        <section id="features">
          <div className="mb-6 flex items-center">
            <Zap className="text-primary mr-2 h-6 w-6" />
            <h2 className="text-3xl font-semibold">Features</h2>
          </div>
          <ul className="grid list-disc grid-cols-1 gap-3 pl-5 md:grid-cols-2">
            {features.map((feature, i) => (
              <li key={i} className="text-lg">
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
          <p className="font-medium">Ready to get started?</p>
          <p className="mt-2">
            Follow our setup instructions to configure your development environment and start
            building with Terturions template.
          </p>
          <div className="mt-4">
            <Link
              href="/docs/setup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
            >
              Setup Instructions
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center text-sm font-medium text-blue-400 hover:underline"
          >
            Back to Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
