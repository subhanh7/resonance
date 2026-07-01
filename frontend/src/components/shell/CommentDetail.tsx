import { motion, AnimatePresence } from "motion/react";
import type { CommentItem } from "@/types/api";
import { moodToRgbString } from "@/lib/mood";
import { formatRelativeDate } from "@/lib/format";

interface CommentDetailProps {
  comment: CommentItem | null;
  onClose: () => void;
}

export function CommentDetail({ comment, onClose }: CommentDetailProps) {
  return (
    <AnimatePresence>
      {comment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-strong w-full max-w-md rounded-[var(--rs-radius-lg)] p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {comment.author_avatar && (
                  <img src={comment.author_avatar} alt="" className="h-8 w-8 rounded-full" />
                )}
                <div>
                  <p className="text-[13px] font-medium text-[var(--rs-text-primary)]">
                    {comment.author}
                  </p>
                  <p className="text-[11px] text-[var(--rs-text-tertiary)]">
                    {formatRelativeDate(comment.published_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--rs-text-tertiary)] hover:bg-white/10"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="text-[15px] leading-relaxed text-[var(--rs-text-primary)]">
              {comment.text}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 font-mono-data text-[11px] text-[var(--rs-text-tertiary)]">
              <span
                className="rounded-full px-2.5 py-1"
                style={{
                  color: `rgb(${moodToRgbString(comment.compound)})`,
                  background: `rgba(${moodToRgbString(comment.compound)}, 0.12)`,
                }}
              >
                {comment.label} · {comment.compound.toFixed(2)}
              </span>
              <span>♥ {comment.like_count.toLocaleString()}</span>
              <span>{comment.reply_count.toLocaleString()} replies</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
