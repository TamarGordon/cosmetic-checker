# Active Context: Cosmetic Checker

## Current Focus
The core prototype is fully functional on both desktop and iPhone (Safari & Chrome). The entire upload → Claude AI analysis → results display flow works end-to-end.

The immediate next focus areas are:
1. **Personalization Profiles**: Let users set skin type (Oily, Dry, Sensitive, Acne-prone) and highlight relevant ingredients automatically.
2. **Caching**: Cache analysis results to reduce API cost and improve speed for repeat scans.
3. **Deployment**: Configure environment variables and deploy to Vercel or similar for public access.

---

## Current State of the Codebase

### Client Upload (Complete ✅)
- Tap-to-upload and drag-and-drop are fully functional on desktop and mobile.
- **iOS Fix**: The upload uses `className="sr-only"` on the `<input>` with a `div` wrapper that calls `fileInputRef.current?.click()` via `onClick`. This is the only approach that reliably triggers `onChange` on iOS Safari and Chrome — overlay and label-based approaches were tested and found to silently drop `onChange` after photo selection on iOS WebKit.
- HEIC/HEIF conversion to JPEG using dynamically imported `heic2any`.
- Image preview with reset capability.

### Backend API `/api/check` (Complete ✅)
- Accepts `POST` with `FormData` image field.
- Calls **Claude 4.6 Sonnet** (`claude-sonnet-4-6`) vision API using `ANTHROPIC_API_KEY` from `.env.local`.
- Returns structured JSON: product name, overall score, ingredient list with safety/purpose/description, skin suitability, and free-from flags.
- Falls back to rich mock data if no API key present or API call fails.
- Errors are surfaced to the UI (no silent fallback when API key is configured).

### Analysis Results Screen (Complete ✅)
- `AnalysisResults.tsx`: score ring, skin suitability cards, free-from checklist, searchable & filterable ingredient list with collapsible detail cards.
- Integrated into `page.tsx` state machine: `idle → checking → done | error`.

### Debug Tooling (Temporary ✅)
- `MobileConsoleDebugger.tsx`: floating console overlay for live mobile debugging. Can be removed once development is stable.
- `app/api/debug/route.ts`: relays mobile `console.*` calls to the Next.js server terminal.

### Configuration
- `next.config.ts` includes `allowedDevOrigins: ["192.168.68.67"]` so the iPhone on the local network receives hot-reload updates during development.

---

## Key Technical Decisions Made This Session

### iOS Upload Fix
`triggerPicker = () => fileInputRef.current?.click()` called from a `div onClick` with the input kept as `sr-only` (1px, clipped, in DOM). Overlay and `<label htmlFor>` approaches were tried but both silently dropped `onChange` on iOS WebKit. The programmatic `.click()` from a user-gesture-initiated handler is what iOS accepts.

### Claude Vision API
Using `claude-sonnet-4-6` (the current Claude 4.6 Sonnet model ID as of May 2026). Older dated IDs like `claude-3-5-sonnet-20241022` return 404. Model IDs for the 4.6+ generation are dateless (no date suffix).

### Error Transparency
When `ANTHROPIC_API_KEY` is set, API errors are returned as `{ success: false, error: "..." }` with HTTP 500 and displayed in the UI. There is no silent fallback to mock data when a key is present.
