import sys

swift_code = """

// MARK: - Native Composer

import WebKit

@objc class NativeComposerManager: NSObject, WKScriptMessageHandler, UITextViewDelegate {
    static let shared = NativeComposerManager()
    
    weak var bridgeController: CAPBridgeViewController?
    var containerView: UIView!
    var textView: UITextView!
    var sendButton: UIButton!
    var attachButton: UIButton!
    
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
        containerView.backgroundColor = UIColor(red: 26/255.0, green: 26/255.0, blue: 26/255.0, alpha: 1)
        containerView.isHidden = true // hidden until React shows it
        view.addSubview(containerView)
        
        // Add a top border
        let border = UIView()
        border.translatesAutoresizingMaskIntoConstraints = false
        border.backgroundColor = UIColor(white: 1.0, alpha: 0.1)
        containerView.addSubview(border)
        
        // Menu button (2 lines)
        let menuBtn = UIButton(type: .system)
        menuBtn.translatesAutoresizingMaskIntoConstraints = false
        menuBtn.setImage(UIImage(systemName: "line.3.horizontal.decrease"), for: .normal)
        menuBtn.tintColor = .white
        menuBtn.addAction(UIAction { [weak self] _ in self?.sendEvent("onComposerMenu") }, for: .touchUpInside)
        containerView.addSubview(menuBtn)
        
        // Attach button (Plus)
        attachButton = UIButton(type: .system)
        attachButton.translatesAutoresizingMaskIntoConstraints = false
        attachButton.setImage(UIImage(systemName: "plus"), for: .normal)
        attachButton.tintColor = .white
        attachButton.addAction(UIAction { [weak self] _ in self?.sendEvent("onComposerAttach") }, for: .touchUpInside)
        containerView.addSubview(attachButton)
        
        // TextView
        textView = UITextView()
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.backgroundColor = UIColor(white: 1.0, alpha: 0.05)
        textView.textColor = .white
        textView.font = .systemFont(ofSize: 16)
        textView.layer.cornerRadius = 18
        textView.textContainerInset = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)
        textView.isScrollEnabled = false
        textView.delegate = self
        containerView.addSubview(textView)
        
        // Send button (Arrow up in circle)
        sendButton = UIButton(type: .system)
        sendButton.translatesAutoresizingMaskIntoConstraints = false
        sendButton.setImage(UIImage(systemName: "arrow.up"), for: .normal)
        sendButton.tintColor = UIColor(red: 165/255.0, green: 180/255.0, blue: 252/255.0, alpha: 1) // indigo-300
        sendButton.backgroundColor = UIColor(red: 129/255.0, green: 140/255.0, blue: 248/255.0, alpha: 0.2) // indigo-400/20
        sendButton.layer.cornerRadius = 20
        sendButton.addAction(UIAction { [weak self] _ in
            guard let self = self, let text = self.textView.text, !text.isEmpty else { return }
            self.sendEvent("onComposerSend", detail: text)
            self.textView.text = ""
            self.textViewDidChange(self.textView)
        }, for: .touchUpInside)
        containerView.addSubview(sendButton)
        
        NSLayoutConstraint.activate([
            containerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            containerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            containerView.bottomAnchor.constraint(equalTo: view.keyboardLayoutGuide.topAnchor),
            
            border.topAnchor.constraint(equalTo: containerView.topAnchor),
            border.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            border.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            border.heightAnchor.constraint(equalToConstant: 0.5),
            
            menuBtn.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 12),
            menuBtn.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -12),
            menuBtn.widthAnchor.constraint(equalToConstant: 40),
            menuBtn.heightAnchor.constraint(equalToConstant: 40),
            
            attachButton.leadingAnchor.constraint(equalTo: menuBtn.trailingAnchor, constant: 4),
            attachButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -12),
            attachButton.widthAnchor.constraint(equalToConstant: 40),
            attachButton.heightAnchor.constraint(equalToConstant: 40),
            
            textView.leadingAnchor.constraint(equalTo: attachButton.trailingAnchor, constant: 8),
            textView.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 12),
            textView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -12),
            textView.heightAnchor.constraint(greaterThanOrEqualToConstant: 40),
            textView.heightAnchor.constraint(lessThanOrEqualToConstant: 120),
            
            sendButton.leadingAnchor.constraint(equalTo: textView.trailingAnchor, constant: 8),
            sendButton.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -12),
            sendButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -12),
            sendButton.widthAnchor.constraint(equalToConstant: 40),
            sendButton.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        updateSendButtonState()
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        
        DispatchQueue.main.async {
            switch action {
            case "show":
                self.containerView.isHidden = false
            case "hide":
                self.containerView.isHidden = true
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
                    self.sendButton.isEnabled = !loading
                    self.textView.isEditable = !loading
                }
            case "focus":
                self.textView.becomeFirstResponder()
            case "blur":
                self.textView.resignFirstResponder()
            default:
                break
            }
        }
    }
    
    func textViewDidChange(_ textView: UITextView) {
        // Auto-resize is handled by intrinsic content size + constraints
        updateSendButtonState()
        
        // Notify React
        sendEvent("onComposerChange", detail: textView.text)
    }
    
    private func updateSendButtonState() {
        let hasText = !(textView.text?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true)
        sendButton.isEnabled = hasText
        sendButton.alpha = hasText ? 1.0 : 0.5
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
}
"""

with open('ios/App/App/NativeGlassOverlayManager.swift', 'a') as f:
    f.write(swift_code)
