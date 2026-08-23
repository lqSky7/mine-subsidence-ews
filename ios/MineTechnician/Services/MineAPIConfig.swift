//
//  MineAPIConfig.swift
//  MineTechnician
//
//  Centralized networking configuration and URL request builder for Mine IoT backend.
//

import Foundation

public struct MineAPIConfig {
    /// Live AWS EC2 HTTPS production backend URL
    public static let baseURLString = "https://35-154-233-23.sslip.io"
    public static let baseURL = URL(string: baseURLString)!
    public static let apiPrefix = "/api/v1"
    
    /// Required header to bypass the ngrok free tier browser warning interstitial
    public static let ngrokHeaderField = "ngrok-skip-browser-warning"
    public static let ngrokHeaderValue = "1"
    
    /// Creates a pre-configured URLRequest with necessary headers for ngrok + JSON
    public static func makeRequest(
        path: String,
        method: String = "GET",
        body: Data? = nil
    ) -> URLRequest {
        let cleanPath = path.hasPrefix("/") ? path : "/\(path)"
        let fullPath = cleanPath.hasPrefix(apiPrefix) ? cleanPath : "\(apiPrefix)\(cleanPath)"
        let url = URL(string: "\(baseURLString)\(fullPath)") ?? baseURL.appendingPathComponent(fullPath)
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue(ngrokHeaderValue, forHTTPHeaderField: ngrokHeaderField)
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("MineTechnician-iOS/1.0", forHTTPHeaderField: "User-Agent")
        request.timeoutInterval = 10.0
        request.httpBody = body
        return request
    }
    
    /// Dedicated photo binary image endpoint URL for a given photo ID
    public static func photoImageURL(photoId: String) -> URL {
        let cleanId = photoId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? photoId
        return URL(string: "\(baseURLString)/api/v1/photos/\(cleanId)/image") ?? baseURL.appendingPathComponent("api/v1/photos/\(cleanId)/image")
    }
    
    /// Resolves an absolute or relative image URL string into a full URL (returns nil for data: URIs)
    public static func resolveURL(urlString: String?) -> URL? {
        guard let urlString = urlString, !urlString.isEmpty else { return nil }
        if urlString.hasPrefix("data:") {
            return nil
        }
        if urlString.hasPrefix("http://") || urlString.hasPrefix("https://") {
            return URL(string: urlString)
        }
        let cleanPath = urlString.hasPrefix("/") ? urlString : "/\(urlString)"
        return URL(string: "\(baseURLString)\(cleanPath)")
    }
}
