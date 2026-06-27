# Liquid Glass (iOS 26+)

Native iOS Liquid Glass for **floating UI only**, via [`expo-glass-effect`](https://docs.expo.dev/versions/latest/sdk/glass-effect/).

## Files changed

| File | Role |
|------|------|
| `mobile/src/components/LiquidGlassSurface.tsx` | Core wrapper: `GlassView` on iOS 26+, fallback `View` elsewhere |
| `mobile/src/components/GlassSurface.tsx` | Adds `liquid` + `borderRadius`; floating surfaces opt in |
| `mobile/src/components/ComposerSurface.tsx` | Composer dock (liquid) |
| `mobile/src/components/FloatingGlassButton.tsx` | Floating profile / Nuevo mapa buttons |
| `mobile/src/components/AttachMenu.tsx` | Attach popup menu |
| `mobile/src/components/ProfileMenu.tsx` | Account menu panel |
| `mobile/src/components/HistoryEntryGlassMenu.tsx` | History entry context menu |
| `mobile/src/components/ModelChip.tsx` | Mode picker sheet chrome |
| `mobile/src/components/MapChatSheet.tsx` | Sheet header + bottom composer chrome |
| `mobile/src/components/AuthSheet.tsx` | Sheet header chrome |
| `mobile/src/screens/InputScreen.tsx` | Intent cards explicitly **`liquid={false}`** (main content) |
| `mobile/package.json` | `expo-glass-effect` dependency |

## What uses Liquid Glass

- Composer input container (`ComposerSurface`)
- Floating buttons (`FloatingGlassButton` — neutral tone only; accent stays solid indigo)
- Attach menu, profile menu, history entry menu
- Modal/sheet chrome (ModelChip picker, MapChat, Auth headers + MapChat bottom bar)

## What does **not** use Liquid Glass

- Screen backgrounds (`SafeAreaView`, drawers, scroll areas)
- History cards, intent option cards, chat bubbles, index rows
- Accent “Nuevo mapa” pill (solid color by design)

## How to test (iOS 26 simulator or device)

1. **Rebuild dev client required** — `expo-glass-effect` adds native code; Expo Go / an old dev build will not show real glass.
   ```bash
   cd mobile
   npm run ios:prebuild   # or eas build --profile preview --platform ios
   npm run ios:device     # install on device/simulator
   ```
2. Start preview bridge from main checkout:
   ```bash
   cd /Users/mfreixanet/antigravity/Untitled
   npm run mobile:preview
   ```
3. Mac LAN IP:
   ```bash
   ipconfig getifaddr en0
   ```
4. On iPhone (same WiFi), open dev build → connect to `http://<IP-LAN-MAC>:8082`
5. Check:
   - Composer at bottom of input/result screens looks like native glass over content
   - Floating circle/pill buttons in sidebar footer
   - Attach menu popup, profile menu, mode sheet
   - Map chat header + bottom input bar
6. **Accessibility:** Settings → Accessibility → Display → *Reduce Transparency* ON → app should show solid/semi-solid fallbacks, no crash.

## Android / older iOS

- Same layouts and hit targets
- `LiquidGlassSurface` renders a sober semi-opaque `View` with subtle border (existing blur path via `GlassSurface` when `liquid={false}`)
- No Liquid Glass material, no behavior change to navigation or scroll

## Known limitations

- Liquid Glass is **iOS 26+ only**; guarded with `Platform.Version`, `isGlassEffectAPIAvailable()`, `isLiquidGlassAvailable()`, and Reduce Transparency.
- Requires **new native dev build** after installing the package.
- Do not animate opacity on glass wrappers (press states apply to outer `Pressable`, not `GlassView`).
- `GlassView` must not cover full-screen backgrounds — only contained floating regions.
