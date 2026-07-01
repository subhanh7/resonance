from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import AnalyzeRequest, AnalyzeResponse
from app.sentiment import (
    build_breakdown,
    build_lexicon,
    build_timeline,
    build_voices,
    score_comments,
)
from app.youtube import YouTubeError, extract_video_id, fetch_video_and_comments

load_dotenv()

app = FastAPI(
    title="Resonance API",
    description="Real-time YouTube comment sentiment intelligence.",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "youtube_api_key_configured": bool(os.getenv("YOUTUBE_API_KEY"))}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    api_key = os.getenv("YOUTUBE_API_KEY", "")

    try:
        video_id = extract_video_id(payload.url)
        video, raw_comments = await fetch_video_and_comments(
            api_key, video_id, payload.max_comments
        )
    except YouTubeError as exc:
        raise HTTPException(status_code=exc.status, detail=exc.message) from exc

    scored = score_comments(raw_comments)
    breakdown = build_breakdown(scored)
    timeline = build_timeline(scored)
    lexicon = build_lexicon(scored)
    voices = build_voices(scored)

    return AnalyzeResponse(
        video=video,
        fetched_comment_count=len(scored),
        breakdown=breakdown,
        timeline=timeline,
        lexicon=lexicon,
        voices=voices,
        comments=scored,
    )
