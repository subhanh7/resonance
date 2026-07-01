import { useState, type FormEvent } from "react";
import { motion } from "motion/react";

interface IntakeCapsuleProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

const EXAMPLE_PROMPTS = [
  "https://youtube.com/watch?v=…",
  "https://youtu.be/…",
  "https://youtube.com/shorts/…",
];

export function IntakeCapsule({ onSubmit, disabled, errorMessage }: IntakeCapsuleProps) {
  const [value, setValue] = useState("");
  const [exampleIndex] = useState(() => Math.floor(Math.random() * EXAMPLE_PROMPTS.length));

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 text-center"
      >
        <p className="font-mono-data text-xs uppercase tracking-[0.32em] text-[var(--rs-text-tertiary)]">
          Resonance
        </p>
        <h1 className="font-display text-balance-pretty mt-4 max-w-2xl text-[2.6rem] leading-[1.05] font-medium text-[var(--rs-text-primary)] sm:text-6xl">
          Drop a video.
          <br />
          <span className="text-[var(--rs-text-secondary)]">Hear what the room thinks.</span>
        </h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit}
        className="glass-panel-strong flex w-full max-w-xl items-center gap-2 rounded-full p-2 pl-6 shadow-2xl"
      >
        <input
          type="text"
          inputMode="url"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={EXAMPLE_PROMPTS[exampleIndex]}
          disabled={disabled}
          aria-label="YouTube video URL"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--rs-text-primary)] placeholder:text-[var(--rs-text-tertiary)] focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="group relative shrink-0 overflow-hidden rounded-full bg-[var(--rs-text-primary)] px-6 py-3 text-sm font-medium text-[var(--rs-void)] transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {disabled ? "Listening…" : "Analyze"}
        </button>
      </motion.form>

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 max-w-md text-center text-sm text-[rgb(255,140,140)]"
          role="alert"
        >
          {errorMessage}
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-xs text-[var(--rs-text-tertiary)]"
      >
        Real comments, fetched live from YouTube. Scored with VADER as they arrive.
      </motion.p>
    </div>
  );
}
