"use client";

import { createContext, useContext } from "react";
import { useTelemetry, type TelemetryState } from "@/hooks/use-telemetry";

const TelemetryContext = createContext<TelemetryState | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const telemetry = useTelemetry();
  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext(): TelemetryState {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error("useTelemetryContext must be used within TelemetryProvider");
  }
  return ctx;
}
