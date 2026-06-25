import UIKit
import Capacitor

final class NucleoBridgeViewController: CAPBridgeViewController {
    private let canvasColor = UIColor(red: 250.0 / 255.0, green: 250.0 / 255.0, blue: 250.0 / 255.0, alpha: 1)

    override func instanceDescriptor() -> InstanceDescriptor {
        // Always boot from bundled web assets; ignore stale live-reload snapshots.
        InstanceDescriptor()
    }

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        applyCanvasColors()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        applyCanvasColors()
        NativeGlassOverlayManager.installIfNeeded(on: self)
    }

    private func applyCanvasColors() {
        view.backgroundColor = canvasColor
        webView?.isOpaque = false
        webView?.backgroundColor = canvasColor
        webView?.scrollView.backgroundColor = canvasColor
    }
}
