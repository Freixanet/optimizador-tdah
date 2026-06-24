import Foundation

enum NativeGlassConfig {
    /// Floating glass bar overlay (bottom bar with Núcleo / Procesar / Ajustes).
    static let isEnabled = false

    /// Debug gear launcher + NativeGlassSettingsSheetController.
    static let isSettingsSheetEnabled = false

    // TODO(iOS 26+): Evaluate UIGlassEffect / UIGlassContainerEffect behind availability checks
    // once a dedicated Liquid Glass pass is approved. v1 uses UIVisualEffectView only.
}
