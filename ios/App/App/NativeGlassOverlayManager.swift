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


// MARK: - Native Composer

import WebKit

@objc class NativeComposerManager: NSObject, WKScriptMessageHandler, UITextViewDelegate {
    static let shared = NativeComposerManager()

    weak var bridgeController: CAPBridgeViewController?
    var containerView: UIView!
    var composerBox: UIView!
    var textView: UITextView!
    var sendButton: UIButton!
    var attachButton: UIButton!
    var attachmentLabel: UILabel!
    var attachmentHeightConstraint: NSLayoutConstraint!
    var placeholderLabel: UILabel!
    var textViewHeightConstraint: NSLayoutConstraint!
    var containerLeadingConstraint: NSLayoutConstraint!
    var containerWidthConstraint: NSLayoutConstraint!
    var containerBottomConstraint: NSLayoutConstraint!
    var isVisible = false
    var isLoading = false
    var hasAttachment = false
    var keyboardVisible = false
    let keyboardGap: CGFloat = 7

    func installIfNeeded(on bridgeController: CAPBridgeViewController) {
        guard self.bridgeController !== bridgeController else { return }
        self.bridgeController = bridgeController

        // Register for JS messages
        bridgeController.webView?.configuration.userContentController.add(self, name: "nativeComposer")

        setupUI()
    }

