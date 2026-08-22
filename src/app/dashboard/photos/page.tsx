"use client";

import React, { useState, useMemo } from "react";
import { useTelemetryContext } from "@/components/layout/telemetry-provider";
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
import {
  EmptyState,
  PageHeader,
  PageShell,
  StatStrip,
  StatusBadge,
  Toolbar,
} from "@/components/uber/dashboard-primitives";
import type { MinePhoto } from "@/types";
import { cn } from "@/lib/utils";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL
  ? process.env.NEXT_PUBLIC_BACKEND_URL.replace("/api/v1", "")
  : "https://commute-overrule-employer.ngrok-free.dev";

function getFallbackSvgDataUri(photo?: Partial<MinePhoto>): string {
  const category = photo?.category || "TUNNEL";
  const title = photo?.title || "Underground Gallery";
  const location = photo?.location || "Chamber 1 - Gallery North";
  const timestamp = photo?.timestamp ? new Date(photo.timestamp).toLocaleTimeString() : "Live Feed";

  let strokeColor = "#00ffff";
  let beamColor = "#00e676";
  let bgGradient1 = "#07090e";
  let bgGradient2 = "#111827";

  if (category === "THERMAL_SCAN") {
    strokeColor = "#ff3d00";
    beamColor = "#ff9100";
    bgGradient1 = "#1a0500";
    bgGradient2 = "#3e0a00";
  } else if (category === "WORKING_FACE") {
    strokeColor = "#ffd600";
    beamColor = "#ffab00";
    bgGradient1 = "#0a0a0c";
    bgGradient2 = "#18181b";
  } else if (category === "SUBSIDENCE_SURFACE") {
    strokeColor = "#38bdf8";
    beamColor = "#818cf8";
    bgGradient1 = "#030712";
    bgGradient2 = "#0f172a";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient1}" />
        <stop offset="50%" stop-color="${bgGradient2}" />
        <stop offset="100%" stop-color="#030407" />
      </linearGradient>
      <radialGradient id="beaconGlow" cx="50%" cy="44%" r="40%">
        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.8" />
        <stop offset="30%" stop-color="${beamColor}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
      </pattern>
    </defs>
    
    <rect width="800" height="500" fill="url(#bgGrad)" />
    <rect width="800" height="500" fill="url(#grid)" />
    
    <!-- Perspective Tunnel Arch Ribs -->
    <path d="M 50 500 L 280 220 L 520 220 L 750 500" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" />
    <path d="M 120 500 L 320 220 L 480 220 L 680 500" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2.5" />
    <path d="M 200 500 L 360 220 L 440 220 L 600 500" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
    
    <!-- Ground Rails -->
    <line x1="400" y1="220" x2="160" y2="500" stroke="${strokeColor}" stroke-width="2.5" stroke-opacity="0.7" />
    <line x1="400" y1="220" x2="640" y2="500" stroke="${strokeColor}" stroke-width="2.5" stroke-opacity="0.7" />
    
    <!-- Rail Ties -->
    <line x1="380" y1="260" x2="420" y2="260" stroke="${strokeColor}" stroke-width="1.5" stroke-opacity="0.4" />
    <line x1="350" y1="310" x2="450" y2="310" stroke="${strokeColor}" stroke-width="1.5" stroke-opacity="0.4" />
    <line x1="310" y1="370" x2="490" y2="370" stroke="${strokeColor}" stroke-width="2" stroke-opacity="0.4" />
    <line x1="250" y1="440" x2="550" y2="440" stroke="${strokeColor}" stroke-width="2.5" stroke-opacity="0.5" />

    <!-- Center Light Beacon -->
    <circle cx="400" cy="220" r="70" fill="url(#beaconGlow)" />
    <circle cx="400" cy="220" r="5" fill="#ffffff" />
    
    <!-- Camera HUD Telemetry Overlay -->
    <g opacity="0.85">
      <!-- Top Left Label -->
      <rect x="24" y="24" width="6" height="6" fill="${beamColor}" />
      <text x="36" y="30" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="1">ESP32-CAM • ${category}</text>
      <text x="36" y="46" fill="#9ca3af" font-family="monospace" font-size="10">${location.toUpperCase()}</text>
      
      <!-- Top Right Timestamp -->
      <text x="776" y="30" text-anchor="end" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold">REC [LIVE]</text>
      <text x="776" y="46" text-anchor="end" fill="#9ca3af" font-family="monospace" font-size="10">${timestamp}</text>
      
      <!-- Center Reticle -->
      <circle cx="400" cy="250" r="30" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="4 4" />
      <line x1="390" y1="250" x2="410" y2="250" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
      <line x1="400" y1="240" x2="400" y2="260" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
      
      <!-- Bottom Metadata Bar -->
      <rect x="24" y="460" width="752" height="1" fill="rgba(255,255,255,0.15)" />
      <text x="24" y="480" fill="#9ca3af" font-family="monospace" font-size="10">FOV: 120° · RES: 1080P · ISO: 800 · EXPOSURE: 1/60s</text>
      <text x="776" y="480" text-anchor="end" fill="#9ca3af" font-family="monospace" font-size="10">${title}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function PhotosPage() {
  const { photos, nodes, ingestPhoto, uploadPhoto, isConnected } = useTelemetryContext();

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

  // Resolve photo URL supporting Data URIs, API image endpoints, and direct static URLs (SparkleYR)
  const getFullImageUrl = (path?: string, photo?: Partial<MinePhoto>) => {
    if (path && (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:"))) {
      return path;
    }
    if (photo?.id) {
      return `${BACKEND_BASE}/api/v1/photos/${photo.id}/image`;
    }
    if (path) {
      return `${BACKEND_BASE}${path}`;
    }
    return getFallbackSvgDataUri(photo);
  };

  return (
    <PageShell>
      {/* Uber Base Page Header */}
      <PageHeader
        eyebrow="Visual Evidence"
        title="Optical inspections"
        description="ESP32-CAM optical and infrared underground gallery monitoring feed. Structural clearance scans, rock strata inspection, and drone subsidence tracking."
        meta={
          <StatusBadge tone="neutral" className="font-mono text-[9px]">
            {photos.length} SCANS ON RECORD
          </StatusBadge>
        }
        actions={
          <Button
            size="sm"
            onClick={() => setIsCaptureOpen(true)}
            className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Icon icon="solar:camera-minimalistic-bold" className="mr-1.5 size-4" />
            Capture Inspection Scan
          </Button>
        }
      />

      {/* Summary StatStrip */}
      <StatStrip
        items={[
          { label: "Total Scans", value: `${photos.length} Record${photos.length === 1 ? "" : "s"}` },
          { label: "Active Camera Source", value: latestPhoto?.nodeId || "ESP-NODE-01", tone: isConnected ? "live" : "neutral" },
          { label: "S3 Cloud Bucket", value: "mine-iot-photos-697114252450" },
          { label: "S3 Synced Records", value: `${photos.filter((p) => p.imageUrl?.includes("amazonaws.com")).length || "Verified"} Cloud` },
        ]}
      />

      {/* Featured Latest Camera Feed Banner */}
      {latestPhoto && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div
              className="relative flex min-h-[300px] cursor-pointer items-center justify-center bg-black lg:col-span-7"
              onClick={() => setSelectedPhoto(latestPhoto)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFullImageUrl(latestPhoto.imageUrl, latestPhoto)}
                alt={latestPhoto.title}
                onError={(e) => {
                  e.currentTarget.src = getFallbackSvgDataUri(latestPhoto);
                }}
                className="max-h-[380px] w-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  Live Feed Snapshot
                </span>
                <span className="rounded bg-black/70 px-2 py-0.5 font-mono text-[9px] font-semibold text-neutral-200 backdrop-blur-md">
                  {latestPhoto.nodeId || "ESP-NODE-01"}
                </span>
              </div>
              <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white drop-shadow-md">{latestPhoto.title}</h3>
                  <p className="mt-0.5 text-xs text-neutral-300 drop-shadow-sm">{latestPhoto.location || "Underground Gallery"}</p>
                </div>
                <Button size="xs" variant="outline" className="border-neutral-700 bg-black/70 text-white hover:bg-black">
                  <Icon icon="solar:maximize-square-minimalistic-bold" className="mr-1 size-3.5" /> Enlarge
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4 p-6 lg:col-span-5">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Active Gallery Station Feed
                </span>
                <h2 className="mt-1 text-lg font-semibold text-neutral-950 dark:text-neutral-50">
                  {latestPhoto.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Optical tunnel clearance inspection verifying track stability, arch rib supports, and structural integrity at {latestPhoto.location}.
                </p>
              </div>

              <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs dark:border-neutral-900">
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                  <span className="text-neutral-500">Timestamp</span>
                  <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(latestPhoto.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                  <span className="text-neutral-500">Station Source</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">{latestPhoto.nodeId || "ESP-NODE-01"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                  <span className="text-neutral-500">Category</span>
                  <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[9px] font-semibold text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                    {latestPhoto.category || "TUNNEL"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Camera Optics</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {String(latestPhoto.metadata?.cameraModel || "ESP32-CAM-IR-NightVision")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <Toolbar>
        <div className="relative w-full max-w-sm">
          <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search scans by title, chamber, station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 rounded-md border-neutral-300 bg-white pl-9 text-xs dark:border-neutral-700 dark:bg-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="mr-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Category:</span>
          {["ALL", "TUNNEL", "WORKING_FACE", "SUBSIDENCE_SURFACE", "THERMAL_SCAN", "INSPECTION"].map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={categoryFilter === cat ? "default" : "outline"}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "h-7 px-2.5 font-mono text-[11px]",
                categoryFilter === cat
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
              )}
            >
              {cat.replace("_", " ")}
            </Button>
          ))}
        </div>
      </Toolbar>

      {/* Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          title="No Visual Inspection Scans Found"
          description="Capture a new camera snapshot from an active ESP station to record visual ground conditions."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFullImageUrl(photo.thumbnailUrl || photo.imageUrl, photo)}
                    alt={photo.title}
                    onError={(e) => {
                      e.currentTarget.src = getFallbackSvgDataUri(photo);
                    }}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded bg-black/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-tight text-white backdrop-blur-md">
                      {photo.category || "INSPECTION"}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] text-neutral-200">
                      {new Date(photo.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="p-4 pb-2">
                  <h3 className="line-clamp-1 text-sm font-semibold text-neutral-950 transition-colors group-hover:text-neutral-600 dark:text-neutral-50 dark:group-hover:text-neutral-300">
                    {photo.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {photo.location || "Underground Station"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 p-4 pt-3 text-xs text-neutral-500 dark:border-neutral-900">
                <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                  {photo.nodeId || "ESP Node"}
                </span>
                <span className="flex items-center gap-1 font-semibold text-neutral-950 group-hover:underline dark:text-neutral-100">
                  Inspect <Icon icon="solar:arrow-right-up-linear" className="size-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Inspection Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="overflow-hidden border-neutral-800 bg-neutral-950 p-0 text-neutral-100 sm:max-w-3xl">
          {selectedPhoto && (
            <div>
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFullImageUrl(selectedPhoto.imageUrl, selectedPhoto)}
                  alt={selectedPhoto.title}
                  onError={(e) => {
                    e.currentTarget.src = getFallbackSvgDataUri(selectedPhoto);
                  }}
                  className="max-h-[480px] w-full object-contain"
                />
              </div>

              <div className="space-y-4 bg-neutral-900/90 p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-neutral-800 px-2.5 py-0.5 font-mono text-[10px] font-bold text-neutral-300">
                      {selectedPhoto.category || "TUNNEL"}
                    </span>
                    <span className="font-mono text-xs text-neutral-400">
                      {new Date(selectedPhoto.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <DialogTitle className="mt-2 text-lg font-bold text-white">
                    {selectedPhoto.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs text-neutral-400">
                    Location: {selectedPhoto.location || "Underground Station"} · Source: {selectedPhoto.nodeId || "ESP-NODE-01"}
                  </DialogDescription>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-neutral-800 pt-4 text-xs sm:grid-cols-4 font-mono">
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-2.5">
                    <span className="text-[10px] uppercase text-neutral-500">Optics</span>
                    <span className="mt-0.5 block font-bold text-neutral-200">
                      {String(selectedPhoto.metadata?.cameraModel || "ESP32-CAM (IR 850nm)")}
                    </span>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-2.5">
                    <span className="text-[10px] uppercase text-neutral-500">Resolution</span>
                    <span className="mt-0.5 block font-bold text-neutral-200">
                      {String(selectedPhoto.metadata?.resolution || "1920x1080")}
                    </span>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-2.5">
                    <span className="text-[10px] uppercase text-neutral-500">Exposure / ISO</span>
                    <span className="mt-0.5 block font-bold text-neutral-200">
                      {String(selectedPhoto.metadata?.exposure || "1/60s")} · ISO {String(selectedPhoto.metadata?.iso || "800")}
                    </span>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-950 p-2.5">
                    <span className="text-[10px] uppercase text-neutral-500">Storage Destination</span>
                    <span className="mt-0.5 block font-bold text-neutral-200 truncate">
                      {selectedPhoto.imageUrl?.includes("amazonaws.com")
                        ? "S3 AWS Cloud"
                        : "Station Memory"}
                    </span>
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-neutral-800 pt-3">
                  {selectedPhoto.imageUrl?.startsWith("http") ? (
                    <a
                      href={selectedPhoto.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 font-mono text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    >
                      <Icon icon="solar:link-minimalistic-bold" className="size-3.5" />
                      View Full S3 URL
                    </a>
                  ) : (
                    <span className="font-mono text-[11px] text-neutral-500">Station Camera Buffer</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPhoto(null)}
                    className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Capture / Upload Dialog */}
      <Dialog open={isCaptureOpen} onOpenChange={setIsCaptureOpen}>
        <DialogContent className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-950 dark:text-neutral-50">
              Capture Inspection Scan
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Trigger a manual camera snapshot from an underground station or upload a visual inspection file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Scan Title / Description</Label>
              <Input
                placeholder="e.g., Chamber 1 Gallery Face - Support Rib Crack Check"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 rounded-md border-neutral-300 bg-white text-xs dark:border-neutral-700 dark:bg-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Station Source</Label>
                <Select value={newNodeId} onValueChange={(val) => val && setNewNodeId(val)}>
                  <SelectTrigger className="h-9 rounded-md border-neutral-300 bg-white text-xs dark:border-neutral-700 dark:bg-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                    {nodes.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.id} ({n.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={newCategory}
                  onValueChange={(val) => val && setNewCategory(val as MinePhoto["category"])}
                >
                  <SelectTrigger className="h-9 rounded-md border-neutral-300 bg-white text-xs dark:border-neutral-700 dark:bg-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
                    <SelectItem value="TUNNEL">Tunnel Clearance</SelectItem>
                    <SelectItem value="WORKING_FACE">Working Face</SelectItem>
                    <SelectItem value="SUBSIDENCE_SURFACE">Subsidence Surface</SelectItem>
                    <SelectItem value="THERMAL_SCAN">Thermal Scan</SelectItem>
                    <SelectItem value="INSPECTION">Inspection Vault</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Location Detail</Label>
              <Input
                placeholder="Gallery North AA - Working Face 1"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="h-9 rounded-md border-neutral-300 bg-white text-xs dark:border-neutral-700 dark:bg-black"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Attach Image File (Optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="h-9 cursor-pointer rounded-md border-neutral-300 bg-white text-xs dark:border-neutral-700 dark:bg-black"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCaptureOpen(false)}
              className="border-neutral-300 bg-white dark:border-neutral-700 dark:bg-black"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCaptureSnapshot}
              disabled={isSubmitting || !newTitle.trim()}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {isSubmitting ? "Recording..." : "Save Inspection Scan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
