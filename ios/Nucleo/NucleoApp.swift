import SwiftUI
import SwiftData

@main
struct NucleoApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: CachedMap.self)
    }
}
