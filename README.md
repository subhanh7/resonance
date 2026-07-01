# Resonance — YouTube Comment Sentiment Intelligence

> Drop a video. Hear what the room thinks.

A spatial, mood-reactive web application that analyzes the emotional 
tone of any YouTube video's comment section in real time. Built as a 
complete ground-up redesign — no dashboards, no sidebars, no template 
UI. Every comment is scored, visualized, and felt.

![Resonance Intake Screen](screenshots/intake.png)

---

## What it does

Paste any YouTube URL. Resonance fetches every comment via the 
YouTube Data API v3, scores each one using NLTK VADER sentiment 
analysis, and renders the results as a living spatial interface:

- The entire background shifts color based on aggregate mood
- Comments become a 3D particle field — sentiment drives position 
  and color, engagement drives size
- Floating glass panels show mood breakdown, standout voices, 
  sentiment over time, and the words driving the conversation
- Scroll down for full analytics: charts, tables, and 
  click-to-filter by sentiment

![Resonance Field View](screenshots/field.png)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| 3D / Animation | Three.js, React Three Fiber, Motion, GSAP |
| State / Data | Zustand, TanStack Query |
| Backend | FastAPI, Python |
| Sentiment | NLTK VADER |
| Data Source | YouTube Data API v3 |

---

## Screenshots

### Intake
![Intake](screenshots/intake.png)

### Field — Spatial Comment Visualization
![Field](screenshots/field.png)

### Analytics — Charts & Comment Explorer
![Analytics](screenshots/analytics.png)

---

## Running locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- A YouTube Data API v3 key 
  ([get one here](https://console.cloud.google.com))

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your YouTube API key to .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Architecture
```text
resonance/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app, /api/analyze endpoint
│   │   ├── youtube.py     # YouTube Data API v3 client
│   │   ├── sentiment.py   # VADER scoring, mood, timeline, lexicon
│   │   └── models.py      # Pydantic request/response schemas
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── field/     # 3D particle field, CenterStage
        │   ├── panels/    # Pulse, Voices, Signal, Lexicon
        │   ├── shell/     # Layout, ambient bg, command palette
        │   ├── intake/    # URL input capsule
        │   └── analytics/ # Charts, comment explorer table
        ├── api/           # Axios API client
        └── lib/           # Mood colors, formatters
```

---

## Design Philosophy

Most sentiment tools look like analytics dashboards. Resonance 
doesn't. The UI *is* the sentiment indicator — the color of the 
entire interface shifts based on what the comment section feels 
like. Panels float in space rather than sitting in a fixed sidebar. 
The experience is closer to a spatial OS than a data tool.

Inspired by Apple VisionOS, Linear, Vercel, and Arc Browser — 
but not copying any of their layouts.

---

## Built by

Mohammed Subhan
