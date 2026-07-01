import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { FloatingPanel } from "./FloatingPanel";
import type { SentimentBreakdown } from "@/types/api";
import { MOOD_COPY, moodToRgbString } from "@/lib/mood";
import { formatPercent } from "@/lib/format";
import { useResonanceStore } from "@/store/useResonanceStore";

interface PulsePanelProps {
  breakdown: SentimentBreakdown;
  onClose?: () => void;
}

export function PulsePanel({ breakdown, onClose }: PulsePanelProps) {
  const { setSentimentFilter } = useResonanceStore();
  const arcRef = useRef<SVGCircleElement>(null);
  const circumference = 2 * Math.PI * 54;

  const handleSentimentClick = (label: "positive" | "neutral" | "negative") => {
    setSentimentFilter(label);
    const el = document.getElementById("analytics-table");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!arcRef.current) return;
    const targetFraction = (breakdown.average_compound + 1) / 2; // 0..1
    const controls = animate(0, targetFraction, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (arcRef.current) {
          arcRef.current.style.strokeDashoffset = String(
            circumference * (1 - latest)
          );
        }
      },
    });
    return () => controls.stop();
  }, [breakdown.average_compound, circumference]);

  const moodCopy = MOOD_COPY[breakdown.mood] ?? MOOD_COPY.mixed;
  const moodRgb = moodToRgbString(breakdown.mood_score);

  return (
    <FloatingPanel title="Pulse" eyebrow="Aggregate mood" onClose={onClose}>
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
            />
            <circle
              ref={arcRef}
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={`rgb(${moodRgb})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{ transition: "stroke 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-medium">
              {breakdown.average_compound >= 0 ? "+" : ""}
              {breakdown.average_compound.toFixed(2)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--rs-text-tertiary)]">
              compound
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-medium" style={{ color: `rgb(${moodRgb})` }}>
            {moodCopy.label}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[var(--rs-text-secondary)]">
            {moodCopy.description}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <SentimentRow label="Positive" value={breakdown.positive_pct} color="rgb(255,158,87)" onClick={() => handleSentimentClick("positive")} />
        <SentimentRow label="Neutral" value={breakdown.neutral_pct} color="rgb(120,200,220)" onClick={() => handleSentimentClick("neutral")} />
        <SentimentRow label="Negative" value={breakdown.negative_pct} color="rgb(124,109,255)" onClick={() => handleSentimentClick("negative")} />
      </div>

      <p className="mt-4 font-mono-data text-[11px] text-[var(--rs-text-tertiary)]">
        {breakdown.total.toLocaleString()} comments scored
      </p>
    </FloatingPanel>
  );
}

function SentimentRow({
  label,
  value,
  color,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group p-1.5 -mx-1.5 rounded transition-all border"
      style={{
        borderColor: isHovered ? color : 'transparent',
        backgroundColor: isHovered ? color.replace('rgb', 'rgba').replace(')', ', 0.05)') : 'transparent'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span className="w-14 shrink-0 text-[12px] text-[var(--rs-text-secondary)] group-hover:text-white transition-colors">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono-data text-[11px] text-[var(--rs-text-tertiary)]">
        {formatPercent(value)}
      </span>
    </div>
  );
}
