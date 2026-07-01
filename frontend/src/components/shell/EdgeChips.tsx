import { motion, AnimatePresence } from "motion/react";
import type { PanelId } from "@/store/useResonanceStore";

interface EdgeChipsProps {
  closedPanels: { id: PanelId; label: string }[];
  onOpen: (id: PanelId) => void;
}

export function EdgeChips({ closedPanels, onOpen }: EdgeChipsProps) {
  if (closedPanels.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
      <AnimatePresence>
        {closedPanels.map((panel) => (
          <motion.button
            key={panel.id}
            type="button"
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onOpen(panel.id)}
            className="glass-panel pointer-events-auto rounded-full px-4 py-2 text-[12px] font-medium text-[var(--rs-text-secondary)] transition-colors hover:text-[var(--rs-text-primary)]"
          >
            + {panel.label}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
