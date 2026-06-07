# System Patterns: Cosmetic Checker

## Tech Stack
- **Framework**: Next.js 16.2.6 (App Router)
- **Libraries**: React 19.2.4, React DOM 19.2.4
- **Language**: TypeScript 5+ (strict)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with a custom **flat, editorial warm-neutral** design system defined via `@theme` tokens in `app/globals.css`. Foundation: `bone` (page bg) / `paper` (surfaces) / `ink` (primary text + buttons) / `stone` + `mist` (secondary/muted) / `line` (borders) / `fill` (subtle selected fill). Color is used **only for meaning** via muted semantics: `good`/`good-bg` (sage), `warn`/`warn-bg` (ochre), `bad`/`bad-bg` (brick). No brand "orange"; primary actions are near-black `ink`. Radius scale is intentionally small/squared (`--radius-*` overridden). Flat: 1px borders, no shadow utilities. Restrained `fade-in`/`fade-up`/`expand` animations only.
- **Icons**: `lucide-react` (consistent flat line-icon family) replaces all emojis across the UI. Skin types/conditions/verdicts/section headers each map to a specific Lucide icon.
- **Branding**: Product is branded **Lumi** ("Skincare, decoded") with a flat line-style dewdrop logo mark matching the Lucide stroke language (`app/components/Logo.tsx`).
- **Fonts**: `Newsreader` (editorial serif, display + italic, `--font-newsreader` → `font-display`) + `Hanken_Grotesk` (UI/body, `--font-hanken` → `font-sans`) via `next/font/google` in `app/layout.tsx`. Light-mode only (`color-scheme: light`).
- **Key Dependencies**:
  - `heic2any` (v0.0.4) — client-side HEIC→JPEG conversion, dynamically imported.
  - **Anthropic Claude API** — called directly via `fetch` in the server route, no SDK needed.
  - `lucide-react` — flat line-icon set used throughout the UI (replaced all emojis).
  - `firebase` (web SDK) — Authentication (Google Sign-In) + Cloud Firestore for user accounts and per-user data.

## Project Structure
```
cosmetic-checker/
├── app/
│   ├── api/
│   │   ├── check/route.ts          # Claude vision/text endpoint + personalized mock engine
│   │   └── debug/route.ts          # Relays mobile console logs to server terminal
│   ├── components/
│   │   ├── Logo.tsx                 # Lumi SVG dewdrop logo mark + wordmark
│   │   ├── ImageUpload.tsx          # Upload UI: tap/drag, HEIC conversion, preview
│   │   ├── AnalysisResults.tsx      # Results dashboard: displays personalized verdicts/re-analysis
│   │   ├── SkinProfileSelector.tsx  # Profile input: gender + life stage + skin type + gender/age-gated special needs
│   │   ├── AuthProvider.tsx         # Firebase Auth React context (user, signIn/Out, onAuthStateChanged)
│   │   ├── AuthControls.tsx         # Header sign-in/out button + account menu (history, sign out)
│   │   ├── ScanHistory.tsx          # Overlay listing past scans; reopen a saved analysis
│   │   └── MobileConsoleDebugger.tsx# Dev tool: floating console for on-device debugging
│   ├── lib/
│   │   ├── firebase.ts              # Firebase app/auth/firestore init from NEXT_PUBLIC_FIREBASE_* env
│   │   └── userData.ts              # Firestore helpers: get/save profile, add/get scans
│   ├── globals.css
│   ├── layout.tsx                   # Wraps app in <AuthProvider>
│   └── page.tsx                     # Root page: state machine, profile sync (Firestore+session), scan saving
├── .cursor/
│   ├── rules/memory-bank.mdc
│   └── memory/
│       ├── productContext.md
│       ├── systemPatterns.md
│       ├── activeContext.md
│       └── progress.md
├── next.config.ts                   # allowedDevOrigins for iPhone LAN hot-reload
├── .env.local                       # ANTHROPIC_API_KEY (not committed)
├── .firebaserc                      # Binds workspace to Firebase project lumi-89a73 (default alias)
├── firebase.json                    # Configures firestore (rules+indexes) and auth (Google Sign-In)
├── firestore.rules                  # Owner-only security rules for users/{uid} and scans subcollection
├── firestore.indexes.json           # Firestore index definitions (empty for now)
└── package.json
```

