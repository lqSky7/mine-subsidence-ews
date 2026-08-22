"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ThresholdSlider } from "@/components/industrial/ThresholdSlider";
import {
  Settings,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Grid3X3,
  Flame,
  Radio,
  Compass,
  Activity,
  Zap,
} from "lucide-react";

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
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setGasWarn(400);
    setGasCrit(800);
    setWallWarn(35.0);
    setWallCrit(20.0);
    setTiltWarn(3.0);
    setTiltCrit(7.0);
    setVibThresh(60);
    setBuzzerEnabled(true);
    setLedMatrixEnabled(true);
    setAutoTrigger(true);

    setThresholds({
      gasPpmWarning: 400,
      gasPpmCritical: 800,
      wallDistanceMinWarningCm: 35.0,
      wallDistanceMinCriticalCm: 20.0,
      tiltDegWarning: 3.0,
      tiltDegCritical: 7.0,
      vibrationIntensityThreshold: 60,
      buzzerEnabled: true,
      ledMatrixEnabled: true,
      autoTriggerActuatorsOnCritical: true,
    });
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shadow-xs">
              <Sliders className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Safety Thresholds & Alert Configuration
              </h1>
              <p className="text-xs text-slate-500">
                Multi-Sensor Threshold Calibration & Automatic Actuator Siren / LED Matrix Trigger Rules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="size-4" /> Thresholds Saved!
            </span>
          )}
          <Button size="sm" variant="outline" onClick={handleResetDefaults} className="h-9 px-3 text-xs bg-white">
            <RotateCcw className="size-3.5 mr-1" /> Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} className="h-9 px-4 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs">
            <Save className="size-3.5 mr-1.5" /> Save Thresholds
          </Button>
        </div>
      </div>

      {/* Sensor Calibration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. MQ2 Gas Sensor Thresholds */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="size-4 text-orange-600" />
              MQ2 Gas Concentration Thresholds
            </CardTitle>
            <CardDescription className="text-xs">
              Flammable gas / methane / smoke concentration alarm triggers in ppm
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ThresholdSlider
              label="Gas Warning Level (ppm)"
              description="Triggers early safety notification on elevated gas presence"
              value={gasWarn}
              min={100}
              max={600}
              step={20}
              unit="ppm"
              warningZone={400}
              onChange={setGasWarn}
            />
            <ThresholdSlider
              label="Gas Critical Hazard Level (ppm)"
              description="Triggers mandatory evacuation buzzer & flashing LED beacon"
              value={gasCrit}
              min={600}
              max={1500}
              step={50}
              unit="ppm"
              criticalZone={800}
              onChange={setGasCrit}
            />
          </CardContent>
        </Card>

        {/* 2. Ultrasound Front-Wall Distance Thresholds */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="size-4 text-blue-600" />
              Ultrasound Wall Clearance Thresholds
            </CardTitle>
            <CardDescription className="text-xs">
              Front-wall proximity / minimum distance safety envelope in cm
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ThresholdSlider
              label="Wall Proximity Warning Limit (cm)"
              description="Alert when distance from front wall falls below this threshold"
              value={wallWarn}
              min={25.0}
              max={60.0}
              step={1.0}
              unit="cm"
              warningZone={35.0}
              onChange={setWallWarn}
            />
            <ThresholdSlider
              label="Wall Proximity Critical Limit (cm)"
              description="Immediate hazard alert for dangerous wall closeness"
              value={wallCrit}
              min={10.0}
              max={30.0}
              step={1.0}
              unit="cm"
              criticalZone={20.0}
              onChange={setWallCrit}
            />
          </CardContent>
        </Card>

        {/* 3. Dual MPU Tilt Angle Limits */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="size-4 text-purple-600" />
              Dual MPU (Gy87 AXL385) Tilt Limits
            </CardTitle>
            <CardDescription className="text-xs">
              Applies to both Horizontal (MPU-1) and Vertical (MPU-2) perpendicular sensors
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ThresholdSlider
              label="Tilt Warning Angle (°)"
              description="Initial inclination / slope deviation limit"
              value={tiltWarn}
              min={1.0}
              max={5.0}
              step={0.5}
              unit="°"
              warningZone={3.0}
              onChange={setTiltWarn}
            />
            <ThresholdSlider
              label="Tilt Critical Angle (°)"
              description="Severe structural / rock wall displacement trigger"
              value={tiltCrit}
              min={5.0}
              max={15.0}
              step={0.5}
              unit="°"
              criticalZone={7.0}
              onChange={setTiltCrit}
            />
          </CardContent>
        </Card>

        {/* 4. Actuator Automation & Linkages */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="size-4 text-amber-600" />
              Emergency Actuator Automation
            </CardTitle>
            <CardDescription className="text-xs">
              Hardware sirens and visual matrix output triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <Volume2 className="size-4 text-rose-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Audible Buzzer Siren</span>
                  <span className="text-slate-500">Allow system to sound physical buzzer on hazard</span>
                </div>
              </div>
              <Switch checked={buzzerEnabled} onCheckedChange={setBuzzerEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <Grid3X3 className="size-4 text-orange-600" />
                <div>
                  <span className="font-bold text-slate-900 block">8x8 Flash LED Matrix</span>
                  <span className="text-slate-500">Render real-time visual warning patterns</span>
                </div>
              </div>
              <Switch checked={ledMatrixEnabled} onCheckedChange={setLedMatrixEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <Zap className="size-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Auto-Trigger on Critical</span>
                  <span className="text-slate-500">Instantly activate siren & danger flash on critical breach</span>
                </div>
              </div>
              <Switch checked={autoTrigger} onCheckedChange={setAutoTrigger} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
