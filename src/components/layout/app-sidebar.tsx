"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTelemetryContext } from "./telemetry-provider";

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { alarms, nodes, isConnected } = useTelemetryContext();

  const activeCriticalAlarms = alarms.filter((a) => a.state === "ACTIVE" && a.severity === "CRITICAL").length;
  const activeWarningAlarms = alarms.filter((a) => a.state === "ACTIVE" && a.severity === "WARNING").length;
  const totalActiveAlarms = activeCriticalAlarms + activeWarningAlarms;

  const navigation: { label: string; items: NavItem[] }[] = [
    {
      label: "Live Monitoring",
      items: [
        {
          title: "Command Center",
          href: "/dashboard",
          icon: "solar:widget-2-bold-duotone",
        },
        {
          title: "ESP Node Fleet",
          href: "/dashboard/nodes",
          icon: "solar:cpu-bolt-bold-duotone",
        },
        {
          title: "Visual Inspections",
          href: "/dashboard/photos",
          icon: "solar:camera-bold-duotone",
        },
        {
          title: "Actuators & Outputs",
          href: "/dashboard/outputs",
          icon: "solar:volume-loud-bold-duotone",
          badge: "ACTUATORS",
        },
      ],
    },
    {
      label: "Hazard Management",
      items: [
        {
          title: "Early Warning Alerts",
          href: "/dashboard/alarms",
          icon: "solar:bell-bold-duotone",
          badge: totalActiveAlarms > 0 ? String(totalActiveAlarms) : undefined,
        },
        {
          title: "Safety Thresholds",
          href: "/dashboard/settings/alerts",
          icon: "solar:settings-bold-duotone",
        },
      ],
    },
    {
      label: "Analytics & History",
      items: [
        {
          title: "Multi-Sensor Trends",
          href: "/dashboard/analytics/trends",
          icon: "solar:chart-2-bold-duotone",
        },
        {
          title: "Event Audit Logs",
          href: "/dashboard/analytics/history",
          icon: "solar:history-bold-duotone",
        },
      ],
    },
    {
      label: "Hardware Specs",
      items: [
        {
          title: "Hardware BOM & Pinout",
          href: "/dashboard/hardware",
          icon: "solar:layers-minimalistic-bold-duotone",
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent className="pt-3">
        {navigation.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        className={cn(
                          "w-full h-9 px-3 rounded-xl transition-all duration-150 flex items-center gap-2.5 cursor-pointer text-xs font-semibold",
                          isActive
                            ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold border border-orange-200/70 dark:border-orange-900/50 shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium"
                        )}
                      >
                        <Icon
                          icon={item.icon}
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive ? "text-orange-600 dark:text-orange-400" : "text-slate-500 dark:text-slate-400"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badge === "ACTUATORS" ? "secondary" : "destructive"}
                            className={cn(
                              "ml-auto h-5 px-1.5 text-[10px] font-bold shrink-0",
                              item.badge === "ACTUATORS" && "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="p-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-slate-400")} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{isConnected ? "Multi-Node Active" : "Disconnected"}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">{nodes.length > 0 ? `${nodes.length} ESPs` : "-"}</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
