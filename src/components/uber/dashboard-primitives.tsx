import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "live" | "watch" | "critical" | "inverse";

const badgeTone: Record<Tone, string> = {
  neutral: "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
  live: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  watch: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300",
  inverse: "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black",
};

const cardTone: Record<Exclude<Tone, "inverse">, string> = {
  neutral: "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
  live: "border-emerald-200 bg-white dark:border-emerald-900 dark:bg-neutral-950",
  watch: "border-amber-200 bg-white dark:border-amber-900 dark:bg-neutral-950",
  critical: "border-red-200 bg-white dark:border-red-900 dark:bg-neutral-950",
};

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6 pb-16 text-neutral-950 dark:text-neutral-50", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 dark:border-neutral-800 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {backHref && (
            <Button
              render={<Link href={backHref} />}
              size="icon-sm"
              variant="outline"
              className="rounded-md border-neutral-300 bg-white text-black hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900"
              aria-label="Back"
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
            </Button>
          )}
          {eyebrow && (
            <span className="text-[11px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              {eyebrow}
            </span>
          )}
          {meta}
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight text-black dark:text-white sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2.5 text-[10px] font-semibold uppercase tracking-normal",
        badgeTone[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  unit,
  detail,
  tone = "neutral",
  sparkline,
  action,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  detail?: ReactNode;
  tone?: Exclude<Tone, "inverse">;
  sparkline?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border p-4", cardTone[tone])}>
      <div className="flex min-h-7 items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        {action}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold leading-none tracking-normal text-black dark:text-white tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{unit}</span>}
      </div>
      {sparkline && <div className="mt-3">{sparkline}</div>}
      {detail && <div className="mt-3 text-xs leading-5 text-neutral-600 dark:text-neutral-400">{detail}</div>}
    </div>
  );
}

export function StatStrip({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode; tone?: Tone }>;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="bg-white px-4 py-3 dark:bg-neutral-950">
          <div className="text-[11px] font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            {item.label}
          </div>
          <div
            className={cn(
              "mt-1 text-lg font-semibold text-black dark:text-white tabular-nums",
              item.tone === "live" && "text-emerald-700 dark:text-emerald-300",
              item.tone === "watch" && "text-amber-700 dark:text-amber-300",
              item.tone === "critical" && "text-red-700 dark:text-red-300"
            )}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-black dark:text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-950">
      <p className="text-sm font-semibold text-black dark:text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}

export function Dot({ tone = "neutral" }: { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full bg-neutral-400",
        tone === "live" && "bg-emerald-500",
        tone === "watch" && "bg-amber-500",
        tone === "critical" && "bg-red-600",
        tone === "inverse" && "bg-black dark:bg-white"
      )}
    />
  );
}
