import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    private let canvasColor = UIColor(red: 26.0 / 255.0, green: 26.0 / 255.0, blue: 26.0 / 255.0, alpha: 1)

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Stale Capacitor live-reload paths can point to an empty snapshot and yield a black WebView.
        KeyValueStore.standard["serverBasePath"] = nil as String?

        window?.backgroundColor = canvasColor
        configureBridgeController(window?.rootViewController as? CAPBridgeViewController)
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        configureBridgeController(window?.rootViewController as? CAPBridgeViewController)
    }

    private func configureBridgeController(_ bridgeController: CAPBridgeViewController?) {
        guard let bridgeController else { return }

        bridgeController.loadViewIfNeeded()
        bridgeController.view.backgroundColor = canvasColor
        bridgeController.webView?.isOpaque = false
        bridgeController.webView?.backgroundColor = canvasColor
        bridgeController.webView?.scrollView.backgroundColor = canvasColor
        bridgeController.webView?.scrollView.keyboardDismissMode = .interactive
        NativeGlassOverlayManager.installIfNeeded(on: bridgeController)
        NativeComposerManager.shared.installIfNeeded(on: bridgeController)
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
