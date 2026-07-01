from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="A YouTube video URL or bare video ID")
    max_comments: Optional[int] = Field(
        None, description="Optional override to set an upper bound on comments to fetch. Defaults to all."
    )


class VideoMeta(BaseModel):
    id: str
    title: str
    channel_title: str
    channel_id: str
    published_at: str
    thumbnail_url: str
    view_count: int
    like_count: int
    comment_count: int
    duration_iso: str


class CommentItem(BaseModel):
    id: str
    author: str
    author_avatar: str
    text: str
    like_count: int
    published_at: str
    reply_count: int
    compound: float
    pos: float
    neu: float
    neg: float
    label: str  # "positive" | "neutral" | "negative"


class SentimentBreakdown(BaseModel):
    positive: int
    neutral: int
    negative: int
    total: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    average_compound: float
    mood: str  # "delight" | "calm" | "friction" | "mixed"
    mood_score: float  # -1..1 smoothed score driving ambient color


class TimelinePoint(BaseModel):
    bucket: str  # ISO date label for the bucket
    average_compound: float
    volume: int


class LexiconEntry(BaseModel):
    term: str
    frequency: int
    average_compound: float
    weight: float  # normalized 0..1 size driver


class VoicesPayload(BaseModel):
    most_positive: List[CommentItem]
    most_negative: List[CommentItem]
    most_engaged: List[CommentItem]


class AnalyzeResponse(BaseModel):
    video: VideoMeta
    fetched_comment_count: int
    breakdown: SentimentBreakdown
    timeline: List[TimelinePoint]
    lexicon: List[LexiconEntry]
    voices: VoicesPayload
    comments: List[CommentItem]


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
