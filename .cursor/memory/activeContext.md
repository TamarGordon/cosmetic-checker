# Active Context: Cosmetic Checker

## Current Focus
The app is branded **Lumi** ("Skincare, decoded"). The UI was redesigned into a **flat, editorial, warm-neutral** aesthetic (revised away from an earlier coral/pastel version that felt too generic/orange/rounded): bone & paper neutrals, near-black `ink` for primary actions, muted semantic colors used only for meaning, small/squared radii, 1px borders instead of shadows. Typography is `Newsreader` (display serif w/ italics) + `Hanken_Grotesk` (UI). All emojis were replaced with `lucide-react` line icons for a single consistent icon language. Design tokens live in `app/globals.css` via Tailwind v4 `@theme`. Light-mode only.

The personal care skin profiles and ingredient personalization are 100% implemented, fully matching the v1 PRD specifications! The entire flow—from selecting a skin type and active conditions, through uploading an image, extracting the ingredients with AI, evaluating them specifically for the chosen profile, and displaying personalized safety verdicts and warnings—is complete.

The immediate next focus areas are:
1. **Caching**: Cache analysis results to reduce API cost and improve speed for repeat scans.
2. **Deployment**: Configure environment variables and deploy to Vercel or similar for public access.
3. **Disclaimers / Global UI Polish**: Enhance visual layout, ensure persistent legal disclaimer blocks, and double check on-device mobile sizing.

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
- Calls **Claude 4.6 Sonnet** (`claude-sonnet-4-6`) vision API with base64 images or parses pre-extracted ingredients.
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
