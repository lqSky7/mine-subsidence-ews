//
//  AlarmView.swift
//  MineTechnician
//
//  Page 2: Remote Mine Alarm
//  - Completely black background
//  - Big alert icon in center
//  - iOS DEFAULT prominent red button to raise the alarm
//

import SwiftUI
import Combine

#if canImport(UIKit)
import UIKit
#endif

public struct AlarmView: View {
    @State private var isAlarmTriggered: Bool = false
    @State private var isLoading: Bool = false
    
    // Auto-polling timer to sync real-world mine alarm state
    let timer = Timer.publish(every: 2.5, on: .main, in: .common).autoconnect()
    
    public init() {}
    
    public var body: some View {
        ZStack {
            // Completely black background
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Big Alert Icon in center
                Image(systemName: isAlarmTriggered ? "bell.and.waveform.fill" : "exclamationmark.triangle.fill")
                    .font(.system(size: 110, weight: .bold))
                    .foregroundStyle(.red)
                    .symbolEffect(.pulse, isActive: isAlarmTriggered)
                
                Spacer()
                
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
                .padding(.horizontal, 32)
                .padding(.bottom, 20)
            }
        }
        .task {
            await syncAlarmState()
        }
        .onReceive(timer) { _ in
            Task {
                await syncAlarmState()
            }
        }
        .preferredColorScheme(.dark)
    }
    
    @MainActor
    private func syncAlarmState() async {
        guard !isLoading else { return }
        do {
            let activeAlarms = try await MineAPIService.shared.fetchActiveAlarms()
            let hasActive = !activeAlarms.isEmpty
            if hasActive != isAlarmTriggered {
                withAnimation(.easeInOut(duration: 0.3)) {
                    self.isAlarmTriggered = hasActive
                }
            }
        } catch {
            // Keep current local state if transient error
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