    private func setupUI() {
        guard let view = bridgeController?.view else { return }

        containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.backgroundColor = .clear
        containerView.isHidden = true
        containerView.isUserInteractionEnabled = true
        view.addSubview(containerView)

        let isDarkMode = view.traitCollection.userInterfaceStyle == .dark

        composerBox = UIView()
        composerBox.translatesAutoresizingMaskIntoConstraints = false
        composerBox.backgroundColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark
                ? UIColor(red: 28/255.0, green: 28/255.0, blue: 28/255.0, alpha: 0.96)
                : UIColor(white: 1.0, alpha: 0.96)
        }
        composerBox.layer.cornerRadius = 26
        composerBox.layer.cornerCurve = .continuous
        composerBox.layer.borderWidth = 1
        composerBox.layer.borderColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark ? UIColor(white: 1.0, alpha: 0.1) : UIColor(red: 229/255.0, green: 229/255.0, blue: 229/255.0, alpha: 1)
        }.cgColor
        composerBox.layer.shadowColor = UIColor.black.cgColor
        composerBox.layer.shadowOpacity = isDarkMode ? 0.28 : 0.08
        composerBox.layer.shadowRadius = isDarkMode ? 18 : 12
        composerBox.layer.shadowOffset = CGSize(width: 0, height: 4)

        containerView.addSubview(composerBox)

        attachmentLabel = UILabel()
        attachmentLabel.translatesAutoresizingMaskIntoConstraints = false
        attachmentLabel.backgroundColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark
                ? UIColor(white: 1.0, alpha: 0.06)
                : UIColor(white: 0.0, alpha: 0.05)
        }
        attachmentLabel.textColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark
                ? UIColor(white: 1.0, alpha: 0.78)
                : UIColor(white: 0.0, alpha: 0.68)
        }
        attachmentLabel.font = .systemFont(ofSize: 13, weight: .medium)
        attachmentLabel.layer.cornerRadius = 11
        attachmentLabel.layer.cornerCurve = .continuous
        attachmentLabel.clipsToBounds = true
        attachmentLabel.numberOfLines = 1
        attachmentLabel.lineBreakMode = .byTruncatingMiddle
        attachmentLabel.isHidden = true
        composerBox.addSubview(attachmentLabel)

        // TextView
        textView = UITextView()
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.backgroundColor = .clear
        textView.textColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark ? UIColor(red: 229/255.0, green: 229/255.0, blue: 229/255.0, alpha: 1) : UIColor(red: 38/255.0, green: 38/255.0, blue: 38/255.0, alpha: 1) // neutral-200 : neutral-800
        }
        textView.font = .systemFont(ofSize: 16)
        textView.textContainerInset = UIEdgeInsets(top: 13, left: 12, bottom: 6, right: 12)
        textView.textContainer.lineFragmentPadding = 0
        textView.isScrollEnabled = false
        textView.delegate = self
        composerBox.addSubview(textView)

        // Placeholder
        placeholderLabel = UILabel()
        placeholderLabel.translatesAutoresizingMaskIntoConstraints = false
        placeholderLabel.text = "Pega texto, enlace o transcripción..."
        placeholderLabel.font = .systemFont(ofSize: 15)
        placeholderLabel.textColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark ? UIColor(white: 1.0, alpha: 0.3) : UIColor(white: 0.0, alpha: 0.3)
        }
        placeholderLabel.numberOfLines = 1
        placeholderLabel.lineBreakMode = .byTruncatingTail
        placeholderLabel.adjustsFontSizeToFitWidth = true
        placeholderLabel.minimumScaleFactor = 0.88
        placeholderLabel.isUserInteractionEnabled = false
        textView.addSubview(placeholderLabel)

        // Attach button (Plus)
        attachButton = UIButton(type: .system)
        attachButton.translatesAutoresizingMaskIntoConstraints = false
        attachButton.setImage(UIImage(systemName: "plus"), for: .normal)
        attachButton.tintColor = UIColor { traitCollection in
            return traitCollection.userInterfaceStyle == .dark ? UIColor(white: 1.0, alpha: 0.6) : UIColor(white: 0.0, alpha: 0.4)
        }
        attachButton.backgroundColor = .clear
        attachButton.addAction(UIAction { [weak self] _ in self?.sendEvent("onComposerAttach") }, for: .touchUpInside)
        composerBox.addSubview(attachButton)

        // Send button
        sendButton = UIButton(type: .system)
        sendButton.translatesAutoresizingMaskIntoConstraints = false
        sendButton.setImage(UIImage(systemName: "arrow.up"), for: .normal)
        sendButton.layer.cornerRadius = 16 // 32x32
        sendButton.layer.cornerCurve = .continuous
        sendButton.addAction(UIAction { [weak self] _ in
            guard let self = self, !self.isLoading else { return }
            let text = self.textView.text?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            guard !text.isEmpty || self.hasAttachment else { return }
            self.sendEvent("onComposerSend", detail: text)
            self.textView.text = ""
            self.textViewDidChange(self.textView)
        }, for: .touchUpInside)
        composerBox.addSubview(sendButton)

        containerLeadingConstraint = containerView.leadingAnchor.constraint(equalTo: view.leadingAnchor)
        containerWidthConstraint = containerView.widthAnchor.constraint(equalToConstant: view.bounds.width)
        if #available(iOS 15.0, *) {
            containerBottomConstraint = containerView.bottomAnchor.constraint(
                equalTo: view.keyboardLayoutGuide.topAnchor,
                constant: -keyboardGap
            )
        } else {
            containerBottomConstraint = containerView.bottomAnchor.constraint(
                equalTo: view.safeAreaLayoutGuide.bottomAnchor,
                constant: -keyboardGap
            )
        }

        NSLayoutConstraint.activate([
            containerLeadingConstraint,
            containerWidthConstraint,
            containerBottomConstraint,

            // Composer Box
            composerBox.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            composerBox.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            composerBox.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 8),
            composerBox.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -8),

            attachmentLabel.leadingAnchor.constraint(equalTo: composerBox.leadingAnchor, constant: 16),
            attachmentLabel.trailingAnchor.constraint(equalTo: composerBox.trailingAnchor, constant: -16),
            attachmentLabel.topAnchor.constraint(equalTo: composerBox.topAnchor, constant: 12),

            // Text View takes full width, sits on top
            textView.leadingAnchor.constraint(equalTo: composerBox.leadingAnchor, constant: 4),
            textView.trailingAnchor.constraint(equalTo: composerBox.trailingAnchor, constant: -4),
            textView.topAnchor.constraint(equalTo: attachmentLabel.bottomAnchor, constant: 4)
        ])

        attachmentHeightConstraint = attachmentLabel.heightAnchor.constraint(equalToConstant: 0)
        attachmentHeightConstraint.isActive = true

        textViewHeightConstraint = textView.heightAnchor.constraint(equalToConstant: 56)
        textViewHeightConstraint.isActive = true

        NSLayoutConstraint.activate([
            // Keep the native placeholder inside the same text rect as typed text.
            placeholderLabel.leadingAnchor.constraint(equalTo: textView.leadingAnchor, constant: 12),
            placeholderLabel.trailingAnchor.constraint(equalTo: textView.trailingAnchor, constant: -12),
            placeholderLabel.topAnchor.constraint(equalTo: textView.topAnchor, constant: 13),
            placeholderLabel.bottomAnchor.constraint(lessThanOrEqualTo: textView.bottomAnchor, constant: -6),

            // Attach button sits below text view on the left
            attachButton.leadingAnchor.constraint(equalTo: composerBox.leadingAnchor, constant: 12),
            attachButton.topAnchor.constraint(equalTo: textView.bottomAnchor, constant: 4),
            attachButton.bottomAnchor.constraint(equalTo: composerBox.bottomAnchor, constant: -12),
            attachButton.widthAnchor.constraint(equalToConstant: 32),
            attachButton.heightAnchor.constraint(equalToConstant: 32),

            // Send button sits below text view on the right
            sendButton.trailingAnchor.constraint(equalTo: composerBox.trailingAnchor, constant: -12),
            sendButton.topAnchor.constraint(equalTo: textView.bottomAnchor, constant: 4),
            sendButton.bottomAnchor.constraint(equalTo: composerBox.bottomAnchor, constant: -12),
            sendButton.widthAnchor.constraint(equalToConstant: 32),
            sendButton.heightAnchor.constraint(equalToConstant: 32)
        ])

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )

        updateSendButtonState()
        sendMetrics()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }

        DispatchQueue.main.async {
            switch action {
            case "show":
                self.setVisible(true)
            case "hide":
                self.setVisible(false)
            case "setText":
                if let text = body["text"] as? String {
                    self.textView.text = text
                    self.textViewDidChange(self.textView)
                }
            case "clearText":
                self.textView.text = ""
                self.textViewDidChange(self.textView)
            case "setLoading":
                if let loading = body["loading"] as? Bool {
                    self.isLoading = loading
                    self.textView.isEditable = !loading
                    self.updateSendButtonState()
                }
            case "setAttachment":
                self.setAttachment(body)
            case "setLayout":
                self.applyLayout(body)
            case "focus":
                self.textView.becomeFirstResponder()
            case "blur":
                self.textView.resignFirstResponder()
            default:
                break
            }
        }
    }

    private func setVisible(_ visible: Bool) {
        isVisible = visible
        if visible {
            containerView.isHidden = false
            bridgeController?.view.bringSubviewToFront(containerView)
        } else {
            textView.resignFirstResponder()
            containerView.isHidden = true
        }
        sendMetrics()
    }

    private func applyLayout(_ body: [String: Any]) {
        guard let view = bridgeController?.view else { return }

        let rawOffset = (body["mainOffsetX"] as? NSNumber)?.doubleValue ?? 0
        let rawWidth = (body["mainWidth"] as? NSNumber)?.doubleValue ?? Double(view.bounds.width)
        let animated = body["animated"] as? Bool ?? false
        let rawDurationMs = (body["durationMs"] as? NSNumber)?.doubleValue ?? 0
        let duration = max(0, min(rawDurationMs / 1000.0, 1.0))
        let curve = body["curve"] as? String ?? "easeOut"
        let maxWidth = max(0, Double(view.bounds.width))
        let offset = CGFloat(max(0, min(rawOffset, maxWidth)))
        let width = CGFloat(max(0, min(rawWidth, maxWidth)))
        let nextWidth = width > 0 ? width : view.bounds.width
        let widthChanged = abs(containerWidthConstraint.constant - nextWidth) > 0.5

        view.layoutIfNeeded()
        containerLeadingConstraint.constant = offset
        containerWidthConstraint.constant = nextWidth

        if animated && duration > 0 {
            let curveOption: UIView.AnimationOptions
            switch curve {
            case "linear":
                curveOption = .curveLinear
            case "easeInOut":
                curveOption = .curveEaseInOut
            default:
                curveOption = .curveEaseOut
            }

            UIView.animate(
                withDuration: duration,
                delay: 0,
                options: [.beginFromCurrentState, .allowUserInteraction, curveOption],
                animations: {
                    view.layoutIfNeeded()
                },
                completion: { _ in
                    if widthChanged {
                        self.sendMetrics()
                    }
                }
            )
        } else {
            UIView.performWithoutAnimation {
                view.layoutIfNeeded()
            }
            if widthChanged {
                sendMetrics()
            }
        }
    }

    private func setAttachment(_ body: [String: Any]) {
        let rawName = body["name"] as? String
        let name = rawName?.trimmingCharacters(in: .whitespacesAndNewlines)
        hasAttachment = !(name?.isEmpty ?? true)

        attachmentLabel.isHidden = !hasAttachment
        attachmentLabel.text = hasAttachment ? "  \(body["isImage"] as? Bool == true ? "Imagen" : "Archivo"): \(name ?? "")  " : nil
        attachmentHeightConstraint.constant = hasAttachment ? 28 : 0

        UIView.animate(withDuration: 0.12) {
            self.containerView.layoutIfNeeded()
        } completion: { _ in
            self.updateSendButtonState()
            self.sendMetrics()
        }
    }

    @objc private func keyboardWillShow(_ notification: Notification) {
        keyboardVisible = true
        sendMetrics()
    }

    @objc private func keyboardWillHide(_ notification: Notification) {
        keyboardVisible = false
        sendMetrics()
    }

    public func textViewDidChange(_ textView: UITextView) {
        placeholderLabel.isHidden = !textView.text.isEmpty

        let width = textView.frame.width > 0 ? textView.frame.width : UIScreen.main.bounds.width - 40
        let size = textView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude))
        let minHeight: CGFloat = 56
        let maxHeight: CGFloat = 160
        let targetHeight = min(max(size.height, minHeight), maxHeight)

        if textViewHeightConstraint.constant != targetHeight {
            textViewHeightConstraint.constant = targetHeight
            UIView.animate(withDuration: 0.1) {
                self.containerView.layoutIfNeeded()
            } completion: { _ in
                self.sendMetrics()
            }
        }

        textView.isScrollEnabled = size.height > maxHeight

        updateSendButtonState()

        // Notify React
        sendEvent("onComposerChange", detail: textView.text)
    }

    private func updateSendButtonState() {
        let hasText = !(textView.text?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true)
        let canSend = (hasText || hasAttachment) && !isLoading
        sendButton.isEnabled = canSend

        // Match the web CSS:
        // empty: bg-neutral-500/10 text-neutral-400 (dark: bg-neutral-500/20 text-neutral-500)
        // full: bg-indigo-600 text-white (dark: bg-indigo-500 text-white)

        let traitCollection = containerView.traitCollection
        let isDark = traitCollection.userInterfaceStyle == .dark

        if canSend {
            sendButton.backgroundColor = isDark ? UIColor(red: 99/255.0, green: 102/255.0, blue: 241/255.0, alpha: 1) : UIColor(red: 79/255.0, green: 70/255.0, blue: 229/255.0, alpha: 1)
            sendButton.tintColor = .white
            sendButton.alpha = 1.0
        } else {
            sendButton.backgroundColor = isDark ? UIColor(white: 1.0, alpha: 0.1) : UIColor(white: 0.0, alpha: 0.05)
            sendButton.tintColor = isDark ? UIColor(white: 1.0, alpha: 0.4) : UIColor(white: 0.0, alpha: 0.4)
            sendButton.alpha = 1.0
        }
    }

    private func sendMetrics() {
        guard containerView != nil else { return }
        bridgeController?.view.layoutIfNeeded()
        let height = containerView.bounds.height > 0 ? containerView.bounds.height : composerBox.systemLayoutSizeFitting(UIView.layoutFittingCompressedSize).height + 16
        let detail: [String: Any] = [
            "height": ceil(height),
            "visible": isVisible,
            "keyboardVisible": keyboardVisible,
        ]
        sendEvent("onComposerMetricsChange", objectDetail: detail)
    }

    private func sendEvent(_ name: String, detail: String? = nil) {
        var js = "window.dispatchEvent(new CustomEvent('\(name)'"
        if let detail = detail {
            // Escape quotes and newlines
            let escaped = detail.replacingOccurrences(of: "\\", with: "\\\\")
                                .replacingOccurrences(of: "\"", with: "\\\"")
                                .replacingOccurrences(of: "\n", with: "\\n")
            js += ", { detail: \"\(escaped)\" }"
        }
        js += "));"

        bridgeController?.webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    private func sendEvent(_ name: String, objectDetail: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(objectDetail),
              let data = try? JSONSerialization.data(withJSONObject: objectDetail),
              let json = String(data: data, encoding: .utf8) else { return }

        let js = "window.dispatchEvent(new CustomEvent('\(name)', { detail: \(json) }));"
        bridgeController?.webView?.evaluateJavaScript(js, completionHandler: nil)
    }
}
