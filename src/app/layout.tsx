import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Mine Subsidence Early Warning System (EWS) — Geotechnical Safety Platform",
  description:
    "Real-time mine telemetry, convergence detection, multi-sensor tilt inclinometers, and early warning geotechnical safety platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
