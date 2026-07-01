// Interpolates between the cool (negative) and warm (positive) mood accent
// colors defined in index.css, driven by a -1..1 mood_score.

const COOL: [number, number, number] = [124, 109, 255]; // indigo/violet
const NEUTRAL: [number, number, number] = [120, 200, 220]; // soft cyan
const WARM: [number, number, number] = [255, 158, 87]; // coral/amber

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

/** moodScore: -1 (very negative) .. 1 (very positive) */
export function moodToRgb(moodScore: number): [number, number, number] {
  const clamped = Math.max(-1, Math.min(1, moodScore));
  if (clamped < 0) {
    return mixColor(COOL, NEUTRAL, clamped + 1); // -1..0 -> 0..1
  }
  return mixColor(NEUTRAL, WARM, clamped);
}

export function moodToRgbString(moodScore: number): string {
  const [r, g, b] = moodToRgb(moodScore);
  return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
}

export function moodToCssGradient(moodScore: number, alpha = 0.35): string {
  const rgb = moodToRgbString(moodScore);
  return `radial-gradient(ellipse at 50% 0%, rgba(${rgb}, ${alpha}) 0%, rgba(7,7,11,0) 60%)`;
}

export const MOOD_COPY: Record<
  string,
  { label: string; description: string }
> = {
  delight: {
    label: "Delight",
    description: "The room is warm. Most voices are glad they watched.",
  },
  calm: {
    label: "Calm",
    description: "Steady and even — comments lean observational, not emotional.",
  },
  friction: {
    label: "Friction",
    description: "There's real disagreement here. Worth a closer read.",
  },
  mixed: {
    label: "Mixed",
    description: "Opinions are split fairly evenly across the room.",
  },
};
