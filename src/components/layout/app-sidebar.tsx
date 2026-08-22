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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Dot, StatusBadge } from "@/components/uber/dashboard-primitives";
import { cn } from "@/lib/utils";
import { useTelemetryContext } from "./telemetry-provider";

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: "Monitor",
    items: [
      { title: "Command", href: "/dashboard", icon: "solar:widget-2-bold-duotone" },
      { title: "Nodes", href: "/dashboard/nodes", icon: "solar:cpu-bolt-bold-duotone" },
      { title: "Photos", href: "/dashboard/photos", icon: "solar:camera-bold-duotone" },
      { title: "Outputs", href: "/dashboard/outputs", icon: "solar:volume-loud-bold-duotone" },
    ],
  },
  {
    label: "Risk",
    items: [
      { title: "Alerts", href: "/dashboard/alarms", icon: "solar:bell-bold-duotone" },
      { title: "Thresholds", href: "/dashboard/settings/alerts", icon: "solar:settings-bold-duotone" },
      { title: "AI Logs", href: "/dashboard/ai-logs", icon: "solar:heart-pulse-bold-duotone" },
    ],
  },
  {
    label: "Review",
    items: [
      { title: "Trends", href: "/dashboard/analytics/trends", icon: "solar:chart-2-bold-duotone" },
      { title: "History", href: "/dashboard/analytics/history", icon: "solar:history-bold-duotone" },
      { title: "Hardware", href: "/dashboard/hardware", icon: "solar:layers-minimalistic-bold-duotone" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { alarms, nodes, isConnected } = useTelemetryContext();

  const activeAlarms = alarms.filter((alarm) => alarm.state === "ACTIVE").length;
  const onlineNodes = nodes.filter((node) => node.status !== "OFFLINE").length;

  const nav = navigation.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      badge: item.href === "/dashboard/alarms" && activeAlarms > 0 ? String(activeAlarms) : item.badge,
    })),
  }));

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-neutral-200 dark:border-neutral-800">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-3 group-data-[collapsible=icon]:hidden">
          <Link href="/dashboard" className="block">
            <div className="text-xl font-semibold leading-none text-black dark:text-white">Mine EWS</div>
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Operator console</div>
          </Link>
        </div>

        {nav.map((group) => (
          <SidebarGroup key={group.label} className="py-2 group-data-[collapsible=icon]:py-1">
            <SidebarGroupLabel className="px-4 text-[10px] font-semibold uppercase text-neutral-500 group-data-[collapsible=icon]:hidden dark:text-neutral-500">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-10 w-full cursor-pointer rounded-full px-3 text-sm font-medium transition-colors group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
                          isActive
                            ? "bg-black text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white"
                            : "text-neutral-700 hover:bg-neutral-100 hover:text-black dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                        )}
                      >
                        <Icon
                          icon={item.icon}
                          className={cn("size-4 shrink-0", isActive ? "text-current" : "text-neutral-500")}
                        />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white group-data-[collapsible=icon]:hidden">
                            {item.badge}
                          </span>
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

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-950 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
              <Dot tone={isConnected ? "live" : "neutral"} />
              <span className="group-data-[collapsible=icon]:hidden">
                {isConnected ? "Gateway live" : "Gateway offline"}
              </span>
            </span>
            <span className="text-neutral-500 group-data-[collapsible=icon]:hidden dark:text-neutral-400">
              {onlineNodes}/{nodes.length || 0}
            </span>
          </div>
          {activeAlarms > 0 && (
            <StatusBadge tone="critical" className="mt-2 group-data-[collapsible=icon]:hidden">
              {activeAlarms} active
            </StatusBadge>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
