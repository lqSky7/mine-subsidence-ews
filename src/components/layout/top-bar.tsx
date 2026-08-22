"use client";

import React from "react";
import { Bell, Radio, User, MapPin } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { cn } from "@/lib/utils";

const pathLabels: Record<string, string> = {
  dashboard: "Command Center",
  nodes: "ESP Node Fleet",
  outputs: "Actuators & Outputs",
  alarms: "Early Warning Alerts",
  analytics: "Analytics",
  trends: "Multi-Sensor Trends",
  history: "Event Audit Logs",
  settings: "Settings",
  alerts: "Safety Thresholds",
  hardware: "Hardware Architecture & BOM",
};

export function TopBar() {
  const pathname = usePathname();
  const { isConnected, alarms, nodes } = useTelemetryContext();
  const segments = pathname.split("/").filter(Boolean);

  const activeCritical = alarms.filter((a) => a.state === "ACTIVE" && a.severity === "CRITICAL").length;
  const activeWarning = alarms.filter((a) => a.state === "ACTIVE" && a.severity === "WARNING").length;
  const totalActive = activeCritical + activeWarning;

  const onlineNodes = nodes.filter((n) => n.status !== "OFFLINE").length;

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Breadcrumbs */}
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const href = "/" + segments.slice(0, i + 1).join("/");
            const label = pathLabels[seg] || seg;
            return (
              <React.Fragment key={seg}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-slate-800">{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side status indicators */}
      <div className="ml-auto flex items-center gap-3">
        {/* Mine Location / Station Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
          <MapPin className="size-3 text-orange-600" />
          <span>Mine Station Grid</span>
        </div>

        {/* Gateway Connection status */}
        <div className="flex items-center gap-1.5 text-xs">
          <Radio className={cn("size-3.5", isConnected ? "text-emerald-600" : "text-slate-400")} />
          <span className="text-slate-600 hidden lg:inline font-medium">
            ESP Bridge: <strong className="text-slate-800">{isConnected ? "Live Socket" : "Local Telemetry"}</strong> ({onlineNodes}/{nodes.length} Nodes)
          </span>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Active Hazard Alarm Badge */}
        <div className="flex items-center gap-1.5">
          <Bell className={cn("size-3.5", totalActive > 0 ? "text-rose-600" : "text-muted-foreground")} />
          {totalActive > 0 ? (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
              {totalActive} HAZARDS
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">0 Alarms</span>
          )}
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* User role */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="size-3.5" />
          <span className="hidden lg:inline font-medium text-slate-700">SAFETY OFFICER</span>
        </div>
      </div>
    </header>
  );
}
