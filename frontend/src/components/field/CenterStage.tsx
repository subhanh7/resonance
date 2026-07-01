import { motion } from "motion/react";
import { useResonanceStore } from "@/store/useResonanceStore";
import { moodToRgbString } from "@/lib/mood";
import type { VideoMeta, SentimentBreakdown } from "@/types/api";

interface CenterStageProps {
  video: VideoMeta;
  breakdown: SentimentBreakdown;
  moodScore: number;
}

export function CenterStage({ video, breakdown, moodScore }: CenterStageProps) {
  const { setSentimentFilter } = useResonanceStore();
  const rgbString = moodToRgbString(moodScore);

  let moodVerdict = "MIXED";
  if (moodScore >= 0.2) {
    moodVerdict = "DELIGHT";
  } else if (moodScore <= -0.2) {
    moodVerdict = "FRICTION";
  } else if (breakdown.neutral > 60) {
    moodVerdict = "CALM";
  }

  const handleChipClick = (sentiment: "positive" | "neutral" | "negative") => {
    setSentimentFilter(sentiment);
    const el = document.getElementById("analytics-table");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="pointer-events-auto flex w-full max-w-[320px] mx-auto flex-col items-center justify-start gap-6">
      
      {/* 1. Video Card */}
      <div 
        className="glass-panel w-full flex flex-col rounded-xl overflow-hidden relative"
        style={{
          boxShadow: `0 0 60px 10px rgba(${rgbString}, 0.18)`
        }}
      >
        <img 
          src={video.thumbnail_url} 
          alt={video.title}
          className="w-full aspect-video object-cover"
        />
        <div className="flex flex-col gap-1 p-4">
          <h3 className="line-clamp-2 font-display text-[15px] leading-tight text-[var(--rs-text-primary)]">
            {video.title}
          </h3>
          <p className="font-mono-data text-[11px] text-[var(--rs-text-tertiary)]">
            {video.channel_title} • {new Date(video.published_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 2. Mood Verdict */}
      <motion.div 
        className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 
          className="font-display text-7xl font-bold uppercase tracking-tight"
          style={{ color: `rgb(${rgbString})` }}
        >
          {moodVerdict}
        </h2>
        <span className="font-mono-data text-[14px] text-[var(--rs-text-tertiary)]">
          {moodScore > 0 ? "+" : ""}{moodScore.toFixed(2)} compound
        </span>
      </motion.div>

      {/* 3. Quick Stats Row */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleChipClick("positive")}
          className="cursor-pointer rounded-full px-3 py-1.5 font-mono-data text-[11px] transition-colors hover:bg-white/5"
          style={{
            border: '1px solid rgba(255, 158, 87, 0.3)',
            backgroundColor: 'rgba(255, 158, 87, 0.1)',
            color: 'rgb(255, 158, 87)'
          }}
        >
          👍 {breakdown.positive} positive
        </button>
        <button 
          onClick={() => handleChipClick("neutral")}
          className="cursor-pointer rounded-full px-3 py-1.5 font-mono-data text-[11px] transition-colors hover:bg-white/5"
          style={{
            border: '1px solid rgba(120, 200, 220, 0.3)',
            backgroundColor: 'rgba(120, 200, 220, 0.1)',
            color: 'rgb(120, 200, 220)'
          }}
        >
          😐 {breakdown.neutral} neutral
        </button>
        <button 
          onClick={() => handleChipClick("negative")}
          className="cursor-pointer rounded-full px-3 py-1.5 font-mono-data text-[11px] transition-colors hover:bg-white/5"
          style={{
            border: '1px solid rgba(124, 109, 255, 0.3)',
            backgroundColor: 'rgba(124, 109, 255, 0.1)',
            color: 'rgb(124, 109, 255)'
          }}
        >
          👎 {breakdown.negative} negative
        </button>
      </div>

    </div>
  );
}
