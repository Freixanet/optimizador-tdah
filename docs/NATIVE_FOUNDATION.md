# Native foundation checkpoint

This document tracks the reversible native migration without replacing the web app.

## Current status

| Phase | Status | Notes |
| --- | --- | --- |
| Backup / safety | Ready | `scripts/backup-working-tree.sh` creates a dated tarball outside the repo, excluding secrets and build artifacts. |
| Shared contract | Done | [`src/contracts.ts`](../src/contracts.ts) defines `MapRecord`, `SavedSession`, `TransformRequest`. |
| Express / Railway | Done | [`server.ts`](../server.ts) keeps `/api/transform`, adds optional Supabase auth, rate limits, upload caps, `/health`. |
| Supabase schema | Done | [`supabase/migrations/20260621_initial_sync.sql`](../supabase/migrations/20260621_initial_sync.sql) with RLS. Apply in **staging first**. |
| Web cloud sync | Done (optional) | Web works offline with localStorage. With `VITE_SUPABASE_*`, profile menu offers Google or email/password sign-in, session persistence, and one-time local migration. |
| iOS shell | Done (optional sync) | SwiftUI app in `ios/` calls `/api/transform`, caches maps with SwiftData. OAuth + cloud sync when `SUPABASE_ANON_KEY` is set. Redirect: `com.nucleo.app://login-callback`. |
| Android shell | Done (optional sync) | Compose app in `android/` calls `/api/transform`, caches maps with Room. OAuth + cloud sync when `SUPABASE_ANON_KEY` is set in `BuildConfig`. Same redirect URL as iOS. |

## Reversible rules

- Do not remove the existing web flow or `/api/transform`.
- Keep Supabase and Railway disabled until staging validation passes.
- Prefer small commits: backend contract, Supabase, web sync, iOS, Android.
- Revert any phase by abandoning the branch or reverting a single commit.

## Staging checklist (before production)

1. Apply the Supabase migration to a staging project.
2. Configure OAuth redirect URLs for web, iOS, and Android.
3. Set Railway env vars from [`.env.staging.example`](../.env.staging.example).
4. Verify: web without Supabase, web with Supabase, OAuth, RLS isolation, local migration, offline cache on iOS/Android.
5. Do not publish to App Store, Play Store, Supabase prod, or Railway prod until explicitly approved.

## Local commands

```bash
# Web (unchanged)
npm install
npm run dev

# Backup current work
./scripts/backup-working-tree.sh

# Supabase local env (preserves GEMINI_API_KEY)
./scripts/setup-supabase.sh write-env --url https://YOUR_REF.supabase.co --anon-key eyJ...

# iOS
cd ios && xcodegen generate

# Android (requires JDK)
cd android && ./gradlew :app:assembleDebug
```
