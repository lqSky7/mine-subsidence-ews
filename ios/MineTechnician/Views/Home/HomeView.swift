//
//  HomeView.swift
//  MineTechnician
//
//  Minimalist Mine Health Display:
//  - Completely black background
//  - Upward lighting simulation from bottom towards top
//  - ONLY big number in center with GlassEffectContainer and .glassEffect(.clear)
//  - Number morphs with .contentTransition(.numericText()) and lighting & lines shift smoothly in lockstep
//

import SwiftUI
import Combine

public struct HomeView: View {
    // Simulated health score (0 - 100)
    @State private var healthScore: Double = 94.0
    
    // Preset simulation sequence to clearly demonstrate smooth dynamic shifts
    @State private var stepIndex: Int = 0
    let simulatedScores: [Double] = [96.0, 78.0, 52.0, 88.0, 64.0, 92.0, 42.0, 95.0]
    
    // Simulation timer
    let timer = Timer.publish(every: 4.0, on: .main, in: .common).autoconnect()
    
    public init() {}
    
    public var body: some View {
        ZStack {
            // Completely black background
            Color.black
                .ignoresSafeArea()
            
            // Upward lighting simulation: light intensity & lines smoothly shift frame-by-frame
            UpwardLightingBeamView(score: healthScore)
                .animation(.easeInOut(duration: 2.5), value: healthScore)
                .ignoresSafeArea()
            
            // Big number inside GlassEffectContainer with .glassEffect(.clear) and numericText transition
            GlassEffectContainer {
                Text(String(format: "%.0f", healthScore))
                    .font(.system(size: 140, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .contentTransition(.numericText(value: healthScore))
                    .animation(.easeInOut(duration: 2.5), value: healthScore)
                    .padding(.horizontal, 48)
                    .padding(.vertical, 24)
                    .glassEffect(.clear, in: .rect(cornerRadius: 36))
            }
        }
        .onReceive(timer) { _ in
            stepIndex = (stepIndex + 1) % simulatedScores.count
            let targetScore = simulatedScores[stepIndex]
            
            withAnimation(.easeInOut(duration: 2.5)) {
                healthScore = targetScore
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    HomeView()
}
