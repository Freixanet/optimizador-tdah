# TDAH Optimizer

Convierte **caos en mapas de acción**. Toma texto denso, transcripciones de YouTube, enlaces web o PDFs y los destila en un formato estructurado y fácil de consumir: núcleo, TL;DR y pasos navegables.

## Qué hace

- **Texto / transcripción**: pega contenido caótico o una transcripción de YouTube.
- **Enlace**: descarga la página en el servidor y extrae el texto legible.
- **Archivo**: sube `.txt`, `.md`, `.csv` o `.pdf`.
- **Resultado**: título, idea central, resumen rápido y pasos con tiempos estimados.

## Requisitos

- Node.js
- Clave de API de Gemini (`GEMINI_API_KEY`)

## Ejecutar en local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Configurar variables de entorno en `.env`:

   ```env
   GEMINI_API_KEY=tu_clave_aqui
   # Opcional:
   GEMINI_MODEL=gemini-3.5-flash
   ```

3. Arrancar en desarrollo:

   ```bash
   npm run dev
   ```

4. Abrir [http://localhost:3000](http://localhost:3000)

## Scripts

| Comando        | Descripción                          |
|----------------|--------------------------------------|
| `npm run dev`  | Servidor Express + Vite (desarrollo) |
| `npm run build`| Build de frontend + bundle del server|
| `npm run start`| Servidor de producción               |
| `npm run lint` | Comprobación de tipos TypeScript     |

## Stack

- React 19 + Vite + Tailwind CSS v4
- Express (API `/api/transform`)
- Google Gemini API (`@google/genai`)

## Apps nativas y sincronización (staging primero)

Consulta [`docs/NATIVE_FOUNDATION.md`](docs/NATIVE_FOUNDATION.md) para el estado del plan reversible, checkpoints y comandos locales.

- `ios/` contiene la app iOS 17+ en SwiftUI, con un puente UIKit para documentos.
  Genera el proyecto local con `cd ios && xcodegen generate`; no incluye secretos.
- `android/` contiene la base Android 10+ en Compose, Room y DataStore. Se necesita
  un JDK local para compilarla con Gradle.
- `supabase/migrations/` contiene una migración aditiva para aplicar **primero en un
  proyecto de staging**. Las políticas RLS impiden que una cuenta acceda a mapas ajenos.
- La web sigue funcionando sin Supabase. Con `VITE_SUPABASE_*`, el menú de perfil permite
  entrar con **Google** (un clic, sesión persistente) o **email + contraseña**, y migra el
  historial local al iniciar sesión.
- Railway puede usar `railway.toml`; configura sus secretos en el panel, nunca en Git.

Antes de producción, registra las URLs de retorno de web/iOS/Android en Supabase y
prueba OAuth, RLS, migración, uso offline y conflictos entre dispositivos en staging.
