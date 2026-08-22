//
//  PhotosView.swift
//  MineTechnician
//
//  Page 3: Mine Photo View
//  - Completely black background
//  - Just ONE photo
//  - Absolutely NO text on this view
//

import SwiftUI

public struct PhotosView: View {
    public init() {}
    
    public var body: some View {
        ZStack {
            // Completely black background
            Color.black
                .ignoresSafeArea()
            
            // Single high-resolution underground mine photo presentation
            MineTunnelPhotoCanvas()
                .aspectRatio(4/3, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.8), radius: 30, x: 0, y: 15)
                .padding(.horizontal, 20)
        }
        .preferredColorScheme(.dark)
    }
}

/// Rich underground mine tunnel perspective photo canvas with glowing track illumination
private struct MineTunnelPhotoCanvas: View {
    var body: some View {
        Canvas { context, size in
            let w = size.width
            let h = size.height
            let vanishPoint = CGPoint(x: w * 0.5, y: h * 0.44)
            
            // 1. Dark rock cavern gradient background
            let bgRect = CGRect(origin: .zero, size: size)
            context.fill(
                Path(bgRect),
                with: .linearGradient(
                    Gradient(colors: [
                        Color(red: 0.05, green: 0.06, blue: 0.08),
                        Color(red: 0.12, green: 0.14, blue: 0.18),
                        Color(red: 0.06, green: 0.07, blue: 0.09)
                    ]),
                    startPoint: CGPoint(x: w * 0.5, y: 0),
                    endPoint: CGPoint(x: w * 0.5, y: h)
                )
            )
            
            // 2. Tunnel Archway Ribs (Perspective Depth Rings)
            for i in stride(from: 0.15, through: 1.0, by: 0.12) {
                let progress = CGFloat(i)
                let archWidth = w * (0.18 + progress * 0.78)
                let archHeight = h * (0.2 + progress * 0.76)
                let archRect = CGRect(
                    x: vanishPoint.x - archWidth * 0.5,
                    y: vanishPoint.y - archHeight * 0.55 + progress * 15,
                    width: archWidth,
                    height: archHeight
                )
                let archPath = Path(roundedRect: archRect, cornerSize: CGSize(width: archWidth * 0.45, height: archHeight * 0.45))
                context.stroke(
                    archPath,
                    with: .color(Color(red: 0.35, green: 0.4, blue: 0.48).opacity(Double(0.1 + progress * 0.35))),
                    style: StrokeStyle(lineWidth: CGFloat(1.0 + progress * 2.5))
                )
            }
            
            // 3. Rail Tracks converging to vanishing point
            var leftRail = Path()
            leftRail.move(to: vanishPoint)
            leftRail.addLine(to: CGPoint(x: w * 0.18, y: h))
            
            var rightRail = Path()
            rightRail.move(to: vanishPoint)
            rightRail.addLine(to: CGPoint(x: w * 0.82, y: h))
            
            context.stroke(leftRail, with: .color(Color.yellow.opacity(0.85)), style: StrokeStyle(lineWidth: 2.5))
            context.stroke(rightRail, with: .color(Color.yellow.opacity(0.85)), style: StrokeStyle(lineWidth: 2.5))
            
            // 4. Rail Ties (Sleepers)
            for t in stride(from: 0.1, through: 1.0, by: 0.08) {
                let p = CGFloat(t * t)
                let y = vanishPoint.y + p * (h - vanishPoint.y)
                let leftX = vanishPoint.x + (w * 0.18 - vanishPoint.x) * p
                let rightX = vanishPoint.x + (w * 0.82 - vanishPoint.x) * p
                
                var tie = Path()
                tie.move(to: CGPoint(x: leftX - 10 * p, y: y))
                tie.addLine(to: CGPoint(x: rightX + 10 * p, y: y))
                context.stroke(tie, with: .color(Color.white.opacity(Double(0.15 + p * 0.45))), style: StrokeStyle(lineWidth: CGFloat(1.0 + p * 3.0)))
            }
            
            // 5. Overhead Safety Worklight / Optical Beacon at vanishing point
            let lightRect = CGRect(x: vanishPoint.x - 30, y: vanishPoint.y - 30, width: 60, height: 60)
            context.fill(
                Path(ellipseIn: lightRect),
                with: .radialGradient(
                    Gradient(colors: [
                        Color.cyan.opacity(0.8),
                        Color.cyan.opacity(0.15),
                        Color.clear
                    ]),
                    center: vanishPoint,
                    startRadius: 2,
                    endRadius: 28
                )
            )
        }
    }
}

#Preview {
    PhotosView()
}
