import UIKit
import Capacitor

enum NativeGlassOverlayManager {
    private static weak var overlayView: UIView?
    private static weak var settingsLauncher: UIView?

    static func installIfNeeded(on bridgeController: CAPBridgeViewController) {
        installSettingsLauncherIfNeeded(on: bridgeController)
        installBarIfNeeded(on: bridgeController)
    }

    private static func installBarIfNeeded(on bridgeController: CAPBridgeViewController) {
        guard NativeGlassConfig.isEnabled else { return }

        if let existing = overlayView,
           existing.superview === bridgeController.view {
            bridgeController.view.bringSubviewToFront(existing)
            return
        }

        let bar = NativeGlassBarView()
        bar.translatesAutoresizingMaskIntoConstraints = false
        bar.isUserInteractionEnabled = true

        bridgeController.view.addSubview(bar)
        NSLayoutConstraint.activate([
            bar.leadingAnchor.constraint(equalTo: bridgeController.view.leadingAnchor, constant: 18),
            bar.trailingAnchor.constraint(equalTo: bridgeController.view.trailingAnchor, constant: -18),
            bar.bottomAnchor.constraint(equalTo: bridgeController.view.safeAreaLayoutGuide.bottomAnchor, constant: -10),
            bar.heightAnchor.constraint(equalToConstant: 56),
        ])

        overlayView = bar
        bridgeController.view.bringSubviewToFront(bar)
    }

    private static func installSettingsLauncherIfNeeded(on bridgeController: CAPBridgeViewController) {
        guard NativeGlassConfig.isSettingsSheetEnabled else { return }

        if let existing = settingsLauncher,
           existing.superview === bridgeController.view {
            bridgeController.view.bringSubviewToFront(existing)
            return
        }

        let launcher = UIButton(type: .system)
        launcher.translatesAutoresizingMaskIntoConstraints = false
        launcher.accessibilityLabel = "Abrir ajustes nativos de prueba"
        launcher.accessibilityHint = "Disponible solo en compilaciones Debug"
        launcher.accessibilityIdentifier = "NativeGlassDebugSettingsLauncher"
        launcher.tintColor = .label
        launcher.backgroundColor = UIColor.secondarySystemBackground.withAlphaComponent(0.94)
        launcher.layer.cornerRadius = 22
        launcher.layer.shadowColor = UIColor.black.cgColor
        launcher.layer.shadowOpacity = 0.14
        launcher.layer.shadowRadius = 10
        launcher.layer.shadowOffset = CGSize(width: 0, height: 4)
        launcher.setImage(UIImage(systemName: "gearshape.fill"), for: .normal)
        launcher.addAction(
            UIAction { [weak bridgeController] _ in
                guard let bridgeController, bridgeController.presentedViewController == nil else { return }
                bridgeController.present(NativeGlassSettingsSheetController(), animated: true)
            },
            for: .touchUpInside
        )

        bridgeController.view.addSubview(launcher)
        NSLayoutConstraint.activate([
            launcher.trailingAnchor.constraint(equalTo: bridgeController.view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            launcher.bottomAnchor.constraint(equalTo: bridgeController.view.safeAreaLayoutGuide.bottomAnchor, constant: -16),
            launcher.widthAnchor.constraint(equalToConstant: 44),
            launcher.heightAnchor.constraint(equalToConstant: 44),
        ])

        settingsLauncher = launcher
        bridgeController.view.bringSubviewToFront(launcher)
    }
}

private final class NativeGlassBarView: UIView {
    private let contentStack = UIStackView()
    private let titleLabel = UILabel()
    private let settingsButton = UIButton(type: .system)
    private let processButton = UIButton(type: .system)

    override init(frame: CGRect) {
        super.init(frame: frame)
        configureChrome()
        configureContent()
    }

    required init?(coder: NSCoder) {
        nil
    }

