# Active Context: Cosmetic Checker

## Current Focus
The app is branded **Lumi** ("Skincare, decoded"). The UI was redesigned into a **flat, editorial, warm-neutral** aesthetic (revised away from an earlier coral/pastel version that felt too generic/orange/rounded): bone & paper neutrals, near-black `ink` for primary actions, muted semantic colors used only for meaning, small/squared radii, 1px borders instead of shadows. Typography is `Newsreader` (display serif w/ italics) + `Hanken_Grotesk` (UI). All emojis were replaced with `lucide-react` line icons for a single consistent icon language. Design tokens live in `app/globals.css` via Tailwind v4 `@theme`. Light-mode only.

The personal care skin profiles and ingredient personalization are 100% implemented, fully matching the v1 PRD specifications! The entire flow—from selecting a skin type and active conditions, through uploading an image, extracting the ingredients with AI, evaluating them specifically for the chosen profile, and displaying personalized safety verdicts and warnings—is complete.

The immediate next focus areas are:
1. **Caching**: Cache analysis results to reduce API cost and improve speed for repeat scans.
2. **Deployment**: Configure environment variables and deploy to Vercel or similar for public access.
3. **Disclaimers / Global UI Polish**: Enhance visual layout, ensure persistent legal disclaimer blocks, and double check on-device mobile sizing.

## Firebase Integration (Auth + Firestore LIVE)
The workspace is connected to the **`lumi-89a73`** Firebase project (display name "Lumi") via the Firebase MCP server / CLI, and **user accounts + per-user data persistence are now implemented and deployed**.
- Authenticated CLI user: `tamargordon20@gmail.com`.
- The directory is bound to the project through `.firebaserc` (default → `lumi-89a73`); `firebase.json` now configures `firestore` (rules + indexes) and `auth` (Google Sign-In provider).
- One registered **Web** app (`1:1000672000901:web:fb6f79e479c35dfee3a2ec`); its public client config lives in `.env.local` as `NEXT_PUBLIC_FIREBASE_*` vars.
- **Authentication**: Google Sign-In enabled (provisioned via `firebase deploy --only auth`). Client uses `signInWithPopup` + `onAuthStateChanged`.
- **Firestore**: `(default)` database (Native, `nam5`) created and secured. Owner-only rules deployed (`firestore.rules`, validated + deployed).
- **Billing**: still Spark (free) — Auth + Firestore run fully on the free tier, so no Blaze upgrade was needed. Blaze-only services (Cloud Functions, Data Connect/Cloud SQL) remain unavailable.
- **Gemini in Firebase ToS**: still not accepted (not needed for Auth/Firestore).

### Data model (Firestore)
- `users/{uid}` — `skinType`, `gender`, `ageGroup`, `conditions[]`, `displayName`, `email`, `updatedAt`. Stores the user's personal-care profile.
- `users/{uid}/scans/{scanId}` — one doc per completed analysis: `productName`, `rating`, `score`, `summary`, `ingredients[]`, `skinSuitability`, `flags`, `source`, `profileUsed` (now `{ skinType, gender, ageGroup, conditions }`), `createdAt`.

### Profile model expansion (gender, life stage, gender/age-gated special needs)
The profile now captures more than skin type:
- **`gender`**: `female` | `male` | `unspecified` (default `unspecified`).
- **`ageGroup`** (life stage): `newborn` | `child` | `teen` | `adult` | `senior` (default `adult`).
- **`skinType`**: `normal` | `dry` | `oily` | `combination` — **`sensitive` was REMOVED as a skin type and moved into Special needs.**
- **`conditions` (Special needs)**: `sensitive`, `acne-prone`, `eczema`, `rosacea`, `pregnant`, `breastfeeding`, `shaving`, `dandruff`, `hair-care`, `hair-loss`, `color-treated`, `anti-aging`, `baby-gentle`.
- **Gender/age gating**: each special need can declare `genders`/`ageGroups`; the selector only shows relevant ones (e.g. pregnant/breastfeeding → female + teen/adult; shaving/anti-aging/hair → age-gated; baby-gentle → newborn/child). Changing gender/age auto-prunes now-irrelevant selected conditions.
- Backward compatibility: loaders (`getUserProfile`, `getScans`, sessionStorage restore) and the API default-fill `gender`→`unspecified`, `ageGroup`→`adult`; result/label maps tolerate the deprecated `sensitive` skin type. Firestore rules still accept `sensitive` in the `skinType` enum for old docs.

