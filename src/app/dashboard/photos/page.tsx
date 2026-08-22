"use client";

import React, { useState, useMemo } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import type { MinePhoto } from "@/types";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL
  ? process.env.NEXT_PUBLIC_BACKEND_URL.replace("/api/v1", "")
  : "https://commute-overrule-employer.ngrok-free.dev";
const S3_FALLBACK_URL = "https://mine-iot-photos-697114252450.s3.us-east-1.amazonaws.com/photos/PHOTO-001.jpg";

export default function PhotosPage() {
  const { photos, nodes, ingestPhoto, uploadPhoto } = useTelemetryContext();

  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<MinePhoto | null>(null);

  // New Inspection Photo Capture Dialog
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNodeId, setNewNodeId] = useState("ESP-NODE-01");
  const [newLocation, setNewLocation] = useState("Gallery North AA - Working Face 1");
  const [newCategory, setNewCategory] = useState<MinePhoto["category"]>("TUNNEL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.nodeId && p.nodeId.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [photos, categoryFilter, searchTerm]);

  const latestPhoto = photos[0] || null;

  const handleCaptureSnapshot = async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("title", newTitle.trim());
        formData.append("nodeId", newNodeId);
        formData.append("location", newLocation);
        formData.append("category", newCategory || "TUNNEL");
        formData.append(
          "metadata",
          JSON.stringify({
            capturedBy: "SAFETY_OFFICER",
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
          })
        );
        await uploadPhoto(formData);
      } else {
        await ingestPhoto({
          title: newTitle.trim(),
          nodeId: newNodeId,
          location: newLocation,
          category: newCategory,
          metadata: {
            capturedBy: "SAFETY_OFFICER",
            resolution: "1920x1080",
            cameraModel: "ESP32-CAM-IR-NightVision",
            lightLevelLux: 85,
          },
        });
      }
      setIsCaptureOpen(false);
      setNewTitle("");
      setSelectedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return S3_FALLBACK_URL;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_BASE}${path}`;
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center shadow-xs">
              <Icon icon="solar:camera-bold-duotone" className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Visual Tunnel & Camera Inspections
                </h1>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {photos.length} SCANS ON RECORD
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ESP32-CAM Night Vision & Thermal Underground Gallery Visual Monitoring Feed
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsCaptureOpen(true)}
            className="text-xs font-bold h-8 bg-orange-600 hover:bg-orange-700 text-white gap-1.5 shadow-xs"
          >
            <Icon icon="solar:camera-minimalistic-bold" className="size-3.5" />
            Capture Inspection Scan
          </Button>
        </div>
      </div>

      {/* Featured Latest Camera Feed Banner */}
      {latestPhoto && (
        <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 bg-slate-950 relative min-h-[280px] flex items-center justify-center cursor-pointer group" onClick={() => setSelectedPhoto(latestPhoto)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFullImageUrl(latestPhoto.imageUrl)}
                alt={latestPhoto.title}
                className="w-full h-full object-cover max-h-[360px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <Badge className="bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-white animate-ping" /> LIVE FEED SNAPSHOT
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-bold bg-slate-900/80 text-slate-200 backdrop-blur-md">
                  {latestPhoto.nodeId || "ESP-NODE-01"}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm drop-shadow-md">{latestPhoto.title}</h3>
                  <p className="text-slate-300 text-xs mt-0.5 drop-shadow-sm">{latestPhoto.location || "Underground Gallery"}</p>
                </div>
                <Button size="sm" variant="secondary" className="h-7 text-xs font-semibold gap-1 bg-white/90 text-slate-900 hover:bg-white">
                  <Icon icon="solar:maximize-square-minimalistic-bold" className="size-3.5" /> Enlarge
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
              <div>
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">
                  Active Gallery Station Feed
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {latestPhoto.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Optical tunnel clearance inspection verifying track stability, arch rib supports, and structural integrity at {latestPhoto.location}.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Timestamp</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(latestPhoto.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Station Source</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{latestPhoto.nodeId || "ESP-NODE-01"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 font-medium">Inspection Category</span>
                  <Badge variant="outline" className="text-[9px] font-bold">
                    {latestPhoto.category || "TUNNEL"}
                  </Badge>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Camera Optics</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {String(latestPhoto.metadata?.cameraModel || "ESP32-CAM-IR-NightVision")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[220px] max-w-sm relative">
            <Icon icon="solar:magnifer-linear" className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search camera scans by title, chamber, station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Category:</span>
            {["ALL", "TUNNEL", "WORKING_FACE", "SUBSIDENCE_SURFACE", "THERMAL_SCAN", "INSPECTION"].map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={categoryFilter === cat ? "default" : "outline"}
                onClick={() => setCategoryFilter(cat)}
                className={`h-7 px-2.5 text-xs font-semibold rounded-lg ${
                  categoryFilter === cat ? "bg-orange-600 hover:bg-orange-700 text-white font-bold" : ""
                }`}
              >
                {cat.replace("_", " ")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Icon icon="solar:camera-broken" className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No Visual Inspection Scans Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Capture a new camera snapshot from an active ESP station to record visual ground conditions.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <Card
              key={photo.id}
              className="border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div>
                <div className="bg-slate-950 aspect-video relative overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFullImageUrl(photo.thumbnailUrl || photo.imageUrl)}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="outline" className="text-[9px] font-bold bg-slate-900/90 text-white border-slate-700 backdrop-blur-md">
                      {photo.category || "INSPECTION"}
                    </Badge>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] text-slate-200 bg-black/60 px-2 py-0.5 rounded-md font-mono">
                      {new Date(photo.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {photo.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {photo.location || "Underground Station"}
                  </CardDescription>
                </CardHeader>
              </div>

              <CardContent className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {photo.nodeId || "ESP Node"}
                </span>
                <span className="text-[11px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 group-hover:underline">
                  Inspect <Icon icon="solar:arrow-right-up-linear" className="size-3.5" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Enlarged Inspection Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-slate-950 text-slate-100 border-slate-800">
          {selectedPhoto && (
            <div>
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFullImageUrl(selectedPhoto.imageUrl)}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain max-h-[480px]"
                />
              </div>

              <div className="p-6 space-y-4 bg-slate-900/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedPhoto.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedPhoto.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold border-slate-700 text-slate-300">
                      {selectedPhoto.category}
                    </Badge>
                    <Badge className="bg-orange-600 text-white font-bold text-xs">
                      {selectedPhoto.nodeId || "ESP-NODE-01"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Timestamp</span>
                    <span className="font-semibold text-slate-200">{new Date(selectedPhoto.timestamp).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Camera Model</span>
                    <span className="font-semibold text-slate-200">{String(selectedPhoto.metadata?.cameraModel || "ESP32-CAM-IR")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Light Level</span>
                    <span className="font-semibold text-slate-200">{selectedPhoto.metadata?.lightLevelLux ? `${selectedPhoto.metadata.lightLevelLux} Lux` : "Infrared"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-medium block">Audit ID</span>
                    <span className="font-mono text-slate-200">{selectedPhoto.id}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)} className="text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Capture Inspection Dialog */}
      <Dialog open={isCaptureOpen} onOpenChange={setIsCaptureOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Icon icon="solar:camera-bold-duotone" className="size-5 text-orange-600" />
              Capture Remote Gallery Inspection
            </DialogTitle>
            <DialogDescription className="text-xs">
              Command an underground ESP32-CAM node to snapshot and index visual tunnel conditions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs font-sans">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-semibold">
                Inspection Title / Description
              </Label>
              <Input
                id="title"
                placeholder="e.g. Gallery North AA Support Ribs Check"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Station Node</Label>
                <Select value={newNodeId} onValueChange={(val) => {
                  if (val) {
                    setNewNodeId(val);
                    const n = nodes.find(x => x.id === val);
                    if (n?.location) setNewLocation(n.location);
                  }
                }}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.length > 0 ? (
                      nodes.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.id} ({n.label})
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="ESP-NODE-01">ESP-NODE-01</SelectItem>
                        <SelectItem value="ESP-NODE-02">ESP-NODE-02</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Category</Label>
                <Select value={newCategory} onValueChange={(val) => {
                  if (val) setNewCategory(val as MinePhoto["category"]);
                }}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUNNEL">Tunnel Clearance</SelectItem>
                    <SelectItem value="WORKING_FACE">Working Face</SelectItem>
                    <SelectItem value="SUBSIDENCE_SURFACE">Subsidence Surface</SelectItem>
                    <SelectItem value="THERMAL_SCAN">Thermal Scan</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="loc" className="text-xs font-semibold">
                Tunnel Location / Section
              </Label>
              <Input
                id="loc"
                placeholder="e.g. Gallery North AA - Working Face 1"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="photo-file" className="text-xs font-semibold">
                Upload Camera Snapshot Image (S3 Direct)
              </Label>
              <Input
                id="photo-file"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs h-9 cursor-pointer file:text-xs file:font-semibold file:text-orange-600 file:bg-orange-50 file:border-0 file:rounded-md file:mr-2"
              />
              <p className="text-[10px] text-slate-400">
                Optional. Leave empty to automatically trigger optical capture on the selected node.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCaptureOpen(false)}
              className="text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCaptureSnapshot}
              disabled={!newTitle.trim() || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>Capturing...</>
              ) : (
                <>
                  <Icon icon="solar:camera-minimalistic-bold" className="size-3.5" />
                  Trigger Camera Scan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
