"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TelemetryProvider } from "@/components/layout/telemetry-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelemetryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-auto bg-white p-4 dark:bg-black sm:p-5 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TelemetryProvider>
  );
}
