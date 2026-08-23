//
//  AlarmView.swift
//  MineTechnician
//
//  Page 2: Remote Mine Alarm & Acoustic Buzzer Controller
//  - Completely black background
//  - Big alert icon in center
//  - Acoustic Piezo Buzzer Siren controller
//  - iOS DEFAULT prominent red button to raise the alarm
//

import SwiftUI
import Combine

#if canImport(UIKit)
import UIKit
#endif

public struct AlarmView: View {
    @State private var isAlarmTriggered: Bool = false
    @State private var isBuzzerActive: Bool = false
    @State private var isLoading: Bool = false
    @State private var isBuzzerLoading: Bool = false
    
    // Auto-polling timer to sync real-world mine alarm and buzzer state
    let timer = Timer.publish(every: 2.0, on: .main, in: .common).autoconnect()
    
    public init() {}
    
    public var body: some View {
        ZStack {
            // Completely black background
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                Spacer()
                
                // Big Alert Icon in center
                Image(systemName: isAlarmTriggered ? "bell.and.waveform.fill" : (isBuzzerActive ? "speaker.wave.3.fill" : "exclamationmark.triangle.fill"))
                    .font(.system(size: 100, weight: .bold))
                    .foregroundStyle(isAlarmTriggered ? .red : (isBuzzerActive ? .orange : .red.opacity(0.85)))
                    .symbolEffect(.pulse, isActive: isAlarmTriggered || isBuzzerActive)
                
                Spacer()
                
                // Acoustic Piezo Buzzer Actuator Card
                buzzerControlCard
                
                // iOS DEFAULT Prominent Red Button
                Button(role: isAlarmTriggered ? .cancel : .destructive) {
                    toggleAlarm()
                } label: {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                    } else {
                        Label(
                            isAlarmTriggered ? "DISMISS ALARM" : "RAISE ALARM",
                            systemImage: isAlarmTriggered ? "xmark.octagon.fill" : "bell.fill"
                        )
                        .font(.title3.bold())
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                .controlSize(.extraLarge)
                .buttonBorderShape(.capsule)
                .disabled(isLoading)
                .padding(.horizontal, 24)
                .padding(.bottom, 20)
            }
        }
        .task {
            await syncState()
        }
        .onReceive(timer) { _ in
            Task {
                await syncState()
            }
        }
        .preferredColorScheme(.dark)
    }
    
    @ViewBuilder
    private var buzzerControlCard: some View {
        HStack(spacing: 14) {
            Image(systemName: isBuzzerActive ? "speaker.wave.3.fill" : "speaker.slash.fill")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(isBuzzerActive ? Color.orange : Color.white.opacity(0.4))
                .symbolEffect(.variableColor.iterative, isActive: isBuzzerActive)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("PIEZO BUZZER SIREN")
                    .font(.system(size: 12, weight: .black, design: .rounded))
                    .foregroundStyle(.white)
                Text(isBuzzerActive ? "SOUNDING • 2.8 kHz ACTIVE" : "STANDBY • FLEET ACTUATOR")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundStyle(isBuzzerActive ? Color.orange : Color.white.opacity(0.45))
            }
            
            Spacer()
            
            Button {
                toggleBuzzer()
            } label: {
                if isBuzzerLoading {
                    ProgressView()
                        .tint(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                } else {
                    Text(isBuzzerActive ? "SILENCE" : "START BUZZER")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(isBuzzerActive ? Color.black : Color.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            Capsule(style: .continuous)
                                .fill(isBuzzerActive ? Color.orange : Color.white.opacity(0.12))
                                .overlay(
                                    Capsule(style: .continuous)
                                        .strokeBorder(isBuzzerActive ? Color.orange : Color.white.opacity(0.2), lineWidth: 1)
                                )
                        )
                }
            }
            .buttonStyle(.plain)
            .disabled(isBuzzerLoading)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .strokeBorder(isBuzzerActive ? Color.orange.opacity(0.4) : Color.white.opacity(0.1), lineWidth: 1)
                )
        )
        .padding(.horizontal, 24)
    }
    
    @MainActor
    private func syncState() async {
        guard !isLoading && !isBuzzerLoading else { return }
        
        // 1. Sync active alarms
        if let activeAlarms = try? await MineAPIService.shared.fetchActiveAlarms() {
            let hasActive = !activeAlarms.isEmpty
            if hasActive != isAlarmTriggered {
                withAnimation(.easeInOut(duration: 0.3)) {
                    self.isAlarmTriggered = hasActive
                }
            }
        }
        
        // 2. Sync buzzer actuator state
        if let telMap = try? await MineAPIService.shared.fetchLiveTelemetry() {
            let anyBuzzerActive = telMap.values.contains(where: { $0.actuators?.buzzerActive == true })
            if anyBuzzerActive != isBuzzerActive {
                withAnimation(.easeInOut(duration: 0.3)) {
                    self.isBuzzerActive = anyBuzzerActive
                }
            }
        }
    }
    
    private func toggleBuzzer() {
        #if canImport(UIKit)
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        #endif
        isBuzzerLoading = true
        
        Task { @MainActor in
            do {
                if isBuzzerActive {
                    _ = try await MineAPIService.shared.stopBuzzer(nodeId: "ALL")
                    withAnimation(.easeInOut(duration: 0.3)) {
                        self.isBuzzerActive = false
                    }
                } else {
                    _ = try await MineAPIService.shared.startBuzzer(nodeId: "ALL")
                    withAnimation(.easeInOut(duration: 0.3)) {
                        self.isBuzzerActive = true
                    }
                }
                #if canImport(UIKit)
                UINotificationFeedbackGenerator().notificationOccurred(.success)
                #endif
            } catch {
                #if canImport(UIKit)
                UINotificationFeedbackGenerator().notificationOccurred(.error)
                #endif
            }
            isBuzzerLoading = false
        }
    }
    
    private func toggleAlarm() {
        #if canImport(UIKit)
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        #endif
        isLoading = true
        
        Task { @MainActor in
            do {
                if isAlarmTriggered {
                    _ = try await MineAPIService.shared.resolveActiveAlarms(by: "Mine Technician (iOS)")
                    withAnimation(.easeInOut(duration: 0.3)) {
                        self.isAlarmTriggered = false
                        self.isBuzzerActive = false
                    }
                    #if canImport(UIKit)
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                    #endif
                } else {
                    _ = try await MineAPIService.shared.raiseManualAlarm(
                        nodeId: "FLEET_WIDE",
                        description: "Emergency alarm raised by technician via iOS app",
                        issuedBy: "Mine Technician (iOS)"
                    )
                    withAnimation(.easeInOut(duration: 0.3)) {
                        self.isAlarmTriggered = true
                        self.isBuzzerActive = true
                    }
                    #if canImport(UIKit)
                    UINotificationFeedbackGenerator().notificationOccurred(.warning)
                    #endif
                }
            } catch {
                #if canImport(UIKit)
                UINotificationFeedbackGenerator().notificationOccurred(.error)
                #endif
            }
            isLoading = false
        }
    }
}

#Preview {
    AlarmView()
}
