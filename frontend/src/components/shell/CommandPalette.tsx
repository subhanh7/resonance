import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PanelId } from "@/store/useResonanceStore";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  panels: { id: PanelId; label: string; description: string; isOpen: boolean }[];
  onTogglePanel: (id: PanelId) => void;
}

export function CommandPalette({ open, onClose, panels, onTogglePanel }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[18vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong w-full max-w-md overflow-hidden rounded-2xl"
          >
            <input
              ref={inputRef}
              readOnly
              value=""
              placeholder="Summon a panel…"
              className="w-full border-b border-white/10 bg-transparent px-5 py-4 text-sm text-[var(--rs-text-primary)] placeholder:text-[var(--rs-text-tertiary)] focus:outline-none"
            />
            <ul className="max-h-72 overflow-y-auto p-2">
              {panels.map((panel) => (
                <li key={panel.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePanel(panel.id);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/8"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[var(--rs-text-primary)]">
                        {panel.label}
                      </p>
                      <p className="text-[11px] text-[var(--rs-text-tertiary)]">
                        {panel.description}
                      </p>
                    </div>
                    <span className="font-mono-data text-[10px] text-[var(--rs-text-tertiary)]">
                      {panel.isOpen ? "hide" : "show"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
