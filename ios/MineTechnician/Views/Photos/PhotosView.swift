//
//  PhotosView.swift
//  MineTechnician
//
//  Page 3: Mine Photo View with iOS 27 Private Cloud Compute (PCC) AI Vision Analysis
//  - Completely black background
//  - High resolution photo presentation
//  - iOS 27 Apple Intelligence PCC Foundation Models crack inspection ("SAFE" / "UNSAFE")
//  - Liquid Glass timeline selector for accessing the last 10 historical inspection scans
//  - Pure live data with zero dummy records
//

import SwiftUI
import Combine

#if canImport(UIKit)
import UIKit
public typealias PlatformImage = UIImage
#elseif canImport(AppKit)
import AppKit
public typealias PlatformImage = NSImage
#endif

extension Image {
    public init(platformImage: PlatformImage) {
        #if canImport(UIKit)
        self.init(uiImage: platformImage)
        #elseif canImport(AppKit)
        self.init(nsImage: platformImage)
        #endif
    }
}

public struct PhotosView: View {
    @State private var photos: [MinePhotoResponse] = []
    @State private var selectedPhotoId: String? = nil
    @State private var imageCache: [String: PlatformImage] = [:]
    @State private var rawDataCache: [String: Data] = [:]
    @State private var analysisResults: [String: MineVisionAnalysisResult] = [:]
    @State private var analyzingPhotoIds: Set<String> = []
    @State private var isAnalyzing: Bool = false
    @State private var isLoading: Bool = true
    
    @Namespace private var photoSliderNamespace
    
    // Auto-refresh timer for new camera captures
    let timer = Timer.publish(every: 6.0, on: .main, in: .common).autoconnect()
    
    public init() {}
    
    private var currentPhoto: MinePhotoResponse? {
        if let id = selectedPhotoId {
            return photos.first(where: { $0.id == id }) ?? photos.first
        }
        return photos.first
    }
    
