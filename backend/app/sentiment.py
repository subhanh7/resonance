from __future__ import annotations

import re
from collections import Counter
from datetime import datetime
from functools import lru_cache
from typing import Any, Dict, List

import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

_POS_THRESHOLD = 0.05
_NEG_THRESHOLD = -0.05

_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "so", "to", "of",
    "in", "on", "for", "with", "as", "at", "by", "from", "is", "it", "its",
    "this", "that", "these", "those", "i", "you", "he", "she", "we", "they",
    "my", "your", "his", "her", "our", "their", "be", "been", "being", "am",
    "are", "was", "were", "have", "has", "had", "do", "does", "did", "not",
    "no", "yes", "just", "very", "really", "too", "also", "all", "some",
    "can", "will", "would", "could", "should", "what", "who", "when",
    "where", "why", "how", "there", "here", "up", "out", "about", "into",
    "than", "more", "most", "such", "only", "own", "same", "me", "us",
    "him", "them", "video", "comment", "comments", "one", "get", "got",
    "like", "im", "dont", "didnt", "youre", "thats", "it's", "don't",
    "didn't", "i'm", "that's", "you're", "watching", "watch",
}

_TOKEN_PATTERN = re.compile(r"[a-zA-Z']{3,}")


@lru_cache(maxsize=1)
def _ensure_vader() -> SentimentIntensityAnalyzer:
    try:
        return SentimentIntensityAnalyzer()
    except LookupError:
        nltk.download("vader_lexicon", quiet=True)
        return SentimentIntensityAnalyzer()


def _label(compound: float) -> str:
    if compound >= _POS_THRESHOLD:
        return "positive"
    if compound <= _NEG_THRESHOLD:
        return "negative"
    return "neutral"


def score_comments(comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    analyzer = _ensure_vader()
    scored: List[Dict[str, Any]] = []
    for comment in comments:
        text = comment.get("text", "") or ""
        scores = analyzer.polarity_scores(text)
        scored.append(
            {
                **comment,
                "compound": round(scores["compound"], 4),
                "pos": round(scores["pos"], 4),
                "neu": round(scores["neu"], 4),
                "neg": round(scores["neg"], 4),
                "label": _label(scores["compound"]),
            }
        )
    return scored


def build_breakdown(scored: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(scored)
    positive = sum(1 for c in scored if c["label"] == "positive")
    negative = sum(1 for c in scored if c["label"] == "negative")
    neutral = total - positive - negative
    average_compound = (sum(c["compound"] for c in scored) / total) if total else 0.0

    positive_pct = (positive / total * 100) if total else 0.0
    negative_pct = (negative / total * 100) if total else 0.0
    neutral_pct = (neutral / total * 100) if total else 0.0

    spread = positive_pct - negative_pct
    if average_compound > 0.15 and spread > 30:
        mood = "delight"
    elif negative_pct - positive_pct > 20:
        mood = "friction"
    elif abs(average_compound) <= 0.08 and neutral_pct > 35:
        mood = "calm"
    else:
        mood = "mixed"

    mood_score = max(-1.0, min(1.0, average_compound))

    return {
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
        "total": total,
        "positive_pct": round(positive_pct, 2),
        "neutral_pct": round(neutral_pct, 2),
        "negative_pct": round(negative_pct, 2),
        "average_compound": round(average_compound, 4),
        "mood": mood,
        "mood_score": round(mood_score, 4),
    }


def _parse_dt(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return datetime.min


def build_timeline(scored: List[Dict[str, Any]], target_buckets: int = 18) -> List[Dict[str, Any]]:
    if not scored:
        return []
    ordered = sorted(scored, key=lambda c: _parse_dt(c.get("published_at", "")))
    bucket_count = max(1, min(target_buckets, len(ordered)))
    chunk_size = max(1, -(-len(ordered) // bucket_count))  # ceil division

    timeline: List[Dict[str, Any]] = []
    for start in range(0, len(ordered), chunk_size):
        chunk = ordered[start : start + chunk_size]
        if not chunk:
            continue
        avg = sum(c["compound"] for c in chunk) / len(chunk)
        midpoint = chunk[len(chunk) // 2]
        label = midpoint.get("published_at", "")[:10] or f"bucket-{start}"
        timeline.append(
            {
                "bucket": label,
                "average_compound": round(avg, 4),
                "volume": len(chunk),
            }
        )
    return timeline


def build_lexicon(scored: List[Dict[str, Any]], top_n: int = 30) -> List[Dict[str, Any]]:
    frequency: Counter = Counter()
    compound_sum: Dict[str, float] = {}

    for comment in scored:
        text = (comment.get("text") or "").lower()
        tokens = {
            tok for tok in _TOKEN_PATTERN.findall(text) if tok not in _STOPWORDS
        }
        for tok in tokens:
            frequency[tok] += 1
            compound_sum[tok] = compound_sum.get(tok, 0.0) + comment["compound"]

    if not frequency:
        return []

    top_terms = frequency.most_common(top_n)
    max_freq = top_terms[0][1] if top_terms else 1

    lexicon = []
    for term, freq in top_terms:
        avg_compound = compound_sum[term] / freq
        lexicon.append(
            {
                "term": term,
                "frequency": freq,
                "average_compound": round(avg_compound, 4),
                "weight": round(freq / max_freq, 4),
            }
        )
    return lexicon


def build_voices(scored: List[Dict[str, Any]], top_n: int = 6) -> Dict[str, List[Dict[str, Any]]]:
    substantial = [c for c in scored if len(c.get("text", "").strip()) >= 8]
    pool = substantial if substantial else scored

    most_positive = sorted(pool, key=lambda c: c["compound"], reverse=True)[:top_n]
    most_negative = sorted(pool, key=lambda c: c["compound"])[:top_n]
    most_engaged = sorted(scored, key=lambda c: c["like_count"], reverse=True)[:top_n]

    return {
        "most_positive": most_positive,
        "most_negative": most_negative,
        "most_engaged": most_engaged,
    }