## Firebase Tooling
- The project is managed via the **Firebase plugin** (Firebase MCP server + Firebase CLI), authenticated as `tamargordon20@gmail.com`.
- Active project: **`lumi-89a73`** ("Lumi"), bound through `.firebaserc`. `firebase.json` configures `firestore` + `auth`.
- The web `firebaseConfig` is the **public client config** (identifies the project; the `apiKey` is not a secret); stored in `.env.local` as `NEXT_PUBLIC_FIREBASE_*`. Data is protected by Firestore security rules, not by hiding the key.
- **Provisioning was done via the MCP** (`firebase_init` for firestore+auth, `firebase_validate_security_rules`, `firebase_deploy --only firestore,auth`) — preferred over slow `npx firebase-tools` invocations.

### Firebase Auth + Firestore Patterns
- **Single app init** (`app/lib/firebase.ts`): guards against re-init during hot reload via `getApps()`; exports `auth` + `db`.
- **Auth context** (`AuthProvider`): subscribes to `onAuthStateChanged`, exposes `{ user, loading, signInWithGoogle, signOut }`. Google sign-in uses `signInWithPopup`.
- **Per-user data** (`app/lib/userData.ts`): profile at `users/{uid}`; scans at `users/{uid}/scans` (auto-id, `serverTimestamp` for `createdAt`, ordered desc). A `stripUndefined` helper sanitizes objects before writes (Firestore rejects `undefined`).
- **Dual persistence**: signed-out = `sessionStorage` only (guest); signed-in = Firestore (with first-sign-in migration of any local profile). Analysis still runs through the Anthropic Claude API in `/api/check`; Firestore only stores profiles + results.
- **Security rules** (`firestore.rules`): default-deny; every doc is owner-scoped (`request.auth.uid == userId`); schema validated with field allow-lists, enum + size limits; scans are immutable (`allow update: if false`). The profile allow-list now includes optional `gender` + `ageGroup` strings and the `conditions` cap was raised to 20. **Deployed via `firebase_deploy --only firestore`** (validate then deploy) — required whenever the profile schema/allow-list changes, otherwise signed-in writes with new fields are rejected by `hasOnly`. These are a solid prototype that should be hardened/audited before public launch.

## Key Architecture Patterns

### 1. iOS-Compatible File Upload
The only approach that reliably fires `onChange` on iOS Safari and Chrome:
- `<input type="file">` with `className="sr-only"` — kept in the DOM at all times, never hidden with `display:none`.
- A `div` wrapper with `onClick={() => fileInputRef.current?.click()}` opens the native picker.
- Overlay inputs and `<label htmlFor>` were tested and found to silently drop `onChange` after photo selection on iOS WebKit.

### 2. Dynamic HEIC Import
`heic2any` is only imported inside the function that needs it, preventing SSR errors:
```typescript
const heic2any = (await import('heic2any')).default;
```

### 3. Personalized Claude Vision/Text API Call
Direct `fetch` to `https://api.anthropic.com/v1/messages` with either a base64-encoded image (OCR + analysis) or a pre-extracted `ingredients` list (skip OCR, text analysis only). 
- **Model**: `claude-haiku-4-5` (Claude Haiku 4.5).
- **Prompt**: Inlines the user's selected `SkinProfile` (skin type and conditions) and instructs Claude to evaluate each ingredient for both general rating/safety and personalized `personalVerdict` (`Safe` | `Caution` | `Avoid`) and `personalExplanation` (e.g., explaining pregnancy restrictions or allergen warnings).
- **Fixed Sources Alignment**: Explicitly instructs Claude to reference and ground its knowledge in the product owner's fixed authoritative sources: INCI Decoder, PubMed, and The Dekel.

### 4. Zero-OCR Re-Analysis (FR-12 Optimization)
When users change their profile on the results view, uploading the image again is unnecessary.
- The client-side page orchestrates a "Re-Scan" flow by POSTing the existing `ingredients` array and the new `profile` to `/api/check`.
- The server route detects the presence of `ingredients`, bypasses the expensive vision OCR step, and triggers a lightweight text-only Claude prompt.
- Cuts analysis times from 12-15 seconds down to 3-5 seconds and reduces API costs.

### 5. Profile Session Storage (FR-14 Compliance)
User's skin profiles (selected skin type and conditions) are saved to `sessionStorage` in `app/page.tsx` on every change. 
- During initialization, the client tries to safely restore any saved profile.
- This conforms to the privacy requirement (no server storage, privacy by default) while maintaining a seamless user experience across page refreshes.

### 6. Rule-Engine Mock Fallback
If no `ANTHROPIC_API_KEY` is present, the `/api/check` endpoint uses a local rule-engine to personalize standard template responses. It dynamically adjusts safety score, rating summaries, and flags, and maps custom `personalVerdict` and `personalExplanation` entries to matches like fragrances, parabens, comedogenic emollients, and soothing lipids based on the user's specific skin type and special conditions.
