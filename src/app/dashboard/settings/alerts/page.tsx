"use client";

import React, { useState } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThresholdSlider } from "@/components/industrial/ThresholdSlider";
import {
  Settings,
  Bell,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  Volume2,
  Radio,
} from "lucide-react";

export default function AlertSettingsPage() {
  const { thresholds, setThresholds } = useTelemetryContext();

  const [tiltWarn, setTiltWarn] = useState(thresholds.tiltDegWarning);
  const [tiltCrit, setTiltCrit] = useState(thresholds.tiltDegCritical);
  const [dispWarn, setDispWarn] = useState(thresholds.displacementMmWarning);
  const [dispCrit, setDispCrit] = useState(thresholds.displacementMmCritical);
  const [crackWarn, setCrackWarn] = useState(thresholds.crackWidthMmWarning);
  const [crackCrit, setCrackCrit] = useState(thresholds.crackWidthMmCritical);
  const [vibThresh, setVibThresh] = useState(thresholds.vibrationCountThreshold);
  const [batteryLow, setBatteryLow] = useState(thresholds.batteryLowVoltage);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setThresholds({
      tiltDegWarning: tiltWarn,
      tiltDegCritical: tiltCrit,
      displacementMmWarning: dispWarn,
      displacementMmCritical: dispCrit,
      crackWidthMmWarning: crackWarn,
      crackWidthMmCritical: crackCrit,
      vibrationCountThreshold: vibThresh,
      batteryLowVoltage: batteryLow,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setTiltWarn(2.0);
    setTiltCrit(4.5);
    setDispWarn(10.0);
    setDispCrit(25.0);
    setCrackWarn(1.5);
    setCrackCrit(4.0);
    setVibThresh(10);
    setBatteryLow(3.4);
    setThresholds({
      tiltDegWarning: 2.0,
      tiltDegCritical: 4.5,
      displacementMmWarning: 10.0,
      displacementMmCritical: 25.0,
      crackWidthMmWarning: 1.5,
      crackWidthMmCritical: 4.0,
      vibrationCountThreshold: 10,
      batteryLowVoltage: 3.4,
    });
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100/80 flex items-center justify-center text-orange-700">
              <Sliders className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Safety Thresholds & Alert Configuration
              </h1>
              <p className="text-xs text-slate-500">
                Geotechnical Alarm Limits · DGMS Calibration · Multi-Channel Dispatch Settings
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

      {/* Geotechnical Alarm Limit Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Displacement Limits */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Ground Subsidence Displacement Limits
            </CardTitle>
            <CardDescription className="text-xs">
              HC-SR04 ultrasonic distance sensor vertical ground depression envelope
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ThresholdSlider
              label="Displacement Warning Level"
              description="Triggers early alert to inspect overburden fissures"
              value={dispWarn}
              min={2.0}
              max={20.0}
              step={0.5}
              unit="mm"
              warningZone={10.0}
              onChange={setDispWarn}
            />
            <ThresholdSlider
              label="Displacement Critical Level"
              description="Mandatory evacuation and structural shutdown threshold"
              value={dispCrit}
              min={15.0}
              max={50.0}
              step={1.0}
              unit="mm"
              criticalZone={25.0}
              onChange={setDispCrit}
            />
          </CardContent>
        </Card>

        {/* Tilt Limits */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Ground Inclination & Tilt Limits
            </CardTitle>
            <CardDescription className="text-xs">
              MPU6050 dual-axis resultant surface slope angle trigger
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ThresholdSlider
              label="Tilt Warning Angle"
              description="Initial surface slope deviation limit"
              value={tiltWarn}
              min={0.5}
              max={5.0}
              step={0.1}
              unit="°"
              warningZone={2.0}
              onChange={setTiltWarn}
            />
            <ThresholdSlider
              label="Tilt Critical Angle"
              description="Severe terrain slope deformation alert"
              value={tiltCrit}
              min={3.0}
              max={10.0}
              step={0.2}
              unit="°"
              criticalZone={4.5}
              onChange={setTiltCrit}
            />
          </CardContent>
        </Card>

        {/* Crack Sensor Limits */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Tension Crack Aperture Limits
            </CardTitle>
            <CardDescription className="text-xs">
              Fabricated crack sensor gap widening thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <ThresholdSlider
              label="Crack Initiation Threshold"
              description="Early micro-crack tensile strain detection"
              value={crackWarn}
              min={0.5}
              max={3.0}
              step={0.1}
              unit="mm"
              warningZone={1.5}
              onChange={setCrackWarn}
            />
            <ThresholdSlider
              label="Crack Rupture Threshold"
              description="Major tension fracture across surface infrastructure"
              value={crackCrit}
              min={2.0}
              max={8.0}
              step={0.2}
              unit="mm"
              criticalZone={4.0}
              onChange={setCrackCrit}
            />
          </CardContent>
        </Card>

        {/* Notification Channels */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Emergency Dispatch Channels
            </CardTitle>
            <CardDescription className="text-xs">
              Configured recipient groups for automated early warning alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 block">SMS Dispatch (GSM Gateway)</span>
                  <span className="text-slate-500">DGMS Safety Inspector & Colliery Manager</span>
                </div>
              </div>
              <Badge variant="secondary" className="font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Email Daily Log & Reports</span>
                  <span className="text-slate-500">planning.subsidence@coalfield.in</span>
                </div>
              </div>
              <Badge variant="secondary" className="font-bold bg-blue-100 text-blue-800">
                ACTIVE
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Volume2 className="size-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Audible Control Room Siren</span>
                  <span className="text-slate-500">Local horn siren on critical hazard</span>
                </div>
              </div>
              <Badge variant="secondary" className="font-bold bg-amber-100 text-amber-800">
                ENABLED
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
