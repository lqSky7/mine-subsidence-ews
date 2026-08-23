//
//  MineModels.swift
//  MineTechnician
//
//  Canonical data transfer objects matching backend schemas without dummy data.
//

import Foundation

// MARK: - Generic Backend API Envelope
public nonisolated struct APIEnvelope<T: Codable & Sendable>: Codable, Sendable {
    public let ok: Bool?
    public let count: Int?
    public let data: T?
    public let error: String?
}

// MARK: - Node Fleet DTO
public nonisolated struct EspNodeResponse: Codable, Identifiable, Sendable, Hashable {
    public let id: String
    public let label: String
    public let location: String
    public let nodeType: String
    public let status: String
    public let riskSeverity: String
    public let ipAddress: String?
    public let lastSeen: String?
    
    public var isOnline: Bool {
        status.uppercased() != "OFFLINE"
    }
    
    enum CodingKeys: String, CodingKey {
        case id, label, location, nodeType, status, riskSeverity, ipAddress, lastSeen
    }
    
    public init(
        id: String = "ESP-NODE",
        label: String = "Monitoring Node",
        location: String = "Mine Section",
        nodeType: String = "esp32_sensor_node",
        status: String = "ONLINE",
        riskSeverity: String = "STABLE",
        ipAddress: String? = nil,
        lastSeen: String? = nil
    ) {
        self.id = id
        self.label = label
        self.location = location
        self.nodeType = nodeType
        self.status = status
        self.riskSeverity = riskSeverity
        self.ipAddress = ipAddress
        self.lastSeen = lastSeen
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(String.self, forKey: .id) ?? "ESP-NODE"
        self.label = try container.decodeIfPresent(String.self, forKey: .label) ?? self.id
        self.location = try container.decodeIfPresent(String.self, forKey: .location) ?? "Mine Section"
        self.nodeType = try container.decodeIfPresent(String.self, forKey: .nodeType) ?? "esp32_sensor_node"
        self.status = try container.decodeIfPresent(String.self, forKey: .status) ?? "ONLINE"
        self.riskSeverity = try container.decodeIfPresent(String.self, forKey: .riskSeverity) ?? "STABLE"
        self.ipAddress = try container.decodeIfPresent(String.self, forKey: .ipAddress)
        self.lastSeen = try container.decodeIfPresent(String.self, forKey: .lastSeen)
    }
}

// MARK: - Live Telemetry DTO
public nonisolated struct NodeTelemetryResponse: Codable, Sendable {
    public let nodeId: String
    public let timestamp: String
    public let gas: GasData?
    public let ultrasound: UltrasoundData?
    public let vibration: VibrationData?
    public let environment: EnvironmentData?
    public let imu1: ImuData?
    public let imu2: ImuData?
    public let actuators: ActuatorData?
    
    public nonisolated struct GasData: Codable, Sendable {
        public let mq2Ppm: Double?
        public let status: String?
    }
    public nonisolated struct UltrasoundData: Codable, Sendable {
        public let distanceCm: Double?
    }
    public nonisolated struct VibrationData: Codable, Sendable {
        public let triggered: Bool?
        public let intensity: Double?
    }
    public nonisolated struct EnvironmentData: Codable, Sendable {
        public let temperatureC: Double?
        public let humidityPct: Double?
    }
    public nonisolated struct ImuData: Codable, Sendable {
        public let totalTiltDeg: Double?
        public let rollDeg: Double?
        public let pitchDeg: Double?
    }
    public nonisolated struct ActuatorData: Codable, Sendable {
        public let buzzerActive: Bool?
        public let buzzerFrequencyHz: Double?
        public let ledMatrixPattern: String?
        public let ledMatrixActive: Bool?
        public let userOverride: Bool?
        public let userOverrideUntil: String?
    }
}

// MARK: - Health Score DTO
public nonisolated struct MineHealthScoreResponse: Codable, Identifiable, Sendable {
    public let id: String
    public let timestamp: String
    public let overallScore: Double
    public let riskLevel: String
    public let contributingFactors: [ContributingFactor]?
    public let modelVersion: String?
    public let summary: String?
    
    public nonisolated struct ContributingFactor: Codable, Sendable {
        public let factor: String
        public let impact: Double?
        public let nodeId: String?
    }
    
    enum CodingKeys: String, CodingKey {
        case id, timestamp, overallScore, riskLevel, contributingFactors, modelVersion, summary
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(String.self, forKey: .id) ?? "HEALTH"
        timestamp = try container.decodeIfPresent(String.self, forKey: .timestamp) ?? ISO8601DateFormatter().string(from: Date())
        
        if let doubleScore = try? container.decode(Double.self, forKey: .overallScore) {
            overallScore = doubleScore
        } else if let intScore = try? container.decode(Int.self, forKey: .overallScore) {
            overallScore = Double(intScore)
        } else {
            overallScore = 0.0
        }
        
        riskLevel = try container.decodeIfPresent(String.self, forKey: .riskLevel) ?? "UNKNOWN"
        contributingFactors = try? container.decodeIfPresent([ContributingFactor].self, forKey: .contributingFactors)
        modelVersion = try? container.decodeIfPresent(String.self, forKey: .modelVersion)
        summary = try? container.decodeIfPresent(String.self, forKey: .summary)
    }
}

