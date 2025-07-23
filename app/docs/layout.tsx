"use client";
import {
  Book,
  Bot,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Database,
  Lock,
  WrapText,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

interface SidebarItemProps {
  href: string;
  title: string;
  icon?: ReactNode;
  isActive?: boolean;
}

const SidebarItem = ({ href, title, icon, isActive }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
        isActive
          ? "bg-primary/10 font-medium text-blue-300"
          : "hover:bg-primary/5 hover:text-blue-300"
      }`}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="bg-background fixed top-0 right-0 left-0 z-20 border-b p-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 font-medium"
        >
          <Book className="h-5 w-5" />
          <span>Documentation</span>
          {sidebarOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Sidebar - Fixed position */}
      <aside
        className={`bg-background fixed top-0 left-0 z-10 flex h-full w-64 flex-col overflow-y-auto border-r ${
          sidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="flex flex-1 flex-col p-6">
          <Link href="/" className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Book className="h-6 w-6" />
            <span>Documentation</span>
          </Link>

          <nav className="flex-1 space-y-4">
            {/* Get Started Section */}
            <div>
              <h3 className="text-muted-foreground mb-2 px-3 text-sm font-semibold">GET STARTED</h3>
              <div className="space-y-1">
                <SidebarItem
                  href="/docs/overview"
                  title="Overview"
                  icon={<Zap className="h-4 w-4 text-blue-400" />}
                  isActive={pathname === "/docs" || pathname === "/docs/overview"}
                />
                <SidebarItem
                  href="/docs/auth"
                  title="Auth Setup"
                  icon={<Lock className="h-4 w-4 text-green-400" />}
                  isActive={pathname === "/docs/auth"}
                />
                <SidebarItem
                  href="/docs/database"
                  title="Database Setup"
                  icon={<Database className="h-4 w-4 text-red-400" />}
                  isActive={pathname === "/docs/database"}
                />
              </div>
            </div>

            {/* Template Features Section */}
            <div>
              <h3 className="text-muted-foreground mb-2 px-3 text-sm font-semibold">
                TEMPLATE FEATURES
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  href="/docs/routes"
                  title="Protected Routes"
                  icon={<Lock className="h-4 w-4 text-yellow-400" />}
                  isActive={pathname === "/docs/routes"}
                />
                <SidebarItem
                  href="/docs/tables"
                  title="Creating Tables"
                  icon={<Database className="h-4 w-4 text-blue-400" />}
                  isActive={pathname.startsWith("/docs/tables")}
                />
                <SidebarItem
                  href="/docs/utils"
                  title="Utility Functions"
                  icon={<WrapText className="h-4 w-4 text-purple-400" />}
                  isActive={pathname.startsWith("/docs/utils")}
                />
                <SidebarItem
                  href="/docs/stripe"
                  title="Stripe Integration"
                  icon={<CreditCard className="h-4 w-4 text-green-400" />}
                  isActive={pathname.startsWith("/docs/stripe")}
                />
              </div>
            </div>
          </nav>

          {/* AI Chat Assistant - Special Section */}
          <div className="mt-6 border-t pt-4">
            <Link
              href="/docs/ai-chat"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                pathname.startsWith("/docs/ai-chat")
                  ? "bg-blue-600/20 text-blue-300"
                  : "bg-primary/5 text-muted-foreground hover:bg-primary/10 hover:text-blue-300"
              }`}
            >
              <Bot className="h-5 w-5 text-blue-400" />
              <span className="font-medium">AI Chat Assistant</span>
            </Link>
          </div>

          <div className="mt-4">
            <Link
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content - Add padding for mobile navbar and fixed sidebar on desktop */}
      <main className="flex-1 pt-16 md:ml-64 md:pt-0">
        <div className="mx-auto">{children}</div>
      </main>
    </div>
  );
}
