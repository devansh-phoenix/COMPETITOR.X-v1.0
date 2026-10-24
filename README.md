# CompetitorX ⚡️
### Autonomous Website Comparison Agent (Powered by TinyFish)

**CompetitorX** is a production-grade competitive intelligence agent. A user inputs 2 or 3 public company or product website URLs. CompetitorX uses **TinyFish** to visit each site, discover key public pages (homepage, product/features, pricing, about), extract verified facts with an LLM, and render a single side-by-side comparison table where **every populated cell links back to the exact source page with supporting quotes**.

---

## 🎯 Core Principle: Trust Over Completeness

- **Zero Hallucinations**: Only report what is explicitly stated on the public pages.
- **Negative Proof**: If a field is not found, it shows **"Not listed on site"** in a visually muted dashed cell. It never infers, guesses, or fills from general LLM knowledge.
- **Gated Pricing**: If pricing requires contacting sales or booking a demo, it shows **"Contact sales (no public price)"**.
- **Evidence Verification**: Every populated cell carries a value, exact source URL, supporting snippet (max 25 words), and a confidence badge:
  - 🟢 **Verified** (explicitly stated on page)
  - 🟡 **Partial** (vague or incomplete)
  - ⚪️ **Not listed** (not mentioned on public pages)
- **Failure Resilience**: Websites are analyzed in parallel with `Promise.allSettled`. If one site is blocked or unreachable, it is flagged cleanly without breaking the other competitors.

---

## 🏗️ Architecture

```
/src
├── /app
│   ├── /api/compare/route.ts   # POST: validates URLs, SSRF check, parallel TinyFish pipeline, SSE streaming progress
│   ├── globals.css             # Light/Dark CSS theme variables, WCAG AA contrast, tooltip styles
│   ├── layout.tsx              # Root layout with Inter font and production metadata
│   └── page.tsx                # Main UI: hero, input card, live progress card, sticky table, mobile cards
├── /components
│   ├── /three                  # 3D R3F scene, floating shapes, and dynamic theme hook
│   │   ├── HeroScene.tsx       # Canvas host with vignette overlay and mobile fallback
│   │   ├── Shapes.tsx          # 5 floating glass/gradient meshes with parallax & drift
│   │   └── useThemeColors.ts   # Theme detection (light/dark/reduced-motion/mobile)
│   ├── ActionBar.tsx           # Copy as Markdown, CSV Download, Print/PDF, New Comparison
│   ├── ComparisonTable.tsx     # Sticky-header table, confidence badges, source links, hover evidence popovers
│   ├── ConfidenceBadge.tsx     # Verified / Partial / Not listed badges
│   ├── CursorGlow.tsx          # Spring physics cursor-following gradient glow behind input card
│   ├── InputCard.tsx           # 2-3 URL fields, inline validation, example presets, loading state
│   ├── MobileCards.tsx         # Mobile-responsive swipeable/tabbed company view
│   ├── Navbar.tsx              # Branding, trust badge, demo mode indicator, theme toggle
│   ├── ProgressCard.tsx        # Multi-step progress tracker with live skeletons
│   ├── SummaryStrip.tsx        # Top 3 key insights generated strictly from extracted facts
│   └── ThemeToggle.tsx         # Light & Dark mode toggle with localStorage persistence
└── /lib
    ├── export.ts               # Clean Markdown & CSV export formatters
    ├── extract.ts              # Strict LLM extraction with Zod schema, single retry, and deterministic fallback
    ├── mock.ts                 # Realistic mock data for Notion, Coda, Airtable & heuristic fallback
    ├── schema.ts               # Complete Zod schemas and TypeScript interfaces
    ├── tinyfish.ts             # ONLY file communicating with TinyFish (Fetch & Page Discovery)
    ├── utils.ts                # Tailwind class merger (clsx + twMerge)
    └── validate.ts             # URL normalization, SSRF protection, 10-minute cache & rate limiter
```

---

## 🎨 3D Interactive Hero & Creative Engineering

CompetitorX features a tasteful, modern 3D ambient hero designed to wow users without sacrificing readability or performance:
- **Floating 3D Geometry**: 5 floating, slowly rotating glass/gradient meshes (Icosahedron, Torus, Luminous Spheres, Octahedron) crafted with `@react-three/fiber` and `@react-three/drei` (`Float`, `MeshDistortMaterial`).
- **Subtle Parallax**: Meshes gently react to normalized mouse movement with smooth linear interpolation (lerp).
- **Dynamic Theme Palette**: Shaders and materials observe light and dark mode switches in real time (`useThemeColors`) to adjust roughness, transmission, specular color, and ambient lighting.
- **Cursor Glow**: An interactive spring-physics gradient glow (`CursorGlow`) tracks cursor movements behind the input card.
- **Strict Accessibility & Performance**:
  - Lazy-loaded via `next/dynamic({ ssr: false })` to keep initial bundle load instantaneous.
  - Respects `prefers-reduced-motion`: pauses 3D rotation, sets distortion to 0, and substitutes ambient glow.
  - Automatically falls back to a zero-overhead CSS gradient mesh on mobile devices (`max-width: 768px`) and low-power hardware.
  - Scene is strictly `pointer-events-none` with a radial contrast vignette ensuring headline and input card maintain WCAG AA contrast.

