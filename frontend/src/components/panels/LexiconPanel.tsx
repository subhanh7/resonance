import { FloatingPanel } from "./FloatingPanel";
import type { LexiconEntry } from "@/types/api";
import { moodToRgbString } from "@/lib/mood";

interface LexiconPanelProps {
  lexicon: LexiconEntry[];
  onClose?: () => void;
}

export function LexiconPanel({ lexicon, onClose }: LexiconPanelProps) {
  return (
    <FloatingPanel title="Lexicon" eyebrow="Words driving the mood" onClose={onClose}>
      {lexicon.length === 0 ? (
        <p className="text-[13px] text-[var(--rs-text-tertiary)]">Not enough text to surface terms.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {lexicon.map((entry) => {
            const fontSize = 11 + entry.weight * 11;
            const rgb = moodToRgbString(entry.average_compound);
            return (
              <span
                key={entry.term}
                className="rounded-full border px-3 py-1.5 transition-transform duration-200 hover:scale-105"
                style={{
                  fontSize: `${fontSize}px`,
                  borderColor: `rgba(${rgb}, 0.35)`,
                  background: `rgba(${rgb}, 0.1)`,
                  color: `rgb(${rgb})`,
                }}
                title={`${entry.frequency} mentions · avg ${entry.average_compound.toFixed(2)}`}
              >
                {entry.term}
              </span>
            );
          })}
        </div>
      )}
    </FloatingPanel>
  );
}
