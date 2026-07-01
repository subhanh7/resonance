import { useMemo } from "react";
import { FloatingPanel } from "./FloatingPanel";
import type { TimelinePoint } from "@/types/api";
import { moodToRgbString } from "@/lib/mood";

interface SignalPanelProps {
  timeline: TimelinePoint[];
  onClose?: () => void;
}

const WIDTH = 320;
const HEIGHT = 110;
const PADDING_X = 8;
const PADDING_Y = 14;

export function SignalPanel({ timeline, onClose }: SignalPanelProps) {
  const { linePath, areaPath, points } = useMemo(() => {
    if (timeline.length === 0) {
      return { linePath: "", areaPath: "", points: [] as { x: number; y: number; v: number }[] };
    }
    const usableWidth = WIDTH - PADDING_X * 2;
    const usableHeight = HEIGHT - PADDING_Y * 2;
    const step = timeline.length > 1 ? usableWidth / (timeline.length - 1) : 0;

    const pts = timeline.map((point, i) => {
      const x = PADDING_X + i * step;
      // compound is -1..1, map to y (inverted, since svg y grows downward)
      const normalized = (point.average_compound + 1) / 2;
      const y = PADDING_Y + (1 - normalized) * usableHeight;
      return { x, y, v: point.average_compound };
    });

    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");

    const area =
      pts.length > 0
        ? `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${HEIGHT - PADDING_Y} L ${pts[0].x.toFixed(2)} ${HEIGHT - PADDING_Y} Z`
        : "";

    return { linePath: line, areaPath: area, points: pts };
  }, [timeline]);

  const midlineY = PADDING_Y + (HEIGHT - PADDING_Y * 2) / 2;

  return (
    <FloatingPanel title="Signal" eyebrow="Sentiment over time" onClose={onClose} className="w-full">
      {timeline.length === 0 ? (
        <p className="text-[13px] text-[var(--rs-text-tertiary)]">Not enough spread to chart yet.</p>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="signal-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          <line
            x1={PADDING_X}
            x2={WIDTH - PADDING_X}
            y1={midlineY}
            y2={midlineY}
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="2 4"
          />

          <path d={areaPath} fill="url(#signal-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 3.2 : 2}
              fill={`rgb(${moodToRgbString(p.v)})`}
            >
              <title>{timeline[i].bucket}: {p.v.toFixed(2)}</title>
            </circle>
          ))}
        </svg>
      )}

      <div className="mt-3 flex items-center justify-between font-mono-data text-[10px] text-[var(--rs-text-tertiary)]">
        <span>{timeline[0]?.bucket ?? ""}</span>
        <span>{timeline[timeline.length - 1]?.bucket ?? ""}</span>
      </div>
    </FloatingPanel>
  );
}