    public var body: some View {
        ZStack {
            // Completely black background
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 16) {
                // Top: Active Inspection Image View with AI Safety Badge
                ZStack {
                    if let photo = currentPhoto {
                        if let img = imageCache[photo.id] {
                            Image(platformImage: img)
                                .resizable()
                                .aspectRatio(4/3, contentMode: .fit)
                                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                                        .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                                )
                                .overlay(alignment: .topTrailing) {
                                    aiSafetyBadge(for: photo)
                                }
                                .shadow(color: .black.opacity(0.9), radius: 24, x: 0, y: 12)
                                .transition(.opacity)
                        } else {
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .fill(Color.white.opacity(0.04))
                                .aspectRatio(4/3, contentMode: .fit)
                                .overlay(
                                    ProgressView()
                                        .tint(.white)
                                )
                        }
                    } else if isLoading {
                        ProgressView()
                            .tint(.white)
                            .scaleEffect(1.3)
                    } else {
                        VStack(spacing: 8) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 40))
                                .foregroundStyle(.white.opacity(0.3))
                            Text("No Camera Scans Available")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(.white.opacity(0.5))
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .padding(.horizontal, 16)
                .animation(.easeInOut(duration: 0.35), value: selectedPhotoId)
                
                // Bottom: Liquid Glass Timeline Selector for last 10 images
                if photos.count > 1 {
                    liquidGlassPhotoSlider
                        .padding(.bottom, 12)
                }
            }
        }
        .task {
            await fetchPhotos()
        }
        .onReceive(timer) { _ in
            Task {
                await fetchPhotos()
            }
        }
        .preferredColorScheme(.dark)
    }
    
    @ViewBuilder
    private func aiSafetyBadge(for photo: MinePhotoResponse) -> some View {
        Group {
            if let result = analysisResults[photo.id] {
                HStack(spacing: 5) {
                    Image(systemName: result.isSafe ? "checkmark.shield.fill" : "exclamationmark.triangle.fill")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(result.isSafe ? Color.green : Color.red)
                    
                    Text(result.label)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(result.isSafe ? Color.green : Color.red)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    Capsule(style: .continuous)
                        .fill(Color.black.opacity(0.75))
                )
                .shadow(color: .black.opacity(0.6), radius: 8, x: 0, y: 4)
            } else if analyzingPhotoIds.contains(photo.id) || (isAnalyzing && photo.id == currentPhoto?.id) {
                HStack(spacing: 6) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.65)
                        .frame(width: 12, height: 12)
                    
                    Text("INSPECTING")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.85))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    Capsule(style: .continuous)
                        .fill(Color.black.opacity(0.75))
                )
                .shadow(color: .black.opacity(0.6), radius: 8, x: 0, y: 4)
            }
        }
        .padding(14)
    }
    
    @ViewBuilder
    private var liquidGlassPhotoSlider: some View {
        if #available(iOS 26.0, macOS 26.0, *) {
            GlassEffectContainer(spacing: 6) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(photos.prefix(10).enumerated()), id: \.element.id) { index, photo in
                            Button {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                    selectedPhotoId = photo.id
                                }
                                Task {
                                    await preloadImage(for: photo)
                                }
                            } label: {
                                HStack(spacing: 6) {
                                    Text(index == 0 ? "LATEST" : "#\(index + 1)")
                                        .font(.system(size: 10, weight: .bold))
                                    
                                    if let loc = photo.nodeId {
                                        Text(loc)
                                            .font(.system(size: 10, weight: .semibold))
                                            .foregroundStyle(.white.opacity(0.7))
                                    }
                                }
                                .foregroundStyle(selectedPhotoId == photo.id ? .white : .white.opacity(0.5))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .glassEffect(selectedPhotoId == photo.id ? .regular : .clear)
                                .glassEffectID(photo.id, in: photoSliderNamespace)
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
                    ForEach(Array(photos.prefix(10).enumerated()), id: \.element.id) { index, photo in
                        Button {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                                selectedPhotoId = photo.id
                            }
                            Task {
                                await preloadImage(for: photo)
                            }
                        } label: {
                            HStack(spacing: 6) {
                                Text(index == 0 ? "LATEST" : "#\(index + 1)")
                                    .font(.system(size: 10, weight: .bold))
                                
                                if let loc = photo.nodeId {
                                    Text(loc)
                                        .font(.system(size: 10, weight: .semibold))
                                        .foregroundStyle(.white.opacity(0.7))
                                }
                            }
                            .foregroundStyle(selectedPhotoId == photo.id ? .white : .white.opacity(0.5))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .fill(selectedPhotoId == photo.id ? Color.white.opacity(0.18) : Color.white.opacity(0.04))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                                            .strokeBorder(Color.white.opacity(selectedPhotoId == photo.id ? 0.25 : 0.08), lineWidth: 1)
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
    
    @MainActor
    private func fetchPhotos() async {
        do {
            let fetchedPhotos = try await MineAPIService.shared.fetchPhotosList(limit: 10)
            withAnimation(.easeInOut(duration: 0.25)) {
                self.photos = fetchedPhotos
                if self.selectedPhotoId == nil || !fetchedPhotos.contains(where: { $0.id == self.selectedPhotoId }),
                   let first = fetchedPhotos.first {
                    self.selectedPhotoId = first.id
                }
                self.isLoading = false
            }
            
            // Preload current image immediately
            if let photo = currentPhoto {
                await preloadImage(for: photo)
            }
            
            // Preload remaining inspection scans in background
            for photo in fetchedPhotos {
                if photo.id != currentPhoto?.id {
                    Task {
                        await preloadImage(for: photo)
                    }
                }
            }
        } catch {
            self.isLoading = false
        }
    }
    
    @MainActor
    private func preloadImage(for photo: MinePhotoResponse) async {
        if let raw = rawDataCache[photo.id] {
            if analysisResults[photo.id] == nil {
                await analyzeImageWithAI(for: photo, data: raw)
            }
            return
        }
        
        do {
            let data = try await MineAPIService.shared.loadImageData(for: photo)
            self.rawDataCache[photo.id] = data
            
            #if canImport(UIKit)
            if let uiImg = UIImage(data: data) {
                self.imageCache[photo.id] = uiImg
            }
            #elseif canImport(AppKit)
            if let nsImg = NSImage(data: data) {
                self.imageCache[photo.id] = nsImg
            }
            #endif
            
            await analyzeImageWithAI(for: photo, data: data)
        } catch {
            // failed to load image
        }
    }
    
    @MainActor
    private func analyzeImageWithAI(for photo: MinePhotoResponse, data: Data) async {
        if analysisResults[photo.id] != nil || analyzingPhotoIds.contains(photo.id) { return }
        self.analyzingPhotoIds.insert(photo.id)
        self.isAnalyzing = true
        
        let result = await MineVisionAnalysisService.shared.analyzeInspectionPhoto(imageData: data)
        withAnimation(.easeInOut(duration: 0.3)) {
            self.analysisResults[photo.id] = result
            self.analyzingPhotoIds.remove(photo.id)
            self.isAnalyzing = !self.analyzingPhotoIds.isEmpty
        }
    }
}

#Preview {
    PhotosView()
}
