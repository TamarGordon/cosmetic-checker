# System Patterns: Cosmetic Checker

## Tech Stack
- **Framework**: Next.js 16.2.6 (App Router)
- **Libraries**: React 19.2.4, React DOM 19.2.4
- **Language**: TypeScript 5+ (strict)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Key Dependencies**:
  - `heic2any` (v0.0.4) — client-side HEIC→JPEG conversion, dynamically imported.
  - **Anthropic Claude API** — called directly via `fetch` in the server route, no SDK needed.

## Project Structure
```
cosmetic-checker/
├── app/
│   ├── api/
│   │   ├── check/route.ts          # Claude vision analysis endpoint + mock fallback
│   │   └── debug/route.ts          # Relays mobile console logs to server terminal
│   ├── components/
│   │   ├── ImageUpload.tsx          # Upload UI: tap/drag, HEIC conversion, preview
│   │   ├── AnalysisResults.tsx      # Results dashboard: score, ingredients, flags
│   │   └── MobileConsoleDebugger.tsx# Dev tool: floating console for on-device debugging
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # Root page: state machine, wires all components
├── .cursor/
│   ├── rules/memory-bank.mdc
│   └── memory/
│       ├── productContext.md
│       ├── systemPatterns.md
│       ├── activeContext.md
│       └── progress.md
├── next.config.ts                   # allowedDevOrigins for iPhone LAN hot-reload
├── .env.local                       # ANTHROPIC_API_KEY (not committed)
└── package.json
```

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

### 3. Claude Vision API Call
Direct `fetch` to `https://api.anthropic.com/v1/messages` with base64-encoded image. Model: `claude-sonnet-4-6` (Claude 4.6 Sonnet — dateless ID format introduced in the 4.6 generation). Older dated IDs (e.g. `claude-3-5-sonnet-20241022`) return 404 on current API keys.

### 4. Error Transparency
When `ANTHROPIC_API_KEY` is set and the API call fails, the server returns `{ success: false, error: "..." }` with HTTP 500. The client displays the raw error message. There is **no silent fallback to mock data** when a key is configured.

### 5. Mock Fallback
When no API key is present, the server returns one of three hardcoded profiles after a 1.5s simulated delay. Profile is chosen by matching keywords in the uploaded filename (`cerave`, `ordinary`, or default).

### 6. LAN Hot-Reload for iPhone
`next.config.ts` includes:
```typescript
allowedDevOrigins: ["192.168.68.67"],
```
This allows the iPhone (on the same Wi-Fi network) to receive HMR websocket updates. Without this, Next.js blocks cross-origin dev requests and the phone always serves stale cached code.

### 7. Tailwind v4 Conventions
```css
/* app/globals.css */
@import "tailwindcss";
```
Fonts are Geist/Geist Mono via `next/font/google`, injected as CSS variables in `layout.tsx`.

### 8. Page State Machine
`app/page.tsx` manages: `checkState: 'idle' | 'checking' | 'done' | 'error'`. When `done`, `ImageUpload` and the upload UI are hidden and `AnalysisResults` is rendered instead.
