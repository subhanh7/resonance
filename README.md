# Resonance — YouTube Comment Sentiment Intelligence

A complete rebuild of the original Streamlit app. No sidebar, no KPI-card dashboard —
a spatial, mood-reactive interface for exploring what a video's comment section actually
feels like, powered by the same real YouTube Data API v3 + NLTK VADER pipeline.

## Architecture

```
resonance/
├── backend/    FastAPI + YouTube Data API v3 + NLTK VADER
└── frontend/   React 19 + TypeScript + Vite + Tailwind + R3F/Three.js + Motion + GSAP + Zustand + TanStack Query
```

The backend is a thin, real data pipeline: it fetches video metadata and paginated
comment threads from YouTube, scores every comment with VADER, and derives:
- an aggregate **mood** (delight / calm / friction / mixed) and a -1..1 mood score
- a **timeline** of sentiment over the comment thread's natural order
- a **lexicon** of the words most associated with positive/negative comments
- **voices**: the warmest, sharpest, and most-liked comments

No mock data, no static JSON — every request hits the live API.

## Run it

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your YouTube Data API v3 key
uvicorn app.main:app --reload --port 8000
```

Get a key: console.cloud.google.com → enable **YouTube Data API v3** → Credentials → Create API key.

The first request downloads the NLTK VADER lexicon automatically (cached after that).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # defaults to http://localhost:8000, fine for local dev
npm run dev
```

Open http://localhost:5173, paste a YouTube URL, and the field will populate with real,
live-scored comments.

## The experience

- **Intake**: a single centered glass capsule. Paste a link, nothing else on screen.
- **The Field**: comments become a 3D particle field (React Three Fiber) — sentiment
  drives vertical position and color (cool indigo → warm coral), engagement drives
  how far a point sits from the center. Drag to orbit, scroll to zoom.
- **Floating panels** (Pulse, Voices, Signal, Lexicon) sit around the field, not in a
  fixed sidebar. Close one and it becomes a small pill at the bottom edge; bring it
  back with a click, or summon the full set with **⌘K**.
- **Ambient color**: the whole background tints toward the mood — there's no separate
  "sentiment score" widget pretending to be the headline; the UI's own color is the
  headline.

## Notes for production hardening

- Add response caching (Redis or in-memory TTL) keyed by `video_id` to avoid burning
  YouTube API quota on repeat lookups.
- The `/api/analyze` call is synchronous; for very large comment counts (close to the
  2000 cap) consider moving to a background job + polling/streaming if your hosting
  has stricter request timeouts.
- Lock `CORS_ORIGINS` down to your real deployed frontend origin before shipping.
