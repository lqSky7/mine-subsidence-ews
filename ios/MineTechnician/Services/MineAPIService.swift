//
//  MineAPIService.swift
//  MineTechnician
//
//  Networking service handling all communications with the live Mine IoT backend.
//

import Foundation

public final class MineAPIService: Sendable {
    public static let shared = MineAPIService()
    
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    public init(session: URLSession = .shared) {
        self.session = session
        self.decoder = JSONDecoder()
        self.encoder = JSONEncoder()
    }
    
    // MARK: - Generic Decoder Helper
    
    private func decodeResponse<T: Codable & Sendable>(_ type: T.Type, from data: Data) throws -> T {
        // 1. Try decoding standard wrapped envelope: { ok: true, data: T }
        if let envelope = try? decoder.decode(APIEnvelope<T>.self, from: data), let innerData = envelope.data {
            return innerData
        }
        // 2. Try decoding directly
        if let direct = try? decoder.decode(T.self, from: data) {
            return direct
        }
        // 3. Throw original error for diagnostics
        return try decoder.decode(T.self, from: data)
    }
    
    // MARK: - Node Fleet API
    
    /// Fetches all registered ESP monitoring nodes from the gateway backend.
    public func fetchNodes() async throws -> [EspNodeResponse] {
        let request = MineAPIConfig.makeRequest(path: "/nodes")
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Invalid HTTP response \(statusCode) from /nodes"])
        }
        
