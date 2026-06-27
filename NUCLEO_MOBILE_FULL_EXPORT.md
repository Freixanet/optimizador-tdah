# NUCLEO MOBILE APP — EXPORT COMPLETO
# Generado: 2026-06-26T23:12:32Z
# Stack: Expo 56 + React Native + NativeWind + shared/

## ESTRUCTURA
- mobile/ — app React Native (Expo dev client)
- shared/ — lógica compartida con web


================================================================================
FILE: mobile/package.json
================================================================================
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/native": "^7.3.4",
    "@react-navigation/native-stack": "^7.17.6",
    "@shopify/flash-list": "2.0.2",
    "@supabase/supabase-js": "^2.108.2",
    "babel-preset-expo": "~56.0.0",
    "expo": "~56.0.12",
    "expo-blur": "~56.0.3",
    "expo-dev-client": "^56.0.20",
    "expo-document-picker": "~56.0.4",
    "expo-file-system": "~56.0.8",
    "expo-haptics": "~56.0.3",
    "expo-image-manipulator": "~56.0.19",
    "expo-image-picker": "~56.0.18",
    "expo-linking": "~56.0.14",
    "expo-status-bar": "~56.0.4",
    "expo-web-browser": "~56.0.5",
    "lucide-react-native": "^1.21.0",
    "nativewind": "^4.2.6",
    "react": "19.2.3",
    "react-native": "0.85.3",
    "react-native-gesture-handler": "~2.31.1",
    "react-native-reanimated": "4.3.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "4.25.2",
    "react-native-svg": "15.15.4",
    "react-native-webview": "13.16.1",
    "tailwindcss": "^3.4.19"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "eas-cli": "^20.4.0",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "start:dev-client": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "ios:prebuild": "expo prebuild --platform ios && ./scripts/configure-ios-local-signing.sh",
    "ios:device": "./scripts/configure-ios-local-signing.sh && expo run:ios --device",
    "ios:signing": "./scripts/configure-ios-local-signing.sh",
    "web": "expo start --web",
    "lint": "tsc --noEmit",
    "release:setup": "../scripts/setup-mobile-release.sh all",
    "release:env": "../scripts/setup-mobile-release.sh env",
    "eas:login": "eas login",
    "eas:init": "eas init --non-interactive",
    "build:preview:ios": "eas build --profile preview --platform ios --non-interactive",
    "build:preview:android": "eas build --profile preview --platform android --non-interactive",
    "build:preview": "eas build --profile preview --platform all --non-interactive"
  },
  "private": true
}

================================================================================
FILE: mobile/app.json
================================================================================
{
  "expo": {
    "name": "Nucleo",
    "slug": "nucleo",
    "version": "1.0.0",
    "scheme": "nucleo",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.freixanet.nucleo"
    },
    "android": {
      "package": "com.freixanet.nucleo",
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "permissions": [
        "android.permission.RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-dev-client",
      [
        "expo-image-picker",
        {
          "photosPermission": "Permite acceder a tus fotos para adjuntar imágenes y videos.",
          "cameraPermission": "Permite usar la cámara para adjuntar fotos."
        }
      ],
      "expo-web-browser"
    ],
    "extra": {
      "eas": {
        "projectId": "50a15b7b-c758-471b-ac20-c630111dcfa2"
      }
    },
    "owner": "mfreixanets-team"
  }
}

================================================================================
FILE: mobile/app.config.js
================================================================================
const { execSync } = require('child_process');
const base = require('./app.json').expo;

function detectAppleTeamId() {
  const fromEnv = process.env.APPLE_TEAM_ID?.trim();
  if (fromEnv) return fromEnv;

  try {
    const subject = execSync(
      'security find-certificate -a -c "Apple Development" -p 2>/dev/null | openssl x509 -noout -subject 2>/dev/null',
      { encoding: 'utf8' },
    );
    const match = subject.match(/OU=([A-Z0-9]{10})/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

const appleTeamId = detectAppleTeamId();

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...base,
    ios: {
      ...base.ios,
      ...(appleTeamId ? { appleTeamId } : {}),
    },
  },
};

================================================================================
FILE: mobile/eas.json
================================================================================
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://optimizador-tdah-production.up.railway.app",
        "EXPO_PUBLIC_SUPABASE_URL": "https://oxvfiyuljzchdjotyshl.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dmZpeXVsanpjaGRqb3R5c2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzMxMjEsImV4cCI6MjA5NzY0OTEyMX0.KPtcbIApyD2jqW0Q_gUAlME8ITi6lGBsim6eQEkAVtc"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://optimizador-tdah-production.up.railway.app",
        "EXPO_PUBLIC_SUPABASE_URL": "https://oxvfiyuljzchdjotyshl.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dmZpeXVsanpjaGRqb3R5c2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzMxMjEsImV4cCI6MjA5NzY0OTEyMX0.KPtcbIApyD2jqW0Q_gUAlME8ITi6lGBsim6eQEkAVtc"
      }
    }
  }
}

================================================================================
FILE: mobile/tsconfig.json
================================================================================
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "ignoreDeprecations": "6.0",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}

================================================================================
FILE: mobile/babel.config.js
================================================================================
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};

================================================================================
FILE: mobile/metro.config.js
================================================================================
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [path.resolve(workspaceRoot, "shared")];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];
config.resolver.extraNodeModules = {
  "@shared": path.resolve(workspaceRoot, "shared"),
};

module.exports = withNativeWind(config, { input: "./global.css" });

================================================================================
FILE: mobile/tailwind.config.js
================================================================================
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // We will define our custom theme color palette here to match the web app's style.
      }
    },
  },
  plugins: [],
}

================================================================================
FILE: mobile/global.css
================================================================================
@tailwind base;
@tailwind components;
@tailwind utilities;

================================================================================
FILE: mobile/index.ts
================================================================================
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);

================================================================================
FILE: mobile/App.tsx
================================================================================
import './global.css';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppSessionProvider } from './src/context/AppSessionContext';
import { AppVariantProvider } from './src/context/AppVariantContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { bootstrapStorage } from './src/shims/localStorage';
import { getAppVariant, switchAppVariant, type AppVariant } from './src/logic/appVariant';
import ComprensionApp from './src/screens/ComprensionApp';
import ClassicShell from './src/screens/classic/ClassicShell';

