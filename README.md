# Resonance — YouTube Comment Sentiment Intelligence

> Drop a video. Hear what the room thinks.

A spatial, mood-reactive web application that analyzes the emotional 
tone of any YouTube video's comment section in real time. Built as a 
complete ground-up redesign — no dashboards, no sidebars, no template 
UI. Every comment is scored, visualized, and felt.

![Resonance Intake Screen](screenshots/<img width="3024" height="1712" alt="Screenshot 2026-07-01 at 12 38 15 PM" src="https://github.com/user-attachments/assets/c94da4ab-8f0e-4280-8d3f-1058cfe8eed1" />.png)

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
<img width="3024" height="1709" alt="Screenshot 2026-07-01 at 12 38 40 PM" src="https://github.com/user-attachments/assets/e6bf75cd-8ffa-43b4-8e22-a5987fa2a8af" />

### Field — Spatial Comment Visualization
<img width="3024" height="1716" alt="Screenshot 2026-07-01 at 12 39 03 PM" src="https://github.com/user-attachments/assets/550c07b7-5a69-484f-94e4-2362aa946ada" />

### Analytics — Charts & Comment Explorer
<img width="3024" height="1708" alt="Screenshot 2026-07-01 at 12 39 11 PM" src="https://github.com/user-attachments/assets/e85f7a5d-8bd6-4797-a6f3-6726e5a65559" />

<img width="1512" height="982" alt="Screenshot 2026-07-01 at 12 40 12 PM" src="https://github.com/user-attachments/assets/a6d108d5-1a48-41ed-a492-9eaa6a716ac7" />


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
