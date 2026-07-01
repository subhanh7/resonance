from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple, Optional

import httpx

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

_VIDEO_ID_PATTERNS = [
    re.compile(r"(?:youtu\.be/)([A-Za-z0-9_-]{11})"),
    re.compile(r"(?:youtube\.com/watch\?v=)([A-Za-z0-9_-]{11})"),
    re.compile(r"(?:youtube\.com/shorts/)([A-Za-z0-9_-]{11})"),
    re.compile(r"(?:youtube\.com/live/)([A-Za-z0-9_-]{11})"),
    re.compile(r"(?:youtube\.com/embed/)([A-Za-z0-9_-]{11})"),
]
_BARE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")


class YouTubeError(Exception):
    def __init__(self, message: str, code: str = "youtube_error", status: int = 502):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status


def extract_video_id(url_or_id: str) -> str:
    candidate = url_or_id.strip()
    if _BARE_ID_PATTERN.match(candidate):
        return candidate
    for pattern in _VIDEO_ID_PATTERNS:
        match = pattern.search(candidate)
        if match:
            return match.group(1)
    raise YouTubeError(
        "That doesn't look like a YouTube video link. Paste a watch, share, or "
        "shorts URL.",
        code="invalid_url",
        status=400,
    )


class YouTubeClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise YouTubeError(
                "YOUTUBE_API_KEY is not configured on the server.",
                code="missing_api_key",
                status=500,
            )
        self.api_key = api_key

    async def _get(self, client: httpx.AsyncClient, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        params = {**params, "key": self.api_key}
        response = await client.get(f"{YOUTUBE_API_BASE}/{path}", params=params)
        if response.status_code == 403:
            raise YouTubeError(
                "YouTube rejected the request (quota exceeded or comments "
                "disabled for this video).",
                code="forbidden",
                status=403,
            )
        if response.status_code == 404:
            raise YouTubeError("Video not found.", code="not_found", status=404)
        if response.status_code >= 400:
            raise YouTubeError(
                f"YouTube API error ({response.status_code}).",
                code="upstream_error",
                status=502,
            )
        return response.json()

    async def fetch_video_metadata(
        self, client: httpx.AsyncClient, video_id: str
    ) -> Dict[str, Any]:
        data = await self._get(
            client,
            "videos",
            {"part": "snippet,statistics,contentDetails", "id": video_id},
        )
        items = data.get("items", [])
        if not items:
            raise YouTubeError("Video not found.", code="not_found", status=404)
        item = items[0]
        snippet = item["snippet"]
        statistics = item.get("statistics", {})
        thumbnails = snippet.get("thumbnails", {})
        thumb = (
            thumbnails.get("maxres")
            or thumbnails.get("high")
            or thumbnails.get("medium")
            or thumbnails.get("default")
            or {}
        )
        return {
            "id": video_id,
            "title": snippet.get("title", "Untitled"),
            "channel_title": snippet.get("channelTitle", "Unknown channel"),
            "channel_id": snippet.get("channelId", ""),
            "published_at": snippet.get("publishedAt", ""),
            "thumbnail_url": thumb.get("url", ""),
            "view_count": int(statistics.get("viewCount", 0)),
            "like_count": int(statistics.get("likeCount", 0)),
            "comment_count": int(statistics.get("commentCount", 0)),
            "duration_iso": item.get("contentDetails", {}).get("duration", "PT0S"),
        }

    async def fetch_comments(
        self, client: httpx.AsyncClient, video_id: str, max_comments: Optional[int]
    ) -> List[Dict[str, Any]]:
        comments: List[Dict[str, Any]] = []
        page_token: str | None = None
        limit = max_comments if max_comments is not None else 20000

        while len(comments) < limit:
            params: Dict[str, Any] = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": min(100, limit - len(comments)),
                "order": "relevance",
                "textFormat": "plainText",
            }
            if page_token:
                params["pageToken"] = page_token

            data = await self._get(client, "commentThreads", params)

            for item in data.get("items", []):
                top = item["snippet"]["topLevelComment"]["snippet"]
                comments.append(
                    {
                        "id": item["id"],
                        "author": top.get("authorDisplayName", "Unknown"),
                        "author_avatar": top.get("authorProfileImageUrl", ""),
                        "text": top.get("textOriginal", ""),
                        "like_count": int(top.get("likeCount", 0)),
                        "published_at": top.get("publishedAt", ""),
                        "reply_count": int(item["snippet"].get("totalReplyCount", 0)),
                    }
                )

            page_token = data.get("nextPageToken")
            if not page_token:
                break

        return comments[:limit]


async def fetch_video_and_comments(
    api_key: str, video_id: str, max_comments: Optional[int]
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    youtube = YouTubeClient(api_key)
    async with httpx.AsyncClient(timeout=120.0) as client:
        video = await youtube.fetch_video_metadata(client, video_id)
        comments = await youtube.fetch_comments(client, video_id, max_comments)
    if not comments:
        raise YouTubeError(
            "This video has no comments, or comments are disabled.",
            code="no_comments",
            status=422,
        )
    return video, comments
