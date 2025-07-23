import { ThemeProvider } from "@/components/general/theme-provider";
import { BASE_URL, configFile } from "@/lib/config";
import { stackServerApp } from "@/stack";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: configFile.title,
  description: configFile.description,
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: configFile.title,
    description: configFile.description,
    url: BASE_URL,
    type: "website",
    siteName: configFile.title,
    locale: "en_US",
    images: [
      {
        url: configFile.og.url,
        width: configFile.og.width,
        height: configFile.og.height,
        alt: configFile.og.alt,
        type: "image/png",
        secureUrl: configFile.og.url,
      },
    ],
  },
  other: {
    author: configFile.author,
    publisher: configFile.author,
    image: configFile.og.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-screen antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          <StackProvider app={stackServerApp}>
            <StackTheme>{children}</StackTheme>
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