    private func configureChrome() {
        layer.cornerRadius = 20
        layer.masksToBounds = false
        layer.shadowColor = UIColor.black.cgColor
        layer.shadowOpacity = 0.12
        layer.shadowRadius = 12
        layer.shadowOffset = CGSize(width: 0, height: 4)

        let surfaceView: UIView
        if UIAccessibility.isReduceTransparencyEnabled {
            let solid = UIView()
            solid.backgroundColor = UIColor(
                red: 250.0 / 255.0,
                green: 250.0 / 255.0,
                blue: 250.0 / 255.0,
                alpha: 1
            )
            solid.layer.cornerRadius = 20
            solid.clipsToBounds = true
            surfaceView = solid
        } else {
            let blurStyle: UIBlurEffect.Style
            if #available(iOS 15.0, *) {
                blurStyle = .systemChromeMaterial
            } else {
                blurStyle = .systemMaterial
            }

            let effectView = UIVisualEffectView(effect: UIBlurEffect(style: blurStyle))
            effectView.layer.cornerRadius = 20
            effectView.clipsToBounds = true
            surfaceView = effectView
        }

        surfaceView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(surfaceView)
        NSLayoutConstraint.activate([
            surfaceView.leadingAnchor.constraint(equalTo: leadingAnchor),
            surfaceView.trailingAnchor.constraint(equalTo: trailingAnchor),
            surfaceView.topAnchor.constraint(equalTo: topAnchor),
            surfaceView.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])

        contentStack.axis = .horizontal
        contentStack.alignment = .center
        contentStack.spacing = 10
        contentStack.translatesAutoresizingMaskIntoConstraints = false
        contentStack.isLayoutMarginsRelativeArrangement = true
        contentStack.layoutMargins = UIEdgeInsets(top: 0, left: 16, bottom: 0, right: 12)

        if let effectView = surfaceView as? UIVisualEffectView {
            effectView.contentView.addSubview(contentStack)
            NSLayoutConstraint.activate([
                contentStack.leadingAnchor.constraint(equalTo: effectView.contentView.leadingAnchor),
                contentStack.trailingAnchor.constraint(equalTo: effectView.contentView.trailingAnchor),
                contentStack.topAnchor.constraint(equalTo: effectView.contentView.topAnchor),
                contentStack.bottomAnchor.constraint(equalTo: effectView.contentView.bottomAnchor),
            ])
        } else {
            surfaceView.addSubview(contentStack)
            NSLayoutConstraint.activate([
                contentStack.leadingAnchor.constraint(equalTo: surfaceView.leadingAnchor),
                contentStack.trailingAnchor.constraint(equalTo: surfaceView.trailingAnchor),
                contentStack.topAnchor.constraint(equalTo: surfaceView.topAnchor),
                contentStack.bottomAnchor.constraint(equalTo: surfaceView.bottomAnchor),
            ])
        }
    }

    private func configureContent() {
        titleLabel.text = "Núcleo"
        titleLabel.font = UIFont.systemFont(ofSize: 15, weight: .semibold)
        titleLabel.textColor = UIColor.label
        titleLabel.setContentHuggingPriority(.defaultLow, for: .horizontal)

        settingsButton.setTitle("Ajustes", for: .normal)
        settingsButton.titleLabel?.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        settingsButton.setTitleColor(UIColor.secondaryLabel, for: .normal)
        settingsButton.addAction(
            UIAction { _ in
                print("[NativeGlass] Ajustes tapped")
            },
            for: .touchUpInside
        )

        processButton.setTitle("Procesar", for: .normal)
        processButton.titleLabel?.font = UIFont.systemFont(ofSize: 14, weight: .semibold)
        processButton.setTitleColor(.white, for: .normal)
        processButton.backgroundColor = UIColor.systemIndigo
        processButton.layer.cornerRadius = 10
        processButton.clipsToBounds = true
        processButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 14, bottom: 8, right: 14)
        processButton.addAction(
            UIAction { _ in
                print("[NativeGlass] Procesar tapped")
            },
            for: .touchUpInside
        )

        let spacer = UIView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)

        contentStack.addArrangedSubview(titleLabel)
        contentStack.addArrangedSubview(spacer)
        contentStack.addArrangedSubview(settingsButton)
        contentStack.addArrangedSubview(processButton)
    }
}
