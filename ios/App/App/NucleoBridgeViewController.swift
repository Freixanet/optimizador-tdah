import UIKit
import Capacitor

/// Reserved extension point for future native bridge customization.
/// Main.storyboard uses the stock `CAPBridgeViewController`; launch setup lives in AppDelegate.
final class NucleoBridgeViewController: CAPBridgeViewController {
    private let canvasColor = UIColor(red: 250.0 / 255.0, green: 250.0 / 255.0, blue: 250.0 / 255.0, alpha: 1)

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        view.backgroundColor = canvasColor
        webView?.isOpaque = true
        webView?.backgroundColor = canvasColor
        webView?.scrollView.backgroundColor = canvasColor
    }
}