// MARK: - Alarm DTO
public nonisolated struct AlarmResponse: Codable, Identifiable, Sendable, Hashable {
    public let id: String
    public let timestamp: String
    public let source: String
    public let sourceLabel: String?
    public let severity: String
    public let category: String?
    public let value: String?
    public let description: String
    public let state: String
    public let raisedBy: String?
    public let acknowledgedBy: String?
    public let resolvedBy: String?
    public let notes: String?
    
    public var isActive: Bool {
        state.uppercased() == "ACTIVE" || state.uppercased() == "ACKNOWLEDGED"
    }
}

public nonisolated struct RaiseAlarmRequest: Codable, Sendable {
    public let nodeId: String
    public let nodeLabel: String?
    public let description: String
    public let issuedBy: String
    public let severity: String?
    
    public init(
        nodeId: String = "FLEET_WIDE",
        nodeLabel: String? = "Mine Wide Emergency",
        description: String = "Emergency alarm raised by mine technician via mobile app",
        issuedBy: String = "Mine Technician (iOS)",
        severity: String = "CRITICAL"
    ) {
        self.nodeId = nodeId
        self.nodeLabel = nodeLabel
        self.description = description
        self.issuedBy = issuedBy
        self.severity = severity
    }
}

public nonisolated struct RaiseAlarmResponse: Codable, Sendable {
    public let alarm: AlarmResponse
}

public nonisolated struct ResolveAlarmRequest: Codable, Sendable {
    public let by: String
    public let notes: String?
    
    public init(by: String = "Mine Technician (iOS)", notes: String? = "Dismissed by technician") {
        self.by = by
        self.notes = notes
    }
}

public nonisolated struct ResolveActiveResponse: Codable, Sendable {
    public let count: Int?
    public let resolved: [AlarmResponse]?
}

// MARK: - Photo DTO
public nonisolated struct MinePhotoResponse: Codable, Identifiable, Sendable, Hashable {
    public let id: String
    public let timestamp: String
    public let title: String
    public let imageUrl: String?
    public let thumbnailUrl: String?
    public let nodeId: String?
    public let location: String?
    public let category: String?
    
    public var isDataUri: Bool {
        (imageUrl?.hasPrefix("data:") ?? false) || (thumbnailUrl?.hasPrefix("data:") ?? false)
    }
}

// MARK: - Remote Command DTOs
public nonisolated struct RemoteCommandRequest: Codable, Sendable {
    public let type: String
    public let targetNodeId: String
    public let payload: [String: String]?
    public let issuedBy: String
    
    public init(
        type: String,
        targetNodeId: String = "ALL",
        payload: [String: String]? = nil,
        issuedBy: String = "Mine Technician (iOS)"
    ) {
        self.type = type
        self.targetNodeId = targetNodeId
        self.payload = payload
        self.issuedBy = issuedBy
    }
}

public nonisolated struct BuzzerCommandRequest: Codable, Sendable {
    public let targetNodeId: String
    public let active: Bool
    public let durationMs: Int
    public let frequencyHz: Double
    public let issuedBy: String
    
    public init(
        targetNodeId: String = "ALL",
        active: Bool = true,
        durationMs: Int = 5000,
        frequencyHz: Double = 2800,
        issuedBy: String = "Mine Technician (iOS)"
    ) {
        self.targetNodeId = targetNodeId
        self.active = active
        self.durationMs = durationMs
        self.frequencyHz = frequencyHz
        self.issuedBy = issuedBy
    }
}

public nonisolated struct RemoteCommandResponse: Codable, Identifiable, Sendable {
    public let id: String
    public let type: String
    public let targetNodeId: String
    public let status: String
    public let issuedBy: String
    public let issuedAt: String?
    public let deliveredAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id, type, targetNodeId, status, issuedBy, issuedAt, deliveredAt
    }
    
    public init(
        id: String = "CMD-0",
        type: String = "BUZZER_START",
        targetNodeId: String = "ALL",
        status: String = "PENDING",
        issuedBy: String = "Mine Technician (iOS)",
        issuedAt: String? = nil,
        deliveredAt: String? = nil
    ) {
        self.id = id
        self.type = type
        self.targetNodeId = targetNodeId
        self.status = status
        self.issuedBy = issuedBy
        self.issuedAt = issuedAt
        self.deliveredAt = deliveredAt
    }
}