function AppShell() {
  const { isDark } = useTheme();
  const [appVariant, setAppVariant] = useState<AppVariant>(() => getAppVariant());

  const handleVariantChange = useCallback((next: AppVariant) => {
    switchAppVariant(next, () => setAppVariant(next));
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppVariantProvider onVariantChange={handleVariantChange}>
        <AppSessionProvider key={appVariant}>
          {appVariant === 'classic' ? <ClassicShell /> : <ComprensionApp />}
        </AppSessionProvider>
      </AppVariantProvider>
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapStorage()
      .then(() => setReady(true))
      .catch((error) => {
        console.error(error);
        setBootError('No se pudo inicializar el almacenamiento local.');
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {bootError ? (
          <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-900">
            <Text className="text-center text-neutral-700 dark:text-neutral-200">{bootError}</Text>
          </View>
        ) : (
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

================================================================================
FILE: mobile/nativewind-env.d.ts
================================================================================
/// <reference types="nativewind/types" />

declare module '*.css';

================================================================================
FILE: mobile/.env.example
================================================================================
# Copia a .env (o ejecuta `../scripts/setup-mobile-release.sh env` desde la raíz).

# API del backend (dev local vs preview/prod en eas.json)
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000

# Sincronización en la nube (opcional)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Para builds EAS en CI (opcional):
# EXPO_TOKEN=...

# Para configurar redirects OAuth en Supabase vía script (opcional):
# SUPABASE_ACCESS_TOKEN=...

# Personal Team de Xcode (opcional; se detecta del certificado Apple Development):
# APPLE_TEAM_ID=XXXXXXXXXX

================================================================================
FILE: mobile/QA_CHECKLIST.md
================================================================================
# Mobile release QA checklist

## Setup automático (desde la raíz del repo)

```bash
./scripts/setup-mobile-release.sh env
```

Esto escribe `mobile/.env` con Supabase y API base.

## Pasos que requieren credenciales (una sola vez)

### 1. Expo / EAS

```bash
cd mobile
npm run eas:login          # abre el navegador; inicia sesión en expo.dev
npm run eas:init           # crea el proyecto y rellena extra.eas.projectId
npm run build:preview      # builds internos iOS + Android
```

Alternativa CI: define `EXPO_TOKEN` en el entorno.

### 2. Supabase OAuth redirects

Opción A — script (token personal en https://supabase.com/dashboard/account/tokens):

```bash
SUPABASE_ACCESS_TOKEN=... ./scripts/setup-mobile-release.sh supabase-redirects
```

Opción B — manual en Auth → URL Configuration:

- `nucleo://login-callback`
- `nucleo://**`
- `com.freixanet.nucleo://login-callback`
- `com.nucleo.app://login-callback`
- `exp://**`
- `http://localhost:3000/**`
- `http://127.0.0.1:3000/**`

### 3. Apple / Google (solo para submit a stores)

Configura credenciales en Expo cuando vayas a publicar:

```bash
cd mobile
eas credentials
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

## Functional QA (iOS + Android)

- [ ] App boots after fresh install
- [ ] Input → loading skeleton → result navigation works
- [ ] Text, link, YouTube, PDF, image, and video transforms succeed
- [ ] Step-by-step and lectura completa modes work
- [ ] Reading progress bar updates in both modes
- [ ] Knowledge sections render when present
- [ ] History drawer opens via button and edge swipe
- [ ] Pin, rename, and delete history entries work
- [ ] Theme toggle persists across relaunch
- [ ] Model selector changes preference sent to API
- [ ] Map chat sheet works on an active map
- [ ] OAuth sign-in works when Supabase is configured
- [ ] Haptics fire on key interactions

## Regression (web)

- [ ] `npm run lint && npm run build` pass at repo root
- [ ] Capacitor iOS fallback still builds (`npm run cap:sync`)

================================================================================
FILE: shared/apiBase.ts
================================================================================
export const DEFAULT_API_BASE = 'https://optimizador-tdah-production.up.railway.app';

export function createApiUrlResolver(getBaseUrl: () => string) {
  return function apiUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getBaseUrl()}${normalizedPath}`;
  };
}

================================================================================
FILE: shared/atomGeometry.ts
================================================================================
export type AtomRibbon = {
  backPath: string;
  frontPath: string;
  grad: { x1: number; y1: number; x2: number; y2: number };
};

export type AtomGeometry = {
  cx: number;
  cy: number;
  coreR: number;
  haloR: number;
  sphereR: number;
  ribbons: AtomRibbon[];
  rim: { strokes: RimStroke[] };
  sphereLight: SphereLight;
};

export type SphereLight = {
  diffuseCx: number;
  diffuseCy: number;
  diffuseR: number;
  specCx: number;
  specCy: number;
  specR: number;
};

export type RimStroke = { d: string; width: number };

/** Toggle sphere volume / projected shadows when comparing effects. */
export const ATOM_SHADING = {
  enableSphereVolume: true,
  enableProjectedShadows: true,
  projectedShadowDx: 0.012,
  projectedShadowDy: 0.018,
  projectedShadowOpacity: { light: 0.14, dark: 0.22 },
  exteriorDropOpacity: { light: 0.32, dark: 0.42 },
  // Spherical glass volume: directional body shading (light top-left -> dark
  // bottom-right), a soft inner core shadow near the bottom-right rim, a
  // top-left highlight and a thin rim light on the far edge.
  sphereBodyShadowOpacity: { light: 0.09, dark: 0.13 },
  sphereDiffuseOpacity: { light: 0.38, dark: 0.32 },
  sphereHighlightOpacity: { light: 0.65, dark: 0.38 },
  sphereRimOpacity: { light: 0.55, dark: 0.65 },
  rimBrightAngleDeg: 45,
  rimMaxHalfW: 0.0055,
  rimExponent: 3.8,
  rimArcHalfDeg: 118,
  rimMinHalfWRatio: 0.006,
} as const;

type Point3D = { x: number; y: number; z: number };

type RibbonSample = Point3D & {
  halfW: number;
  ox: number;
  oy: number;
  ix: number;
  iy: number;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fmt(n: number) {
  return n.toFixed(2);
}

function ribbonPathFromArc(outer: Array<{ x: number; y: number }>, inner: Array<{ x: number; y: number }>) {
  if (outer.length < 2 || inner.length < 2) return '';
  let d = `M${fmt(outer[0].x)} ${fmt(outer[0].y)}`;
  for (let i = 1; i < outer.length; i++) d += ` L${fmt(outer[i].x)} ${fmt(outer[i].y)}`;
  for (let i = inner.length - 1; i >= 0; i--) d += ` L${fmt(inner[i].x)} ${fmt(inner[i].y)}`;
  return `${d} Z`;
}

function lerpSample(a: RibbonSample, b: RibbonSample, t: number): RibbonSample {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    halfW: lerp(a.halfW, b.halfW, t),
    ox: lerp(a.ox, b.ox, t),
    oy: lerp(a.oy, b.oy, t),
    ix: lerp(a.ix, b.ix, t),
    iy: lerp(a.iy, b.iy, t),
  };
}

function buildRibbonSamples(
  centerline: Point3D[],
  minHalfW: number,
  maxHalfW: number,
  zRange: number
): RibbonSample[] {
  const n = centerline.length;
  return centerline.map((pt, i) => {
    const prev = centerline[(i - 1 + n) % n];
    const next = centerline[(i + 1) % n];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    const t = (pt.z + zRange) / (2 * zRange);
    const halfW = lerp(minHalfW, maxHalfW, t);
    return {
      ...pt,
      halfW,
      ox: pt.x + nx * halfW,
      oy: pt.y + ny * halfW,
      ix: pt.x - nx * halfW,
      iy: pt.y - ny * halfW,
    };
  });
}

function splitRibbonArcs(samples: RibbonSample[]): { backArcs: RibbonSample[][]; frontArcs: RibbonSample[][] } {
  const n = samples.length;
  const runs: Array<{ sign: number; pts: RibbonSample[] }> = [];

  for (let i = 0; i < n; i++) {
    const curr = samples[i];
    const next = samples[(i + 1) % n];
    const sign = curr.z >= 0 ? 1 : -1;
    const last = runs[runs.length - 1];

    if (last && last.sign === sign) {
      last.pts.push(curr);
    } else {
      runs.push({ sign, pts: [curr] });
    }

    if ((curr.z >= 0) !== (next.z >= 0)) {
      const denom = Math.abs(curr.z) + Math.abs(next.z);
      const t = denom > 0 ? Math.abs(curr.z) / denom : 0.5;
      const cross = lerpSample(curr, next, t);
      runs[runs.length - 1].pts.push(cross);

      const nextSign = next.z >= 0 ? 1 : -1;
      runs.push({ sign: nextSign, pts: [cross] });
    }
  }

  if (runs.length > 1 && runs[0].sign === runs[runs.length - 1].sign) {
    const first = runs.shift()!;
    runs[runs.length - 1].pts.push(...first.pts);
  }

  const backArcs: RibbonSample[][] = [];
  const frontArcs: RibbonSample[][] = [];

  for (const run of runs) {
    if (run.pts.length < 2) continue;
    if (run.sign < 0) backArcs.push(run.pts);
    else frontArcs.push(run.pts);
  }

  return { backArcs, frontArcs };
}

function arcsToPath(arcs: RibbonSample[][]): string {
  return arcs
    .map((arc) => {
      const outer = arc.map((p) => ({ x: p.ox, y: p.oy }));
      const inner = arc.map((p) => ({ x: p.ix, y: p.iy }));
      return ribbonPathFromArc(outer, inner);
    })
    .filter(Boolean)
    .join(' ');
}

function buildRingRibbon(
  size: number,
  cx: number,
  cy: number,
  spin: number,
  radius: number,
  tilt: number,
  samples: number,
  minHalfW: number,
  maxHalfW: number,
  rotation: number
): AtomRibbon {
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const cosS = Math.cos(spin);
  const sinS = Math.sin(spin);
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const zRange = radius * sinT;

  const centerline: Point3D[] = [];
  for (let s = 0; s < samples; s++) {
    const a = (s / samples) * Math.PI * 2;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    const ty = py * cosT;
    const tz = py * sinT;
    const sx = px * cosS - ty * sinS;
    const sy = px * sinS + ty * cosS;
    const rx = sx * cosR - sy * sinR;
    const ry = sx * sinR + sy * cosR;
    centerline.push({ x: cx + rx, y: cy - ry, z: tz });
  }

  const ribbonSamples = buildRibbonSamples(centerline, minHalfW, maxHalfW, zRange);
  const { backArcs, frontArcs } = splitRibbonArcs(ribbonSamples);

  const far = centerline.reduce((best, p) => (p.z < best.z ? p : best), centerline[0]);
  const near = centerline.reduce((best, p) => (p.z > best.z ? p : best), centerline[0]);

  return {
    backPath: arcsToPath(backArcs),
    frontPath: arcsToPath(frontArcs),
    grad: { x1: far.x, y1: far.y, x2: near.x, y2: near.y },
  };
}

function buildSphereRim(
  cx: number,
  cy: number,
  sphereR: number,
  brightAngle: number,
  maxHalfW: number,
  exponent: number,
  arcHalfRad: number,
  minHalfWRatio: number,
  samples: number
): { strokes: RimStroke[] } {
  const r = sphereR;
  const minHalfW = maxHalfW * minHalfWRatio;
  const strokes: RimStroke[] = [];

  for (let s = 0; s < samples; s++) {
    const t0 = s / samples;
    const t1 = (s + 1) / samples;
    const theta0 = brightAngle - arcHalfRad + t0 * (2 * arcHalfRad);
    const theta1 = brightAngle - arcHalfRad + t1 * (2 * arcHalfRad);
    const thetaMid = (theta0 + theta1) / 2;
    const taper = Math.max(0, 0.5 + 0.5 * Math.cos(thetaMid - brightAngle));
    const halfW = Math.max(minHalfW, maxHalfW * Math.pow(taper, exponent));

    const x1 = cx + r * Math.cos(theta0);
    const y1 = cy + r * Math.sin(theta0);
    const x2 = cx + r * Math.cos(theta1);
    const y2 = cy + r * Math.sin(theta1);

    strokes.push({
      d: `M${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)}`,
      width: halfW * 2,
    });
  }

  return { strokes };
}

function buildSphereLight(cx: number, cy: number, sphereR: number): SphereLight {
  return {
    diffuseCx: cx - sphereR * 0.3,
    diffuseCy: cy - sphereR * 0.34,
    diffuseR: sphereR * 0.75,
    specCx: cx - sphereR * 0.2,
    specCy: cy - sphereR * 0.24,
    specR: sphereR * 0.26,
  };
}

/** Global rotation of the whole atom, in degrees (clockwise / "to the right"). */
export const ATOM_ROTATION_DEG = 90;

export function buildAtomRibbons(size: number): AtomGeometry {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.4;
  const tilt = (72 * Math.PI) / 180;
  const scale = size / 112;
  const minHalfW = scale * 0.45;
  const maxHalfW = scale * 1.35;
  const samples = 120;
  const rotation = -(ATOM_ROTATION_DEG * Math.PI) / 180;

  const ribbons = [0, 1, 2].map((i) =>
    buildRingRibbon(size, cx, cy, -(i * 60 * Math.PI) / 180, radius, tilt, samples, minHalfW, maxHalfW, rotation)
  );

  const rimBrightAngle = (ATOM_SHADING.rimBrightAngleDeg * Math.PI) / 180;
  const arcHalfRad = (ATOM_SHADING.rimArcHalfDeg * Math.PI) / 180;
  const sphereR = size * 0.46;
  const rimMaxHalfW = size * ATOM_SHADING.rimMaxHalfW;
  const rim = buildSphereRim(
    cx,
    cy,
    sphereR,
    rimBrightAngle,
    rimMaxHalfW,
    ATOM_SHADING.rimExponent,
    arcHalfRad,
    ATOM_SHADING.rimMinHalfWRatio,
    96
  );
  const sphereLight = buildSphereLight(cx, cy, sphereR);

  return {
    cx,
    cy,
    coreR: size * 0.072,
    haloR: sphereR,
    sphereR,
    ribbons,
    rim,
    sphereLight,
  };
}

================================================================================
FILE: shared/contracts.ts
================================================================================
export type SourceType = 'text' | 'link' | 'youtube' | 'file' | 'pdf';

export type MapIntent = 'understand' | 'study' | 'apply';

export type MapDepth = 'rapido' | 'estandar' | 'profundo';

export type OutputLanguagePreference = 'device' | 'es' | 'en';

export type SourceKind =
  | 'text'
  | 'link'
  | 'youtube'
  | 'pdf'
  | 'image'
  | 'video'
  | 'file';

export type ReferenceLocatorKind =
  | 'page'
  | 'section'
  | 'timestamp'
  | 'slide'
  | 'sheet'
  | 'chapter'
  | 'region'
  | 'general';

export type SourceReference = {
  label: string;
  locator: string;
  locatorKind?: ReferenceLocatorKind;
  excerpt?: string;
  note?: string;
};

export type SourceMetadata = {
  kind: SourceKind;
  label: string;
  title?: string;
  author?: string;
  language?: string;
  detected: string[];
  limitations?: string[];
};

export type CoverageNote = {
  label: string;
  detail: string;
  tone?: 'neutral' | 'warning';
};

export type Coverage = {
  summary: string;
  notes: CoverageNote[];
};

export type KnowledgeSection = {
  title: string;
  summary: string;
  references?: SourceReference[];
};

export type TLDRItem = {
  title: string;
  desc: string;
};

export type CalloutLabel =
  | 'Idea clave'
  | 'Matiz'
  | 'Ejemplo'
  | 'Precaución'
  | 'Para aplicarlo';

export type StepListItem = {
  strong: string;
  span?: string;
};

export type StepContentBlock = {
  type: 'prose' | 'callout' | 'list';
  text: string;
  kind?: 'action' | 'info' | 'alert';
  label?: CalloutLabel;
  items?: StepListItem[];
  references?: SourceReference[];
};

export type MapStep = {
  id: string;
  shortNav: string;
  title: string;
  time: string;
  content: StepContentBlock[];
  purpose?: string;
  references?: SourceReference[];
};

export type CompletionCard = {
  title: string;
  summary: string;
  takeaways: string[];
  promptQuestion?: string;
};

export type ActionMapData = {
  title: string;
  category?: string;
  intent?: MapIntent;
  outputLanguage?: string;
  mapVersion?: number;
  sourceMetadata?: SourceMetadata;
  coverage?: Coverage;
  coreIdea: string;
  coreSupport: string;
  tldr: TLDRItem[];
  knowledgeSections?: KnowledgeSection[];
  steps: MapStep[];
  references?: SourceReference[];
  completionCard?: CompletionCard;
  modelUsed?: string;
};

export type SavedSession = {
  data: ActionMapData | Record<string, unknown>;
  currentStep: number;
  isComplete?: boolean;
  viewAll?: boolean;
};

export type MapRecord = {
  id: string;
  title: string;
  category?: string;
  pinned?: boolean;
  pinnedAt?: number;
  createdAt: number;
  updatedAt: number;
  sourceType: SourceType;
  session: SavedSession;
};

export type TransformRequest = {
  text?: string;
  type: 'text' | 'link' | 'youtube' | 'pdf' | 'image' | 'video';
  fileData?: string;
  mimeType?: string;
  preferredModel?: string;
  intent?: MapIntent;
  outputLanguage?: string;
  sourceLabel?: string;
  mapId?: string;
  depth?: MapDepth;
};

export type ChatTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export type MapChatRequest = {
  map?: ActionMapData;
  question: string;
  history?: ChatTurn[];
};

export type MapChatResponse = {
  answer: string;
  followUps: string[];
  citations: SourceReference[];
  limitations?: string[];
};

export type TransformStreamEvent = {
  type: 'partial' | 'done' | 'error';
  map?: ActionMapData;
  model?: string;
  error?: string;
};

================================================================================
FILE: shared/depthPreference.ts
================================================================================
import { getStorage } from './storage';
import type { MapDepth } from './contracts';

export const DEPTH_OPTIONS = [
  { id: 'rapido' as const, label: 'Rápido', hint: 'Menos pasos, ideas esenciales' },
  { id: 'estandar' as const, label: 'Estándar', hint: 'Equilibrio entre cobertura y brevedad' },
  { id: 'profundo' as const, label: 'Profundo', hint: 'Máximo detalle por unidad' },
] as const;

export type DepthPreference = MapDepth;

const STORAGE_KEY = 'tdah-depth-preference';

export function getInitialDepthPreference(): DepthPreference {
  try {
    const stored = getStorage().getItem(STORAGE_KEY);
    if (stored && DEPTH_OPTIONS.some((option) => option.id === stored)) {
      return stored as DepthPreference;
    }
  } catch {
    // Storage not ready yet
  }
  return 'estandar';
}

export function saveDepthPreference(value: DepthPreference): void {
  getStorage().setItem(STORAGE_KEY, value);
}

================================================================================
FILE: shared/history.ts
================================================================================
import type { SavedSession, SourceType } from './contracts';
export type { SourceType } from './contracts';
import { getStorage } from './storage';

export type HistoryEntry = {
  id: string;
  title: string;
  category?: string;
  pinned?: boolean;
  pinnedAt?: number;
  createdAt: number;
  updatedAt: number;
  sourceType: SourceType;
  session: SavedSession;
};

export type HistoryStore = {
  activeId: string | null;
  entries: HistoryEntry[];
};

const HISTORY_KEY = 'tdah-optimizer-history';
const LEGACY_SESSION_KEY = 'tdah-optimizer-session';
const MAX_ENTRIES = 30;

function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and use fallback
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function isValidSession(session: unknown): session is SavedSession {
  const s = session as SavedSession;
  const steps = (s?.data as { steps?: unknown } | undefined)?.steps;
  return Array.isArray(steps) && steps.length > 0;
}

function isValidEntry(entry: unknown): entry is HistoryEntry {
  const e = entry as HistoryEntry;
  return Boolean(
    e?.id &&
      e?.title &&
      typeof e.createdAt === 'number' &&
      typeof e.updatedAt === 'number' &&
      e.sourceType &&
      isValidSession(e.session)
  );
}

function migrateLegacySession(): HistoryStore | null {
  try {
    const storage = getStorage();
    const raw = storage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SavedSession;
    if (!isValidSession(parsed)) {
      storage.removeItem(LEGACY_SESSION_KEY);
      return null;
    }

    const now = Date.now();
    const title = (parsed.data as { title?: string } | undefined)?.title || 'Mapa sin título';
    const entry: HistoryEntry = {
      id: generateId(),
      title,
      createdAt: now,
      updatedAt: now,
      sourceType: 'text',
      session: parsed,
    };

    storage.removeItem(LEGACY_SESSION_KEY);
    return { activeId: entry.id, entries: [entry] };
  } catch {
    try {
      getStorage().removeItem(LEGACY_SESSION_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

function trimEntries(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, MAX_ENTRIES);
}

function persist(store: HistoryStore): boolean {
  const trimmed: HistoryStore = {
    activeId: store.activeId,
    entries: trimEntries(store.entries),
  };

  try {
    getStorage().setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    if (trimmed.entries.length <= 1) return false;

    const reduced: HistoryStore = {
      activeId: trimmed.activeId,
      entries: trimmed.entries.slice(0, Math.max(1, Math.floor(trimmed.entries.length / 2))),
    };

    try {
      getStorage().setItem(HISTORY_KEY, JSON.stringify(reduced));
      return true;
    } catch {
      return false;
    }
  }
}

function resolveActiveId(
  stored: string | null | undefined,
  entries: HistoryEntry[]
): string | null {
  if (stored === null) return null;
  if (stored && entries.some((entry) => entry.id === stored)) return stored;
  if (stored) return null;
  return entries[0]?.id ?? null;
}

export function loadHistory(): HistoryStore {
  try {
    const raw = getStorage().getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryStore;
      const entries = (parsed.entries || []).filter(isValidEntry);
      const activeId = resolveActiveId(parsed.activeId, entries);
      return { activeId, entries };
    }
  } catch {
    // fall through to migration
  }

  const migrated = migrateLegacySession();
  if (migrated) {
    persist(migrated);
    return migrated;
  }

  return { activeId: null, entries: [] };
}

export function saveHistory(store: HistoryStore): boolean {
  return persist(store);
}

export function getActiveEntry(store: HistoryStore): HistoryEntry | null {
  if (!store.activeId) return null;
  return store.entries.find((e) => e.id === store.activeId) ?? null;
}

export function createEntry(
  store: HistoryStore,
  session: SavedSession,
  sourceType: SourceType,
  providedId?: string
): HistoryStore {
  const now = Date.now();
  const title = (session.data as { title?: string } | undefined)?.title || 'Mapa sin título';
  const entry: HistoryEntry = {
    id: providedId || generateId(),
    title,
    createdAt: now,
    updatedAt: now,
    sourceType,
    session,
  };

  return {
    activeId: entry.id,
    entries: [entry, ...store.entries],
  };
}

export function updateActiveSession(
  store: HistoryStore,
  session: SavedSession
): HistoryStore {
  if (!store.activeId) return store;

  const entries = store.entries.map((entry) => {
    if (entry.id !== store.activeId) return entry;

    const title = ((session.data as { title?: string } | undefined)?.title || entry.title) as string;
    const progressChanged =
      entry.session.currentStep !== session.currentStep ||
      entry.session.isComplete !== session.isComplete ||
      entry.session.viewAll !== session.viewAll;
    const titleChanged = title !== entry.title;

    if (!progressChanged && !titleChanged) {
      if (entry.session.data === session.data) return entry;
      return { ...entry, title, session };
    }

    const now = Date.now();
    return {
      ...entry,
      title,
      updatedAt: now,
      session,
    };
  });

  return { ...store, entries };
}

export function setActiveId(store: HistoryStore, id: string | null): HistoryStore {
  if (id && !store.entries.some((e) => e.id === id)) {
    return store;
  }
  return { ...store, activeId: id };
}

export function deleteEntry(store: HistoryStore, id: string): HistoryStore {
  const entries = store.entries.filter((e) => e.id !== id);
  const activeId = store.activeId === id ? null : store.activeId;

  return { activeId, entries };
}

export function renameEntry(store: HistoryStore, id: string, title: string): HistoryStore {
  const trimmed = title.trim();
  if (!trimmed) return store;

  const now = Date.now();
  const entries = store.entries.map((entry) => {
    if (entry.id !== id) return entry;

    return {
      ...entry,
      title: trimmed,
      updatedAt: now,
      session: {
        ...entry.session,
        data: {
          ...entry.session.data,
          title: trimmed,
        },
      },
    };
  });

  return { ...store, entries };
}

export function togglePinEntry(store: HistoryStore, id: string): HistoryStore {
  const now = Date.now();
  const entries = store.entries.map((entry) => {
    if (entry.id !== id) return entry;

    if (entry.pinned) {
      const { pinned: _pinned, pinnedAt: _pinnedAt, ...rest } = entry;
      return rest;
    }

    return { ...entry, pinned: true, pinnedAt: now };
  });

  return { ...store, entries };
}

export function formatRelativeDate(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function sortPinnedEntries(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) => (b.pinnedAt ?? b.updatedAt) - (a.pinnedAt ?? a.updatedAt)
  );
}

================================================================================
FILE: shared/index.ts
================================================================================
export * from './contracts';
export * from './youtube';
export * from './urlInput';
export * from './modelPreference';
export * from './depthPreference';
export * from './uiTokens';
export * from './history';
export * from './mapData';
export * from './apiBase';
export * from './storage';
export * from './atomGeometry';
export * from './transformStream';

================================================================================
FILE: shared/mapData.ts
================================================================================
import type {
  ActionMapData,
  CalloutLabel,
  CoverageNote,
  KnowledgeSection,
  MapStep,
  SourceReference,
  StepListItem,
} from './contracts';

const DEFAULT_CALLOUT_LABELS: Record<string, CalloutLabel> = {
  action: 'Para aplicarlo',
  info: 'Idea clave',
  alert: 'Precaución',
};

function normalizeReferences(input: unknown): SourceReference[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((ref) => {
      const value = ref as SourceReference;
      if (!value?.label || !value?.locator) return null;
      return {
        label: String(value.label),
        locator: String(value.locator),
        locatorKind: value.locatorKind,
        excerpt: value.excerpt ? String(value.excerpt) : undefined,
        note: value.note ? String(value.note) : undefined,
      } satisfies SourceReference;
    })
    .filter(Boolean) as SourceReference[];
}

export function normalizeMapData(input: unknown): ActionMapData | null {
  const raw = input as ActionMapData;
  if (!raw?.title || !Array.isArray(raw?.steps) || !Array.isArray(raw?.tldr)) return null;

  const normalizedSteps: MapStep[] = raw.steps.map((step, index) => ({
    id: String(step?.id || `step-${index + 1}`),
    shortNav: String(step?.shortNav || step?.title || `Paso ${index + 1}`),
    title: String(step?.title || `Paso ${index + 1}`),
    time: String(step?.time || '~3 min'),
    purpose: step?.purpose ? String(step.purpose) : undefined,
    content: Array.isArray(step?.content)
      ? step.content
          .map((block) => {
            const kindRaw = block?.kind ? String(block.kind) : undefined;
            const kind: 'action' | 'info' | 'alert' | undefined =
              kindRaw === 'action' || kindRaw === 'info' || kindRaw === 'alert' ? kindRaw : undefined;
            const items: StepListItem[] | undefined = Array.isArray(block?.items)
              ? (block.items
                  .map((item) =>
                    item?.strong
                      ? {
                          strong: String(item.strong),
                          span: item?.span ? String(item.span) : undefined,
                        }
                      : null
                  )
                  .filter(Boolean) as StepListItem[])
              : undefined;

            return {
              type: String(block?.type || 'prose') as 'prose' | 'callout' | 'list',
              text: String(block?.text || '').trim(),
              kind,
              label: block?.label
                ? (String(block.label) as CalloutLabel)
                : DEFAULT_CALLOUT_LABELS[String(block?.kind || 'info')] || 'Idea clave',
              items,
              references: normalizeReferences(block?.references),
            };
          })
          .filter((block) => block.text || block.items?.length)
      : [],
    references: normalizeReferences(step?.references),
  }));

  const normalized: ActionMapData = {
    title: String(raw.title),
    category: raw.category ? String(raw.category) : undefined,
    intent: raw.intent === 'study' || raw.intent === 'apply' ? raw.intent : 'understand',
    outputLanguage: raw.outputLanguage ? String(raw.outputLanguage) : 'es',
    mapVersion: Number.isFinite(raw.mapVersion) ? Number(raw.mapVersion) : 2,
    sourceMetadata: {
      kind: raw.sourceMetadata?.kind || 'text',
      label: raw.sourceMetadata?.label || 'Fuente analizada',
      title: raw.sourceMetadata?.title ? String(raw.sourceMetadata.title) : undefined,
      author: raw.sourceMetadata?.author ? String(raw.sourceMetadata.author) : undefined,
      language: raw.sourceMetadata?.language ? String(raw.sourceMetadata.language) : undefined,
      detected: Array.isArray(raw.sourceMetadata?.detected)
        ? raw.sourceMetadata.detected.map((item) => String(item))
        : [],
      limitations: Array.isArray(raw.sourceMetadata?.limitations)
        ? raw.sourceMetadata.limitations.map((item) => String(item))
        : [],
    },
    coverage: {
      summary: raw.coverage?.summary
        ? String(raw.coverage.summary)
        : 'Lectura generada a partir del material disponible.',
      notes: Array.isArray(raw.coverage?.notes)
        ? (raw.coverage.notes
            .map((note) =>
              note?.label && note?.detail
                ? {
                    label: String(note.label),
                    detail: String(note.detail),
                    tone: note?.tone === 'warning' ? ('warning' as const) : ('neutral' as const),
                  }
                : null
            )
            .filter(Boolean) as CoverageNote[])
        : [],
    },
    coreIdea: String(raw.coreIdea || ''),
    coreSupport: String(raw.coreSupport || ''),
    tldr: raw.tldr
      .map((item) =>
        item?.title && item?.desc
          ? { title: String(item.title), desc: String(item.desc) }
          : null
      )
      .filter(Boolean) as ActionMapData['tldr'],
    knowledgeSections: Array.isArray(raw.knowledgeSections)
      ? (raw.knowledgeSections
          .map((section) =>
            section?.title && section?.summary
              ? {
                  title: String(section.title),
                  summary: String(section.summary),
                  references: normalizeReferences(section.references),
                }
              : null
          )
          .filter(Boolean) as KnowledgeSection[])
      : [],
    steps: normalizedSteps,
    references: normalizeReferences(raw.references),
    completionCard: {
      title: raw.completionCard?.title ? String(raw.completionCard.title) : 'Mapa completado',
      summary: raw.completionCard?.summary
        ? String(raw.completionCard.summary)
        : 'Vuelve aquí para repasar lo esencial sin tener que releerlo todo.',
      takeaways: Array.isArray(raw.completionCard?.takeaways)
        ? raw.completionCard.takeaways.map((item) => String(item)).filter(Boolean)
        : [],
      promptQuestion: raw.completionCard?.promptQuestion
        ? String(raw.completionCard.promptQuestion)
        : undefined,
    },
    modelUsed: raw.modelUsed ? String(raw.modelUsed) : undefined,
  };

  if (!normalized.sourceMetadata!.detected.length) {
    normalized.sourceMetadata!.detected = [normalized.sourceMetadata!.label];
  }
  if (!normalized.completionCard!.takeaways.length) {
    normalized.completionCard!.takeaways = normalized.tldr
      .slice(0, 5)
      .map((item) => `${item.title}: ${item.desc}`);
  }

  return normalized;
}

export function isValidMap(data: unknown): data is ActionMapData {
  return normalizeMapData(data) !== null;
}

================================================================================
FILE: shared/modelPreference.ts
================================================================================
import { getStorage } from './storage';

export const MODEL_OPTIONS = [
  { id: 'auto', label: 'Automático', hint: 'Mejor disponible' },
  { id: 'gemini-3.5-flash', label: 'Flash 3.5', hint: 'Máxima calidad' },
  { id: 'gemini-3-flash-preview', label: 'Flash Preview', hint: 'Equilibrado' },
  { id: 'gemini-3.1-flash-lite', label: 'Flash Lite', hint: 'Pruebas' },
] as const;

export type ModelPreference = (typeof MODEL_OPTIONS)[number]['id'];

const STORAGE_KEY = 'tdah-model-preference';

export function getInitialModelPreference(): ModelPreference {
  try {
    const stored = getStorage().getItem(STORAGE_KEY);
    if (stored && MODEL_OPTIONS.some((option) => option.id === stored)) {
      return stored as ModelPreference;
    }
  } catch {
    // Storage not ready yet (SSR or pre-bootstrap)
  }
  return 'auto';
}

export function saveModelPreference(value: ModelPreference): void {
  getStorage().setItem(STORAGE_KEY, value);
}

================================================================================
FILE: shared/storage.ts
================================================================================
export interface SyncKeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

let storageOverride: SyncKeyValueStorage | null = null;

export function configureStorage(storage: SyncKeyValueStorage): void {
  storageOverride = storage;
}

export function getStorage(): SyncKeyValueStorage {
  if (storageOverride) return storageOverride;
  if (
    typeof globalThis !== 'undefined' &&
    'localStorage' in globalThis &&
    globalThis.localStorage
  ) {
    return globalThis.localStorage as SyncKeyValueStorage;
  }
  throw new Error('Storage not configured. Call configureStorage() or set globalThis.localStorage.');
}

================================================================================
FILE: shared/transformStream.ts
================================================================================
import type { ActionMapData, TransformStreamEvent } from './contracts';
import { normalizeMapData } from './mapData';

export const TRANSFORM_IDLE_TIMEOUT_MS = 60_000;
export const TRANSFORM_IDLE_TIMEOUT_MESSAGE =
  'La generación se ha detenido. Comprueba tu conexión e inténtalo de nuevo.';

export function isRenderablePartialMap(map: ActionMapData | null): boolean {
  if (!map) return false;
  const hasTitle = Boolean(map.title?.trim() && map.title !== 'Mapa sin título');
  const hasCore = Boolean(map.coreIdea?.trim());
  const hasSteps = Boolean(map.steps?.length);
  return (hasTitle && hasCore) || hasSteps;
}

export type TransformStreamHandlers = {
  onPartial?: (map: ActionMapData) => void;
  onDone: (map: ActionMapData, model?: string) => void;
  onError: (message: string) => void;
};

export type ConsumeTransformStreamResult = 'done' | 'error' | 'idle' | 'incomplete' | 'aborted';

function parseStreamLine(line: string): TransformStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as TransformStreamEvent;
  } catch {
    return null;
  }
}

export async function consumeTransformStream(
  response: Response,
  handlers: TransformStreamHandlers,
  options: {
    signal?: AbortSignal;
    idleTimeoutMs?: number;
  } = {}
): Promise<ConsumeTransformStreamResult> {
  const body = response.body;
  if (!body) return 'incomplete';

  const idleTimeoutMs = options.idleTimeoutMs ?? TRANSFORM_IDLE_TIMEOUT_MS;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let idleAborted = false;

  const clearIdle = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const resetIdle = () => {
    clearIdle();
    idleTimer = setTimeout(() => {
      idleAborted = true;
      reader.cancel().catch(() => undefined);
    }, idleTimeoutMs);
  };

  const onExternalAbort = () => {
    idleAborted = true;
    reader.cancel().catch(() => undefined);
  };

  options.signal?.addEventListener('abort', onExternalAbort, { once: true });

  resetIdle();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (idleAborted) {
        return options.signal?.aborted ? 'aborted' : 'idle';
      }

      resetIdle();
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const event = parseStreamLine(line);
        if (!event) continue;

        if (event.type === 'partial' && event.map) {
          const normalized = normalizeMapData(event.map);
          if (normalized && isRenderablePartialMap(normalized)) {
            handlers.onPartial?.(normalized);
          }
          continue;
        }

        if (event.type === 'done' && event.map) {
          const normalized = normalizeMapData(event.map);
          if (!normalized) {
            handlers.onError('No se pudo interpretar el mapa generado.');
            return 'error';
          }
          handlers.onDone(normalized, event.model);
          return 'done';
        }

        if (event.type === 'error') {
          handlers.onError(event.error || 'Error desconocido durante la generación.');
          return 'error';
        }
      }
    }

    return 'incomplete';
  } catch (err: unknown) {
    const name = err instanceof Error ? err.name : '';
    if (options.signal?.aborted) {
      return 'aborted';
    }
    if (idleAborted || name === 'AbortError') {
      return 'idle';
    }
    throw err;
  } finally {
    clearIdle();
    options.signal?.removeEventListener('abort', onExternalAbort);
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

export type FetchTransformOptions = {
  streamUrl: string;
  fallbackUrl: string;
  body: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  idleTimeoutMs?: number;
  handlers: TransformStreamHandlers;
};

export async function fetchTransformWithProgress({
  streamUrl,
  fallbackUrl,
  body,
  headers = {},
  signal,
  idleTimeoutMs,
  handlers,
}: FetchTransformOptions): Promise<'stream' | 'fallback'> {
  let receivedRenderablePartial = false;

  const wrappedHandlers: TransformStreamHandlers = {
    onPartial: (map) => {
      receivedRenderablePartial = true;
      handlers.onPartial?.(map);
    },
    onDone: handlers.onDone,
    onError: handlers.onError,
  };

  try {
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson',
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errPayload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errPayload.error || `Error del servidor (${response.status})`);
    }

    if (!response.body) {
      throw new Error('Streaming no disponible');
    }

    const result = await consumeTransformStream(response, wrappedHandlers, {
      signal,
      idleTimeoutMs,
    });

    if (result === 'done') return 'stream';

    if (result === 'aborted') {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (!receivedRenderablePartial) {
      throw new Error('Streaming incompleto');
    }

    handlers.onError(
      result === 'idle'
        ? TRANSFORM_IDLE_TIMEOUT_MESSAGE
        : 'La generación se interrumpió antes de completarse.'
    );
    return 'stream';
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    if (receivedRenderablePartial) throw err;

    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    });

    const parsed = (await fallbackResponse.json()) as ActionMapData & { error?: string };
    if (!fallbackResponse.ok || parsed.error) {
      throw new Error(parsed.error || `Error del servidor (${fallbackResponse.status})`);
    }

    const normalized = normalizeMapData(parsed);
    if (!normalized) {
      throw new Error('No se pudo interpretar el mapa generado.');
    }

    wrappedHandlers.onDone(normalized, parsed.modelUsed);
    return 'fallback';
  }
}

================================================================================
FILE: shared/tsconfig.json
================================================================================
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["./**/*.ts"]
}

================================================================================
FILE: shared/uiTokens.ts
================================================================================
export const RADII = { sm: 12, md: 16, lg: 20, xl: 28, pill: 9999 } as const;
export const HAIRLINE = 1;
export const INSET_HIGHLIGHT_LIGHT = 'inset 0 1px 1px rgba(255,255,255,0.6)';
export const INSET_HIGHLIGHT_DARK = 'inset 0 1px 1px rgba(255,255,255,0.08)';
export const BLUR_INTENSITY = 24;
export const DRAWER_CORNER_RADIUS = RADII.xl;
export const COMPOSER_CORNER_RADIUS = 22;
export const COMPOSER_DARK_SURFACE = '#3F4142';
export const COMPOSER_DARK_INSET =
  '0 2px 24px rgba(0,0,0,0.25), inset 0 1px 0.5px #626463, inset 0 -1px 0.5px #626463';

================================================================================
FILE: shared/urlInput.ts
================================================================================
import { isYouTubeUrl } from './youtube';

export type UrlInputDetection =
  | { kind: 'youtube'; url: string }
  | { kind: 'link'; url: string }
  | { kind: 'text' }
  | { kind: 'invalid'; message: string };

