// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "MineTechnician",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "MineTechnician",
            targets: ["MineTechnician"]
        )
    ],
    targets: [
        .target(
            name: "MineTechnician",
            path: "MineTechnician",
            resources: [
                .process("Shaders")
            ]
        )
    ]
)
