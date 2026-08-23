//
//  HomeView.swift
//  MineTechnician
//
//  Minimalist Mine Health & Node Selector Display:
//  - Completely black background
//  - Upward lighting simulation
//  - Liquid Glass Node Slider (using default SwiftUI Liquid Glass APIs)
//  - Dynamic live mine health number and node telemetry (zero dummy data)
//

import SwiftUI
import Combine

public struct HomeView: View {
    @State private var healthScore: Double? = nil
    @State private var nodes: [EspNodeResponse] = []
    @State private var selectedNodeId: String = "FLEET"
    @State private var telemetryMap: [String: NodeTelemetryResponse] = [:]
    @State private var isConnected: Bool = false
    @State private var isLoading: Bool = true
    
    @Namespace private var nodeSliderNamespace
    
    // Auto-polling timer for live mine health & nodes updates
    let timer = Timer.publish(every: 3.0, on: .main, in: .common).autoconnect()
    
    public init() {}
    
    private var activeScore: Double {
        healthScore ?? 0.0
    }
    
    private var nodeOptions: [String] {
        ["FLEET"] + nodes.map(\.id)
    }
    
    public var body: some View {
        ZStack {
            // Completely black background
            Color.black
                .ignoresSafeArea()
            
            // Upward lighting simulation reflecting live health score
            UpwardLightingBeamView(score: activeScore)
                .animation(.easeInOut(duration: 2.5), value: activeScore)
                .ignoresSafeArea()
            
            VStack(spacing: 28) {
                // Top: Liquid Glass Node Selector Slider
                if !nodes.isEmpty {
                    liquidGlassNodeSlider
                        .padding(.top, 12)
                }
                
                Spacer()
                
                // Center: Big Live Health Score inside Glass Container
                if let score = healthScore, score > 0, nodes.contains(where: \.isOnline) {
                    VStack(spacing: 12) {
                        Text(String(format: "%.0f", score))
                            .font(.system(size: 130, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .contentTransition(.numericText(value: score))
                            .animation(.easeInOut(duration: 2.0), value: score)
                            .padding(.horizontal, 44)
                            .padding(.vertical, 20)
                            .background(
                                RoundedRectangle(cornerRadius: 36, style: .continuous)
                                    .fill(Color.white.opacity(0.06))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 36, style: .continuous)
                                            .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                                    )
                            )
                        
                        if selectedNodeId != "FLEET", let nodeTel = telemetryMap[selectedNodeId] {
                            // Node Specific Live Metric Badges
                            HStack(spacing: 10) {
                                if let gas = nodeTel.gas?.mq2Ppm {
                                    MetricPill(label: "GAS", value: String(format: "%.0f ppm", gas), isDanger: gas > 500)
                                }
                                if let dist = nodeTel.ultrasound?.distanceCm {
                                    MetricPill(label: "WALL", value: String(format: "%.1f cm", dist), isDanger: dist < 20)
                                }
                                if let tilt = nodeTel.imu1?.totalTiltDeg {
                                    MetricPill(label: "TILT", value: String(format: "%.1f°", tilt), isDanger: tilt > 10)
                                }
                            }
                            .transition(.opacity.combined(with: .scale))
                        }
                    }
                } else if !isLoading {
                    // No live physical data in last 30s -> Show dash
                    VStack(spacing: 8) {
                        Text("—")
                            .font(.system(size: 130, weight: .bold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.3))
                            .padding(.horizontal, 44)
                            .padding(.vertical, 20)
                            .background(
                                RoundedRectangle(cornerRadius: 36, style: .continuous)
                                    .fill(Color.white.opacity(0.04))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 36, style: .continuous)
                                            .strokeBorder(Color.white.opacity(0.08), lineWidth: 1)
                                    )
                            )
                        
                        Text("OFFLINE • NO LIVE TELEMETRY")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundStyle(.white.opacity(0.4))
                    }
                } else {
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(1.4)
                }
                
                Spacer()
            }
        }
        .task {
            await fetchAllLiveData()
        }
        .onReceive(timer) { _ in
            Task {
                await fetchAllLiveData()
            }
        }
        .preferredColorScheme(.dark)
    }
    
    @ViewBuilder
    private var liquidGlassNodeSlider: some View {
        if #available(iOS 26.0, macOS 26.0, *) {
            GlassEffectContainer(spacing: 6) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(nodeOptions, id: \.self) { nodeId in
                            Button {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                    selectedNodeId = nodeId
                                }
                            } label: {
                                HStack(spacing: 5) {
                                    if nodeId != "FLEET" {
                                        Circle()
                                            .fill(isNodeOnline(nodeId) ? Color.green : Color.red)
                                            .frame(width: 6, height: 6)
                                    }
                                    Text(nodeId == "FLEET" ? "FLEET WIDE" : nodeId)
                                        .font(.system(size: 11, weight: .bold, design: .rounded))
                                        .foregroundStyle(selectedNodeId == nodeId ? .white : .white.opacity(0.6))
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .glassEffect(selectedNodeId == nodeId ? .regular : .clear)
                                .glassEffectID(nodeId, in: nodeSliderNamespace)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 4)
                }
            }
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(nodeOptions, id: \.self) { nodeId in
                        Button {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                selectedNodeId = nodeId
                            }
                        } label: {
                            HStack(spacing: 5) {
                                if nodeId != "FLEET" {
                                    Circle()
                                        .fill(isNodeOnline(nodeId) ? Color.green : Color.red)
                                        .frame(width: 6, height: 6)
                                }
                                Text(nodeId == "FLEET" ? "FLEET WIDE" : nodeId)
                                    .font(.system(size: 11, weight: .bold, design: .rounded))
                                    .foregroundStyle(selectedNodeId == nodeId ? .white : .white.opacity(0.6))
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .fill(selectedNodeId == nodeId ? Color.white.opacity(0.18) : Color.white.opacity(0.04))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                                            .strokeBorder(Color.white.opacity(selectedNodeId == nodeId ? 0.25 : 0.08), lineWidth: 1)
                                    )
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 4)
            }
        }
    }
    
    private func isNodeOnline(_ id: String) -> Bool {
        nodes.first(where: { $0.id == id })?.isOnline ?? false
    }
    
    @MainActor
    private func fetchAllLiveData() async {
        do {
            async let healthTask = MineAPIService.shared.fetchLatestHealth()
            async let nodesTask = MineAPIService.shared.fetchNodes()
            async let telTask = MineAPIService.shared.fetchLiveTelemetry()
            
            let (health, fetchedNodes, tel) = try await (healthTask, nodesTask, telTask)
            
            withAnimation(.easeInOut(duration: 1.5)) {
                self.healthScore = health.overallScore
                self.nodes = fetchedNodes
                self.telemetryMap = tel
                self.isConnected = true
                self.isLoading = false
            }
        } catch {
            self.isConnected = false
            self.isLoading = false
        }
    }
}

private struct MetricPill: View {
    let label: String
    let value: String
    let isDanger: Bool
    
    var body: some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.system(size: 9, weight: .black, design: .rounded))
                .foregroundStyle(.white.opacity(0.5))
            Text(value)
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundStyle(isDanger ? Color.red : Color.white)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(
            Capsule(style: .continuous)
                .fill(Color.white.opacity(0.06))
                .overlay(
                    Capsule(style: .continuous)
                        .strokeBorder(Color.white.opacity(0.1), lineWidth: 1)
                )
        )
    }
}

#Preview {
    HomeView()
}
