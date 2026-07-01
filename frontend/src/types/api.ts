export type SentimentLabel = "positive" | "neutral" | "negative";
export type Mood = "delight" | "calm" | "friction" | "mixed";

export interface VideoMeta {
  id: string;
  title: string;
  channel_title: string;
  channel_id: string;
  published_at: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  duration_iso: string;
}

export interface CommentItem {
  id: string;
  author: string;
  author_avatar: string;
  text: string;
  like_count: number;
  published_at: string;
  reply_count: number;
  compound: number;
  pos: number;
  neu: number;
  neg: number;
  label: SentimentLabel;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  average_compound: number;
  mood: Mood;
  mood_score: number;
}

export interface TimelinePoint {
  bucket: string;
  average_compound: number;
  volume: number;
}

export interface LexiconEntry {
  term: string;
  frequency: number;
  average_compound: number;
  weight: number;
}

export interface VoicesPayload {
  most_positive: CommentItem[];
  most_negative: CommentItem[];
  most_engaged: CommentItem[];
}

export interface AnalyzeResponse {
  video: VideoMeta;
  fetched_comment_count: number;
  breakdown: SentimentBreakdown;
  timeline: TimelinePoint[];
  lexicon: LexiconEntry[];
  voices: VoicesPayload;
  comments: CommentItem[];
}

export interface AnalyzeRequest {
  url: string;
  max_comments?: number;
}

export interface ApiErrorShape {
  detail: string;
}
