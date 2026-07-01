import { motion } from "motion/react";
import type { VideoMeta } from "@/types/api";
import { formatCompactNumber, formatIsoDuration, formatRelativeDate } from "@/lib/format";

interface VideoHeaderProps {
  video: VideoMeta;
  fetchedCommentCount: number;
  onNewAnalysis: () => void;
}

export function VideoHeader({ video, fetchedCommentCount, onNewAnalysis }: VideoHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel pointer-events-auto flex w-full max-w-3xl items-center gap-4 rounded-full px-4 py-2.5"
    >
      {video.thumbnail_url && (
        <img
          src={video.thumbnail_url}
          alt=""
          className="h-10 w-16 shrink-0 rounded-lg object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[var(--rs-text-primary)]">
          {video.title}
        </p>
        <p className="truncate text-[11px] text-[var(--rs-text-tertiary)]">
          {video.channel_title} · {formatRelativeDate(video.published_at)}
          {video.duration_iso ? ` · ${formatIsoDuration(video.duration_iso)}` : ""}
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-3 font-mono-data text-[11px] text-[var(--rs-text-tertiary)] sm:flex">
        <span>{formatCompactNumber(video.view_count)} views</span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span>{formatCompactNumber(fetchedCommentCount)} analyzed</span>
      </div>
      <button
        type="button"
        onClick={onNewAnalysis}
        className="shrink-0 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-[var(--rs-text-primary)] transition-colors hover:bg-white/16"
      >
        New
      </button>
    </motion.header>
  );
}