### Auth/data behavior
- **Guest mode preserved**: signed-out users still scan; profile persists via `sessionStorage` only.
- **Signed-in**: on sign-in the app loads `users/{uid}` profile from Firestore (migrating any local sessionStorage profile up on first sign-in). Profile edits write through to Firestore; every completed full scan is appended to `users/{uid}/scans`. Re-analyses are NOT saved (kept to one history entry per scanned product).
- New files: `app/lib/firebase.ts` (SDK init), `app/lib/userData.ts` (profile + scan helpers), `app/components/AuthProvider.tsx` (context), `app/components/AuthControls.tsx` (header sign-in/out + history menu), `app/components/ScanHistory.tsx` (history overlay). `app/layout.tsx` wraps the tree in `AuthProvider`.

---

## Current State of the Codebase

### Client Upload & Profile Selector (Complete ✅)
- Tap-to-upload and drag-and-drop are fully functional on desktop and mobile.
- **`SkinProfileSelector.tsx`**: Pill-style dashboard selecting a single skin type (`normal` | `dry` | `oily` | `sensitive` | `combination`) and multiple special conditions (`pregnant` | `breastfeeding` | `eczema` | `rosacea` | `acne-prone`).
- **Storage Persistence**: Saves and loads the user's selected skin profile dynamically using browser `sessionStorage` (so profiles persist across reloads but remain private and local).
- HEIC/HEIF conversion to JPEG using dynamically imported `heic2any`.
- Image preview with reset capability.

### Backend API `/api/check` (Complete ✅)
- Accepts `POST` with `FormData` containing `image` (for new scans) or stringified `ingredients` array (for rapid re-scans with changed profiles).
- Accepts stringified `profile` (skinType + conditions).
- Calls **Claude Haiku 4.5** (`claude-haiku-4-5`) vision API with base64 images or parses pre-extracted ingredients.
- Instructs the AI model to perform ingredient-by-ingredient safety analysis, returning general safety ratings, purposes, descriptions, AND a personalized `personalVerdict` (`Safe` | `Caution` | `Avoid`) and `personalExplanation` specifically addressing the user's skin profile!
- **Backwards-Compatible Mock Fallback**: When no Anthropic API key is configured, the server processes mock data (CeraVe, The Ordinary, or standard moisturizer) and *dynamically personalizes* ingredient verdicts, descriptions, product ratings, and overall scores based on the incoming profile.

### Analysis Results Screen (Complete ✅)
- `AnalysisResults.tsx`: score ring, general skin suitability, free-from checklist, searchable & filterable ingredient list.
- **Personalization Badges**: Highlights personalized verdicts (`Safe` / `Caution` / `Avoid`) and expands to show a dedicated box explaining exactly why that ingredient holds that rating for the user's skin type and conditions (e.g., explaining why a pregnant user must avoid retinoids, or why an eczema user must avoid synthetic fragrance).
- **Live Re-Analysis (Zero-Vision-Cost)**: Users can change their skin profile directly on the results screen and tap "Re-Analyze". The client submits the pre-extracted ingredients list and the new profile. The API bypasses the slow and costly Vision OCR step, completing a personalized re-analysis in just 3-5 seconds!

---

## Key Technical Decisions Made This Session

### Combined API Endpoint (`/api/check`)
To avoid breaking the existing simple codebase architecture while supporting PRD-required features (like re-analyzing without re-upload), the `/api/check` endpoint was enhanced to support both:
1. **Full Scan**: Takes `image` + `profile` -> performs Vision OCR + personalized analysis.
2. **Re-Scan (OCR Skip)**: Takes `ingredients` array + `profile` -> skips OCR entirely, making a direct text-only Claude call or applying personalized mock transformations. This saves substantial Claude token costs and cuts response times down to under 5 seconds!

### Server-Side Personalization Fallback
To ensure a high-fidelity experience without an active API key, we designed a server-side rule engine inside `/api/check` that parses mock product templates and dynamically injects `personalVerdict`, `personalExplanation`, and adjusted product scores/ratings based on the incoming `SkinProfile`.
