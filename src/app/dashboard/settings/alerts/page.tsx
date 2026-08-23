"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThresholdSlider } from "@/components/industrial/ThresholdSlider";
import { Icon } from "@/components/ui/icon";

export default function AlertSettingsPage() {
  const { thresholds, setThresholds } = useTelemetryContext();

  const [gasWarn, setGasWarn] = useState(thresholds.gasPpmWarning);
  const [gasCrit, setGasCrit] = useState(thresholds.gasPpmCritical);
  const [wallWarn, setWallWarn] = useState(thresholds.wallDistanceMinWarningCm);
  const [wallCrit, setWallCrit] = useState(thresholds.wallDistanceMinCriticalCm);
  const [tiltWarn, setTiltWarn] = useState(thresholds.tiltDegWarning);
  const [tiltCrit, setTiltCrit] = useState(thresholds.tiltDegCritical);
  const [vibThresh, setVibThresh] = useState(thresholds.vibrationIntensityThreshold);

  const [buzzerEnabled, setBuzzerEnabled] = useState(thresholds.buzzerEnabled);
  const [ledMatrixEnabled, setLedMatrixEnabled] = useState(thresholds.ledMatrixEnabled);
  const [autoTrigger, setAutoTrigger] = useState(thresholds.autoTriggerActuatorsOnCritical);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(thresholds.alertEmailsEnabled !== false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setThresholds({
      gasPpmWarning: gasWarn,
      gasPpmCritical: gasCrit,
      wallDistanceMinWarningCm: wallWarn,
      wallDistanceMinCriticalCm: wallCrit,
      tiltDegWarning: tiltWarn,
      tiltDegCritical: tiltCrit,
      vibrationIntensityThreshold: vibThresh,
      buzzerEnabled,
      ledMatrixEnabled,
      autoTriggerActuatorsOnCritical: autoTrigger,
      alertEmailsEnabled: emailAlertsEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setGasWarn(450);
    setGasCrit(700);
    setWallWarn(2.5);
    setWallCrit(1.5);
    setTiltWarn(14);
    setTiltCrit(18);
    setVibThresh(60);
    setBuzzerEnabled(true);
    setLedMatrixEnabled(true);
    setAutoTrigger(false);
    setEmailAlertsEnabled(true);
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <Icon icon="solar:settings-bold-duotone" className="size-4.5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Safety Thresholds & Actuator Automation
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust Early Warning Limits for Gas, Wall Convergence, Dual Tilt, and Siren Triggers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs font-semibold h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-1.5"
          >
            <Icon icon="solar:restart-bold" className="size-3.5 text-neutral-500 dark:text-neutral-400" /> Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="text-xs font-bold h-8 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 gap-1.5"
          >
            {savedSuccess ? (
              <>
                <Icon icon="solar:check-circle-bold-duotone" className="size-3.5" /> Saved to Gateway!
              </>
            ) : (
              <>
                <Icon icon="solar:diskette-bold" className="size-3.5" /> Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-2">
          <Icon icon="solar:check-circle-bold-duotone" className="size-4 text-neutral-500 dark:text-neutral-400" />
          Safety threshold configuration has been broadcasted to all ESP monitoring stations.
        </div>
      )}

      {/* Sensor Threshold Controls */}
      <div className="space-y-4">
        {/* Section 1: MQ2 Gas Sensor */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:flame-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  MQ2 Flammable Gas Sensor Thresholds
                </CardTitle>
                <CardDescription className="text-xs">
                  Trigger limits for combustible gas, methane, LPG, and toxic smoke accumulation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <ThresholdSlider
              label="Warning Threshold (PPM)"
              description="Initial early warning alert trigger limit"
              value={gasWarn}
              min={100}
              max={1500}
              step={25}
              unit="ppm"
              color="amber"
              onChange={setGasWarn}
            />
            <ThresholdSlider
              label="Critical Danger Threshold (PPM)"
              description="Evacuation trigger limit; automatically sounds sirens and flashes beacon"
              value={gasCrit}
              min={200}
              max={2500}
              step={50}
              unit="ppm"
              color="rose"
              onChange={setGasCrit}
            />
          </CardContent>
        </Card>

        {/* Section 2: Ultrasound Wall Distance */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:radar-2-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ultrasound Wall Clearance & Convergence Thresholds
                </CardTitle>
                <CardDescription className="text-xs">
                  Minimum safe clearance from rock faces; detects sidewall deformation and collapse risk
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <ThresholdSlider
              label="Convergence Warning Limit (Min cm)"
              description="Triggers watch alert if distance to wall drops below this value"
              value={wallWarn}
              min={1}
              max={50}
              step={0.5}
              unit="cm"
              color="amber"
              onChange={setWallWarn}
            />
            <ThresholdSlider
              label="Critical Rock Incursion / Collapse Limit (Min cm)"
              description="Immediate structural breach alarm threshold"
              value={wallCrit}
              min={0.5}
              max={30}
              step={0.5}
              unit="cm"
              color="rose"
              onChange={setWallCrit}
            />
          </CardContent>
        </Card>

        {/* Section 3: Dual Gy87 Tilt Sensors */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:compass-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Dual Gy87 Inclinometer Inclination Thresholds
                </CardTitle>
                <CardDescription className="text-xs">
                  Angular deflection limits for Sensor A (Horizontal) and Sensor B (Vertical Perpendicular)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <ThresholdSlider
              label="Angular Incline Warning Limit (Deg)"
              description="Deflection angle triggering geotechnical watch status"
              value={tiltWarn}
              min={1.0}
              max={25.0}
              step={0.5}
              unit="°"
              color="amber"
              onChange={setTiltWarn}
            />
            <ThresholdSlider
              label="Critical Structural Tilt Deflection (Deg)"
              description="Emergency subsidence trigger angle; indicates imminent ground failure"
              value={tiltCrit}
              min={3.0}
              max={35.0}
              step={0.5}
              unit="°"
              color="rose"
              onChange={setTiltCrit}
            />
          </CardContent>
        </Card>

        {/* Section 4: Vibration Sensor */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:graph-up-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Micro-Vibration Sensor Thresholds
                </CardTitle>
                <CardDescription className="text-xs">
                  Sensitivity settings for micro-seismic shockwave event detection
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <ThresholdSlider
              label="Vibration Shock Intensity Threshold (%)"
              description="Threshold percentage for seismic shockwave spike detection"
              value={vibThresh}
              min={20}
              max={100}
              step={5}
              unit="%"
              color="amber"
              onChange={setVibThresh}
            />
          </CardContent>
        </Card>

        {/* Section 5: Actuator Automation Toggles */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:volume-loud-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Physical Alert Actuator Automation
                </CardTitle>
                <CardDescription className="text-xs">
                  Automate 8x8 LED flash beacon and piezo siren responses on critical alerts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="autoTrigger" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Auto-Engage Actuators on Critical Hazard
                </Label>
                <p className="text-slate-500 text-[11px]">
                  Automatically trigger both siren and LED hazard matrix whenever critical limits are breached
                </p>
              </div>
              <Switch
                id="autoTrigger"
                checked={autoTrigger}
                onCheckedChange={setAutoTrigger}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="buzzerEnable" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Audible Siren Master Enable
                </Label>
                <p className="text-slate-500 text-[11px]">
                  Allow ESP stations to sound high-decibel piezo buzzer
                </p>
              </div>
              <Switch
                id="buzzerEnable"
                checked={buzzerEnabled}
                onCheckedChange={setBuzzerEnabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="ledEnable" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Visual 8x8 LED Beacon Master Enable
                </Label>
                <p className="text-slate-500 text-[11px]">
                  Allow ESP stations to drive MAX7219 8x8 LED pattern matrix
                </p>
              </div>
              <Switch
                id="ledEnable"
                checked={ledMatrixEnabled}
                onCheckedChange={setLedMatrixEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Automated Email Dispatch & Kill Switch */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Icon icon="solar:letter-bold-duotone" className="size-4 text-neutral-700 dark:text-neutral-300" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Automated Alert Email Notifications & Kill Switch
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure SMTP dispatch for real-time critical hazard emails
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label htmlFor="emailKillSwitch" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Automated Alert Email Dispatch
                </Label>
                <p className="text-slate-500 text-[11px]">
                  {emailAlertsEnabled
                    ? "Enabled — Emergency emails are automatically sent to configured officers upon critical safety threshold breaches."
                    : "Kill Switch Engaged — All automated email dispatches are halted. No emails will be sent."}
                </p>
              </div>
              <Switch
                id="emailKillSwitch"
                checked={emailAlertsEnabled}
                onCheckedChange={setEmailAlertsEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
