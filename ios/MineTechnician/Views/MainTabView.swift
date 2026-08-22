//
//  MainTabView.swift
//  MineTechnician
//
//  SwiftUI Default Native Bottom TabBar Navigation:
//  - Tab 1: Health (HomeView)
//  - Tab 2: Alarm (AlarmView)
//  - Tab 3: Photos (PhotosView)
//

import SwiftUI

public struct MainTabView: View {
    @State private var selectedTab: Int = 0
    
    public init() {}
    
    public var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Health", systemImage: "waveform.path.ecg")
                }
                .tag(0)
            
            AlarmView()
                .tabItem {
                    Label("Alarm", systemImage: "exclamationmark.triangle.fill")
                }
                .tag(1)
            
            PhotosView()
                .tabItem {
                    Label("Photos", systemImage: "photo.fill")
                }
                .tag(2)
        }
        .tint(.white)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    MainTabView()
}
