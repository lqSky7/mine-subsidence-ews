"use client";

import React from "react";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dot, StatusBadge } from "@/components/uber/dashboard-primitives";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";

const pathLabels: Record<string, string> = {
  dashboard: "Command",
  nodes: "Nodes",
  photos: "Photos",
  outputs: "Outputs",
  alarms: "Alerts",
  analytics: "Analytics",
  trends: "Trends",
  history: "History",
  settings: "Settings",
  alerts: "Thresholds",
  hardware: "Hardware",
  "ai-logs": "AI Logs",
};

export function TopBar() {
  const pathname = usePathname();
  const { isConnected, alarms, nodes } = useTelemetryContext();
  const segments = pathname.split("/").filter(Boolean);

  const activeCritical = alarms.filter((alarm) => alarm.state === "ACTIVE" && alarm.severity === "CRITICAL").length;
  const activeWarning = alarms.filter((alarm) => alarm.state === "ACTIVE" && alarm.severity === "WARNING").length;
  const onlineNodes = nodes.filter((node) => node.status !== "OFFLINE").length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur dark:border-neutral-800 dark:bg-black/95">
      <SidebarTrigger className="-ml-1 rounded-full" />
      <Separator orientation="vertical" className="h-5 bg-neutral-200 dark:bg-neutral-800" />

      <Breadcrumb className="hidden min-w-0 sm:flex">
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = "/" + segments.slice(0, index + 1).join("/");
            const label = pathLabels[segment] || segment;

            return (
              <React.Fragment key={`${segment}-${index}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-black dark:text-white">{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href} className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white">
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-black dark:text-neutral-300 md:flex">
          <Dot tone={isConnected ? "live" : "neutral"} />
          {isConnected ? "Live socket" : "Offline"}
          <span className="text-neutral-400">/</span>
          <span className="tabular-nums">{onlineNodes}/{nodes.length || 0} nodes</span>
        </div>

        <StatusBadge tone={activeCritical > 0 ? "critical" : activeWarning > 0 ? "watch" : "neutral"}>
          {activeCritical > 0
            ? `${activeCritical} critical`
            : activeWarning > 0
            ? `${activeWarning} watch`
            : "No active alerts"}
        </StatusBadge>

        <Separator orientation="vertical" className="hidden h-5 bg-neutral-200 dark:bg-neutral-800 md:block" />

        <div className="hidden items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 lg:flex">
          <Icon icon="solar:user-circle-bold-duotone" className="size-4" />
          Safety officer
        </div>
      </div>
    </header>
  );
}
