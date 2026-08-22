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
  SidebarHeader,
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
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8.5 items-center justify-center rounded-xl bg-orange-600 text-white shadow-xs">
                  <Icon icon="solar:fire-bold-duotone" className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Mine EWS Platform</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    ESP Sensor & Early Warning
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                    >
                      <Icon icon={item.icon} className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badge === "ACTUATORS" ? "secondary" : "destructive"}
                          className={cn(
                            "ml-auto h-5 px-1.5 text-[10px] font-bold",
                            item.badge === "ACTUATORS" && "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-slate-400")} />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{isConnected ? "Multi-Node Active" : "Disconnected"}</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">{nodes.length > 0 ? `${nodes.length} ESPs` : "-"}</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
