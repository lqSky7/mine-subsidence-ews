import Link from "next/link";
import { ArrowRight, Shield, Cpu, Activity, Radio, Compass, MapPin, Sparkles, Flame } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <nav className="absolute inset-x-0 top-4 z-50 mx-auto w-full lg:max-w-[calc(100%-4rem)]">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-600 shadow-md">
                <Flame className="size-5 text-white fill-current" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-base tracking-tight">Mine EWS Platform</span>
                <span className="text-[10px] text-slate-400 font-medium">Wireless Surface Mesh Subsidence AI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#problem" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Problem Statement</a>
              <a href="#architecture" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Mesh Architecture</a>
              <a href="#sensors" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">Low-Cost BOM</a>
              <Link
                href="/dashboard"
                className="group relative flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-600/20 px-4 py-2 text-xs font-bold tracking-tight hover:bg-orange-600 hover:text-white transition-all shadow-xs"
              >
                <span>Launch EWS Dashboard</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 lg:px-16 pt-24 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-[600px] rounded-full bg-orange-600/15 blur-[140px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 shadow-inner">
            <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">
              Made in India · Smart Mining Safety Initiative
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-[1.1]">
            Real-Time Mine Subsidence{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
              Prediction & Early Warning
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed text-balance">
            An indigenous, low-cost AI/ML platform powered by localized wireless surface mesh sensor networks deployed above underground coal mine panels in India. Continuous micro-deformation sensing before critical ground failure occurs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all"
            >
              Enter Command Center
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard/map"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              Interactive Deformation Map
            </Link>
          </div>
        </div>
      </section>

      {/* Problem & Background Section */}
      <section id="problem" className="bg-slate-900/60 border-y border-slate-800 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-400 mb-3">Background & Industry Gap</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-12">
            Why Indian Underground Coal Mines Need Real-Time Mesh Sensing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white">Post-Facto Damage Surveys</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conventional monitoring relies on periodic manual levelling and optical surveys that fail to provide early warning before sudden surface collapse occurs over active goaf panels.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white">High-Cost Import Barriers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Commercial imported robotic total stations and satellite InSAR platforms cost millions, making dense sensor deployment across hundreds of Indian coalfields cost-prohibitive.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-base font-bold text-white">Surface Infrastructure Hazards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Underground extraction triggers ground tilt, tension fractures, and vertical subsidence endangering public roads, railways, power lines, and forest reserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Multi-Sensor Subsystems */}
      <section id="sensors" className="py-24 max-w-6xl mx-auto px-6">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-400 mb-3">Low-Cost Hardware Innovation</p>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-12">
          4-in-1 Geotechnical Micro-Sensor Surface Nodes (&lt; ₹1,150 / Node)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Compass className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">MPU6050 Dual-Axis Tilt</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Measures continuous ground slope inclination, roll/pitch angles, and dynamic terrain tilt rates (&gt; 2.0°).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Activity className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">HC-SR04 Displacement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Millimeter-precision vertical ground sag monitoring calculating vertical subsidence delta against baseline pillars.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Tension Crack Aperture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fabricated conductive resistive grid detecting early surface tension cracks and aperture widening before catastrophic shear.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Radio className="size-5" />
            </div>
            <h3 className="text-sm font-bold text-white">SW420 Micro-Seismic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-sensitivity vibration pulse sensor capturing pre-collapse rock fracturing acoustic bursts and fault slips.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>AI-Enabled Mine Subsidence Early Warning System (EWS) © 2026</span>
          <span>Made in India · Student Prototype & Industry Scalable Architecture</span>
        </div>
      </footer>
    </div>
  );
}
