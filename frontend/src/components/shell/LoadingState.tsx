import { useEffect, useState } from "react";
import { motion } from "motion/react";

const STEPS = [
  "Reaching the video…",
  "Pulling comments…",
  "Scoring with VADER…",
  "Shaping the field…",
];

export function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-white/20"
            initial={{ width: 24, height: 24, opacity: 0.8 }}
            animate={{ width: 112, height: 112, opacity: 0 }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.7,
            }}
          />
        ))}
        <span className="h-3 w-3 rounded-full bg-white" />
      </div>

      <motion.p
        key={stepIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 font-mono-data text-xs uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)]"
      >
        {STEPS[stepIndex]}
      </motion.p>
    </div>
  );
}
