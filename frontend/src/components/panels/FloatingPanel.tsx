import { type ReactNode } from "react";
import { motion } from "motion/react";

interface FloatingPanelProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  delay?: number;
}

export function FloatingPanel({
  title,
  eyebrow,
  children,
  className = "",
  onClose,
  delay = 0,
}: FloatingPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel pointer-events-auto rounded-[var(--rs-radius-lg)] p-5 ${className}`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="font-mono-data text-[10px] uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display mt-1 text-[15px] font-medium text-[var(--rs-text-primary)]">
            {title}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={`Collapse ${title} panel`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--rs-text-tertiary)] transition-colors hover:bg-white/10 hover:text-[var(--rs-text-primary)]"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>
      {children}
    </motion.section>
  );
}
