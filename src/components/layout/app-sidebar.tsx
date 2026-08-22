"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  Radio,
  Cpu,
  Bell,
  BarChart3,
  Shield,
  Layers,
  Settings,
  ChevronDown,
  Activity,
  HeartPulse,
  History,
  Bot,
  Zap,
  TrendingUp,
  HardDrive,
  Flame,
  AlertTriangle,
} from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTelemetryContext } from "./telemetry-provider";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: { title: string; href: string }[];
}

export function AppSidebar() {
  const pathname = usePathname();
  const { alarms, nodes } = useTelemetryContext();

  const activeCriticalAlarms = alarms.filter((a) => a.state === "ACTIVE" && a.severity === "CRITICAL").length;
  const activeWarningAlarms = alarms.filter((a) => a.state === "ACTIVE" && a.severity === "WARNING").length;
  const totalActiveAlarms = activeCriticalAlarms + activeWarningAlarms;

  const navigation: { label: string; items: NavItem[] }[] = [
    {
      label: "Geotechnical Overview",
      items: [
        {
          title: "Command Center",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Deformation & Risk Map",
          href: "/dashboard/map",
          icon: MapIcon,
          badge: "LIVE",
        },
        {
          title: "LoRa Mesh Topology",
          href: "/dashboard/network",
          icon: Radio,
        },
      ],
    },
    {
      label: "Surface Mesh Fleet",
      items: [
        {
          title: "Mesh Nodes",
          href: "/dashboard/nodes",
          icon: Cpu,
          children: [
            { title: "Fleet Roster", href: "/dashboard/nodes" },
            { title: "Health & Battery", href: "/dashboard/nodes/health" },
          ],
        },
      ],
    },
    {
      label: "Hazard Management",
      items: [
        {
          title: "Early Warning Alerts",
          href: "/dashboard/alarms",
          icon: Bell,
          badge: totalActiveAlarms > 0 ? String(totalActiveAlarms) : undefined,
        },
        {
          title: "Safety Thresholds",
          href: "/dashboard/settings/alerts",
          icon: Settings,
        },
      ],
    },
    {
      label: "AI & Geotechnical Analytics",
      items: [
        {
          title: "Analytics",
          href: "/dashboard/analytics/predictive",
          icon: BarChart3,
          children: [
            { title: "Predictive AI (EWS)", href: "/dashboard/analytics/predictive" },
            { title: "Multi-Node Trends", href: "/dashboard/analytics/trends" },
            { title: "Historical Replay", href: "/dashboard/analytics/history" },
            { title: "Battery Power", href: "/dashboard/analytics/power" },
          ],
        },
      ],
    },
    {
      label: "System & Architecture",
      items: [
        {
          title: "Hardware BOM",
          href: "/dashboard/hardware",
          icon: Layers,
        },
        {
          title: "Gateway & Security",
          href: "/dashboard/security",
          icon: Shield,
        },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children && pathname.startsWith(item.href)) {
          initial[item.title] = true;
        }
      });
    });
    return initial;
  });

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8.5 items-center justify-center rounded-xl bg-orange-600 text-white shadow-xs">
                  <Flame className="size-4.5 fill-current" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-sm text-slate-900 tracking-tight">Mine EWS Platform</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Surface Mesh Subsidence AI
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
                {group.items.map((item) =>
                  item.children ? (
                    <Collapsible
                      key={item.title}
                      open={!!openGroups[item.title]}
                      onOpenChange={(open) =>
                        setOpenGroups((prev) => ({ ...prev, [item.title]: open }))
                      }
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={
                            <SidebarMenuButton
                              className={cn(
                                pathname.startsWith(item.href) &&
                                  "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                              )}
                            />
                          }
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  render={<Link href={child.href} />}
                                  isActive={pathname === child.href}
                                >
                                  {child.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={pathname === item.href}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badge === "LIVE" ? "secondary" : "destructive"}
                            className={cn(
                              "ml-auto h-5 px-1.5 text-[10px] font-bold",
                              item.badge === "LIVE" && "bg-emerald-100 text-emerald-800 border-emerald-300"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="font-semibold text-slate-700">Panel 4A Active</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{nodes.length} Nodes</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
