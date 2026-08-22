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

public struct AlarmView: View {
    @State private var isAlarmTriggered: Bool = false
    
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
                
                Spacer()
                
                // iOS DEFAULT Prominent Red Button
                Button(role: isAlarmTriggered ? .cancel : .destructive) {
                    withAnimation {
                        isAlarmTriggered.toggle()
                    }
                } label: {
                    Label(
                        isAlarmTriggered ? "DISMISS ALARM" : "RAISE ALARM",
                        systemImage: isAlarmTriggered ? "xmark.octagon.fill" : "bell.fill"
                    )
                    .font(.title3.bold())
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                .controlSize(.extraLarge)
                .buttonBorderShape(.capsule)
                .padding(.horizontal, 32)
                .padding(.bottom, 20)
            }
        }
        .preferredColorScheme(.dark)
    }
}

#Preview {
    AlarmView()
}
