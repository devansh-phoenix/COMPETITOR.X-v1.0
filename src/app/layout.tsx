import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CompetitorX — Evidence-Based SaaS Comparison Agent",
  description:
    "Compare any competitors in one minute with zero hallucinations. Powered by TinyFish web automations and strict factual extraction.",
  keywords: [
    "competitor comparison",
    "competitive intelligence",
    "SaaS pricing comparison",
    "TinyFish agent",
    "feature matrix",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
        {children}
      </body>
    </html>
  );
}
