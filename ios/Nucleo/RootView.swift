import SwiftUI
import PhotosUI

@MainActor
final class MapStore: ObservableObject {
    @Published var maps: [ActionMap] = []
    @Published var currentMap: ActionMap?
    @Published var isLoading = false
    @Published var errorMessage: String?
    private let client = APIClient()

    func create(text: String, imageData: Data? = nil) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let request = TransformRequest(
                text: text.isEmpty ? nil : text,
                type: imageData == nil ? "text" : "image",
                fileData: imageData?.base64EncodedString(),
                mimeType: imageData == nil ? nil : "image/jpeg",
                preferredModel: "auto"
            )
            let document = try await client.transform(request, accessToken: nil)
            let now = Date()
            let map = ActionMap(id: UUID().uuidString, title: "Mapa nuevo", category: nil, pinnedAt: nil, sourceType: "text", document: document, currentStep: 0, isComplete: false, viewAll: false, createdAt: now, updatedAt: now)
            maps.insert(map, at: 0)
            currentMap = map
        } catch { errorMessage = "No se pudo crear el mapa. \(error.localizedDescription)" }
    }
}

struct RootView: View {
    @StateObject private var store = MapStore()
    @State private var text = ""
    @State private var pickedPhoto: PhotosPickerItem?
    @State private var showingDocumentPicker = false

    var body: some View {
        TabView {
            NavigationStack {
                Form {
                    Section("Nuevo mapa") {
                        TextEditor(text: $text).frame(minHeight: 180)
                        PhotosPicker("Añadir foto", selection: $pickedPhoto, matching: .images)
                        Button("Seleccionar documento") { showingDocumentPicker = true }
                        Button("Crear mapa") { Task { await store.create(text: text) } }
                            .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || store.isLoading)
                    }
                }
                .navigationTitle("Núcleo")
                .sheet(isPresented: $showingDocumentPicker) { DocumentPicker { _ in showingDocumentPicker = false } }
            }
            .tabItem { Label("Nuevo", systemImage: "square.and.pencil") }

            NavigationStack {
                List(store.maps) { map in
                    Button(map.title) { store.currentMap = map }
                }
                .navigationTitle("Historial")
            }
            .tabItem { Label("Historial", systemImage: "clock") }
        }
        .task(id: pickedPhoto) {
            guard let data = try? await pickedPhoto?.loadTransferable(type: Data.self) else { return }
            await store.create(text: text, imageData: data)
        }
        .alert("Núcleo", isPresented: Binding(get: { store.errorMessage != nil }, set: { if !$0 { store.errorMessage = nil } })) {
            Button("Aceptar", role: .cancel) {}
        } message: { Text(store.errorMessage ?? "") }
    }
}
