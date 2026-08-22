//
//  UpwardLightingBeamView.swift
//  MineTechnician
//
//  1:1 implementation of LightingSim pointing from bottom towards top.
//  The light intensity, dispersion, and radius smoothly animate in lockstep with the health score.
//

import SwiftUI

public struct UpwardLightingBeamView: View, Animatable {
    public var score: Double
    public var rotation: Float
    
    nonisolated public var animatableData: Double {
        get { score }
        set { score = newValue }
    }
    
    public init(score: Double, rotation: Float = 0.0) {
        self.score = score
        self.rotation = rotation
    }
    
    public var body: some View {
        let norm = Float(max(0.0, min(100.0, score)) / 100.0) // 0.0 (low health) to 1.0 (perfect health)
        
        // Intensity smoothly scales from 0.4 (faint/dim) up to 2.8 (intense flare)
        let intensity = 0.4 + norm * 2.4
        
        // Dispersion smoothly widens when health drops, tightens into narrow cone when health is high
        let disperse = 0.12 + (1.0 - norm) * 0.70
        
        // Core radius smoothly shifts from 10 to 60
        let radius = 10.0 + (1.0 - norm) * 50.0
        
        GeometryReader { proxy in
            let width = proxy.size.width
            let height = proxy.size.height
            
            ZStack(alignment: .bottom) {
                // 1. Completely black base
                Color.black
                
                // 2. Metal Shader Layer (pointing from bottom upwards via 180 deg rotation)
                if #available(iOS 17.0, *) {
                    Color.black
                        .frame(width: width, height: height)
                        .layerEffect(
                            ShaderLibrary.lightingSimulation(
                                .float2(Float(width), Float(height * 0.25)),
                                .float(intensity),
                                .float(disperse),
                                .float(rotation),
                                .float(radius)
                            ),
                            maxSampleOffset: .zero
                        )
                        .rotationEffect(Angle(degrees: 180))
                }
                
                // 3. Vector Canvas beam lines (smoothly animated based on disperse & radius)
                BeamLinesCanvas(
                    disperse: disperse,
                    radius: radius,
                    rotation: rotation
                )
                .frame(width: width, height: height)
                .allowsHitTesting(false)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .ignoresSafeArea()
    }
}

/// Dedicated Animatable Canvas for smooth vector guide rays and concentric range circles
public struct BeamLinesCanvas: View, Animatable {
    public var disperse: Float
    public var radius: Float
    public var rotation: Float
    
    nonisolated public var animatableData: AnimatablePair<Float, AnimatablePair<Float, Float>> {
        get {
            AnimatablePair(disperse, AnimatablePair(radius, rotation))
        }
        set {
            disperse = newValue.first
            radius = newValue.second.first
            rotation = newValue.second.second
        }
    }
    
    public var body: some View {
        Canvas { context, size in
            let center = CGPoint(x: size.width / 2.0, y: size.height - 20)
            let beamLength: CGFloat = size.height * 0.95
            let baseAngle = -Float.pi / 2.0 // Direct UP
            let angle = baseAngle + rotation
            
            // Concentric range circles
            for r in stride(from: 60.0, through: Double(size.height * 1.1), by: 60.0) {
                let rect = CGRect(x: center.x - CGFloat(r), y: center.y - CGFloat(r), width: CGFloat(r * 2), height: CGFloat(r * 2))
                let circlePath = Path(ellipseIn: rect)
                context.stroke(circlePath, with: .color(.white.opacity(0.06)), style: StrokeStyle(lineWidth: 1))
            }
            
            let dir = CGPoint(x: CGFloat(cos(angle)), y: CGFloat(sin(angle)))
            let perp = CGPoint(x: -dir.y, y: dir.x)
            let spreadFactor = 2.0 * disperse
            let outerSpreadFactor = spreadFactor * 4.0
            
            func pathFor(spread: Float, color: Color, style: StrokeStyle = StrokeStyle()) {
                var leftLine = Path()
                var rightLine = Path()
                let steps = 100
                for i in 0...steps {
                    let t = Float(i) / Float(steps)
                    let dist = CGFloat(t) * beamLength
                    let t_mapped = t / 0.2
                    let clamped_t_mapped = max(0, min(1, t_mapped))
                    let startSmoothing = clamped_t_mapped * clamped_t_mapped * (3 - 2 * clamped_t_mapped)
                    let w0 = radius
                    let currentWidth = w0 + Float(dist) * spread * startSmoothing
                    
                    let pointOnAxis = CGPoint(x: center.x + dir.x * dist, y: center.y + dir.y * dist)
                    let offset = CGPoint(x: perp.x * CGFloat(currentWidth), y: perp.y * CGFloat(currentWidth))
                    
                    let leftP = CGPoint(x: pointOnAxis.x + offset.x, y: pointOnAxis.y + offset.y)
                    let rightP = CGPoint(x: pointOnAxis.x - offset.x, y: pointOnAxis.y - offset.y)
                    
                    if i == 0 {
                        leftLine.move(to: leftP)
                        rightLine.move(to: rightP)
                    } else {
                        leftLine.addLine(to: leftP)
                        rightLine.addLine(to: rightP)
                    }
                }
                context.stroke(leftLine, with: .color(color), style: style)
                context.stroke(rightLine, with: .color(color), style: style)
            }
            
            // Yellow inner core spread guide lines
            pathFor(spread: spreadFactor, color: .yellow.opacity(0.85), style: StrokeStyle(lineWidth: 0.8, dash: [4, 4]))
            
            // White outer diffuse spread guide lines
            pathFor(spread: outerSpreadFactor, color: .white.opacity(0.45), style: StrokeStyle(lineWidth: 0.8, dash: [3, 5]))
        }
    }
}
