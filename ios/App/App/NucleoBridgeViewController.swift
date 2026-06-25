import UIKit
import Capacitor

/// Reserved extension point for a future native-only presentation pass.
/// It is intentionally not assigned to the storyboard while the PoC is off.
final class NucleoBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        let canvas = UIColor(red: 250.0 / 255.0, green: 250.0 / 255.0, blue: 250.0 / 255.0, alpha: 1)
        view.backgroundColor = canvas
        webView?.backgroundColor = canvas
        webView?.scrollView.backgroundColor = canvas

    }
}