export type TransformSourceKind = 'link' | 'youtube' | 'text';

const URL_WITH_EXTRA_TEXT_MESSAGE =
  'Pega solo el enlace, sin texto adicional, o pega directamente el texto completo.';

const INVALID_URL_MESSAGE =
  'URL inválida. Ingresa un enlace completo (https://...).';

const BARE_DOMAIN_PATTERN =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])+)+\/?[^\s]*$/i;

export function normalizeUrlCandidate(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const nonEmptyLines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return nonEmptyLines.length === 1 ? nonEmptyLines[0] : trimmed;
}

function looksLikeUrlAttempt(candidate: string): boolean {
  const value = candidate.trim();
  if (!value) return false;
  if (/^https?:\/\//i.test(value)) return true;
  if (/^www\./i.test(value)) return true;
  return BARE_DOMAIN_PATTERN.test(value);
}

function normalizeToAbsoluteUrl(candidate: string): string | null {
  let value = candidate.trim();
  if (!value) return null;

  if (/^www\./i.test(value)) {
    value = `https://${value}`;
  } else if (!/^https?:\/\//i.test(value) && BARE_DOMAIN_PATTERN.test(value)) {
    value = `https://${value}`;
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function detectUrlInput(text: string): UrlInputDetection {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'text' };

  const nonEmptyLines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (nonEmptyLines.length > 1) {
    if (looksLikeUrlAttempt(nonEmptyLines[0])) {
      return { kind: 'invalid', message: URL_WITH_EXTRA_TEXT_MESSAGE };
    }
    return { kind: 'text' };
  }

  const candidate = nonEmptyLines[0] ?? trimmed;

  if (isYouTubeUrl(candidate)) {
    return { kind: 'youtube', url: candidate };
  }

  if (!looksLikeUrlAttempt(candidate)) {
    return { kind: 'text' };
  }

  const normalized = normalizeToAbsoluteUrl(candidate);
  if (!normalized) {
    return { kind: 'invalid', message: INVALID_URL_MESSAGE };
  }

  if (isYouTubeUrl(normalized)) {
    return { kind: 'youtube', url: normalized };
  }

  return { kind: 'link', url: normalized };
}

export function friendlyTransformError(
  message: string,
  sourceKind?: TransformSourceKind
): string {
  if (!message) return message;

  if (message.includes('did not match the expected pattern')) {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión a internet e inténtalo de nuevo.';
  }

  const isUrlSource = sourceKind === 'link' || sourceKind === 'youtube';

  if (
    isUrlSource &&
    /suficiente texto legible|no contiene suficiente texto/i.test(message)
  ) {
    return `${message} La página puede cargar el contenido con JavaScript o estar detrás de un paywall. Copia el texto y pégalo aquí.`;
  }

  if (
    isUrlSource &&
    /No se pudo acceder al enlace \((401|403)\)/.test(message)
  ) {
    return `${message} Puede requerir suscripción o inicio de sesión. Copia el texto manualmente.`;
  }

  if (
    isUrlSource &&
    /fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo|network request failed/i.test(message)
  ) {
    return 'No se pudo descargar el enlace. Comprueba la URL y tu conexión.';
  }

  return message;
}

================================================================================
FILE: shared/youtube.ts
================================================================================
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
      }

      const pathMatch = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
      if (pathMatch) return pathMatch[1];
    }
  } catch {
    if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;
  }

  return null;
}

export function isYouTubeUrl(text: string): boolean {
  return extractYouTubeVideoId(text) !== null;
}

================================================================================
FILE: mobile/App.tsx
================================================================================
import './global.css';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppSessionProvider } from './src/context/AppSessionContext';
import { AppVariantProvider } from './src/context/AppVariantContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { bootstrapStorage } from './src/shims/localStorage';
import { getAppVariant, switchAppVariant, type AppVariant } from './src/logic/appVariant';
import ComprensionApp from './src/screens/ComprensionApp';
import ClassicShell from './src/screens/classic/ClassicShell';