---

## ⏱️ Setup in Under 2 Minutes

### 1. Prerequisites
- Node.js 18+ (tested with Node 20+)
- npm or pnpm

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Optional: TinyFish API Key (already supported if set in your system environment)
TINYFISH_API_KEY=your_tinyfish_api_key_here

# Optional: LLM API Key (OpenAI, Groq, OpenRouter, Gemini compatible)
LLM_API_KEY=your_openai_or_groq_key_here
LLM_MODEL=gpt-4o-mini

# Set to true for instant offline demo mode, false for live web analysis
USE_MOCK_DATA=false
```

### 4. Run the development server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔄 Switching Between Live and Mock Mode

| Mode | Configuration in `.env.local` | Behavior |
| :--- | :--- | :--- |
| **Live Mode** | `USE_MOCK_DATA=false` | TinyFish visits live websites, extracts navigation links, scrapes pages via headless browser rendering, and runs LLM extraction. |
| **Offline Demo Mode** | `USE_MOCK_DATA=true` | Zero API keys required. Uses realistic, verified benchmark data for instant demos without network latency or external rate limits. |

*Note: If no API keys are provided or an external service fails, CompetitorX automatically and gracefully falls back to verified benchmark data with a visible "Demo Mode" badge so demos never break.*

---

## 🎬 60-Second Demo Script

1. **Open [http://localhost:3000](http://localhost:3000)**:
   - Notice the modern editorial-SaaS styling (Linear / Stripe aesthetic), WCAG AA typography, and the **"Zero Hallucinations Guarantee"** badge.
2. **Toggle Theme**:
   - Click the Sun/Moon icon in the upper-right corner to preview dark mode and light mode.
3. **Select Competitors**:
   - Click the quick preset chip: **"Notion vs Coda vs Airtable"**.
   - Notice the instant URL population with inline validation.
4. **Click "Compare Competitors"**:
   - Watch the live progress cards:
     - `Discover Pages` → `Read Pricing & Features` → `Extract Verified Facts` → `Done`.
5. **Inspect the Comparison Matrix**:
   - **Top Summary Strip**: Review the 3 automated executive takeaways.
   - **Sticky Header**: Notice company favicons, names, and root links.
   - **Trust & Evidence**:
     - See green **Verified** badges for explicit pricing tiers and core features.
     - Click any **"Source"** link icon to jump directly to the exact page where that claim lives.
     - Hover over the quote snippet box to view the exact excerpt cited from the page.
     - Observe how missing or gated attributes show muted dashed boxes with **"Not listed on site"**.
6. **Export Findings**:
   - Click **"Copy as Markdown"** (provides instant clipboard feedback).
   - Click **"Download CSV"** to save the comparison table.
   - Click **"Print / PDF"** to trigger a clean, print-optimized document view.

---

## 🛠️ Where to Edit if TinyFish Endpoint Details Differ

All communication with TinyFish is strictly isolated in [`src/lib/tinyfish.ts`](file:///Users/devansh/event%20radar/src/lib/tinyfish.ts):

| Parameter | Location in `src/lib/tinyfish.ts` | Default Value | Notes |
| :--- | :--- | :--- | :--- |
| **Fetch Endpoint** | Line 36 (`DEFAULT_FETCH_ENDPOINT`) | `https://api.fetch.tinyfish.ai/` | Target endpoint for web extraction (or `${TINYFISH_BASE_URL}/v1/fetch`). |
| **Agent Base URL** | Line 39 (`DEFAULT_AGENT_BASE_URL`) | `https://agent.tinyfish.ai` | Target base URL for browser automations. |
| **Auth Headers** | Lines 71–75 | `X-API-Key` & `Authorization: Bearer` | Pass custom API token header formats here. |
| **Page Timeout** | Line 42 (`PAGE_FETCH_TIMEOUT_MS`) | `20000` (20 seconds) | Adjust per-page fetch timeout. |
| **Page Discovery Heuristics** | Lines 174–215 | `pricing`, `product`, `about` regexes | Custom URL path filters for page discovery. |

---

## 🛡️ Security & Guardrails

- **SSRF Protection**: Normalizes URLs, enforces HTTP/HTTPS protocols, and rejects `localhost`, `127.0.0.1`, `0.0.0.0`, cloud metadata endpoints (`169.254.169.254`), and private RFC 1918 subnets (`10.x`, `172.16.x`, `192.168.x`).
- **No Client Secrets**: TinyFish and LLM tokens remain exclusively on the Node.js server.
- **In-Memory Cache**: 10-minute LRU cache keyed by normalized URLs to accelerate repeat demos.
- **Rate Limiting**: IP-based rate limiter preventing denial-of-service abuse.
