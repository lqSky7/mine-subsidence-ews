//
//  MineVisionAnalysisService.swift
//  MineTechnician
//
//  iOS 27 On-Device Apple Intelligence Foundation Models & Vision Analysis Service.
//  Hackathon Inspection Rule: Hand / Skin / Person in camera frame -> UNSAFE; otherwise -> SAFE.
//

import Foundation
import CoreImage

#if canImport(Vision)
import Vision
#endif

#if canImport(FoundationModels)
import FoundationModels
#endif

public struct MineVisionAnalysisResult: Sendable {
    public let isSafe: Bool
    public let label: String
    public let detail: String
    
    public init(isSafe: Bool, label: String, detail: String) {
        self.isSafe = isSafe
        self.label = label
        self.detail = detail
    }
}

public final class MineVisionAnalysisService: Sendable {
    public static let shared = MineVisionAnalysisService()
    
    public init() {}
    
    /// Analyzes an inspection photo using Apple Vision (Hand/Skin/Pose) & on-device Foundation Model.
    /// Rule: Skin / Hand / Person detected -> UNSAFE; Clean mine / rock surface -> SAFE.
    public func analyzeInspectionPhoto(imageData: Data) async -> MineVisionAnalysisResult {
        var isHazardDetected = false
        var detectionReason = "Tunnel and rock face clear. No hand or human obstruction detected."
        
        #if canImport(CoreImage) && canImport(Vision)
        if let ciImage = CIImage(data: imageData) {
            let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])
            
            // 1. Hand Pose Detection
            let handReq = VNDetectHumanHandPoseRequest()
            handReq.maximumHandCount = 2
            
            // 2. Body Pose Detection
            let bodyReq = VNDetectHumanBodyPoseRequest()
            
            // 3. Face Detection
            let faceReq = VNDetectFaceRectanglesRequest()
            
            // 4. Image Classifier (Hand, Person, Skin, Finger)
            let classReq = VNClassifyImageRequest()
            
            if (try? handler.perform([handReq, bodyReq, faceReq, classReq])) != nil {
                if let hands = handReq.results, !hands.isEmpty {
                    isHazardDetected = true
                    detectionReason = "Human hand detected in camera frame."
                } else if let faces = faceReq.results, !faces.isEmpty {
                    isHazardDetected = true
                    detectionReason = "Human face / person detected in camera frame."
                } else if let bodies = bodyReq.results, !bodies.isEmpty {
                    isHazardDetected = true
                    detectionReason = "Human body / posture detected in camera frame."
                } else if let classifications = classReq.results {
                    let triggers = ["hand", "finger", "arm", "skin", "person", "human", "face", "palm", "wrist", "man", "woman"]
                    for obs in classifications where obs.confidence > 0.35 {
                        let id = obs.identifier.lowercased()
                        if triggers.contains(where: { id.contains($0) }) {
                            isHazardDetected = true
                            detectionReason = "Detected \(obs.identifier) (\(Int(obs.confidence * 100))% confidence)."
                            break
                        }
                    }
                }
            }
            
            // 5. Skin Tone Pixel Sampling (detects close-up hand covering camera lens)
            if !isHazardDetected {
                let ciContext = CIContext()
                if let cgImage = ciContext.createCGImage(ciImage, from: ciImage.extent) {
                    let width = min(cgImage.width, 160)
                    let height = min(cgImage.height, 120)
                    var pixelData = [UInt8](repeating: 0, count: width * height * 4)
                    let colorSpace = CGColorSpaceCreateDeviceRGB()
                    if let context = CGContext(
                        data: &pixelData,
                        width: width,
                        height: height,
                        bitsPerComponent: 8,
                        bytesPerRow: width * 4,
                        space: colorSpace,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
                    ) {
                        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
                        var skinPixels = 0
                        let total = width * height
                        for i in stride(from: 0, to: pixelData.count, by: 4) {
                            let r = Int(pixelData[i])
                            let g = Int(pixelData[i + 1])
                            let b = Int(pixelData[i + 2])
                            
                            // Peer et al. RGB human skin tone thresholding
                            if r > 95 && g > 40 && b > 20 &&
                               max(r, max(g, b)) - min(r, min(g, b)) > 15 &&
                               abs(r - g) > 15 && r > g && r > b {
                                skinPixels += 1
                            }
                        }
                        let skinRatio = Double(skinPixels) / Double(total)
                        if skinRatio > 0.22 {
                            isHazardDetected = true
                            detectionReason = "Close-up hand / skin coverage detected (\(Int(skinRatio * 100))% surface)."
                        }
                    }
                }
            }
        }
        #endif
        
        let isSafe = !isHazardDetected
        
        #if canImport(FoundationModels)
        if #available(iOS 27.0, macOS 27.0, *) {
            do {
                let session = LanguageModelSession()
                
                let prompt = """
                You are an underground mine safety inspector.
                Vision Analysis: Hand/skin detected = \(isHazardDetected). Detail: \(detectionReason).
                Rule: If skin, hand, or person is detected, status is UNSAFE. Otherwise, status is SAFE.
                Output only either SAFE or UNSAFE followed by a brief reason.
                """
                
                let response = try await session.respond(to: prompt)
                let text = response.content.trimmingCharacters(in: .whitespacesAndNewlines)
                
                return MineVisionAnalysisResult(
                    isSafe: isSafe,
                    label: isSafe ? "SAFE" : "UNSAFE",
                    detail: text.isEmpty ? detectionReason : text
                )
            } catch {
                // Fallback to Vision result
            }
        }
        #endif
        
        return MineVisionAnalysisResult(
            isSafe: isSafe,
            label: isSafe ? "SAFE" : "UNSAFE",
            detail: detectionReason
        )
    }
}