function AppShell() {
  const { isDark } = useTheme();
  const [appVariant, setAppVariant] = useState<AppVariant>(() => getAppVariant());

  const handleVariantChange = useCallback((next: AppVariant) => {
    switchAppVariant(next, () => setAppVariant(next));
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppVariantProvider onVariantChange={handleVariantChange}>
        <AppSessionProvider key={appVariant}>
          {appVariant === 'classic' ? <ClassicShell /> : <ComprensionApp />}
        </AppSessionProvider>
      </AppVariantProvider>
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    bootstrapStorage()
      .then(() => setReady(true))
      .catch((error) => {
        console.error(error);
        setBootError('No se pudo inicializar el almacenamiento local.');
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {bootError ? (
          <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-900">
            <Text className="text-center text-neutral-700 dark:text-neutral-200">{bootError}</Text>
          </View>
        ) : (
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

================================================================================
FILE: mobile/index.ts
================================================================================
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);

================================================================================
FILE: mobile/src/components/AppIcon.tsx
================================================================================
import React from 'react';
import Svg, { Ellipse, Circle } from 'react-native-svg';

type AppIconProps = {
  className?: string;
  size?: number;
  color?: string;
};

export default function AppIcon({ size = 24, color = 'currentColor' }: AppIconProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      aria-hidden={true}
    >
      <Ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <Ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        transform="rotate(60 12 12)"
      />
      <Ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        stroke={color}
        strokeWidth="1.35"
        strokeLinecap="round"
        transform="rotate(120 12 12)"
      />
      <Circle cx="12" cy="12" r="2.75" fill={color} />
    </Svg>
  );
}

================================================================================
FILE: mobile/src/components/AtomCanvasIcon.tsx
================================================================================
import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { ATOM_SHADING, buildAtomRibbons } from '../logic/atomGeometry';

type AtomCanvasIconProps = {
  className?: string;
  size?: number;
};

export default function AtomCanvasIcon({ size = 112 }: AtomCanvasIconProps) {
  const { isDark } = useTheme();
  const geometry = React.useMemo(() => buildAtomRibbons(size), [size]);
  const { cx, cy, coreR, haloR, sphereR, ribbons, rim, sphereLight } = geometry;

  const base = isDark ? '129, 140, 248' : '79, 70, 229';
  const coreLight = isDark ? '#C7D2FE' : '#EEF0FF';
  const coreMid = isDark ? '#6366f1' : '#4f46e5';
  const coreDeep = isDark ? '#312e81' : '#3730a3';
  const orbitNearOpacity = isDark ? 0.92 : 0.88;
  const orbitFarOpacity = isDark ? 0.18 : 0.16;

  const shadowDx = size * ATOM_SHADING.projectedShadowDx;
  const shadowDy = size * ATOM_SHADING.projectedShadowDy;
  const projectedOpacity = isDark
    ? ATOM_SHADING.projectedShadowOpacity.dark
    : ATOM_SHADING.projectedShadowOpacity.light;
  const exteriorDropOpacity = isDark
    ? ATOM_SHADING.exteriorDropOpacity.dark
    : ATOM_SHADING.exteriorDropOpacity.light;
  const sphereBodyOpacity = isDark
    ? ATOM_SHADING.sphereBodyShadowOpacity.dark
    : ATOM_SHADING.sphereBodyShadowOpacity.light;
  const sphereDiffuseOpacity = isDark
    ? ATOM_SHADING.sphereDiffuseOpacity.dark
    : ATOM_SHADING.sphereDiffuseOpacity.light;
  const sphereHighlightOpacity = isDark
    ? ATOM_SHADING.sphereHighlightOpacity.dark
    : ATOM_SHADING.sphereHighlightOpacity.light;
  const sphereRimOpacity = isDark ? ATOM_SHADING.sphereRimOpacity.dark : ATOM_SHADING.sphereRimOpacity.light;
  const rimFill = `rgba(255,255,255,${sphereRimOpacity})`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="atomHalo" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={`rgb(${base})`} stopOpacity={isDark ? 0.22 : 0.16} />
          <Stop offset="65%" stopColor={`rgb(${base})`} stopOpacity={0.04} />
          <Stop offset="100%" stopColor={`rgb(${base})`} stopOpacity={0} />
        </RadialGradient>

        <RadialGradient id="atomExteriorShadow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop
            offset="0%"
            stopColor={isDark ? 'rgb(0,0,0)' : 'rgb(30,27,75)'}
            stopOpacity={isDark ? 0.5 : 0.4}
          />
          <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity={0} />
        </RadialGradient>

        <LinearGradient id="atomSphereBody" x1="25%" y1="22%" x2="78%" y2="82%">
          <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity={sphereBodyOpacity * 0.9} />
          <Stop offset="55%" stopColor="rgb(255,255,255)" stopOpacity={0} />
          <Stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity={sphereBodyOpacity * 0.5} />
        </LinearGradient>

        <RadialGradient
          id="atomSphereDiffuse"
          gradientUnits="userSpaceOnUse"
          cx={sphereLight.diffuseCx}
          cy={sphereLight.diffuseCy}
          r={sphereLight.diffuseR}
          fx={sphereLight.diffuseCx}
          fy={sphereLight.diffuseCy}
        >
          <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity={sphereDiffuseOpacity} />
          <Stop offset="50%" stopColor="rgb(255,255,255)" stopOpacity={sphereDiffuseOpacity * 0.35} />
          <Stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity={0} />
        </RadialGradient>

        <RadialGradient
          id="atomSphereHighlight"
          gradientUnits="userSpaceOnUse"
          cx={sphereLight.specCx}
          cy={sphereLight.specCy}
          r={sphereLight.specR}
          fx={sphereLight.specCx}
          fy={sphereLight.specCy}
        >
          <Stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity={sphereHighlightOpacity} />
          <Stop offset="45%" stopColor="rgb(255,255,255)" stopOpacity={sphereHighlightOpacity * 0.2} />
          <Stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity={0} />
        </RadialGradient>

        <RadialGradient id="atomContactShadow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={isDark ? 'rgba(0,0,0,0.35)' : 'rgba(30,27,75,0.22)'} />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </RadialGradient>

        <RadialGradient id="atomCore" cx="36%" cy="30%" rx="72%" ry="72%">
          <Stop offset="0%" stopColor={coreLight} />
          <Stop offset="45%" stopColor={coreMid} />
          <Stop offset="100%" stopColor={coreDeep} />
        </RadialGradient>

        <RadialGradient id="atomCoreOcclusion" cx="68%" cy="72%" rx="55%" ry="55%">
          <Stop offset="0%" stopColor={isDark ? 'rgba(15,15,35,0.55)' : 'rgba(30,27,75,0.45)'} />
          <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </RadialGradient>

        {ribbons.map((ribbon, i) => (
          <LinearGradient
            key={`orbitGrad-${i}`}
            id={`orbitGrad-${i}`}
            gradientUnits="userSpaceOnUse"
            x1={ribbon.grad.x1}
            y1={ribbon.grad.y1}
            x2={ribbon.grad.x2}
            y2={ribbon.grad.y2}
          >
            <Stop offset="0%" stopColor={`rgb(${base})`} stopOpacity={orbitFarOpacity} />
            <Stop offset="100%" stopColor={`rgb(${base})`} stopOpacity={orbitNearOpacity} />
          </LinearGradient>
        ))}
      </Defs>

      {ATOM_SHADING.enableSphereVolume && (
        <Ellipse
          cx={cx + sphereR * 0.12}
          cy={cy + sphereR * 0.62}
          rx={sphereR * 0.7}
          ry={sphereR * 0.2}
          fill="url(#atomExteriorShadow)"
          opacity={exteriorDropOpacity}
        />
      )}

      <Circle cx={cx} cy={cy} r={haloR} fill="url(#atomHalo)" />

      {ATOM_SHADING.enableSphereVolume && (
        <>
          <Circle cx={cx} cy={cy} r={sphereR} fill="url(#atomSphereBody)" />
          <Circle cx={cx} cy={cy} r={sphereR} fill="url(#atomSphereDiffuse)" />
          {rim.strokes.map((stroke, i) => (
            <Path
              key={`rim-${i}`}
              d={stroke.d}
              stroke={rimFill}
              strokeWidth={stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </>
      )}

      {ribbons.map((ribbon, i) => (
        <Path key={`back-${i}`} d={ribbon.backPath} fill={`url(#orbitGrad-${i})`} />
      ))}

      {ATOM_SHADING.enableProjectedShadows &&
        ribbons.map((ribbon, i) => (
          <G key={`proj-${i}`} transform={`translate(${shadowDx}, ${shadowDy})`}>
            <Path d={ribbon.frontPath} fill={`rgba(0,0,0,${projectedOpacity})`} />
          </G>
        ))}

      <Ellipse
        cx={cx}
        cy={cy + coreR * 0.4}
        rx={coreR * 1.2}
        ry={coreR * 0.38}
        fill="url(#atomContactShadow)"
      />

      <Circle cx={cx} cy={cy} r={coreR} fill="url(#atomCore)" />
      <Circle cx={cx} cy={cy} r={coreR} fill="url(#atomCoreOcclusion)" />
      <Circle
        cx={cx - coreR * 0.3}
        cy={cy - coreR * 0.34}
        r={coreR * 0.36}
        fill={isDark ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.68)'}
      />

      {ribbons.map((ribbon, i) => (
        <Path key={`front-${i}`} d={ribbon.frontPath} fill={`url(#orbitGrad-${i})`} />
      ))}

      {ATOM_SHADING.enableSphereVolume && (
        <Circle cx={cx} cy={cy} r={sphereR} fill="url(#atomSphereHighlight)" />
      )}
    </Svg>
  );
}

================================================================================
FILE: mobile/src/components/AttachMenu.tsx
================================================================================
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Camera, FileText, Film, Image as ImageIcon, Plus } from 'lucide-react-native';
import GlassSurface from './GlassSurface';

type AttachMenuProps = {
  open: boolean;
  onToggle: () => void;
  onPickImage: () => void;
  onPickCamera: () => void;
  onPickPdf: () => void;
  onPickVideo: () => void;
  disabled?: boolean;
  darkSurface?: boolean;
};

export default function AttachMenu({
  open,
  onToggle,
  onPickImage,
  onPickCamera,
  onPickPdf,
  onPickVideo,
  disabled = false,
  darkSurface = false,
}: AttachMenuProps) {
  const iconColor = darkSurface ? '#d4d4d4' : '#737373';
  const textClass = darkSurface
    ? 'text-sm font-medium text-neutral-200'
    : 'text-sm font-medium text-neutral-700 dark:text-neutral-200';

  return (
    <View className="relative">
      <Pressable
        onPress={onToggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Adjuntar"
        accessibilityState={{ expanded: open, disabled }}
        className={`w-10 h-10 rounded-full items-center justify-center ${
          open
            ? darkSurface
              ? 'bg-white/10'
              : 'bg-neutral-100 dark:bg-white/10'
            : 'bg-transparent active:bg-neutral-100 dark:active:bg-white/5'
        } ${disabled ? 'opacity-40' : ''}`}
      >
        <Plus
          size={20}
          color={open ? (darkSurface ? '#fafafa' : '#404040') : iconColor}
          style={{ transform: [{ rotate: open ? '45deg' : '0deg' }] }}
        />
      </Pressable>

      {open ? (
        <View className="absolute bottom-full left-0 mb-2 w-64 z-50" accessibilityRole="menu">
          <GlassSurface className="rounded-[20px] shadow-xl">
          <View className="p-2">
            <Pressable
              onPress={onPickImage}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100/60 dark:active:bg-white/5"
            >
              <ImageIcon size={16} color={iconColor} />
              <Text className={textClass}>Galería</Text>
            </Pressable>

            <Pressable
              onPress={onPickCamera}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100/60 dark:active:bg-white/5"
            >
              <Camera size={16} color={iconColor} />
              <Text className={textClass}>Cámara</Text>
            </Pressable>

            <Pressable
              onPress={onPickPdf}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100/60 dark:active:bg-white/5"
            >
              <FileText size={16} color={iconColor} />
              <Text className={textClass}>PDF</Text>
            </Pressable>

            <Pressable
              onPress={onPickVideo}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-3 px-3 py-2.5 rounded-xl active:bg-neutral-100/60 dark:active:bg-white/5"
            >
              <Film size={16} color={iconColor} />
              <Text className={textClass}>Video</Text>
            </Pressable>
          </View>
          </GlassSurface>
        </View>
      ) : null}
    </View>
  );
}

================================================================================
FILE: mobile/src/components/AuthSheet.tsx
================================================================================
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, X } from 'lucide-react-native';
import {
  signInWithPassword,
  signInWithProvider,
  signOut,
  signUpWithPassword,
} from '../logic/cloudHistory';

type AuthSheetProps = {
  visible: boolean;
  userEmail: string | null;
  onClose: () => void;
};

function authErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'No se pudo completar el acceso.';
  const msg = err.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (msg.includes('user already registered')) return 'Esa cuenta ya existe. Prueba a entrar.';
  if (msg.includes('password') && msg.includes('least'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  return err.message;
}

export default function AuthSheet({ visible, userEmail, onClose }: AuthSheetProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignedIn = Boolean(userEmail);

  const resetForm = () => {
    setPassword('');
    setError(null);
    setBusy(false);
  };

  const handlePasswordSubmit = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      if (isSignUp) {
        await signUpWithPassword(email, password);
      } else {
        await signInWithPassword(email, password);
      }
      resetForm();
      onClose();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleProvider = async (provider: 'google' | 'apple') => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const ok = await signInWithProvider(provider);
      if (ok) onClose();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut();
      onClose();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-white/10">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {isSignedIn ? 'Tu cuenta' : 'Sincroniza tu historial'}
          </Text>
          <Pressable
            onPress={onClose}
            className="w-9 h-9 rounded-full items-center justify-center bg-neutral-200/80 dark:bg-white/10"
            accessibilityLabel="Cerrar"
          >
            <X size={18} color="#737373" />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 py-6"
            keyboardShouldPersistTaps="handled"
          >
            {isSignedIn ? (
              <View>
                <View className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/60 px-4 py-4">
                  <Text className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Cuenta conectada
                  </Text>
                  <Text
                    className="mt-1.5 text-base font-semibold text-neutral-900 dark:text-neutral-100"
                    numberOfLines={1}
                  >
                    {userEmail}
                  </Text>
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 leading-5">
                    Tu historial se sincroniza automáticamente entre tus dispositivos.
                  </Text>
                </View>

                <Pressable
                  onPress={() => void handleSignOut()}
                  disabled={busy}
                  className="mt-6 flex-row items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-white/10 active:bg-neutral-100 dark:active:bg-white/5"
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#737373" />
                  ) : (
                    <>
                      <LogOut size={18} color="#525252" />
                      <Text className="font-semibold text-neutral-700 dark:text-neutral-200">
                        Cerrar sesión
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              <View>
                <Text className="text-sm text-neutral-600 dark:text-neutral-300 leading-6 mb-5">
                  Entra para guardar tus mapas en la nube y recuperarlos desde cualquier dispositivo.
                </Text>

                <Pressable
                  onPress={() => void handleProvider('google')}
                  disabled={busy}
                  className="flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/80 active:bg-neutral-100 dark:active:bg-white/5"
                >
                  <Text className="font-semibold text-neutral-800 dark:text-neutral-100">
                    Continuar con Google
                  </Text>
                </Pressable>

                {Platform.OS === 'ios' ? (
                  <Pressable
                    onPress={() => void handleProvider('apple')}
                    disabled={busy}
                    className="mt-3 flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/80 active:bg-neutral-100 dark:active:bg-white/5"
                  >
                    <Text className="font-semibold text-neutral-800 dark:text-neutral-100">
                      Continuar con Apple
                    </Text>
                  </Pressable>
                ) : null}

                <View className="flex-row items-center gap-3 my-6">
                  <View className="flex-1 h-px bg-neutral-200 dark:bg-white/10" />
                  <Text className="text-xs font-medium text-neutral-400">o con email</Text>
                  <View className="flex-1 h-px bg-neutral-200 dark:bg-white/10" />
                </View>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor="#a3a3a3"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  className="px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/80 text-base text-neutral-900 dark:text-neutral-100"
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña (mín. 6)"
                  placeholderTextColor="#a3a3a3"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  textContentType={isSignUp ? 'newPassword' : 'password'}
                  onSubmitEditing={() => void handlePasswordSubmit()}
                  className="mt-3 px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/80 text-base text-neutral-900 dark:text-neutral-100"
                />

                <Pressable
                  onPress={() => void handlePasswordSubmit()}
                  disabled={busy || !email.trim() || password.length < 6}
                  className={`mt-4 py-3.5 rounded-xl items-center justify-center ${
                    busy || !email.trim() || password.length < 6
                      ? 'bg-indigo-600/40'
                      : 'bg-indigo-600 active:bg-indigo-700'
                  }`}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {isSignUp ? 'Crear cuenta' : 'Entrar'}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => {
                    setIsSignUp((value) => !value);
                    setError(null);
                  }}
                  className="mt-4 items-center"
                >
                  <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {isSignUp ? '¿Ya tienes cuenta? Entrar' : '¿Primera vez? Crear cuenta'}
                  </Text>
                </Pressable>
              </View>
            )}

            {error ? (
              <View className="mt-5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3">
                <Text className="text-sm font-medium text-red-600 dark:text-red-300">{error}</Text>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

================================================================================
FILE: mobile/src/components/BalancedText.tsx
================================================================================
import React, { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';

type BalancedTextProps = TextProps & {
  children: ReactNode;
};

export default function BalancedText({ children, ...props }: BalancedTextProps) {
  return <Text {...props}>{children}</Text>;
}

================================================================================
FILE: mobile/src/components/ComposerSurface.tsx
================================================================================
import React from 'react';
import { StyleSheet, View } from 'react-native';
import GlassSurface from './GlassSurface';
import { useTheme } from '../context/ThemeContext';

const COMPOSER_SHADOW_LIGHT = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 8,
} as const;

const COMPOSER_SHADOW_DARK = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 24,
  elevation: 10,
} as const;

type ComposerSurfaceProps = {
  children: React.ReactNode;
};

export default function ComposerSurface({ children }: ComposerSurfaceProps) {
  const { isDark } = useTheme();

  return (
    <View
      className="rounded-[22px] overflow-hidden"
      style={isDark ? COMPOSER_SHADOW_DARK : COMPOSER_SHADOW_LIGHT}
    >
      <GlassSurface variant="composer" className="rounded-[22px]">
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, isDark ? styles.darkInsetFrame : styles.lightInsetFrame]}
        />
        {children}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  darkInsetFrame: {
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: '#626463',
    borderBottomColor: '#626463',
    zIndex: 20,
  },
  lightInsetFrame: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.95)',
    zIndex: 20,
  },
});

================================================================================
FILE: mobile/src/components/GlassSurface.tsx
================================================================================
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { BLUR_INTENSITY } from '@shared/uiTokens';
import { useTheme } from '../context/ThemeContext';

type GlassSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  overlayClassName?: string;
  variant?: 'default' | 'composer';
};

export default function GlassSurface({
  children,
  className = '',
  style,
  intensity,
  overlayClassName,
  variant = 'default',
}: GlassSurfaceProps) {
  const { isDark } = useTheme();
  const resolvedIntensity =
    intensity ?? (variant === 'composer' ? (isDark ? 40 : 32) : BLUR_INTENSITY);
  const overlay =
    overlayClassName ??
    (variant === 'composer'
      ? isDark
        ? 'bg-[#3F4142]'
        : 'bg-white/40'
      : isDark
        ? 'bg-neutral-900/80'
        : 'bg-white/80');

  return (
    <View className={`overflow-hidden ${className}`} style={style}>
      <BlurView
        intensity={resolvedIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View className={`absolute inset-0 ${overlay}`} />
      <View className="relative z-10">{children}</View>
    </View>
  );
}

================================================================================
FILE: mobile/src/components/HistoryDrawer.tsx
================================================================================
import React, { useEffect } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import HistorySheet from './HistorySheet';
import type { ActionMapData } from '../logic/contracts';
import type { HistoryEntry } from '../logic/history';
import type { AppPhase } from '../context/AppSessionContext';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 360);

type HistoryDrawerProps = {
  open: boolean;
  entries: HistoryEntry[];
  activeId: string | null;
  phase: AppPhase;
  data: ActionMapData | null;
  currentStep: number;
  isComplete: boolean;
  viewAll: boolean;
  totalSteps: number;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onOpen: () => void;
  onGoToStep: (idx: number) => void;
  onToggleViewMode: () => void;
  onNewMap: () => void;
  enableEdgeSwipe?: boolean;
};

function triggerOpenHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function HistoryDrawer({
  open,
  entries,
  activeId,
  phase,
  data,
  currentStep,
  isComplete,
  viewAll,
  totalSteps,
  onClose,
  onSelect,
  onDelete,
  onRename,
  onTogglePin,
  onOpen,
  onGoToStep,
  onToggleViewMode,
  onNewMap,
  enableEdgeSwipe = true,
}: HistoryDrawerProps) {
  const translateX = useSharedValue(open ? 0 : -DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(open ? 0.35 : 0);

  useEffect(() => {
    translateX.value = withSpring(open ? 0 : -DRAWER_WIDTH, { damping: 24, stiffness: 260 });
    backdropOpacity.value = withTiming(open ? 0.35 : 0, { duration: 220 });
    if (open) triggerOpenHaptic();
  }, [backdropOpacity, open, translateX]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const next = Math.min(0, Math.max(-DRAWER_WIDTH, event.translationX + (open ? 0 : -DRAWER_WIDTH)));
      translateX.value = next;
      backdropOpacity.value = ((DRAWER_WIDTH + next) / DRAWER_WIDTH) * 0.35;
    })
    .onEnd((event) => {
      const shouldClose = event.translationX < -DRAWER_WIDTH * 0.25 || event.velocityX < -600;
      if (shouldClose) {
        translateX.value = withSpring(-DRAWER_WIDTH, { damping: 24, stiffness: 260 });
        backdropOpacity.value = withTiming(0, { duration: 180 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { damping: 24, stiffness: 260 });
        backdropOpacity.value = withTiming(0.35, { duration: 180 });
      }
    });

  const edgeOpenGesture = Gesture.Pan()
    .activeOffsetX(12)
    .onEnd((event) => {
      if (event.translationX > 40 && event.velocityX > 200) {
        runOnJS(onOpen)();
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <>
      {enableEdgeSwipe && !open ? (
        <GestureDetector gesture={edgeOpenGesture}>
          <View style={styles.edgeHitSlop} />
        </GestureDetector>
      ) : null}

      <Modal visible={open} transparent animationType="none" onRequestClose={onClose}>
        <View style={styles.container}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar navegacion" />
          </Animated.View>

          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.drawer, drawerStyle]}>
              <HistorySheet
                visible={open}
                embedded
                entries={entries}
                activeId={activeId}
                onClose={onClose}
                onSelect={onSelect}
                onDelete={onDelete}
                onRename={onRename}
                onTogglePin={onTogglePin}
                showIndex={phase === 'result' && Boolean(data)}
                data={data}
                currentStep={currentStep}
                isComplete={isComplete}
                viewAll={viewAll}
                totalSteps={totalSteps}
                onGoToStep={onGoToStep}
                onToggleViewMode={onToggleViewMode}
                onNewMap={onNewMap}
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  edgeHitSlop: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    zIndex: 20,
  },
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
  },
});

================================================================================
FILE: mobile/src/components/HistorySheet.tsx
================================================================================
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  ChevronDown,
  Layers,
  List,
  MoreHorizontal,
  Pin,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react-native';
import AppIcon from './AppIcon';
import ProfileMenu from './ProfileMenu';
import {
  formatRelativeDate,
  sortPinnedEntries,
  type HistoryEntry,
} from '../logic/history';
import type { ActionMapData } from '../logic/contracts';

type HistorySheetProps = {
  visible: boolean;
  entries: HistoryEntry[];
  activeId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  embedded?: boolean;
  showIndex?: boolean;
  data?: ActionMapData | null;
  currentStep?: number;
  isComplete?: boolean;
  viewAll?: boolean;
  totalSteps?: number;
  onGoToStep?: (idx: number) => void;
  onToggleViewMode?: () => void;
  onNewMap?: () => void;
};

type ActionMenuState = {
  entry: HistoryEntry;
} | null;

export default function HistorySheet({
  visible,
  entries,
  activeId,
  onClose,
  onSelect,
  onDelete,
  onRename,
  onTogglePin,
  embedded = false,
  showIndex = false,
  data,
  currentStep = 0,
  isComplete = false,
  viewAll = false,
  totalSteps = 0,
  onGoToStep,
  onToggleViewMode,
  onNewMap,
}: HistorySheetProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [actionMenu, setActionMenu] = useState<ActionMenuState>(null);
  const [indexExpanded, setIndexExpanded] = useState(true);

  const pinnedEntries = useMemo(
    () => sortPinnedEntries(entries.filter((entry) => entry.pinned)),
    [entries]
  );
  const regularEntries = useMemo(
    () => entries.filter((entry) => !entry.pinned),
    [entries]
  );
  const listData = useMemo(
    () => [
      ...(pinnedEntries.length ? [{ type: 'header' as const, id: 'pinned-header', title: 'Fijados' }] : []),
      ...pinnedEntries.map((entry) => ({ type: 'entry' as const, entry })),
      ...(regularEntries.length ? [{ type: 'header' as const, id: 'recent-header', title: 'Recientes' }] : []),
      ...regularEntries.map((entry) => ({ type: 'entry' as const, entry })),
    ],
    [pinnedEntries, regularEntries]
  );

  const startRename = useCallback((entry: HistoryEntry) => {
    setRenamingId(entry.id);
    setRenameValue(entry.title);
    setActionMenu(null);
  }, []);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    onRename(renamingId, renameValue);
    setRenamingId(null);
    setRenameValue('');
  }, [onRename, renameValue, renamingId]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => {
      if (item.type === 'header') {
        return (
          <Text className="px-1 pt-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {item.title}
          </Text>
        );
      }

      const entry = item.entry;
      const isActive = entry.id === activeId;
      const stepCount = (entry.session.data as { steps?: unknown[] })?.steps?.length ?? 0;
      const progress = entry.session.isComplete
        ? 'Completado'
        : entry.session.viewAll
          ? 'Lectura completa'
          : `Paso ${entry.session.currentStep}/${stepCount}`;

      return (
        <View
          className={`mb-2 rounded-2xl px-3 py-3 ${
            isActive
              ? 'bg-indigo-50 dark:bg-indigo-500/10'
              : 'bg-white dark:bg-white/[0.03]'
          }`}
        >
          {renamingId === entry.id ? (
            <View className="flex-row items-center gap-2">
              <TextInput
                value={renameValue}
                onChangeText={setRenameValue}
                autoFocus
                className="flex-1 text-base text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-2"
                onSubmitEditing={commitRename}
              />
              <Pressable onPress={commitRename} className="px-3 py-2">
                <Text className="font-semibold text-indigo-600">OK</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable onPress={() => onSelect(entry.id)}>
                <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100" numberOfLines={2}>
                  {entry.title}
                </Text>
                <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {formatRelativeDate(entry.updatedAt)} · {progress}
                </Text>
              </Pressable>
              <View className="flex-row items-center justify-end gap-1 mt-2">
                <Pressable
                  onPress={() => onTogglePin(entry.id)}
                  className="p-2 rounded-full"
                  accessibilityLabel={entry.pinned ? 'Desfijar' : 'Fijar'}
                >
                  <Pin size={16} color={entry.pinned ? '#4f46e5' : '#737373'} />
                </Pressable>
                <Pressable
                  onPress={() => setActionMenu({ entry })}
                  className="p-2 rounded-full"
                  accessibilityLabel="Más acciones"
                >
                  <MoreHorizontal size={16} color="#737373" />
                </Pressable>
              </View>
            </>
          )}
        </View>
      );
    },
    [activeId, commitRename, onSelect, onTogglePin, renameValue, renamingId]
  );

  const content = (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="flex-1 min-h-0">
        <View className="px-6 pt-6 pb-4">
          <Pressable
            onPress={() => {
              onNewMap?.();
              onClose();
            }}
            className="flex-row items-center gap-2"
            accessibilityLabel="Ir a inicio"
          >
            <AppIcon size={32} color="#1A1A1A" />
            <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Nucleo
            </Text>
          </Pressable>
        </View>

        <View className="flex-1 px-4">
          {showIndex && data ? (
            <View className="mb-2">
              <Pressable
                onPress={() => setIndexExpanded((value) => !value)}
                className="flex-row items-center gap-2 mb-3 px-1 py-1"
                accessibilityState={{ expanded: indexExpanded }}
              >
                <ChevronDown
                  size={16}
                  color="#a3a3a3"
                  style={{ transform: [{ rotate: indexExpanded ? '0deg' : '-90deg' }] }}
                />
                <Text className="text-xs font-bold tracking-widest uppercase text-neutral-400">
                  Índice
                </Text>
              </Pressable>

              {indexExpanded ? (
                <View className="mb-4">
                  <Pressable
                    onPress={() => {
                      onGoToStep?.(0);
                      onClose();
                    }}
                    className={`px-4 py-3 rounded-lg mb-1 ${
                      currentStep === 0 && !isComplete
                        ? 'bg-indigo-100/50 dark:bg-indigo-500/10'
                        : ''
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        currentStep === 0 && !isComplete
                          ? 'text-indigo-700 dark:text-indigo-400'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      Idea central
                    </Text>
                  </Pressable>

                  {data.steps?.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = currentStep === stepNum && !isComplete;
                    const isPast = currentStep > stepNum || isComplete;
                    return (
                      <Pressable
                        key={step.id || stepNum}
                        onPress={() => {
                          onGoToStep?.(stepNum);
                          onClose();
                        }}
                        className={`px-4 py-3 rounded-lg mb-1 flex-row items-center justify-between ${
                          isActive ? 'bg-indigo-100/50 dark:bg-indigo-500/10' : ''
                        }`}
                      >
                        <View className="flex-row items-center gap-3 flex-1 pr-2">
                          <View className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-white/10 items-center justify-center">
                            <Text className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                              {stepNum}
                            </Text>
                          </View>
                          <Text
                            className={`flex-1 font-semibold ${
                              isActive
                                ? 'text-indigo-700 dark:text-indigo-400'
                                : 'text-neutral-600 dark:text-neutral-300'
                            }`}
                            numberOfLines={1}
                          >
                            {step.shortNav || step.title}
                          </Text>
                        </View>
                        <CheckCircle2
                          size={16}
                          color={isPast ? '#4f46e5' : '#a3a3a3'}
                        />
                      </Pressable>
                    );
                  })}

                  {!isComplete && onToggleViewMode ? (
                    <Pressable
                      onPress={onToggleViewMode}
                      className={`mt-3 flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-xl ${
                        viewAll
                          ? 'bg-indigo-100 dark:bg-indigo-500/10'
                          : 'bg-white/60 dark:bg-neutral-800/60'
                      }`}
                    >
                      {viewAll ? <List size={16} color="#4f46e5" /> : <Layers size={16} color="#737373" />}
                      <Text
                        className={`text-sm font-semibold ${
                          viewAll ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {viewAll ? 'Paso a paso' : 'Lectura completa'}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              <View className="border-t border-neutral-200 dark:border-white/10 pt-4 mb-2">
                <Text className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2 px-1">
                  Historial
                </Text>
              </View>
            </View>
          ) : (
            <View className="mb-2">
              <Text className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2 px-1">
                Historial
              </Text>
            </View>
          )}

          {entries.length === 0 ? (
            <View className="py-8 px-2">
              <Text className="text-center text-neutral-600 dark:text-neutral-300 leading-6">
                Aún no hay mapas guardados. Genera una lectura y aparecerá aquí.
              </Text>
            </View>
          ) : (
            <FlashList
              data={listData}
              renderItem={renderItem}
              keyExtractor={(item) => ('entry' in item ? item.entry.id : item.id)}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </View>
      </View>

      <View className="shrink-0 px-6 pt-3 pb-4 border-t border-neutral-200 dark:border-white/10">
        <View className="flex-row items-center justify-between gap-3">
          <ProfileMenu placement="bottomLeft" />
          <Pressable
            onPress={() => {
              onNewMap?.();
              onClose();
            }}
            className="flex-row items-center gap-2 py-2.5 px-5 rounded-full bg-white/30 dark:bg-white/[0.03]"
            accessibilityLabel="Nuevo mapa"
          >
            <SquarePen size={16} color="#525252" />
            <Text className="font-bold text-neutral-800 dark:text-neutral-200">Nuevo mapa</Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={Boolean(actionMenu)} animationType="fade" onRequestClose={() => setActionMenu(null)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setActionMenu(null)}>
          <View className="bg-white dark:bg-neutral-900 rounded-t-3xl px-4 py-4">
            <Pressable
              onPress={() => actionMenu && startRename(actionMenu.entry)}
              className="py-4 border-b border-neutral-200 dark:border-white/10"
            >
              <Text className="text-base font-medium text-neutral-800 dark:text-neutral-100">Renombrar</Text>
            </Pressable>
            <Pressable
              onPress={() => actionMenu && onTogglePin(actionMenu.entry.id)}
              className="py-4 border-b border-neutral-200 dark:border-white/10"
            >
              <Text className="text-base font-medium text-neutral-800 dark:text-neutral-100">
                {actionMenu?.entry.pinned ? 'Desfijar' : 'Fijar'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (!actionMenu) return;
                Alert.alert('Eliminar mapa', '¿Seguro que quieres eliminar este mapa?', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => onDelete(actionMenu.entry.id),
                  },
                ]);
                setActionMenu(null);
              }}
              className="py-4 flex-row items-center gap-2"
            >
              <Trash2 size={16} color="#dc2626" />
              <Text className="text-base font-medium text-red-600">Eliminar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );

  if (embedded) {
    return visible ? content : null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

================================================================================
FILE: mobile/src/components/LoadingState.tsx
================================================================================
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import AtomCanvasIcon from './AtomCanvasIcon';

const PHASES = [
  'Leyendo la fuente',
  'Detectando la estructura',
  'Destilando el núcleo',
  'Generando los pasos',
] as const;

type LoadingStateProps = {
  onCancel: () => void;
};

function ShimmerBlock({
  className = '',
  reduceMotion,
  delay = 0,
}: {
  className?: string;
  reduceMotion: boolean;
  delay?: number;
}) {
  const translateX = useSharedValue(-120);

  useEffect(() => {
    if (reduceMotion) return;
    translateX.value = withRepeat(
      withTiming(240, { duration: 1600, easing: Easing.linear }),
      -1,
      false
    );
  }, [delay, reduceMotion, translateX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className={`overflow-hidden rounded-md bg-zinc-200/70 dark:bg-zinc-800/70 border border-indigo-500/10 ${className}`}>
      {!reduceMotion ? (
        <Animated.View
          style={shimmerStyle}
          className="absolute inset-y-0 w-1/2 bg-indigo-400/20 dark:bg-indigo-500/10"
        />
      ) : null}
    </View>
  );
}

export default function LoadingState({ onCancel }: LoadingStateProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-neutral-900">
      <View className="w-full max-w-md">
        <View className="flex-row items-center gap-3 mb-8">
          <AtomCanvasIcon size={44} />
          <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {PHASES[phaseIndex]}
          </Text>
        </View>

        <View className="gap-3">
          <ShimmerBlock className="h-4 w-3/4" reduceMotion={reduceMotion} />
          <ShimmerBlock className="h-4 w-full" reduceMotion={reduceMotion} delay={100} />
          <ShimmerBlock className="h-4 w-5/6" reduceMotion={reduceMotion} delay={200} />
          <View className="mt-4 gap-3">
            <ShimmerBlock className="h-24 w-full rounded-2xl" reduceMotion={reduceMotion} delay={300} />
            <ShimmerBlock className="h-16 w-full rounded-2xl" reduceMotion={reduceMotion} delay={400} />
          </View>
        </View>

        <Pressable
          onPress={onCancel}
          className="mt-10 self-center px-5 py-3 rounded-xl border border-neutral-200 dark:border-white/10"
        >
          <Text className="text-neutral-700 dark:text-neutral-300 font-semibold">Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

================================================================================
FILE: mobile/src/components/MapChatSheet.tsx
================================================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MessageSquareText, X } from 'lucide-react-native';
import { apiUrl } from '../logic/apiBase';
import type { ActionMapData, ChatTurn, MapChatResponse } from '../logic/contracts';
import { supabase } from '../logic/supabase';

type MapChatSheetProps = {
  visible: boolean;
  onClose: () => void;
  mapId: string;
  mapData: ActionMapData;
};

type ParsedAssistantTurn = {
  answer: string;
  citations: MapChatResponse['citations'];
  limitations: MapChatResponse['limitations'];
};

function parseStoredAssistantText(text: string): ParsedAssistantTurn {
  const sourcesIndex = text.indexOf('\n\nFuentes:');
  const limitsIndex = text.indexOf('\n\nLímites:');

  if (sourcesIndex === -1 && limitsIndex === -1) {
    return { answer: text, citations: [], limitations: [] };
  }

  const answerEnd = [sourcesIndex, limitsIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? text.length;
  const answer = text.slice(0, answerEnd).trim();
  const citations: NonNullable<MapChatResponse['citations']> = [];
  const limitations: string[] = [];

  if (sourcesIndex >= 0) {
    const sourcesBlock = text.slice(
      sourcesIndex + '\n\nFuentes:'.length,
      limitsIndex >= 0 ? limitsIndex : undefined
    );
    for (const line of sourcesBlock.split('\n')) {
      const trimmed = line.replace(/^-\s*/, '').trim();
      if (!trimmed) continue;
      const [labelPart, rest] = trimmed.split(':');
      const label = labelPart?.trim() || 'Fuente';
      const locator = rest?.trim() || '';
      const excerptIndex = locator.indexOf(' — ');
      if (excerptIndex >= 0) {
        citations.push({
          label,
          locator: locator.slice(0, excerptIndex).trim(),
          excerpt: locator.slice(excerptIndex + 3).trim(),
        });
      } else {
        citations.push({ label, locator });
      }
    }
  }

  if (limitsIndex >= 0) {
    const limitsBlock = text.slice(limitsIndex + '\n\nLímites:'.length);
    for (const line of limitsBlock.split('\n')) {
      const trimmed = line.replace(/^-\s*/, '').trim();
      if (trimmed) limitations.push(trimmed);
    }
  }

  return { answer, citations, limitations };
}

function formatAssistantText(reply: MapChatResponse): string {
  const citationText = reply.citations?.length
    ? `\n\nFuentes:\n${reply.citations
        .map(
          (citation) =>
            `- ${citation.label}: ${citation.locator}${citation.excerpt ? ` — ${citation.excerpt}` : ''}`
        )
        .join('\n')}`
    : '';
  const limitationsText = reply.limitations?.length
    ? `\n\nLímites:\n${reply.limitations.map((item) => `- ${item}`).join('\n')}`
    : '';

  return `${reply.answer}${citationText}${limitationsText}`.trim();
}

function AssistantBubble({ text }: { text: string }) {
  const parsed = parseStoredAssistantText(text);

  return (
    <View className="self-start max-w-[92%] mb-4 rounded-[20px] px-4 py-3 bg-neutral-100 dark:bg-white/5">
      <Text className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">{parsed.answer}</Text>
      {parsed.citations?.length ? (
        <View className="mt-3 pt-3 border-t border-neutral-200/80 dark:border-white/10">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            Fuentes
          </Text>
          {parsed.citations.map((citation, index) => (
            <View
              key={`${citation.label}-${citation.locator}-${index}`}
              className="mb-2 rounded-[20px] border border-neutral-200 dark:border-white/10 px-3 py-2"
            >
              <Text className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                {citation.label}: {citation.locator}
              </Text>
              {citation.excerpt ? (
                <Text className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {citation.excerpt}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      {parsed.limitations?.length ? (
        <View className="mt-3 pt-3 border-t border-neutral-200/80 dark:border-white/10">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
            Límites
          </Text>
          {parsed.limitations.map((item, index) => (
            <Text key={`${item}-${index}`} className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 mb-1">
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function MapChatSheet({ visible, onClose, mapId, mapData }: MapChatSheetProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setChatHistory([]);
    setChatInput('');
    setChatError(null);
    setChatBusy(false);
  }, [mapId]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [chatHistory, chatBusy, visible]);

  const suggestedQuestions = [
    mapData.completionCard?.promptQuestion,
    '¿Qué no debería pasar por alto?',
    '¿Qué partes están más conectadas entre sí?',
  ]
    .filter(Boolean)
    .slice(0, 3) as string[];

  const handleSubmit = useCallback(
    async (presetQuestion?: string) => {
      const question = (presetQuestion || chatInput).trim();
      if (!question || chatBusy) return;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const optimisticHistory: ChatTurn[] = [...chatHistory, { role: 'user', text: question }];
      setChatHistory(optimisticHistory);
      setChatInput('');
      setChatBusy(true);
      setChatError(null);

      try {
        const accessToken = supabase
          ? (await supabase.auth.getSession()).data.session?.access_token
          : undefined;

        const response = await fetch(apiUrl(`/api/maps/${mapId}/chat`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            map: mapData,
            question,
            history: optimisticHistory,
          }),
        });

        const parsed = (await response.json()) as MapChatResponse & { error?: string };
        if (!response.ok) {
          throw new Error(parsed?.error || 'No se pudo responder a esta pregunta.');
        }

        setChatHistory((previous) => [
          ...previous,
          {
            role: 'assistant',
            text: formatAssistantText(parsed),
          },
        ]);
      } catch (err) {
        console.error(err);
        setChatError(err instanceof Error ? err.message : 'No se pudo responder a esta pregunta.');
      } finally {
        setChatBusy(false);
      }
    },
    [chatBusy, chatHistory, chatInput, mapData, mapId]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-white/10">
            <View className="flex-1 pr-3">
              <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Preguntar sobre este mapa
              </Text>
              <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Responde solo con el contenido de esta lectura y sus referencias.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-full items-center justify-center bg-neutral-200/80 dark:bg-white/10"
              accessibilityLabel="Cerrar chat"
            >
              <X size={18} color="#737373" />
            </Pressable>
          </View>

          {suggestedQuestions.length > 0 ? (
            <View className="px-5 py-3 border-b border-neutral-200 dark:border-white/10">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                {suggestedQuestions.map((question) => (
                  <Pressable
                    key={question}
                    onPress={() => void handleSubmit(question)}
                    disabled={chatBusy}
                    className="rounded-full border border-neutral-200 dark:border-white/10 px-3 py-1.5 active:border-indigo-300 dark:active:border-indigo-500/40"
                  >
                    <Text className="text-sm text-neutral-700 dark:text-neutral-200">{question}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="px-5 py-5 pb-4"
            keyboardShouldPersistTaps="handled"
          >
            {chatHistory.length === 0 ? (
              <Text className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                Puedes pedir una aclaración, una lectura más sintética o una explicación de un bloque
                concreto.
              </Text>
            ) : (
              chatHistory.map((turn, index) =>
                turn.role === 'user' ? (
                  <View
                    key={`${turn.role}-${index}`}
                    className="mb-4 self-end max-w-[85%] rounded-[20px] px-4 py-3 bg-indigo-600"
                  >
                    <Text className="text-sm leading-relaxed text-white">{turn.text}</Text>
                  </View>
                ) : (
                  <AssistantBubble key={`${turn.role}-${index}`} text={turn.text} />
                )
              )
            )}

            {chatBusy ? (
              <View className="self-start max-w-[92%] mb-4 rounded-[20px] px-4 py-3 bg-neutral-100 dark:bg-white/5 flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#4f46e5" />
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">Pensando…</Text>
              </View>
            ) : null}
          </ScrollView>

          <View className="border-t border-neutral-200 dark:border-white/10 px-5 py-4">
            <View className="flex-row gap-3 items-end">
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Haz una pregunta sobre este mapa…"
                placeholderTextColor="#a3a3a3"
                multiline
                textAlignVertical="top"
                editable={!chatBusy}
                className="flex-1 min-h-[72px] max-h-32 rounded-[20px] border border-neutral-200 dark:border-white/10 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100"
              />
              <Pressable
                onPress={() => void handleSubmit()}
                disabled={chatBusy || !chatInput.trim()}
                className={`rounded-[20px] px-4 py-3 flex-row items-center gap-2 ${
                  chatBusy || !chatInput.trim()
                    ? 'bg-indigo-600/40'
                    : 'bg-indigo-600 active:bg-indigo-700'
                }`}
                accessibilityLabel="Enviar pregunta"
              >
                <MessageSquareText size={16} color="#fff" />
                <Text className="text-sm font-semibold text-white">
                  {chatBusy ? 'Pensando…' : 'Preguntar'}
                </Text>
              </Pressable>
            </View>
            {chatError ? (
              <Text className="mt-3 text-sm text-amber-700 dark:text-amber-300">{chatError}</Text>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

================================================================================
FILE: mobile/src/components/MenuTwoLines.tsx
================================================================================
import React from 'react';
import Svg, { Path } from 'react-native-svg';

type MenuTwoLinesProps = {
  size?: number;
  color?: string;
};

export default function MenuTwoLines({ size = 24, color = 'currentColor' }: MenuTwoLinesProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      width={size}
      height={size}
      aria-hidden={true}
    >
      <Path d="M4 9h16" />
      <Path d="M4 15h16" />
    </Svg>
  );
}

================================================================================
FILE: mobile/src/components/ModelChip.tsx
================================================================================
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Check, ChevronDown, Sparkles, X } from 'lucide-react-native';
import GlassSurface from './GlassSurface';
import { MODEL_OPTIONS, type ModelPreference } from '../logic/modelPreference';
import { stepHaptic } from '../context/AppSessionContext';

type ModelChipProps = {
  value: ModelPreference;
  onChange: (value: ModelPreference) => void;
  disabled?: boolean;
};

export default function ModelChip({ value, onChange, disabled = false }: ModelChipProps) {
  const [open, setOpen] = useState(false);
  const activeOption = MODEL_OPTIONS.find((option) => option.id === value) ?? MODEL_OPTIONS[0];

  return (
    <>
      <Pressable
        onPress={() => {
          if (disabled) return;
          setOpen(true);
          stepHaptic();
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Modelo: ${activeOption.label}`}
        className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
          disabled ? 'opacity-40' : 'active:opacity-80'
        } bg-neutral-500/10 dark:bg-white/10`}
      >
        <Sparkles size={14} color="#737373" />
        <Text className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          {activeOption.label}
        </Text>
        <ChevronDown size={14} color="#737373" style={{ opacity: 0.6 }} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <GlassSurface className="rounded-t-[20px] mx-0">
              <View className="px-4 pt-4 pb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Modelo
                  </Text>
                  <Pressable
                    onPress={() => setOpen(false)}
                    className="w-8 h-8 rounded-full items-center justify-center bg-neutral-500/10"
                    accessibilityLabel="Cerrar selector de modelo"
                  >
                    <X size={16} color="#737373" />
                  </Pressable>
                </View>
                <ScrollView className="max-h-72">
                  {MODEL_OPTIONS.map((option) => {
                    const isActive = option.id === value;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          onChange(option.id);
                          setOpen(false);
                        }}
                        className={`px-3 py-3 rounded-xl mb-1 flex-row items-start gap-2 ${
                          isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                        }`}
                      >
                        <View className="flex-1">
                          <Text
                            className={`text-sm font-semibold ${
                              isActive
                                ? 'text-indigo-700 dark:text-indigo-300'
                                : 'text-neutral-800 dark:text-neutral-200'
                            }`}
                          >
                            {option.label}
                          </Text>
                          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {option.hint}
                          </Text>
                        </View>
                        {isActive ? <Check size={16} color="#4f46e5" /> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </GlassSurface>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

================================================================================
FILE: mobile/src/components/ModelSelector.tsx
================================================================================
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MODEL_OPTIONS, type ModelPreference } from '../logic/modelPreference';

type ModelSelectorProps = {
  value: ModelPreference;
  onChange: (value: ModelPreference) => void;
};

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {MODEL_OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className={`px-3 py-2 rounded-full border ${
              active
                ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                active ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

================================================================================
FILE: mobile/src/components/NucleoIcon.tsx
================================================================================
import React from 'react';
import { View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';

type NucleoIconProps = {
  className?: string;
  energized?: boolean;
  interactive?: boolean;
};

export default function NucleoIcon({
  energized = false,
  interactive = true,
}: NucleoIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === 'burst') {
      // Activa una respuesta táctica nativa (Haptics) al pulsar
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-user-select: none;
          user-select: none;
        }
        body {
          background: transparent;
          overflow: hidden;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${isDark ? '#EDEDED' : '#1A1A1A'};
        }
        .nucleo-wrapper {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 72px;
          height: 72px;
          padding: 8px;
          border: 0;
          background: transparent;
          color: currentColor;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-wrapper.is-bursting {
          transform: scale(1.12);
        }
        .nucleo-wrapper.is-static {
          cursor: default;
          pointer-events: none;
        }
        .nucleo-svg {
          width: 56px;
          height: 56px;
          overflow: visible;
        }
        .nucleo-halo {
          fill: currentColor;
          opacity: 0.1;
        }
        .nucleo-core {
          fill: currentColor;
          animation: nucleo-core-pulse 2.8s ease-in-out infinite;
        }
        .nucleo-orbit {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          opacity: 0.28;
        }
        .nucleo-energy-glow,
        .nucleo-energy {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 2 1 4 1 6 1 6 1 4 1 2 162;
          animation-name: nucleo-energy-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .nucleo-energy-glow {
          stroke-width: 11;
          opacity: 0.22;
          filter: url(#energy-soft);
        }
        .nucleo-energy {
          stroke-width: 1.8;
          opacity: 0.62;
          filter: url(#energy-light);
        }
        .energy-1 .nucleo-energy,
        .energy-1 .nucleo-energy-glow {
          animation-duration: 3.9s;
        }
        .energy-2 .nucleo-energy,
        .energy-2 .nucleo-energy-glow {
          animation-duration: 5.4s;
          animation-delay: -1.1s;
        }
        .energy-2 .nucleo-energy-glow {
          opacity: 0.18;
        }
        .energy-3 .nucleo-energy,
        .energy-3 .nucleo-energy-glow {
          animation-duration: 6.8s;
          animation-delay: -2.2s;
          animation-direction: reverse;
        }
        .energy-3 .nucleo-energy-glow {
          opacity: 0.15;
        }
        .nucleo-wrapper.is-energized .nucleo-energy,
        .nucleo-wrapper.is-energized .nucleo-energy-glow {
          animation-duration: 1.15s;
        }
        .nucleo-burst-ring {
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          opacity: 0;
        }
        .nucleo-wrapper.is-bursting .nucleo-burst-ring {
          animation: nucleo-burst-ring 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-wrapper.is-bursting .nucleo-core {
          animation: nucleo-core-burst 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nucleo-wrapper.is-bursting .nucleo-energy,
        .nucleo-wrapper.is-bursting .nucleo-energy-glow {
          animation-duration: 1.15s;
        }
        @keyframes nucleo-core-pulse {
          0%, 100% { opacity: 0.72; }
          50% { opacity: 1; }
        }
        @keyframes nucleo-core-burst {
          0% { opacity: 0.84; }
          34% { opacity: 1; }
          100% { opacity: 0.84; }
        }
        @keyframes nucleo-energy-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -192; }
        }
        @keyframes nucleo-burst-ring {
          0% {
            opacity: 0.38;
            stroke-width: 2;
          }
          100% {
            opacity: 0;
            stroke-width: 0.75;
          }
        }
      </style>
    </head>
    <body>
      <div
        id="wrapper"
        class="nucleo-wrapper ${energized ? 'is-energized' : ''} ${interactive ? '' : 'is-static'}"
      >
        <svg viewBox="0 0 100 100" class="nucleo-svg" aria-hidden="true">
          <defs>
            <filter id="nucleo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="energy-soft" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="4.2" />
            </filter>
            <filter id="energy-light" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="50" cy="50" r="18" class="nucleo-halo" />
          <circle cx="50" cy="50" r="25" class="nucleo-burst-ring" />

          <g>
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-orbit" />
          </g>
          <g transform="rotate(60 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-orbit" />
          </g>
          <g transform="rotate(120 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-orbit" />
          </g>

          <g class="energy-1">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy-glow" />
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy" />
          </g>
          <g class="energy-2" transform="rotate(60 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy-glow" />
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy" />
          </g>
          <g class="energy-3" transform="rotate(120 50 50)">
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy-glow" />
            <ellipse cx="50" cy="50" rx="42" ry="14" class="nucleo-energy" />
          </g>

          <circle cx="50" cy="50" r="7" class="nucleo-core" filter="url(#nucleo-glow)" />
        </svg>
      </div>

      <script>
        const wrapper = document.getElementById('wrapper');
        let timeout = null;

        if (${interactive}) {
          wrapper.addEventListener('click', () => {
            if (timeout) clearTimeout(timeout);
            wrapper.classList.add('is-bursting');
            
            // Notify React Native to trigger haptics
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('burst');
            }

            timeout = setTimeout(() => {
              wrapper.classList.remove('is-bursting');
            }, 700);
          });
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width: 72, height: 72 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
      />
    </View>
  );
}

================================================================================
FILE: mobile/src/components/ProfileMenu.tsx
================================================================================
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react-native';
import GlassSurface from './GlassSurface';
import { useAppSession, stepHaptic } from '../context/AppSessionContext';
import { useTheme } from '../context/ThemeContext';
import { useAppVariantSwitch } from '../context/AppVariantContext';
import { APP_VARIANT_OPTIONS, getAppVariant } from '../logic/appVariant';
import { signOut } from '../logic/cloudHistory';

type ProfileMenuProps = {
  placement?: 'topRight' | 'bottomLeft';
};

function ProfileAvatar({ signedIn }: { signedIn: boolean }) {
  return (
    <View
      className={`w-9 h-9 rounded-full items-center justify-center ${
        signedIn ? 'bg-indigo-600' : 'bg-neutral-500/10 dark:bg-white/10'
      }`}
    >
      <UserRound size={18} color={signedIn ? '#ffffff' : '#525252'} />
    </View>
  );
}

export default function ProfileMenu({ placement = 'topRight' }: ProfileMenuProps) {
  const session = useAppSession();
  const { theme, toggleTheme } = useTheme();
  const { onVariantChange } = useAppVariantSwitch();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'root' | 'settings'>('root');

  const closeMenu = () => {
    setOpen(false);
    setView('root');
  };

  const menuAnchorClass =
    placement === 'bottomLeft'
      ? 'flex-1 justify-end items-start px-6 pb-28'
      : 'flex-1 items-end pt-14 px-4';

  const renderMenuContent = () => {
    if (view === 'settings') {
      return (
        <>
          <Pressable
            onPress={() => setView('root')}
            className="flex-row items-center gap-2 px-3 py-3 border-b border-neutral-200/60 dark:border-white/10"
          >
            <ChevronLeft size={16} color="#737373" />
            <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Ajustes
            </Text>
          </Pressable>

          <View className="px-3 py-2.5">
            <Text className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
              Experiencia
            </Text>
          </View>

          {APP_VARIANT_OPTIONS.map((option) => {
            const isActive = getAppVariant() === option.id;
            return (
              <Pressable
                key={option.id}
                disabled={session.phase === 'loading'}
                onPress={() => {
                  if (isActive) return;
                  closeMenu();
                  onVariantChange(option.id);
                  stepHaptic();
                }}
                className={`px-3 py-2.5 flex-row items-start gap-2 ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''
                } ${session.phase === 'loading' ? 'opacity-50' : ''}`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {option.label}
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {option.hint}
                  </Text>
                </View>
                {isActive ? <Check size={16} color="#4f46e5" /> : null}
              </Pressable>
            );
          })}

          <View className="border-t border-neutral-200/60 dark:border-white/10">
            <Pressable
              onPress={() => {
                toggleTheme();
                stepHaptic();
              }}
              className="px-3 py-2.5 flex-row items-center gap-2.5"
            >
              {theme === 'light' ? <Moon size={16} color="#737373" /> : <Sun size={16} color="#737373" />}
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
              </Text>
            </Pressable>
          </View>
        </>
      );
    }

    return (
      <View className="py-1">
        <Pressable
          onPress={() => setView('settings')}
          className="px-3 py-2.5 flex-row items-center gap-2.5"
        >
          <Settings size={16} color="#737373" />
          <Text className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Ajustes
          </Text>
          <ChevronRight size={16} color="#a3a3a3" />
        </Pressable>

        {session.cloudSignedIn ? (
          <Pressable
            onPress={() => {
              closeMenu();
              void signOut();
              stepHaptic();
            }}
            className="px-3 py-2.5 flex-row items-center gap-2.5"
          >
            <LogOut size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Cerrar sesión
            </Text>
          </Pressable>
        ) : session.isCloudSyncConfigured ? (
          <Pressable
            onPress={() => {
              closeMenu();
              session.setAuthOpen(true);
              stepHaptic();
            }}
            className="px-3 py-2.5 flex-row items-center gap-2.5"
          >
            <LogIn size={16} color="#737373" />
            <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Iniciar sesión
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <View className="relative">
      <Pressable
        onPress={() => {
          setOpen((current) => {
            if (current) setView('root');
            return !current;
          });
          stepHaptic();
        }}
        accessibilityRole="button"
        accessibilityLabel={session.cloudSignedIn ? 'Tu cuenta' : 'Cuenta y ajustes'}
        accessibilityState={{ expanded: open }}
        className="rounded-xl p-1 active:opacity-80"
      >
        <ProfileAvatar signedIn={session.cloudSignedIn} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable className="flex-1 bg-black/20" onPress={closeMenu}>
          <View className={menuAnchorClass} pointerEvents="box-none">
            <Pressable onPress={(event) => event.stopPropagation()}>
              <GlassSurface className="w-72 rounded-[20px] shadow-xl">{renderMenuContent()}</GlassSurface>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

================================================================================
FILE: mobile/src/components/ReadingProgressBar.tsx
================================================================================
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MenuTwoLines from './MenuTwoLines';

type ReadingProgressBarProps = {
  viewAll: boolean;
  isComplete: boolean;
  stepProgress: number;
  progressLabel: string;
  onToggleSidebar: () => void;
  scrollProgress?: number;
};

export default function ReadingProgressBar({
  viewAll,
  isComplete,
  stepProgress,
  progressLabel,
  onToggleSidebar,
  scrollProgress = 0,
}: ReadingProgressBarProps) {
  const progress = useSharedValue(viewAll ? scrollProgress : stepProgress / 100);
  const [shownPercent, setShownPercent] = useState(
    viewAll ? Math.round(scrollProgress * 100) : Math.round(stepProgress)
  );

  useEffect(() => {
    const target = viewAll ? scrollProgress : stepProgress / 100;
    progress.value = withSpring(target, { damping: 38, stiffness: 320, mass: 0.24 });
    setShownPercent(viewAll ? Math.round(scrollProgress * 100) : Math.round(stepProgress));
  }, [progress, scrollProgress, stepProgress, viewAll]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value * 100))}%`,
  }));

  return (
    <View className="shrink-0 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5">
      <View className="flex-row items-center justify-between gap-3 py-2.5 px-3">
        <View className="flex-row min-w-0 items-center gap-2 flex-1">
          <Pressable
            onPress={onToggleSidebar}
            className="w-8 h-8 rounded-full bg-neutral-500/10 items-center justify-center"
            accessibilityLabel="Abrir navegación"
          >
            <MenuTwoLines size={18} color="#525252" />
          </Pressable>
          <Text
            className="flex-1 text-xs font-bold text-neutral-800 dark:text-neutral-100"
            numberOfLines={1}
          >
            {progressLabel}
          </Text>
        </View>
        <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{shownPercent}%</Text>
      </View>
      <View className="h-2 bg-neutral-200 dark:bg-neutral-800">
        <Animated.View
          style={barStyle}
          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-r-full"
          accessibilityRole="progressbar"
        />
      </View>
    </View>
  );
}

================================================================================
FILE: mobile/src/components/StepContentBlocks.tsx
================================================================================
import React from 'react';
import { Text, View } from 'react-native';
import type { CalloutLabel, StepContentBlock } from '../logic/contracts';

const DEFAULT_CALLOUT_LABELS: Record<string, CalloutLabel> = {
  action: 'Para aplicarlo',
  info: 'Idea clave',
  alert: 'Precaución',
};

const CALLOUT_BORDER: Record<string, string> = {
  action: 'border-l-indigo-500',
  info: 'border-l-neutral-400 dark:border-l-neutral-500',
  alert: 'border-l-amber-500',
};

type StepContentBlocksProps = {
  blocks: StepContentBlock[];
};

function BlockReferences({ references }: { references?: StepContentBlock['references'] }) {
  if (!references?.length) return null;

  return (
    <View className="mt-3 flex-row flex-wrap gap-2">
      {references.slice(0, 3).map((reference, idx) => (
        <View
          key={`${reference.label}-${reference.locator}-${idx}`}
          className="rounded-full border border-neutral-300 dark:border-white/12 px-2.5 py-1"
        >
          <Text className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            <Text className="text-neutral-400 dark:text-neutral-500">{reference.label} </Text>
            {reference.locator}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderBlock(block: StepContentBlock, idx: number) {
  const type = String(block.type || 'prose').toLowerCase();
  const textContent = block.text || '';

  if (type === 'callout') {
    const kind = String(block.kind || 'info').toLowerCase();
    const label = String(block.label || DEFAULT_CALLOUT_LABELS[kind] || 'Idea clave');
    const borderClass = CALLOUT_BORDER[kind] || CALLOUT_BORDER.info;

    return (
      <View
        key={idx}
        className={`my-6 border-l-4 ${borderClass} bg-neutral-100/80 dark:bg-white/[0.04] rounded-r-2xl px-4 py-4`}
      >
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
          {label}
        </Text>
        {textContent ? (
          <Text className="text-base leading-7 text-neutral-800 dark:text-neutral-200">{textContent}</Text>
        ) : null}
        <BlockReferences references={block.references} />
      </View>
    );
  }

  if (type === 'list') {
    return (
      <View key={idx} className="my-6">
        {textContent ? (
          <Text className="text-base leading-7 text-neutral-800 dark:text-neutral-200 mb-4">{textContent}</Text>
        ) : null}
        {block.items?.map((item, i) => (
          <View key={i} className="flex-row gap-3 items-start mb-4">
            <View className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0" />
            <Text className="flex-1 text-base leading-7 text-neutral-800 dark:text-neutral-200">
              <Text className="font-bold text-neutral-900 dark:text-neutral-100">{item.strong}</Text>
              {item.span ? (
                <Text className="text-neutral-700 dark:text-neutral-300"> {item.span}</Text>
              ) : null}
            </Text>
          </View>
        ))}
        <BlockReferences references={block.references} />
      </View>
    );
  }

  if (!textContent.trim()) return null;

  return (
    <View key={idx} className="my-4">
      <Text className="text-base leading-7 text-neutral-800 dark:text-neutral-200">{textContent}</Text>
      <BlockReferences references={block.references} />
    </View>
  );
}

export default function StepContentBlocks({ blocks }: StepContentBlocksProps) {
  if (!blocks.length) return null;

  return <View>{blocks.map((block, idx) => renderBlock(block, idx))}</View>;
}

================================================================================
FILE: mobile/src/components/ThemeToggle.tsx
================================================================================
import React from 'react';
import { Pressable, Text } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      className="w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/80"
      accessibilityLabel={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? <Moon size={18} color="#525252" /> : <Sun size={18} color="#525252" />}
    </Pressable>
  );
}

================================================================================
FILE: mobile/src/context/AppSessionContext.tsx
================================================================================
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Share } from 'react-native';
import {
  cacheDirectory,
  EncodingType,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import type { ActionMapData, MapIntent, SourceType, TransformRequest } from '../logic/contracts';
import {
  deleteCloudHistoryEntry,
  migrateLocalHistory,
  pullCloudHistory,
  pushHistoryEntry,
} from '../logic/cloudHistory';
import {
  createEntry,
  deleteEntry,
  getActiveEntry,
  loadHistory,
  renameEntry,
  saveHistory,
  setActiveId,
  togglePinEntry,
  updateActiveSession,
  type HistoryEntry,
  type HistoryStore,
} from '../logic/history';
import { normalizeMapData } from '../logic/mapData';
import {
  getInitialModelPreference,
  saveModelPreference,
  type ModelPreference,
} from '../logic/modelPreference';
import {
  getInitialDepthPreference,
  saveDepthPreference,
  type DepthPreference,
} from '../logic/depthPreference';
import {
  pickImageFromCamera,
  pickImageFromLibrary,
  pickPdfAttachment,
  pickVideoFromLibrary,
  type UploadedFile,
} from '../logic/attachments';
import { detectUrlInput, friendlyTransformError } from '../logic/urlInput';
import {
  fetchTransformWithProgress,
  TRANSFORM_IDLE_TIMEOUT_MESSAGE,
} from '../logic/transformStream';
import { apiUrl } from '../logic/apiBase';
import { isCloudSyncConfigured, supabase } from '../logic/supabase';

export type AppPhase = 'input' | 'loading' | 'result';

const MAX_SYNCED_ENTRIES = 30;

function mergeHistory(localEntries: HistoryEntry[], cloudEntries: HistoryEntry[]): HistoryEntry[] {
  const entries = new Map<string, HistoryEntry>();
  for (const entry of [...localEntries, ...cloudEntries]) {
    const existing = entries.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) entries.set(entry.id, entry);
  }
  return [...entries.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SYNCED_ENTRIES);
}

function generateMapId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toSourceType(requestType: TransformRequest['type']): SourceType {
  if (requestType === 'image' || requestType === 'video') return 'file';
  return requestType;
}

export function stepHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

type AppSessionContextValue = {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  inputText: string;
  setInputText: (text: string) => void;
  intent: MapIntent;
  setIntent: (intent: MapIntent) => void;
  error: string | null;
  setError: (error: string | null) => void;
  data: ActionMapData | null;
  historyStore: HistoryStore;
  currentStep: number;
  isComplete: boolean;
  viewAll: boolean;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  cloudUserEmail: string | null;
  cloudSignedIn: boolean;
  isCloudSyncConfigured: boolean;
  uploadedFile: UploadedFile | null;
  attachMenuOpen: boolean;
  setAttachMenuOpen: (open: boolean) => void;
  modelPreference: ModelPreference;
  setModelPreference: (value: ModelPreference) => void;
  depthPreference: DepthPreference;
  setDepthPreference: (value: DepthPreference) => void;
  totalSteps: number;
  canSubmit: boolean;
  hideTextInput: boolean;
  composerPlaceholder: string;
  progressLabel: string;
  stepProgress: number;
  goToStep: (idx: number, fromViewAll?: boolean) => void;
  toggleViewMode: () => void;
  handleCancelLoading: () => void;
  handlePickImage: () => Promise<void>;
  handlePickCamera: () => Promise<void>;
  handlePickPdf: () => Promise<void>;
  handlePickVideo: () => Promise<void>;
  removeUploadedFile: () => void;
  handleTransform: () => Promise<void>;
  handleNewMap: () => void;
  handleSelectHistory: (id: string) => void;
  handleDeleteHistory: (id: string) => void;
  handleRenameHistory: (id: string, title: string) => void;
  handlePinHistory: (id: string) => void;
  handleCompleteMap: () => void;
  essentialsReview: boolean;
  setEssentialsReview: (value: boolean) => void;
  handleDownloadPdf: () => Promise<void>;
  isStreamGenerating: boolean;
};

const AppSessionContext = createContext<AppSessionContextValue | null>(null);

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const initialHistory = useMemo(() => loadHistory(), []);
  const initialActive = useMemo(() => getActiveEntry(initialHistory), [initialHistory]);
  const initialActiveData = useMemo(
    () => (initialActive ? normalizeMapData(initialActive.session.data) : null),
    [initialActive]
  );

  const [phase, setPhase] = useState<AppPhase>(initialActiveData ? 'result' : 'input');
  const [inputText, setInputText] = useState('');
  const [intent, setIntent] = useState<MapIntent>(initialActiveData?.intent ?? 'understand');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ActionMapData | null>(initialActiveData);
  const [historyStore, setHistoryStore] = useState<HistoryStore>(initialHistory);
  const [currentStep, setCurrentStep] = useState(initialActive?.session.currentStep ?? 0);
  const [isComplete, setIsComplete] = useState(initialActive?.session.isComplete ?? false);
  const [viewAll, setViewAll] = useState(initialActive?.session.viewAll ?? false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cloudUserEmail, setCloudUserEmail] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [modelPreference, setModelPreferenceState] = useState<ModelPreference>(() =>
    getInitialModelPreference()
  );
  const [depthPreference, setDepthPreferenceState] = useState<DepthPreference>(() =>
    getInitialDepthPreference()
  );
  const [essentialsReview, setEssentialsReview] = useState(false);
  const [isStreamGenerating, setIsStreamGenerating] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const transformCancelledRef = useRef(false);
  const historyStoreRef = useRef(historyStore);
  const cloudSignedIn = Boolean(cloudUserEmail);

  const totalSteps = data?.steps.length ?? 0;
  const canSubmit = Boolean(inputText.trim() || uploadedFile);
  const hideTextInput = Boolean(uploadedFile?.isPdf || uploadedFile?.isVideo);
  const composerPlaceholder = uploadedFile?.isImage
    ? 'Añade una indicación (opcional)…'
    : uploadedFile?.isVideo
      ? 'Añade una indicación sobre el video (opcional)…'
      : uploadedFile
        ? 'Archivo adjunto listo para convertir'
        : 'Pega texto, un artículo, un enlace o una transcripción…';

  const progressLabel = useMemo(() => {
    if (isComplete) return 'Mapa completado';
    if (viewAll) return 'Lectura completa';
    if (currentStep === 0) return 'Introducción';
    return `Paso ${currentStep} de ${totalSteps}`;
  }, [currentStep, isComplete, totalSteps, viewAll]);

  const stepProgress = useMemo(() => {
    if (isComplete || viewAll || !data || totalSteps === 0) return 0;
    if (currentStep === 0) return 0;
    return Math.round((currentStep / totalSteps) * 100);
  }, [currentStep, data, isComplete, totalSteps, viewAll]);

  const setModelPreference = useCallback((value: ModelPreference) => {
    setModelPreferenceState(value);
    saveModelPreference(value);
    stepHaptic();
  }, []);

  const setDepthPreference = useCallback((value: DepthPreference) => {
    setDepthPreferenceState(value);
    saveDepthPreference(value);
    stepHaptic();
  }, []);

  useEffect(() => {
    if (phase !== 'result' || !data || !historyStore.activeId) return;

    setHistoryStore((prev) => {
      const updated = updateActiveSession(prev, {
        data,
        currentStep,
        isComplete,
        viewAll,
      });
      saveHistory(updated);
      return updated;
    });
  }, [phase, data, currentStep, isComplete, viewAll, historyStore.activeId]);

  useEffect(() => {
    historyStoreRef.current = historyStore;
  }, [historyStore]);

  useEffect(() => {
    if (!supabase) return;

    const hydrateCloudHistory = async (email: string | null) => {
      setCloudUserEmail(email);
      if (!email) return;
      try {
        await migrateLocalHistory(historyStoreRef.current);
        const remoteEntries = await pullCloudHistory();
        setHistoryStore((previous) => {
          const merged = { ...previous, entries: mergeHistory(previous.entries, remoteEntries) };
          saveHistory(merged);
          return merged;
        });
      } catch (err) {
        console.error('No se pudo sincronizar el historial.', err);
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data: sessionData }) => hydrateCloudHistory(sessionData.session?.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateCloudHistory(session?.user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !cloudSignedIn) return;
    const timer = setTimeout(() => {
      void Promise.all(historyStore.entries.map(pushHistoryEntry)).catch((err) => {
        console.error('Los cambios se sincronizarán más tarde.', err);
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [historyStore, cloudSignedIn]);

  const goToStep = useCallback((idx: number, fromViewAll = false) => {
    setIsComplete(false);
    setCurrentStep(idx);
    if (fromViewAll) setViewAll(false);
    stepHaptic();
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewAll((v) => !v);
    setIsComplete(false);
    stepHaptic();
  }, []);

  const handleCancelLoading = useCallback(() => {
    transformCancelledRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setPhase('input');
  }, []);

  const handleAttachmentError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : 'No se pudo adjuntar el archivo.';
    setError(message);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handlePickImage = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickImageFromLibrary();
      if (!file) return;
      setUploadedFile(file);
      setError(null);
      stepHaptic();
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const handlePickCamera = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickImageFromCamera();
      if (!file) return;
      setUploadedFile(file);
      setError(null);
      stepHaptic();
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const handlePickPdf = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickPdfAttachment();
      if (!file) return;
      setUploadedFile(file);
      setInputText('');
      setError(null);
      stepHaptic();
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const handlePickVideo = useCallback(async () => {
    setAttachMenuOpen(false);
    try {
      const file = await pickVideoFromLibrary();
      if (!file) return;
      setUploadedFile(file);
      setInputText('');
      setError(null);
      stepHaptic();
    } catch (err) {
      handleAttachmentError(err);
    }
  }, [handleAttachmentError]);

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null);
    if (uploadedFile?.isPdf || uploadedFile?.isVideo) setInputText('');
  }, [uploadedFile?.isPdf, uploadedFile?.isVideo]);

  const handleTransform = useCallback(async () => {
    if (!inputText.trim() && !uploadedFile) return;

    let urlDetection: ReturnType<typeof detectUrlInput> | null = null;
    if (!uploadedFile && inputText.trim()) {
      urlDetection = detectUrlInput(inputText);
      if (urlDetection.kind === 'invalid') {
        setError(urlDetection.message);
        return;
      }
    }

    setPhase('loading');
    setError(null);
    setAttachMenuOpen(false);
    transformCancelledRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const mapId = generateMapId();
      const sourceLabel =
        uploadedFile?.name || inputText.trim().split('\n')[0]?.slice(0, 80) || 'Fuente analizada';

      let body: TransformRequest;
      if (uploadedFile?.isPdf && uploadedFile.fileData) {
        body = {
          type: 'pdf',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'application/pdf',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
      } else if (uploadedFile?.isVideo && uploadedFile.fileData) {
        body = {
          type: 'video',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'video/mp4',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
        if (inputText.trim()) body.text = inputText.trim();
      } else if (uploadedFile?.isImage && uploadedFile.fileData) {
        body = {
          type: 'image',
          fileData: uploadedFile.fileData,
          mimeType: uploadedFile.mimeType || 'image/jpeg',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
        if (inputText.trim()) body.text = inputText.trim();
      } else if (urlDetection?.kind === 'youtube') {
        body = {
          text: urlDetection.url,
          type: 'youtube',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel: urlDetection.url,
          mapId,
        };
      } else if (urlDetection?.kind === 'link') {
        body = {
          text: urlDetection.url,
          type: 'link',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel: urlDetection.url,
          mapId,
        };
      } else {
        body = {
          text: inputText.trim(),
          type: 'text',
          preferredModel: modelPreference,
          intent,
          depth: depthPreference,
          outputLanguage: 'es',
          sourceLabel,
          mapId,
        };
      }

      const accessToken = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

      let hasShownPartial = false;
      setIsStreamGenerating(true);

      const saveCompletedMap = (normalized: ActionMapData) => {
        const session = {
          data: normalized,
          currentStep: 0,
          isComplete: false,
          viewAll: false,
        };

        setHistoryStore((prev) => {
          const updated = createEntry(prev, session, toSourceType(body.type), mapId);
          saveHistory(updated);
          return updated;
        });

        setData(normalized);
        setCurrentStep(0);
        setIsComplete(false);
        setViewAll(false);
        setUploadedFile(null);
        setInputText('');
        setPhase('result');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };

      await fetchTransformWithProgress({
        streamUrl: apiUrl('/api/transform/stream'),
        fallbackUrl: apiUrl('/api/transform'),
        body,
        headers,
        signal: controller.signal,
        handlers: {
          onPartial: (partialMap) => {
            if (!hasShownPartial) {
              hasShownPartial = true;
              setPhase('result');
              setCurrentStep(0);
              setIsComplete(false);
              setViewAll(false);
            }
            setData(partialMap);
          },
          onDone: (finalMap) => {
            saveCompletedMap(finalMap);
          },
          onError: (message) => {
            throw new Error(message);
          },
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (transformCancelledRef.current) {
          setPhase('input');
          return;
        }
        setError(TRANSFORM_IDLE_TIMEOUT_MESSAGE);
        setPhase('input');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const rawMessage =
        err instanceof Error ? err.message : 'No se pudo procesar el contenido.';
      setError(friendlyTransformError(rawMessage));
      setPhase('input');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsStreamGenerating(false);
      abortControllerRef.current = null;
    }
  }, [depthPreference, inputText, intent, modelPreference, uploadedFile]);

  const handleNewMap = useCallback(() => {
    setHistoryStore((prev) => {
      const updated = setActiveId(prev, null);
      saveHistory(updated);
      return updated;
    });
    setInputText('');
    setUploadedFile(null);
    setAttachMenuOpen(false);
    setData(null);
    setError(null);
    setCurrentStep(0);
    setIsComplete(false);
    setViewAll(false);
    setHistoryOpen(false);
    setChatOpen(false);
    setEssentialsReview(false);
    setPhase('input');
  }, []);

  const handleSelectHistory = useCallback(
    (id: string) => {
      const entry = historyStore.entries.find((e) => e.id === id);
      if (!entry) return;

      const normalized = normalizeMapData(entry.session.data);
      if (!normalized) return;

      setHistoryStore((prev) => {
        const updated = setActiveId(prev, id);
        saveHistory(updated);
        return updated;
      });

      setData(normalized);
      setIntent(normalized.intent ?? 'understand');
      setCurrentStep(entry.session.currentStep);
      setIsComplete(entry.session.isComplete ?? false);
      setViewAll(entry.session.viewAll ?? false);
      setHistoryOpen(false);
      setChatOpen(false);
      setEssentialsReview(false);
      setPhase('result');
      setError(null);
      stepHaptic();
    },
    [historyStore.entries]
  );

  const handleDeleteHistory = useCallback(
    (id: string) => {
      const wasActive = historyStore.activeId === id;

      setHistoryStore((prev) => {
        const updated = deleteEntry(prev, id);
        saveHistory(updated);
        return updated;
      });

      if (supabase && cloudSignedIn) {
        void deleteCloudHistoryEntry(id).catch((err) =>
          console.error('No se pudo eliminar el mapa en la nube.', err)
        );
      }

      if (wasActive) {
        setData(null);
        setCurrentStep(0);
        setIsComplete(false);
        setViewAll(false);
        setError(null);
        setPhase('input');
      }

      stepHaptic();
    },
    [historyStore.activeId, cloudSignedIn]
  );

  const handleRenameHistory = useCallback((id: string, title: string) => {
    setHistoryStore((prev) => {
      const updated = renameEntry(prev, id, title);
      saveHistory(updated);
      return updated;
    });
    stepHaptic();
  }, []);

  const handlePinHistory = useCallback((id: string) => {
    setHistoryStore((prev) => {
      const updated = togglePinEntry(prev, id);
      saveHistory(updated);
      return updated;
    });
    stepHaptic();
  }, []);

  const handleCompleteMap = useCallback(() => {
    setIsComplete(true);
    setEssentialsReview(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stepHaptic();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    const mapId = historyStore.activeId;
    if (!data || !mapId) return;

    try {
      const response = await fetch(apiUrl(`/api/maps/${mapId}/cheatsheet.pdf`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ map: data }),
      });

      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(err?.error || 'No se pudo generar la ficha.');
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64 = globalThis.btoa(binary);
      const filename = `${data.title || 'nucleo-cheatsheet'}.pdf`.replace(/[^\w.-]+/g, '-');
      const directory = cacheDirectory;
      if (!directory) throw new Error('No se pudo acceder al almacenamiento local.');
      const uri = `${directory}${filename}`;
      await writeAsStringAsync(uri, base64, {
        encoding: EncodingType.Base64,
      });

      await Share.share({
        url: uri,
        title: filename,
        message: filename,
      });
      stepHaptic();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo generar la ficha PDF.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [data, historyStore.activeId]);

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      inputText,
      setInputText,
      intent,
      setIntent,
      error,
      setError,
      data,
      historyStore,
      currentStep,
      isComplete,
      viewAll,
      historyOpen,
      setHistoryOpen,
      chatOpen,
      setChatOpen,
      authOpen,
      setAuthOpen,
      cloudUserEmail,
      cloudSignedIn,
      isCloudSyncConfigured,
      uploadedFile,
      attachMenuOpen,
      setAttachMenuOpen,
      modelPreference,
      setModelPreference,
      depthPreference,
      setDepthPreference,
      totalSteps,
      canSubmit,
      hideTextInput,
      composerPlaceholder,
      progressLabel,
      stepProgress,
      goToStep,
      toggleViewMode,
      handleCancelLoading,
      handlePickImage,
      handlePickCamera,
      handlePickPdf,
      handlePickVideo,
      removeUploadedFile,
      handleTransform,
      handleNewMap,
      handleSelectHistory,
      handleDeleteHistory,
      handleRenameHistory,
      handlePinHistory,
      handleCompleteMap,
      essentialsReview,
      setEssentialsReview,
      handleDownloadPdf,
      isStreamGenerating,
    }),
    [
      phase,
      inputText,
      intent,
      error,
      data,
      historyStore,
      currentStep,
      isComplete,
      viewAll,
      historyOpen,
      chatOpen,
      authOpen,
      cloudUserEmail,
      cloudSignedIn,
      uploadedFile,
      attachMenuOpen,
      modelPreference,
      totalSteps,
      canSubmit,
      hideTextInput,
      composerPlaceholder,
      progressLabel,
      stepProgress,
      goToStep,
      toggleViewMode,
      handleCancelLoading,
      handlePickImage,
      handlePickCamera,
      handlePickPdf,
      handlePickVideo,
      removeUploadedFile,
      handleTransform,
      handleNewMap,
      handleSelectHistory,
      handleDeleteHistory,
      handleRenameHistory,
      handlePinHistory,
      handleCompleteMap,
      essentialsReview,
      handleDownloadPdf,
      isStreamGenerating,
    ]
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (!context) throw new Error('useAppSession must be used within AppSessionProvider');
  return context;
}

================================================================================
FILE: mobile/src/context/AppVariantContext.tsx
================================================================================
import React, { createContext, useContext } from 'react';
import type { AppVariant } from '../logic/appVariant';

type AppVariantContextValue = {
  onVariantChange: (variant: AppVariant) => void;
};

const AppVariantContext = createContext<AppVariantContextValue | null>(null);

export function AppVariantProvider({
  children,
  onVariantChange,
}: {
  children: React.ReactNode;
  onVariantChange: (variant: AppVariant) => void;
}) {
  return (
    <AppVariantContext.Provider value={{ onVariantChange }}>{children}</AppVariantContext.Provider>
  );
}

export function useAppVariantSwitch() {
  const context = useContext(AppVariantContext);
  if (!context) throw new Error('useAppVariantSwitch must be used within AppVariantProvider');
  return context;
}

================================================================================
FILE: mobile/src/context/ThemeContext.tsx
================================================================================
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getStorage } from '@shared/storage';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(fallback: ThemeMode): ThemeMode {
  try {
    const stored = getStorage().getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return fallback;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const systemTheme: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
  const [theme, setTheme] = useState<ThemeMode>(() => readStoredTheme(systemTheme));

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        getStorage().setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

================================================================================
FILE: mobile/src/logic/apiBase.ts
================================================================================
import { createApiUrlResolver, DEFAULT_API_BASE } from '@shared/apiBase';

export { DEFAULT_API_BASE };

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (__DEV__) {
    return 'http://127.0.0.1:3000';
  }
  return DEFAULT_API_BASE;
}

export const apiUrl = createApiUrlResolver(getApiBaseUrl);

================================================================================
FILE: mobile/src/logic/appVariant.ts
================================================================================
export const APP_VARIANT_OPTIONS = [
  { id: 'classic', label: 'Clásica', hint: 'Mapas de acción paso a paso' },
  { id: 'comprension', label: 'Comprensión', hint: 'Lectura guiada con objetivos' },
] as const;

export type AppVariant = (typeof APP_VARIANT_OPTIONS)[number]['id'];

const STORAGE_KEY = 'nucleo-app-variant';

export function getAppVariant(): AppVariant {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'classic' || stored === 'comprension') return stored;
  return 'comprension';
}

export function saveAppVariant(variant: AppVariant): void {
  localStorage.setItem(STORAGE_KEY, variant);
}

export function switchAppVariant(next: AppVariant, onSwitch?: () => void): void {
  if (next === getAppVariant()) return;
  saveAppVariant(next);
  if (onSwitch) {
    onSwitch();
  }
}

================================================================================
FILE: mobile/src/logic/atomGeometry.ts
================================================================================
export * from '@shared/atomGeometry';

================================================================================
FILE: mobile/src/logic/attachments.ts
================================================================================
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type UploadedFile = {
  name: string;
  size: number;
  isPdf?: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  fileData?: string;
  mimeType?: string;
  previewUri?: string;
};

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOAD_SIZE_MESSAGE =
  'El archivo supera el límite de 15 MB. Prueba con un archivo más pequeño.';
export const LOCAL_FILE_READ_ERROR_MESSAGE =
  'No se pudo leer el archivo en el dispositivo. Prueba con otro archivo.';
export const UNSUPPORTED_IMAGE_MESSAGE = 'El archivo seleccionado no es una imagen.';

const IMAGE_MAX_DIMENSION = 1024;

function assertFileSize(size: number | undefined | null): void {
  if (size != null && size > MAX_UPLOAD_BYTES) {
    throw new Error(MAX_UPLOAD_SIZE_MESSAGE);
  }
}

async function processImageAsset(
  asset: ImagePicker.ImagePickerAsset
): Promise<UploadedFile> {
  assertFileSize(asset.fileSize);

  const width = asset.width ?? IMAGE_MAX_DIMENSION;
  const height = asset.height ?? IMAGE_MAX_DIMENSION;
  const maxDim = Math.max(width, height);
  const actions =
    maxDim > IMAGE_MAX_DIMENSION
      ? [
          {
            resize: {
              width: Math.round(width * (IMAGE_MAX_DIMENSION / maxDim)),
              height: Math.round(height * (IMAGE_MAX_DIMENSION / maxDim)),
            },
          },
        ]
      : [];

  const processed = await manipulateAsync(asset.uri, actions, {
    compress: 0.82,
    format: SaveFormat.JPEG,
    base64: true,
  });

  const base64 = processed.base64;
  if (!base64) {
    throw new Error('No se pudo procesar la imagen.');
  }

  return {
    name: asset.fileName || 'Imagen',
    size: asset.fileSize ?? Math.round(base64.length * 0.75),
    isImage: true,
    fileData: base64,
    mimeType: 'image/jpeg',
    previewUri: processed.uri,
  };
}

async function readPdfAttachment(
  uri: string,
  name: string,
  size: number | undefined | null
): Promise<UploadedFile> {
  assertFileSize(size);

  try {
    const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
    return {
      name,
      size: size ?? Math.round(base64.length * 0.75),
      isPdf: true,
      fileData: base64,
      mimeType: 'application/pdf',
    };
  } catch {
    throw new Error(LOCAL_FILE_READ_ERROR_MESSAGE);
  }
}

export async function pickPdfAttachment(): Promise<UploadedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const name = asset.name || 'Documento.pdf';
  const isPdf =
    asset.mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    throw new Error('Solo se admiten archivos PDF.');
  }

  return readPdfAttachment(asset.uri, name, asset.size);
}

export async function pickImageFromLibrary(): Promise<UploadedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Necesitamos acceso a la galería para adjuntar imágenes.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  if (asset.mimeType && !asset.mimeType.startsWith('image/')) {
    throw new Error(UNSUPPORTED_IMAGE_MESSAGE);
  }

  return processImageAsset(asset);
}

export async function pickImageFromCamera(): Promise<UploadedFile | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Necesitamos acceso a la cámara para tomar una foto.');
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  return processImageAsset(result.assets[0]);
}

export async function pickVideoFromLibrary(): Promise<UploadedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Necesitamos acceso a la galería para adjuntar videos.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 1,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  assertFileSize(asset.fileSize);

  try {
    const base64 = await readAsStringAsync(asset.uri, { encoding: EncodingType.Base64 });
    return {
      name: asset.fileName || 'Video',
      size: asset.fileSize ?? Math.round(base64.length * 0.75),
      isVideo: true,
      fileData: base64,
      mimeType: asset.mimeType || 'video/mp4',
      previewUri: asset.uri,
    };
  } catch {
    throw new Error(LOCAL_FILE_READ_ERROR_MESSAGE);
  }
}
================================================================================
FILE: mobile/src/logic/cloudHistory.ts
================================================================================
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { HistoryEntry, HistoryStore } from './history';
import { supabase } from './supabase';

function authRedirectUrl() {
  // Expo genera automáticamente la URL de redirección adecuada tanto para desarrollo (exp://...) como para prod
  return Linking.createURL('login-callback');
}

type CloudMap = {
  id: string;
  title: string;
  category: string | null;
  pinned_at: string | null;
  source_type: HistoryEntry['sourceType'];
  session: HistoryEntry['session'];
  created_at: string;
  updated_at: string;
};

function toCloudMap(entry: HistoryEntry) {
  return {
    id: entry.id,
    title: entry.title,
    category: entry.category ?? null,
    pinned_at: entry.pinnedAt ? new Date(entry.pinnedAt).toISOString() : null,
    source_type: entry.sourceType,
    session: entry.session,
    created_at: new Date(entry.createdAt).toISOString(),
    updated_at: new Date(entry.updatedAt).toISOString(),
  };
}

function fromCloudMap(map: CloudMap): HistoryEntry {
  return {
    id: map.id,
    title: map.title,
    category: map.category ?? undefined,
    pinned: Boolean(map.pinned_at),
    pinnedAt: map.pinned_at ? new Date(map.pinned_at).getTime() : undefined,
    sourceType: map.source_type,
    session: map.session,
    createdAt: new Date(map.created_at).getTime(),
    updatedAt: new Date(map.updated_at).getTime(),
  };
}

export async function signInWith(provider: 'google' | 'apple') {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectUrl(), skipBrowserRedirect: true },
  });
}

function paramFromUrl(url: string, key: string): string | undefined {
  // Los proveedores OAuth devuelven los parámetros en la query (?code=) o en el fragmento (#access_token=)
  const parsed = Linking.parse(url);
  const fromQuery = parsed.queryParams?.[key];
  if (typeof fromQuery === 'string') return fromQuery;

  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    const hashParams = new URLSearchParams(url.slice(hashIndex + 1));
    return hashParams.get(key) ?? undefined;
  }
  return undefined;
}

/**
 * Flujo OAuth completo para móvil: abre el navegador de autenticación del sistema,
 * recoge la redirección hacia la app y canjea el código/token por una sesión persistida.
 */
export async function signInWithProvider(provider: 'google' | 'apple') {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');

  const redirectTo = authRedirectUrl();
  const { data, error } = await signInWith(provider);
  if (error) throw error;
  if (!data?.url) throw new Error('No se pudo iniciar el acceso con el proveedor.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    // El usuario cerró el navegador o canceló: no es un error que mostrar
    return false;
  }

  const errorDescription = paramFromUrl(result.url, 'error_description');
  if (errorDescription) throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));

  const code = paramFromUrl(result.url, 'code');
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return true;
  }

  const accessToken = paramFromUrl(result.url, 'access_token');
  const refreshToken = paramFromUrl(result.url, 'refresh_token');
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
    return true;
  }

  throw new Error('No se recibió una sesión válida del proveedor.');
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('La sincronización todavía no está configurada.');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error('Revisa tu email para confirmar la cuenta, o usa Google para entrar al instante.');
  }
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function migrateLocalHistory(store: HistoryStore) {
  if (!supabase || store.entries.length === 0) return;
  const { error } = await supabase.from('maps').upsert(
    store.entries.map(toCloudMap),
    { onConflict: 'id', ignoreDuplicates: false }
  );
  if (error) throw error;
}

export async function pullCloudHistory(): Promise<HistoryEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('maps')
    .select('id,title,category,pinned_at,source_type,session,created_at,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as CloudMap[]).map(fromCloudMap);
}

export async function pushHistoryEntry(entry: HistoryEntry) {
  if (!supabase) return;
  const { error } = await supabase.from('maps').upsert(toCloudMap(entry), { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteCloudHistoryEntry(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from('maps').delete().eq('id', id);
  if (error) throw error;
}

================================================================================
FILE: mobile/src/logic/cloudUserProfile.ts
================================================================================
import type { User } from '@supabase/supabase-js';

export type CloudUserProfile = {
  email?: string | null;
  avatarUrl?: string | null;
};

export function toCloudUserProfile(user: User): CloudUserProfile {
  const metadata = user.user_metadata ?? {};
  const avatarUrl =
    (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
    (typeof metadata.picture === 'string' && metadata.picture) ||
    null;

  return {
    email: user.email,
    avatarUrl,
  };
}

================================================================================
FILE: mobile/src/logic/contracts.ts
================================================================================
export * from '@shared/contracts';

================================================================================
FILE: mobile/src/logic/depthPreference.ts
================================================================================
export * from '@shared/depthPreference';

================================================================================
FILE: mobile/src/logic/history.ts
================================================================================
export * from '@shared/history';

================================================================================
FILE: mobile/src/logic/mapData.ts
================================================================================
export * from '@shared/mapData';

================================================================================
FILE: mobile/src/logic/modelPreference.ts
================================================================================
export * from '@shared/modelPreference';

================================================================================
FILE: mobile/src/logic/supabase.ts
================================================================================
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Inicializamos el cliente Supabase configurando AsyncStorage para la sesión nativa
export const supabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const isCloudSyncConfigured = Boolean(supabase);

================================================================================
FILE: mobile/src/logic/transformStream.ts
================================================================================
export * from '@shared/transformStream';

================================================================================
FILE: mobile/src/logic/urlInput.ts
================================================================================
export * from '@shared/urlInput';

================================================================================
FILE: mobile/src/logic/youtube.ts
================================================================================
export * from '@shared/youtube';

================================================================================
FILE: mobile/src/navigation/PhaseRouter.tsx
================================================================================
import React from 'react';
import { useAppSession } from '../context/AppSessionContext';
import InputScreen from '../screens/InputScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ResultScreen from '../screens/ResultScreen';
import ClassicInputScreen from '../screens/classic/ClassicInputScreen';
import ClassicResultScreen from '../screens/classic/ClassicResultScreen';

export function ComprensionPhaseRouter() {
  const { phase } = useAppSession();

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'result') return <ResultScreen />;
  return <InputScreen />;
}

export function ClassicPhaseRouter() {
  const { phase } = useAppSession();

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'result') return <ClassicResultScreen />;
  return <ClassicInputScreen />;
}

================================================================================
FILE: mobile/src/screens/ComprensionApp.tsx
================================================================================
import React from 'react';
import { View } from 'react-native';
import AuthSheet from '../components/AuthSheet';
import HistoryDrawer from '../components/HistoryDrawer';
import { useAppSession } from '../context/AppSessionContext';
import { useTheme } from '../context/ThemeContext';
import { ComprensionPhaseRouter } from '../navigation/PhaseRouter';

export default function ComprensionApp() {
  const session = useAppSession();
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
      <ComprensionPhaseRouter />

      <HistoryDrawer
        open={session.historyOpen}
        entries={session.historyStore.entries}
        activeId={session.historyStore.activeId}
        phase={session.phase}
        data={session.data}
        currentStep={session.currentStep}
        isComplete={session.isComplete}
        viewAll={session.viewAll}
        totalSteps={session.totalSteps}
        onClose={() => session.setHistoryOpen(false)}
        onOpen={() => session.setHistoryOpen(true)}
        onSelect={session.handleSelectHistory}
        onDelete={session.handleDeleteHistory}
        onRename={session.handleRenameHistory}
        onTogglePin={session.handlePinHistory}
        onGoToStep={session.goToStep}
        onToggleViewMode={session.toggleViewMode}
        onNewMap={session.handleNewMap}
      />

      <AuthSheet
        visible={session.authOpen}
        userEmail={session.cloudUserEmail}
        onClose={() => session.setAuthOpen(false)}
      />
    </View>
  );
}

================================================================================
FILE: mobile/src/screens/InputScreen.tsx
================================================================================
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, BookOpen, File, GraduationCap, ListChecks, X } from 'lucide-react-native';
import AttachMenu from '../components/AttachMenu';
import AtomCanvasIcon from '../components/AtomCanvasIcon';
import ComposerSurface from '../components/ComposerSurface';
import GlassSurface from '../components/GlassSurface';
import MenuTwoLines from '../components/MenuTwoLines';
import ModelChip from '../components/ModelChip';
import ProfileMenu from '../components/ProfileMenu';
import { useTheme } from '../context/ThemeContext';
import { stepHaptic, useAppSession } from '../context/AppSessionContext';
import { DEPTH_OPTIONS } from '../logic/depthPreference';
import type { MapIntent } from '../logic/contracts';

const INTENT_OPTIONS: Array<{
  id: MapIntent;
  title: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    id: 'understand',
    title: 'Comprender',
    description: 'Idea central, contexto, argumentos y matices.',
    icon: BookOpen,
  },
  {
    id: 'study',
    title: 'Estudiar',
    description: 'Conceptos, relaciones y repaso para retener.',
    icon: GraduationCap,
  },
  {
    id: 'apply',
    title: 'Aplicar',
    description: 'Decisiones, pasos, riesgos y siguiente acción.',
    icon: ListChecks,
  },
];

export default function InputScreen() {
  const session = useAppSession();
  const { isDark } = useTheme();
  const canSend = session.canSubmit && session.phase !== 'loading';

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View className="flex-1 justify-between px-4 pb-4">
          <View className="flex-row justify-between items-center gap-2 pt-2">
            <Pressable
              onPress={() => session.setHistoryOpen(true)}
              className="w-10 h-10 rounded-full items-center justify-center bg-neutral-500/10 dark:bg-white/10"
              accessibilityLabel="Abrir navegacion"
            >
              <MenuTwoLines size={18} color="#525252" />
            </Pressable>
            <ProfileMenu />
          </View>

          <ScrollView className="flex-1" contentContainerClassName="items-center justify-center px-2 py-6">
            <AtomCanvasIcon size={112} />
            <Text className="mt-4 text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 text-center">
              ¿Qué quieres entender?
            </Text>
            <Text className="mt-3 text-base text-neutral-600 dark:text-neutral-300 text-center leading-6 max-w-md">
              Pega, adjunta o enlaza una fuente. La convertiré en una lectura clara, completa y hecha para tu objetivo.
            </Text>

            <View className="mt-6 w-full max-w-xl gap-3">
              {INTENT_OPTIONS.map((option) => {
                const isActive = session.intent === option.id;
                const Icon = option.icon;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      session.setIntent(option.id);
                      stepHaptic();
                    }}
                    className="rounded-[28px] overflow-hidden"
                  >
                    <GlassSurface
                      className="rounded-[28px]"
                      overlayClassName={
                        isActive
                          ? 'bg-indigo-50/70 dark:bg-indigo-500/10'
                          : 'bg-white/30 dark:bg-white/[0.03]'
                      }
                    >
                      <View className="px-5 py-5">
                        <View className="flex-row items-center gap-3">
                          <View
                            className={`w-8 h-8 rounded-full items-center justify-center ${
                              isActive
                                ? 'bg-indigo-500/15 dark:bg-indigo-400/20'
                                : 'bg-neutral-500/10 dark:bg-neutral-500/20'
                            }`}
                          >
                            <Icon size={16} color={isActive ? '#4f46e5' : '#737373'} />
                          </View>
                          <Text
                            className={`text-[15px] font-bold tracking-tight ${
                              isActive
                                ? 'text-indigo-900 dark:text-indigo-200'
                                : 'text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {option.title}
                          </Text>
                        </View>
                        <Text className="mt-3 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400 font-medium">
                          {option.description}
                        </Text>
                      </View>
                    </GlassSurface>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-4 w-full max-w-md flex-row gap-1 rounded-xl bg-neutral-100/80 dark:bg-white/5 p-1">
              {DEPTH_OPTIONS.map((option) => {
                const isActive = session.depthPreference === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => session.setDepthPreference(option.id)}
                    disabled={session.phase === 'loading'}
                    className={`flex-1 rounded-lg px-3 py-2 ${
                      isActive ? 'bg-white dark:bg-neutral-800 shadow-sm' : ''
                    } ${session.phase === 'loading' ? 'opacity-50' : ''}`}
                    accessibilityLabel={option.hint}
                  >
                    <Text
                      className={`text-xs font-semibold text-center ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {session.error ? (
              <View className="mt-5 w-full max-w-xl rounded-2xl overflow-hidden">
                <GlassSurface className="rounded-2xl">
                  <View className="px-4 py-3">
                    <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {session.error}
                    </Text>
                  </View>
                </GlassSurface>
              </View>
            ) : null}
          </ScrollView>

          <ComposerSurface>
            {session.uploadedFile ? (
                <View className="px-4 pt-4 pb-1">
                  {session.uploadedFile.isImage && session.uploadedFile.previewUri ? (
                    <View className="relative self-start">
                      <Image
                        source={{ uri: session.uploadedFile.previewUri }}
                        accessibilityLabel={session.uploadedFile.name}
                        className="w-16 h-16 rounded-xl border border-neutral-200 dark:border-white/10"
                      />
                      <Pressable
                        onPress={session.removeUploadedFile}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-800 items-center justify-center"
                      >
                        <X size={12} color="#fff" />
                      </Pressable>
                    </View>
                  ) : (
                    <View
                      className={`flex-row items-center gap-2 self-start max-w-full px-3 py-1.5 rounded-full ${
                        isDark ? 'bg-white/10' : 'bg-neutral-100 dark:bg-white/5'
                      }`}
                    >
                      <File size={16} color={isDark ? '#d4d4d4' : '#737373'} />
                      <Text
                        className={`text-sm flex-shrink ${
                          isDark ? 'text-neutral-200' : 'text-neutral-700 dark:text-neutral-300'
                        }`}
                        numberOfLines={1}
                      >
                        {session.uploadedFile.name}
                      </Text>
                      <Pressable onPress={session.removeUploadedFile} className="p-0.5 rounded-full">
                        <X size={14} color={isDark ? '#d4d4d4' : '#737373'} />
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : null}

              {!session.hideTextInput ? (
                <TextInput
                  value={session.inputText}
                  onChangeText={session.setInputText}
                  placeholder={session.composerPlaceholder}
                  placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
                  multiline
                  textAlignVertical="top"
                  className={`min-h-[88px] max-h-40 px-4 py-3 text-base ${
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  }`}
                />
              ) : null}

              <View className="flex-row items-center justify-between px-3 pb-3 pt-1">
                <AttachMenu
                  open={session.attachMenuOpen}
                  onToggle={() => session.setAttachMenuOpen(!session.attachMenuOpen)}
                  onPickImage={() => void session.handlePickImage()}
                  onPickCamera={() => void session.handlePickCamera()}
                  onPickPdf={() => void session.handlePickPdf()}
                  onPickVideo={() => void session.handlePickVideo()}
                  disabled={session.phase === 'loading'}
                  darkSurface={isDark}
                />
                <View className="flex-row items-center gap-2">
                  <ModelChip
                    value={session.modelPreference}
                    onChange={session.setModelPreference}
                    disabled={session.phase === 'loading'}
                  />
                  <Pressable
                    onPress={() => void session.handleTransform()}
                    disabled={!canSend}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      canSend
                        ? 'bg-indigo-500/15 dark:bg-indigo-400/20 active:opacity-80'
                        : 'bg-neutral-500/10 dark:bg-neutral-500/20 opacity-40'
                    }`}
                    accessibilityLabel="Enviar"
                  >
                    <ArrowUp size={20} color={canSend ? '#4f46e5' : '#a3a3a3'} />
                  </Pressable>
                </View>
              </View>
            </ComposerSurface>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

================================================================================
FILE: mobile/src/screens/LoadingScreen.tsx
================================================================================
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingState from '../components/LoadingState';
import { useAppSession } from '../context/AppSessionContext';

export default function LoadingScreen() {
  const { handleCancelLoading } = useAppSession();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <LoadingState onCancel={handleCancelLoading} />
    </SafeAreaView>
  );
}

================================================================================
FILE: mobile/src/screens/ResultScreen.tsx
================================================================================
import React, { useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  Download,
  Layers,
  List,
  MessageSquareText,
  SquarePen,
} from 'lucide-react-native';
import AppIcon from '../components/AppIcon';
import MapChatSheet from '../components/MapChatSheet';
import ReadingProgressBar from '../components/ReadingProgressBar';
import StepContentBlocks from '../components/StepContentBlocks';
import { stepHaptic, useAppSession } from '../context/AppSessionContext';
import type { SourceReference } from '../logic/contracts';

function parseTotalMinutes(steps: Array<{ time?: string }> | undefined): number | null {
  if (!steps?.length) return null;
  let total = 0;
  let found = false;
  for (const step of steps) {
    const match = String(step.time || '').match(/(\d+)\s*min/i);
    if (match) {
      total += parseInt(match[1] ?? '0', 10);
      found = true;
    }
  }
  return found ? total : null;
}

function ReferencesChips({ references }: { references?: SourceReference[] }) {
  if (!references?.length) return null;

  return (
    <View className="mt-4 flex-row flex-wrap gap-2">
      {references.slice(0, 3).map((reference, idx) => (
        <View
          key={`${reference.label}-${reference.locator}-${idx}`}
          className="flex-row items-center gap-1.5 rounded-full border border-neutral-300 dark:border-white/12 px-2.5 py-1"
        >
          <Text className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            {reference.label}
          </Text>
          <Text className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            {reference.locator}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function ResultScreen() {
  const session = useAppSession();
  const { data } = session;
  const [scrollProgress, setScrollProgress] = useState(0);

  const showStepFooter = !session.viewAll && !session.isComplete;
  const totalMinutes = useMemo(() => parseTotalMinutes(data?.steps), [data?.steps]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!session.viewAll) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const ratio = maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, contentOffset.y / maxScroll));
    setScrollProgress(ratio);
  };

  const stepKey = useMemo(
    () => `${session.currentStep}-${session.viewAll}-${session.isComplete}-${session.essentialsReview}`,
    [session.currentStep, session.essentialsReview, session.isComplete, session.viewAll]
  );

  if (!data) return null;

  const renderResumen = (interactive = false) => (
    <Pressable
      disabled={!interactive}
      onPress={interactive ? () => session.goToStep(0, true) : undefined}
      className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10' : 'mb-8'}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <AppIcon size={20} color="#1A1A1A" />
        <Text className="text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-neutral-100">
          Idea central
        </Text>
      </View>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9">{data.coreIdea}</Text>
      {data.coreSupport ? (
        <Text className="mt-4 text-lg leading-7 text-neutral-700 dark:text-neutral-400">{data.coreSupport}</Text>
      ) : null}

      {data.sourceMetadata ? (
        <View className="mt-8 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-5 py-4">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Fuente detectada
            </Text>
            <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {data.sourceMetadata.label}
            </Text>
          </View>
          {data.sourceMetadata.detected?.length ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {data.sourceMetadata.detected.map((item, index) => (
                <View
                  key={`${item}-${index}`}
                  className="rounded-full bg-neutral-100 dark:bg-white/[0.05] px-2.5 py-1"
                >
                  <Text className="text-xs text-neutral-600 dark:text-neutral-300">{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {data.coverage?.summary ? (
            <Text className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {data.coverage.summary}
            </Text>
          ) : null}
          {data.coverage?.notes?.length ? (
            <View className="mt-3 gap-2">
              {data.coverage.notes.slice(0, 3).map((note, index) => (
                <View key={`${note.label}-${index}`} className="flex-row gap-2">
                  <CircleAlert
                    size={16}
                    color={note.tone === 'warning' ? '#d97706' : '#a3a3a3'}
                    style={{ marginTop: 2 }}
                  />
                  <Text className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    <Text className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {note.label}.{' '}
                    </Text>
                    {note.detail}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {data.references?.length ? (
        <View className="mt-6">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Referencias visibles
          </Text>
          <ReferencesChips references={data.references} />
        </View>
      ) : null}

      {data.tldr?.length ? (
        <View className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
          <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
            En 60 segundos
          </Text>
          {data.tldr.map((item, i) => (
            <View key={i} className="flex-row gap-4 items-start mb-6">
              <View className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-white/10 items-center justify-center">
                <Text className="text-sm font-bold text-neutral-400">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {item.title}
                </Text>
                <Text className="text-base leading-6 text-neutral-700 dark:text-neutral-300">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );

  const renderStep = (stepIndex: number, interactive = false) => {
    const step = data.steps[stepIndex - 1];
    if (!step) return null;

    return (
      <Pressable
        key={step.id || stepIndex}
        disabled={!interactive}
        onPress={interactive ? () => session.goToStep(stepIndex, true) : undefined}
        className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10 last:border-0' : ''}
      >
        <View className="flex-row flex-wrap items-center gap-2 mb-4">
          <Text className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Paso {stepIndex} de {session.totalSteps}
          </Text>
          {step.time ? <Text className="text-sm text-neutral-500 dark:text-neutral-400">{step.time}</Text> : null}
        </View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9 mb-4">{step.title}</Text>
        {step.purpose ? (
          <Text className="text-base leading-7 text-neutral-600 dark:text-neutral-300 mb-4">{step.purpose}</Text>
        ) : null}
        <StepContentBlocks blocks={step.content} />
        <ReferencesChips references={step.references} />
      </Pressable>
    );
  };

  const renderEssentialsReview = () => {
    const takeaways =
      data.completionCard?.takeaways?.length
        ? data.completionCard.takeaways
        : data.tldr?.map((item) => `${item.title}: ${item.desc}`) ?? [];

    return (
      <View className="py-6">
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">Repaso esencial</Text>
        <Text className="mt-6 text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">{data.coreIdea}</Text>
        {takeaways.length ? (
          <View className="mt-8 rounded-3xl bg-white dark:bg-white/[0.03] px-5 py-5">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
              Para recordar
            </Text>
            {takeaways.slice(0, 7).map((item, index) => (
              <View key={`${item}-${index}`} className="flex-row gap-3 mt-4">
                <View className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                <Text className="flex-1 text-base leading-6 text-neutral-700 dark:text-neutral-200">{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View className="mt-10 flex-row flex-wrap gap-3">
          <Pressable
            onPress={() => session.setEssentialsReview(false)}
            className="px-5 py-3 rounded-2xl border border-neutral-200 dark:border-white/10"
          >
            <Text className="font-semibold text-neutral-700 dark:text-neutral-300">Volver al mapa completado</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              session.setEssentialsReview(false);
              session.goToStep(0);
            }}
            className="px-5 py-3 rounded-2xl border border-neutral-200 dark:border-white/10"
          >
            <Text className="font-semibold text-neutral-700 dark:text-neutral-300">Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCompletion = () => (
    <View className="py-6">
      <View className="flex-row items-center gap-2 mb-4">
        <CheckCircle2 size={16} color="#4f46e5" />
        <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400">Mapa completado</Text>
      </View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
        {data.completionCard?.title || 'Has terminado esta lectura'}
      </Text>
      <Text className="mt-4 text-lg leading-7 text-neutral-600 dark:text-neutral-300">
        {data.completionCard?.summary || 'Aquí tienes lo esencial para retomarlo con rapidez.'}
      </Text>
      {data.completionCard?.takeaways?.length ? (
        <View className="mt-8 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-5 py-5">
          <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Para recordar
          </Text>
          {data.completionCard.takeaways.slice(0, 7).map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row gap-3 mt-4">
              <View className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <Text className="flex-1 text-base leading-6 text-neutral-700 dark:text-neutral-200">{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-10 flex-row flex-wrap gap-3">
        {[
          {
            label: 'Repasar lo esencial',
            onPress: () => session.setEssentialsReview(true),
          },
          {
            label: 'Volver al inicio',
            onPress: () => {
              session.setEssentialsReview(false);
              session.goToStep(0);
            },
          },
          {
            label: 'Guardar ficha PDF',
            icon: Download,
            onPress: () => void session.handleDownloadPdf(),
          },
          {
            label: 'Preguntar',
            icon: MessageSquareText,
            onPress: () => {
              session.setChatOpen(true);
              stepHaptic();
            },
          },
          {
            label: 'Nuevo mapa',
            icon: SquarePen,
            primary: true,
            onPress: session.handleNewMap,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              className={`w-[48%] px-4 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
                action.primary
                  ? 'bg-indigo-600 active:bg-indigo-700'
                  : 'border border-neutral-200 dark:border-white/10'
              }`}
            >
              {Icon ? <Icon size={16} color={action.primary ? '#fff' : '#525252'} /> : null}
              <Text
                className={`font-semibold text-center ${
                  action.primary ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
      <ReadingProgressBar
        viewAll={session.viewAll}
        isComplete={session.isComplete}
        stepProgress={session.stepProgress}
        progressLabel={session.progressLabel}
        scrollProgress={scrollProgress}
        onToggleSidebar={() => session.setHistoryOpen(true)}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-5 pb-8"
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-300">
              {data.title}
            </Text>
            {session.isStreamGenerating ? (
              <Text className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                Generando mapa…
              </Text>
            ) : null}
            {!session.isComplete && totalMinutes !== null ? (
              <View className="mt-2 flex-row items-center gap-1.5">
                <Clock size={16} color="#4338ca" />
                <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  ~{totalMinutes} min
                </Text>
              </View>
            ) : null}
          </View>

          {!session.isComplete ? (
            <Pressable
              onPress={session.toggleViewMode}
              className={`flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-xl border mb-4 ${
                session.viewAll
                  ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
                  : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
              }`}
            >
              {session.viewAll ? <List size={16} color="#4f46e5" /> : <Layers size={16} color="#737373" />}
              <Text
                className={`text-sm font-semibold ${
                  session.viewAll ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {session.viewAll ? 'Paso a paso' : 'Lectura completa'}
              </Text>
            </Pressable>
          ) : null}

          <Animated.View key={stepKey} entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)}>
            {session.isComplete ? (
              session.essentialsReview ? renderEssentialsReview() : renderCompletion()
            ) : session.viewAll ? (
              <>
                {renderResumen(true)}
                {data.steps.map((_, idx) => renderStep(idx + 1, true))}
              </>
            ) : session.currentStep === 0 ? (
              renderResumen(false)
            ) : (
              renderStep(session.currentStep, false)
            )}
          </Animated.View>
        </ScrollView>

        {showStepFooter ? (
          <View className="border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 pt-4 pb-2">
            {session.currentStep === 0 ? (
              <Pressable
                onPress={() => session.goToStep(1)}
                className="w-full bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Text className="text-white font-bold text-lg">Empezar a leer</Text>
                <ArrowRight size={20} color="#fff" />
              </Pressable>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => session.goToStep(session.currentStep - 1)}
                  className="flex-1 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center justify-center"
                >
                  <Text className="font-bold text-neutral-700 dark:text-neutral-300">Atrás</Text>
                </Pressable>
                {session.currentStep < session.totalSteps ? (
                  <Pressable
                    onPress={() => session.goToStep(session.currentStep + 1)}
                    className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Text className="text-white font-bold text-lg">Siguiente</Text>
                    <ArrowRight size={20} color="#fff" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={session.handleCompleteMap}
                    className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Check size={20} color="#fff" />
                    <Text className="text-white font-bold text-lg">Completar mapa</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ) : null}
      </View>

      {session.historyStore.activeId ? (
        <MapChatSheet
          visible={session.chatOpen}
          onClose={() => session.setChatOpen(false)}
          mapId={session.historyStore.activeId}
          mapData={data}
        />
      ) : null}
    </SafeAreaView>
  );
}

================================================================================
FILE: mobile/src/screens/classic/ClassicInputScreen.tsx
================================================================================
import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowUp, File, X } from 'lucide-react-native';
import AttachMenu from '../../components/AttachMenu';
import ComposerSurface from '../../components/ComposerSurface';
import GlassSurface from '../../components/GlassSurface';
import MenuTwoLines from '../../components/MenuTwoLines';
import ModelChip from '../../components/ModelChip';
import NucleoIcon from '../../components/NucleoIcon';
import ProfileMenu from '../../components/ProfileMenu';
import { useTheme } from '../../context/ThemeContext';
import { useAppSession } from '../../context/AppSessionContext';

export default function ClassicInputScreen() {
  const session = useAppSession();
  const { isDark } = useTheme();
  const canSend = session.canSubmit && session.phase !== 'loading';
  const composerPlaceholder = session.uploadedFile?.isImage
    ? 'Añade una indicación (opcional)…'
    : session.uploadedFile
      ? 'Archivo adjunto listo para transformar'
      : 'Pega texto, un enlace de YouTube o una transcripción…';

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View className="flex-1 justify-between px-4 pb-4">
          <View className="flex-row justify-between items-center gap-2 pt-2">
            <Pressable
              onPress={() => session.setHistoryOpen(true)}
              className="w-10 h-10 rounded-full items-center justify-center bg-neutral-500/10 dark:bg-white/10"
              accessibilityLabel="Abrir navegacion"
            >
              <MenuTwoLines size={18} color="#525252" />
            </Pressable>
            <ProfileMenu />
          </View>

          <ScrollView className="flex-1" contentContainerClassName="items-center justify-center px-2 py-6">
            <NucleoIcon interactive={false} />
            <Text className="mt-4 text-3xl font-black tracking-tight text-neutral-900 dark:text-neutral-100 text-center">
              ¿Qué me cuentas?
            </Text>
            <Text className="mt-3 text-base text-neutral-600 dark:text-neutral-400 text-center leading-6 max-w-md">
              Convierte{' '}
              <Text className="font-bold text-neutral-900 dark:text-neutral-100">caos en mapas de acción</Text>
              . Directo al punto.
            </Text>

            {session.error ? (
              <View className="mt-5 w-full max-w-xl rounded-2xl overflow-hidden">
                <GlassSurface className="rounded-2xl">
                  <View className="px-4 py-3">
                    <Text className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {session.error}
                    </Text>
                  </View>
                </GlassSurface>
              </View>
            ) : null}
          </ScrollView>

          <ComposerSurface>
            {session.uploadedFile ? (
                <View className="px-4 pt-4 pb-1">
                  {session.uploadedFile.isImage && session.uploadedFile.previewUri ? (
                    <View className="relative self-start">
                      <Image
                        source={{ uri: session.uploadedFile.previewUri }}
                        accessibilityLabel={session.uploadedFile.name}
                        className="w-16 h-16 rounded-xl border border-neutral-200 dark:border-white/10"
                      />
                      <Pressable
                        onPress={session.removeUploadedFile}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-neutral-800 items-center justify-center"
                      >
                        <X size={12} color="#fff" />
                      </Pressable>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2 self-start max-w-full px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/5">
                      <File size={16} color="#737373" />
                      <Text className="text-sm text-neutral-700 dark:text-neutral-300 flex-shrink" numberOfLines={1}>
                        {session.uploadedFile.name}
                      </Text>
                      <Pressable onPress={session.removeUploadedFile} className="p-0.5 rounded-full">
                        <X size={14} color="#737373" />
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : null}

              {!session.hideTextInput ? (
                <TextInput
                  value={session.inputText}
                  onChangeText={session.setInputText}
                  placeholder={composerPlaceholder}
                  placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
                  multiline
                  textAlignVertical="top"
                  className={`min-h-[88px] max-h-40 px-4 py-3 text-base ${
                    isDark ? 'text-neutral-200' : 'text-neutral-800'
                  }`}
                />
              ) : null}

              <View className="flex-row items-center justify-between px-3 pb-3 pt-1">
                <AttachMenu
                  open={session.attachMenuOpen}
                  onToggle={() => session.setAttachMenuOpen(!session.attachMenuOpen)}
                  onPickImage={() => void session.handlePickImage()}
                  onPickCamera={() => void session.handlePickCamera()}
                  onPickPdf={() => void session.handlePickPdf()}
                  onPickVideo={() => void session.handlePickVideo()}
                  disabled={session.phase === 'loading'}
                  darkSurface={isDark}
                />
                <View className="flex-row items-center gap-2">
                  <ModelChip
                    value={session.modelPreference}
                    onChange={session.setModelPreference}
                    disabled={session.phase === 'loading'}
                  />
                  <Pressable
                    onPress={() => void session.handleTransform()}
                    disabled={!canSend}
                    accessibilityLabel="Transformar"
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      canSend
                        ? 'bg-indigo-500/15 dark:bg-indigo-400/20 active:opacity-80'
                        : 'bg-neutral-500/10 dark:bg-neutral-500/20 opacity-40'
                    }`}
                  >
                    <ArrowUp size={20} color={canSend ? '#4f46e5' : '#a3a3a3'} />
                  </Pressable>
                </View>
              </View>
            </ComposerSurface>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

================================================================================
FILE: mobile/src/screens/classic/ClassicResultScreen.tsx
================================================================================
import React, { useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  List,
  SquarePen,
} from 'lucide-react-native';
import AppIcon from '../../components/AppIcon';
import ReadingProgressBar from '../../components/ReadingProgressBar';
import StepContentBlocks from '../../components/StepContentBlocks';
import { useAppSession } from '../../context/AppSessionContext';

function parseTotalMinutes(steps: Array<{ time?: string }> | undefined): number | null {
  if (!steps?.length) return null;
  let total = 0;
  let found = false;
  for (const step of steps) {
    const match = String(step.time || '').match(/(\d+)\s*min/i);
    if (match) {
      total += parseInt(match[1] ?? '0', 10);
      found = true;
    }
  }
  return found ? total : null;
}

export default function ClassicResultScreen() {
  const session = useAppSession();
  const { data } = session;
  const [scrollProgress, setScrollProgress] = useState(0);
  const showStepFooter = !session.viewAll && !session.isComplete;
  const totalMinutes = useMemo(() => parseTotalMinutes(data?.steps), [data?.steps]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!session.viewAll) return;
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const ratio = maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, contentOffset.y / maxScroll));
    setScrollProgress(ratio);
  };

  const stepKey = useMemo(
    () => `${session.currentStep}-${session.viewAll}-${session.isComplete}`,
    [session.currentStep, session.isComplete, session.viewAll]
  );

  if (!data) return null;

  const renderResumen = (interactive = false) => (
    <Pressable
      disabled={!interactive}
      onPress={interactive ? () => session.goToStep(0, true) : undefined}
      className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10' : 'mb-8'}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <AppIcon size={20} color="#1A1A1A" />
        <Text className="text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-neutral-100">
          El Nucleo
        </Text>
      </View>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9">{data.coreIdea}</Text>
      {data.coreSupport ? (
        <Text className="mt-4 text-lg leading-7 text-neutral-700 dark:text-neutral-400">{data.coreSupport}</Text>
      ) : null}

      {data.tldr?.length ? (
        <View className="mt-8 pt-8 border-t border-neutral-200 dark:border-white/10">
          <Text className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
            Desglose Rápido (TL;DR)
          </Text>
          {data.tldr.map((item, i) => (
            <View key={i} className="flex-row gap-4 items-start mb-6">
              <View className="w-8 h-8 rounded-full border-2 border-neutral-200 dark:border-white/10 items-center justify-center">
                <Text className="text-sm font-bold text-neutral-400">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {item.title}
                </Text>
                <Text className="text-base leading-6 text-neutral-700 dark:text-neutral-300">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );

  const renderStep = (stepIndex: number, interactive = false) => {
    const step = data.steps[stepIndex - 1];
    if (!step) return null;

    return (
      <Pressable
        key={step.id || stepIndex}
        disabled={!interactive}
        onPress={interactive ? () => session.goToStep(stepIndex, true) : undefined}
        className={interactive ? 'mb-8 pb-8 border-b border-neutral-200 dark:border-white/10 last:border-0' : ''}
      >
        <View className="flex-row flex-wrap items-center gap-2 mb-4">
          <Text className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Paso {stepIndex} de {session.totalSteps}
          </Text>
          {step.time ? <Text className="text-sm text-neutral-500 dark:text-neutral-400">{step.time}</Text> : null}
        </View>
        <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-9 mb-4">{step.title}</Text>
        <StepContentBlocks blocks={step.content} />
      </Pressable>
    );
  };

  const renderCompletion = () => (
    <View className="py-10 items-center">
      <View className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/15 items-center justify-center mb-8">
        <CheckCircle2 size={40} color="#059669" />
      </View>
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 text-center">
        ¡Lo lograste!
      </Text>
      <Text className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 text-center leading-7 px-4">
        Has completado los {session.totalSteps} pasos de este mapa de acción.
      </Text>
      <View className="mt-10 w-full gap-3">
        <Pressable
          onPress={() => session.goToStep(0)}
          className="px-6 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center"
        >
          <Text className="font-bold text-neutral-700 dark:text-neutral-300">Repasar desde el inicio</Text>
        </Pressable>
        <Pressable
          onPress={session.handleNewMap}
          className="px-6 py-4 rounded-xl bg-indigo-600 active:bg-indigo-700 flex-row items-center justify-center gap-2"
        >
          <SquarePen size={20} color="#fff" />
          <Text className="font-bold text-white">Nuevo mapa</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900" edges={['top', 'left', 'right']}>
      <ReadingProgressBar
        viewAll={session.viewAll}
        isComplete={session.isComplete}
        stepProgress={session.stepProgress}
        progressLabel={session.progressLabel}
        scrollProgress={scrollProgress}
        onToggleSidebar={() => session.setHistoryOpen(true)}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-5 pb-8"
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              {data.title}
            </Text>
            {!session.isComplete && totalMinutes !== null ? (
              <View className="mt-2 flex-row items-center gap-1.5">
                <Clock size={16} color="#4338ca" />
                <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  ~{totalMinutes} min
                </Text>
              </View>
            ) : null}
          </View>

          {!session.isComplete ? (
            <Pressable
              onPress={session.toggleViewMode}
              className={`flex-row items-center justify-center gap-2 px-3 py-2.5 rounded-xl border mb-4 ${
                session.viewAll
                  ? 'bg-indigo-100 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
                  : 'border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800/60'
              }`}
            >
              {session.viewAll ? <List size={16} color="#4f46e5" /> : <Layers size={16} color="#737373" />}
              <Text
                className={`text-sm font-semibold ${
                  session.viewAll ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {session.viewAll ? 'Paso a paso' : 'Lectura completa'}
              </Text>
            </Pressable>
          ) : null}

          <Animated.View key={stepKey} entering={FadeIn.duration(220)} exiting={FadeOut.duration(180)}>
            {session.isComplete ? (
              renderCompletion()
            ) : session.viewAll ? (
              <>
                {renderResumen(true)}
                {data.steps.map((_, idx) => renderStep(idx + 1, true))}
              </>
            ) : session.currentStep === 0 ? (
              renderResumen(false)
            ) : (
              renderStep(session.currentStep, false)
            )}
          </Animated.View>
        </ScrollView>

        {showStepFooter ? (
          <View className="border-t border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 pt-4 pb-2">
            {session.currentStep === 0 ? (
              <Pressable
                onPress={() => session.goToStep(1)}
                className="w-full bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Text className="text-white font-bold text-lg">Empezar a leer</Text>
                <ArrowRight size={20} color="#fff" />
              </Pressable>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => session.goToStep(session.currentStep - 1)}
                  className="flex-1 py-4 rounded-xl border border-neutral-200 dark:border-white/10 items-center justify-center"
                >
                  <Text className="font-bold text-neutral-700 dark:text-neutral-300">Atrás</Text>
                </Pressable>
                {session.currentStep < session.totalSteps ? (
                  <Pressable
                    onPress={() => session.goToStep(session.currentStep + 1)}
                    className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Text className="text-white font-bold text-lg">Siguiente</Text>
                    <ArrowRight size={20} color="#fff" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={session.handleCompleteMap}
                    className="flex-[2] bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <Check size={20} color="#fff" />
                    <Text className="text-white font-bold text-lg">Finalizar</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

================================================================================
FILE: mobile/src/screens/classic/ClassicShell.tsx
================================================================================
import React from 'react';
import { View } from 'react-native';
import AuthSheet from '../../components/AuthSheet';
import HistoryDrawer from '../../components/HistoryDrawer';
import { useAppSession } from '../../context/AppSessionContext';
import { useTheme } from '../../context/ThemeContext';
import { ClassicPhaseRouter } from '../../navigation/PhaseRouter';

export default function ClassicShell() {
  const session = useAppSession();
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
      <ClassicPhaseRouter />

      <HistoryDrawer
        open={session.historyOpen}
        entries={session.historyStore.entries}
        activeId={session.historyStore.activeId}
        phase={session.phase}
        data={session.data}
        currentStep={session.currentStep}
        isComplete={session.isComplete}
        viewAll={session.viewAll}
        totalSteps={session.totalSteps}
        onClose={() => session.setHistoryOpen(false)}
        onOpen={() => session.setHistoryOpen(true)}
        onSelect={session.handleSelectHistory}
        onDelete={session.handleDeleteHistory}
        onRename={session.handleRenameHistory}
        onTogglePin={session.handlePinHistory}
        onGoToStep={session.goToStep}
        onToggleViewMode={session.toggleViewMode}
        onNewMap={session.handleNewMap}
      />

      <AuthSheet
        visible={session.authOpen}
        userEmail={session.cloudUserEmail}
        onClose={() => session.setAuthOpen(false)}
      />
    </View>
  );
}

================================================================================
FILE: mobile/src/shims/localStorage.ts
================================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStorage } from '@shared/storage';

class LocalStorageShim {
  private cache: Record<string, string> = {};
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      for (const [key, value] of pairs) {
        if (value !== null) {
          this.cache[key] = value;
        }
      }
    } catch (error) {
      console.error('Error loading AsyncStorage into localStorage shim', error);
    }
    this.initialized = true;
  }

  getItem(key: string): string | null {
    return key in this.cache ? this.cache[key] : null;
  }

  setItem(key: string, value: string): void {
    const stringValue = String(value);
    this.cache[key] = stringValue;
    AsyncStorage.setItem(key, stringValue).catch((error) => {
      console.error(`Error saving key ${key} to AsyncStorage`, error);
    });
  }

  removeItem(key: string): void {
    delete this.cache[key];
    AsyncStorage.removeItem(key).catch((error) => {
      console.error(`Error removing key ${key} from AsyncStorage`, error);
    });
  }

  clear(): void {
    this.cache = {};
    AsyncStorage.clear().catch((error) => {
      console.error('Error clearing AsyncStorage', error);
    });
  }

  get length(): number {
    return Object.keys(this.cache).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.cache);
    return index >= 0 && index < keys.length ? keys[index] : null;
  }
}

export const localStorageShim = new LocalStorageShim();

declare global {
  // eslint-disable-next-line no-var
  var localStorage: Storage;
}

export async function bootstrapStorage(): Promise<void> {
  await localStorageShim.init();
  configureStorage(localStorageShim);
  globalThis.localStorage = localStorageShim as unknown as Storage;

  if (!localStorageShim.getItem('nucleo-app-variant')) {
    localStorageShim.setItem('nucleo-app-variant', 'comprension');
  }
}

================================================================================
FILE: _CONTEXTO_PARA_DEBUG.md (nota, no es código ejecutable)
================================================================================

## Estado actual (jun 2026)

### Arquitectura
- App Expo 56 (dev client) en `mobile/`
- Lógica compartida con web en `shared/` (importada vía alias `@shared` en metro)
- Dos variantes: `comprension` (default) y `classic` (switch en ProfileMenu → Ajustes)
- Navegación: **PhaseRouter** (render condicional por `phase` en AppSessionContext), NO React Navigation stack activo
- Composer nuevo en InputScreen / ClassicInputScreen con ComposerSurface + GlassSurface (expo-blur)

### Problemas reportados por el usuario
1. Error "Couldn't find a navigation context" — se intentó quitar React Navigation stack; si persiste, revisar NativeWind cssInterop o componentes que importen @react-navigation
2. Composer móvil no iguala calidad visual web (backdrop-blur CSS vs expo-blur en RN)
3. iPhone físico requiere Metro en Mac + EXPO_PUBLIC_API_BASE_URL con IP LAN (no 127.0.0.1)
4. Bundle id `com.freixanet.nucleo` compartido entre Capacitor (`ios/App`) y Expo (`mobile/ios`) — pueden pisarse

### Archivos NO incluidos en este export
- `mobile/ios/` — proyecto nativo generado por `expo prebuild`
- `mobile/node_modules/`
- `mobile/package-lock.json`
- `mobile/.env` (secretos locales)
- `ios/App/` — app Capacitor antigua
- `server.ts` — backend (solo cliente móvil aquí)

### Comandos útiles
```bash
cd mobile
npm install
npx expo start --dev-client --host lan
npx expo run:ios --device   # build nativo a iPhone
npm run lint                # tsc --noEmit
```

### Variables de entorno (mobile/.env.example)
- EXPO_PUBLIC_API_BASE_URL=http://<IP_MAC>:3000  (iPhone físico)
- EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