        return try decodeResponse([EspNodeResponse].self, from: data)
    }
    
    /// Fetches live multi-sensor telemetry mapping for all nodes.
    public func fetchLiveTelemetry() async throws -> [String: NodeTelemetryResponse] {
        let request = MineAPIConfig.makeRequest(path: "/telemetry/live")
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Invalid HTTP response \(statusCode) from /telemetry/live"])
        }
        
        return try decodeResponse([String: NodeTelemetryResponse].self, from: data)
    }
    
    // MARK: - Health Score API (Tab 1)
    
    /// Fetches the latest computed mine health score and risk level from the backend.
    public func fetchLatestHealth() async throws -> MineHealthScoreResponse {
        let request = MineAPIConfig.makeRequest(path: "/health/mine")
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Invalid HTTP response \(statusCode) from /health/mine"])
        }
        
        return try decodeResponse(MineHealthScoreResponse.self, from: data)
    }
    
    // MARK: - Alarms API (Tab 2)
    
    /// Fetches currently active or acknowledged alarms.
    public func fetchActiveAlarms() async throws -> [AlarmResponse] {
        let request = MineAPIConfig.makeRequest(path: "/alarms?state=ACTIVE")
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Invalid HTTP response \(statusCode) from /alarms"])
        }
        
        return try decodeResponse([AlarmResponse].self, from: data)
    }
    
    /// Raises a manual emergency alarm remotely from the technician app.
    public func raiseManualAlarm(
        nodeId: String = "FLEET_WIDE",
        description: String = "Emergency remote alarm triggered by technician",
        issuedBy: String = "Mine Technician (iOS)"
    ) async throws -> AlarmResponse {
        let payload = RaiseAlarmRequest(nodeId: nodeId, description: description, issuedBy: issuedBy)
        let bodyData = try encoder.encode(payload)
        let request = MineAPIConfig.makeRequest(path: "/alarms/manual", method: "POST", body: bodyData)
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Failed to raise alarm: HTTP \(statusCode)"])
        }
        
        // Try decoding envelope with { alarm: AlarmResponse }
        if let envelope = try? decoder.decode(APIEnvelope<RaiseAlarmResponse>.self, from: data), let inner = envelope.data {
            return inner.alarm
        }
        if let direct = try? decoder.decode(RaiseAlarmResponse.self, from: data) {
            return direct.alarm
        }
        return try decodeResponse(AlarmResponse.self, from: data)
    }
    
    /// Resolves an active alarm by its ID.
    public func resolveAlarm(id: String, by: String = "Mine Technician (iOS)") async throws -> AlarmResponse {
        let payload = ResolveAlarmRequest(by: by)
        let bodyData = try encoder.encode(payload)
        let request = MineAPIConfig.makeRequest(path: "/alarms/\(id)/resolve", method: "POST", body: bodyData)
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Failed to resolve alarm \(id): HTTP \(statusCode)"])
        }
        
        return try decodeResponse(AlarmResponse.self, from: data)
    }
    
    /// Resolves all active alarms across the mine in one call.
    public func resolveActiveAlarms(by: String = "Mine Technician (iOS)") async throws -> [AlarmResponse] {
        let payload = ResolveAlarmRequest(by: by)
        let bodyData = try encoder.encode(payload)
        let request = MineAPIConfig.makeRequest(path: "/alarms/resolve-active", method: "POST", body: bodyData)
        let (data, response) = try await session.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) {
            if let envelope = try? decoder.decode(APIEnvelope<ResolveActiveResponse>.self, from: data), let res = envelope.data?.resolved {
                return res
            }
            if let direct = try? decoder.decode(ResolveActiveResponse.self, from: data), let res = direct.resolved {
                return res
            }
            if let arr = try? decoder.decode(APIEnvelope<[AlarmResponse]>.self, from: data), let res = arr.data {
                return res
            }
        }
        
        // Fallback: list active alarms and resolve individually
        let activeAlarms = try await fetchActiveAlarms()
        var resolved: [AlarmResponse] = []
        for alarm in activeAlarms {
            if let res = try? await resolveAlarm(id: alarm.id, by: by) {
                resolved.append(res)
            }
        }
        return resolved
    }
    
    // MARK: - Photos API (Tab 3)
    
    /// Fetches the latest 10 camera inspection photos from the mine.
    public func fetchPhotosList(limit: Int = 10) async throws -> [MinePhotoResponse] {
        let request = MineAPIConfig.makeRequest(path: "/photos?limit=\(limit)")
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Failed to fetch photos: HTTP \(statusCode)"])
        }
        
        return try decodeResponse([MinePhotoResponse].self, from: data)
    }
    
    /// Fetches the latest single camera snapshot metadata from the mine.
    public func fetchLatestPhoto() async throws -> MinePhotoResponse {
        let request = MineAPIConfig.makeRequest(path: "/photos/latest")
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Failed to fetch latest photo: HTTP \(statusCode)"])
        }
        
        return try decodeResponse(MinePhotoResponse.self, from: data)
    }
    
    /// Loads raw JPEG/PNG image binary data for an inspection photo record.
    /// Resiliently resolves base64 Data URIs, direct API binary routes (/api/v1/photos/:id/image), and static disk files.
    public func loadImageData(for photo: MinePhotoResponse) async throws -> Data {
        // 1. Decode base64 Data URI if available in imageUrl
        if let imageUrl = photo.imageUrl, imageUrl.hasPrefix("data:") {
            if let commaIndex = imageUrl.firstIndex(of: ",") {
                let base64Part = String(imageUrl[imageUrl.index(after: commaIndex)...])
                if let decoded = Data(base64Encoded: base64Part, options: [.ignoreUnknownCharacters]) {
                    return decoded
                }
            }
        }
        
        // 2. Decode base64 Data URI if available in thumbnailUrl
        if let thumbUrl = photo.thumbnailUrl, thumbUrl.hasPrefix("data:") {
            if let commaIndex = thumbUrl.firstIndex(of: ",") {
                let base64Part = String(thumbUrl[thumbUrl.index(after: commaIndex)...])
                if let decoded = Data(base64Encoded: base64Part, options: [.ignoreUnknownCharacters]) {
                    return decoded
                }
            }
        }
        
        // 3. Try fetching from resolved imageUrl (e.g. /photos/PHOTO-xxx.jpg or full HTTP URL)
        if let resolvedURL = MineAPIConfig.resolveURL(urlString: photo.imageUrl) {
            do {
                return try await fetchImageData(from: resolvedURL)
            } catch {
                // proceed to endpoint fallback
            }
        }
        
        // 4. Try fetching from dedicated binary API endpoint: /api/v1/photos/:id/image
        let endpointURL = MineAPIConfig.photoImageURL(photoId: photo.id)
        do {
            return try await fetchImageData(from: endpointURL)
        } catch {
            // proceed to static file fallback
        }
        
        // 5. Try fetching from static JPEG path: /photos/:id.jpg
        if let staticURL = MineAPIConfig.resolveURL(urlString: "/photos/\(photo.id).jpg") {
            return try await fetchImageData(from: staticURL)
        }
        
        throw NSError(
            domain: "MineAPI",
            code: 404,
            userInfo: [NSLocalizedDescriptionKey: "Unable to load image data for photo ID: \(photo.id)"]
        )
    }
    
    /// Fetches raw image data with ngrok bypass headers or direct HTTPS request.
    public func fetchImageData(from url: URL) async throws -> Data {
        var request = URLRequest(url: url)
        request.setValue(MineAPIConfig.ngrokHeaderValue, forHTTPHeaderField: MineAPIConfig.ngrokHeaderField)
        request.setValue("image/jpeg, image/png, image/*, */*", forHTTPHeaderField: "Accept")
        request.setValue("MineTechnician-iOS/1.0", forHTTPHeaderField: "User-Agent")
        request.timeoutInterval = 15.0
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let statusCode = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw NSError(domain: "MineAPI", code: statusCode, userInfo: [NSLocalizedDescriptionKey: "Failed to load image: HTTP \(statusCode) from \(url.absoluteString)"])
        }
        
        return data
    }
}
