"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, CheckCircle2, AlertCircle, Radio, Terminal } from "lucide-react";

export default function SecurityPage() {
  const securityEvents = [
    {
      id: "SEC-4401",
      time: "2026-08-22 20:25:10",
      nodeId: "NODE-04",
      type: "AES_GCM_VERIFIED",
      details: "Frame Counter: 18450 · Payload MAC Verified · Nonce: 0x3FA91C",
      status: "SUCCESS",
    },
    {
      id: "SEC-4402",
      time: "2026-08-22 20:22:04",
      nodeId: "NODE-03",
      type: "MESH_HANDSHAKE",
      details: "ECDHE P-256 ephemeral session key negotiated with RPi4 Gateway",
      status: "SUCCESS",
    },
    {
      id: "SEC-4403",
      time: "2026-08-22 20:15:33",
      nodeId: "RPI4-GW-01",
      type: "TOKEN_REFRESH",
      details: "JWT edge authentication token refreshed for Operator local session",
      status: "SUCCESS",
    },
  ];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Shield className="size-4.5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                LoRa Mesh Cryptography & Edge Gateway Security
              </h1>
              <p className="text-xs text-slate-500">
                End-to-End AES-128-GCM Encryption · Anti-Replay Nonce Tracking · Edge Bridge Isolation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="size-3.5 text-emerald-600" />
              Air Interface Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">AES-128-GCM</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Authenticated Payload Encryption</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="size-3.5 text-blue-600" />
              Key Exchange Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-slate-900">ECDHE P-256</div>
            <p className="text-xs text-slate-500 mt-1">Dynamic Per-Session Secret Derivation</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Packet Anti-Replay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-700">ACTIVE</div>
            <p className="text-xs text-slate-500 mt-1">32-Bit Monotonic Sequence Counter</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Event Log Table */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 bg-slate-50/80 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900">
            Cryptographic Audit Log & Key Exchange Verifications
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time verification of node packet integrity, signature validation, and authorization events
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Origin Node</th>
                <th className="py-3 px-4">Security Operation</th>
                <th className="py-3 px-4">Cryptographic Details</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {securityEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{evt.id}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{evt.time}</td>
                  <td className="py-3 px-4 font-mono font-bold">{evt.nodeId}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {evt.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{evt.details}</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {evt.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
