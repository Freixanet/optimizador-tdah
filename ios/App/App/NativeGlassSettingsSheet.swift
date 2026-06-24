import UIKit

/// Debug-only UIKit sheet used to validate native presentation above the web app.
/// It deliberately has no bridge or JavaScript integration.
final class NativeGlassSettingsSheetController: UIViewController {
    private let appearanceControl = UISegmentedControl(items: ["Sistema", "Claro", "Oscuro"])

    override func viewDidLoad() {
        super.viewDidLoad()

        title = "Ajustes nativos"
        view.backgroundColor = .systemBackground
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .done,
            target: self,
            action: #selector(dismissSheet)
        )

        configureSheet()
        configureContent()
    }

    private func configureSheet() {
        modalPresentationStyle = .pageSheet

        if #available(iOS 15.0, *), let sheet = sheetPresentationController {
            sheet.detents = [.medium(), .large()]
            sheet.prefersGrabberVisible = true
            sheet.preferredCornerRadius = 24
        }
    }

    private func configureContent() {
        let descriptionLabel = UILabel()
        descriptionLabel.numberOfLines = 0
        descriptionLabel.font = .preferredFont(forTextStyle: .body)
        descriptionLabel.textColor = .secondaryLabel
        descriptionLabel.text = "Prueba aislada de una interfaz UIKit sobre la aplicación web. No cambia el flujo ni envía eventos a JavaScript."

        let appearanceLabel = UILabel()
        appearanceLabel.font = .preferredFont(forTextStyle: .headline)
        appearanceLabel.text = "Apariencia del sheet"

        appearanceControl.selectedSegmentIndex = 0
        appearanceControl.addTarget(self, action: #selector(updateAppearance), for: .valueChanged)
        appearanceControl.accessibilityLabel = "Apariencia del sheet de prueba"

        let debugLabel = UILabel()
        debugLabel.numberOfLines = 0
        debugLabel.font = .preferredFont(forTextStyle: .footnote)
        debugLabel.textColor = .tertiaryLabel
        debugLabel.text = "Solo disponible en compilaciones Debug. La barra NativeGlass continúa desactivada."

        let stack = UIStackView(arrangedSubviews: [descriptionLabel, appearanceLabel, appearanceControl, debugLabel])
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            stack.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
            stack.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 28),
        ])
    }

    @objc private func updateAppearance() {
        switch appearanceControl.selectedSegmentIndex {
        case 1:
            overrideUserInterfaceStyle = .light
        case 2:
            overrideUserInterfaceStyle = .dark
        default:
            overrideUserInterfaceStyle = .unspecified
        }
    }

    @objc private func dismissSheet() {
        dismiss(animated: true)
    }
}
