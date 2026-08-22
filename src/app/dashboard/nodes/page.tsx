"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  PageHeader,
  PageShell,
  StatStrip,
  StatusBadge,
  Toolbar,
} from "@/components/uber/dashboard-primitives";
import { cn } from "@/lib/utils";

const riskTone = (risk: string) => {
  if (risk === "CRITICAL") return "critical";
  if (risk === "WATCH") return "watch";
  if (risk === "STABLE") return "live";
  return "neutral";
};

export default function MeshFleetPage() {
  const { nodes, telemetry, isConnected } = useTelemetryContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filteredNodes = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return nodes.filter((node) => {
      const matchesSearch =
        node.id.toLowerCase().includes(query) ||
        node.label.toLowerCase().includes(query) ||
        node.location.toLowerCase().includes(query);
      const matchesSeverity = severityFilter === "ALL" || node.riskSeverity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [nodes, searchTerm, severityFilter]);

  const criticalCount = nodes.filter((node) => node.riskSeverity === "CRITICAL").length;
  const watchCount = nodes.filter((node) => node.riskSeverity === "WATCH").length;
  const onlineCount = nodes.filter((node) => node.status !== "OFFLINE").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Monitor"
        title="Nodes"
        description="Station health and current telemetry. Open a node only when you need the full sensor detail."
        meta={<StatusBadge tone={isConnected ? "live" : "neutral"}>{isConnected ? "Gateway live" : "Gateway offline"}</StatusBadge>}
      />

      <StatStrip
        items={[
          { label: "Registered", value: nodes.length },
          { label: "Online", value: onlineCount, tone: isConnected ? "live" : "neutral" },
          { label: "Watch", value: watchCount, tone: watchCount > 0 ? "watch" : "neutral" },
          { label: "Critical", value: criticalCount, tone: criticalCount > 0 ? "critical" : "neutral" },
        ]}
      />

      <Toolbar>
        <div className="relative w-full max-w-md">
          <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search node, sector, chamber"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 rounded-md border-neutral-300 bg-white pl-9 text-sm dark:border-neutral-700 dark:bg-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "CRITICAL", "WATCH", "STABLE"].map((severity) => (
            <Button
              key={severity}
              size="sm"
              variant={severityFilter === severity ? "default" : "outline"}
              onClick={() => setSeverityFilter(severity)}
            >
              {severity === "ALL" ? "All" : severity}
            </Button>
          ))}
          <div className="ml-0 flex rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800 sm:ml-2">
            {(["table", "cards"] as const).map((mode) => (
              <Button
                key={mode}
                size="xs"
                variant={viewMode === mode ? "default" : "ghost"}
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </Toolbar>

      {nodes.length === 0 ? (
        <EmptyState title="No nodes discovered" description="Monitoring stations appear here after their first gateway heartbeat." />
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredNodes.map((node) => {
            const tel = telemetry[node.id];
            return (
              <Link
                key={node.id}
                href={`/dashboard/nodes/${node.id}`}
                className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-black dark:text-white">{node.id}</div>
                    <div className="mt-1 truncate text-sm text-neutral-500 dark:text-neutral-400">{node.location}</div>
                  </div>
                  <StatusBadge tone={riskTone(node.riskSeverity)}>{node.riskSeverity}</StatusBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                  <MetricMini label="Gas" value={tel?.gas?.mq2Ppm !== undefined ? `${tel.gas.mq2Ppm} ppm` : "--"} />
                  <MetricMini label="Wall" value={tel?.ultrasound?.distanceCm !== undefined ? `${tel.ultrasound.distanceCm.toFixed(1)} cm` : "--"} />
                  <MetricMini label="Tilt A" value={tel?.imu1?.totalTiltDeg !== undefined ? `${tel.imu1.totalTiltDeg.toFixed(1)} deg` : "--"} />
                  <MetricMini label="Vibe" value={tel?.vibration?.intensity !== undefined ? `${tel.vibration.intensity}%` : "--"} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-200 dark:border-neutral-800">
                <TableHead>Node</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Gas</TableHead>
                <TableHead>Wall</TableHead>
                <TableHead>Tilt A</TableHead>
                <TableHead>Tilt B</TableHead>
                <TableHead>Vibe</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-neutral-500">
                    No nodes match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredNodes.map((node) => {
                  const tel = telemetry[node.id];
                  return (
                    <TableRow
                      key={node.id}
                      className={cn(
                        "text-sm",
                        node.riskSeverity === "CRITICAL" && "bg-red-50/60 dark:bg-red-950/20",
                        node.riskSeverity === "WATCH" && "bg-amber-50/70 dark:bg-amber-950/20"
                      )}
                    >
                      <TableCell className="font-semibold text-black dark:text-white">{node.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">{node.location}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{node.label}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={riskTone(node.riskSeverity)}>{node.riskSeverity}</StatusBadge>
                      </TableCell>
                      <TableCell className="tabular-nums">{tel?.gas?.mq2Ppm !== undefined ? `${tel.gas.mq2Ppm} ppm` : "--"}</TableCell>
                      <TableCell className="tabular-nums">{tel?.ultrasound?.distanceCm !== undefined ? `${tel.ultrasound.distanceCm.toFixed(1)} cm` : "--"}</TableCell>
                      <TableCell className="tabular-nums">{tel?.imu1?.totalTiltDeg !== undefined ? `${tel.imu1.totalTiltDeg.toFixed(1)} deg` : "--"}</TableCell>
                      <TableCell className="tabular-nums">{tel?.imu2?.totalTiltDeg !== undefined ? `${tel.imu2.totalTiltDeg.toFixed(1)} deg` : "--"}</TableCell>
                      <TableCell className="tabular-nums">{tel?.vibration?.intensity !== undefined ? `${tel.vibration.intensity}%` : "--"}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/nodes/${node.id}`}>
                          <Button size="icon-sm" variant="ghost" aria-label={`Open ${node.id}`}>
                            <Icon icon="solar:arrow-right-up-linear" className="size-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </PageShell>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 dark:bg-neutral-950">
      <div className="text-[11px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-black dark:text-white tabular-nums">{value}</div>
    </div>
  );
}
