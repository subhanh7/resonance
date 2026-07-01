import { useState } from "react";
import { FloatingPanel } from "./FloatingPanel";
import type { CommentItem, VoicesPayload } from "@/types/api";
import { moodToRgbString } from "@/lib/mood";
import { formatRelativeDate } from "@/lib/format";

interface VoicesPanelProps {
  voices: VoicesPayload;
  onClose?: () => void;
  onSelect?: (comment: CommentItem) => void;
}

const TABS: { id: keyof VoicesPayload; label: string }[] = [
  { id: "most_positive", label: "Warmest" },
  { id: "most_negative", label: "Sharpest" },
  { id: "most_engaged", label: "Loudest" },
];

export function VoicesPanel({ voices, onClose, onSelect }: VoicesPanelProps) {
  const [active, setActive] = useState<keyof VoicesPayload>("most_positive");
  const list = voices[active];

  return (
    <FloatingPanel title="Voices" eyebrow="What people actually said" onClose={onClose}>
      <div className="mb-4 flex gap-1 rounded-full bg-white/5 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
              active === tab.id
                ? "bg-white/14 text-[var(--rs-text-primary)]"
                : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {list.length === 0 && (
          <li className="text-[13px] text-[var(--rs-text-tertiary)]">Nothing here yet.</li>
        )}
        {list.map((comment) => (
          <li key={comment.id}>
            <button
              type="button"
              onClick={() => onSelect?.(comment)}
              className="w-full rounded-[14px] border border-white/8 bg-white/4 p-3 text-left transition-colors hover:bg-white/8"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-medium text-[var(--rs-text-secondary)]">
                  {comment.author}
                </span>
                <span
                  className="shrink-0 font-mono-data text-[10px]"
                  style={{ color: `rgb(${moodToRgbString(comment.compound)})` }}
                >
                  {comment.compound >= 0 ? "+" : ""}
                  {comment.compound.toFixed(2)}
                </span>
              </div>
              <p className="line-clamp-3 text-[13px] leading-snug text-[var(--rs-text-primary)]">
                {comment.text}
              </p>
              <div className="mt-1.5 flex items-center gap-3 font-mono-data text-[10px] text-[var(--rs-text-tertiary)]">
                <span>♥ {comment.like_count.toLocaleString()}</span>
                <span>{formatRelativeDate(comment.published_at)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </FloatingPanel>
  );
}
