/**
 * Single source of truth for classification styling.
 * Returns Tailwind class strings for chip, dot, and classification-matching bar.
 * For confidence bars (colored by confidence, not classification), use confidenceBarStyle().
 */

export type ClassificationStyle = {
  /** Classes for the chip container: rounded-full, soft tinted bg, 1px ring, text */
  chip: string;
  /** Classes for the 6px colored dot before the label */
  dot: string;
  /** Classes for a bar matching the classification hue (not confidence-based) */
  bar: string;
};

/**
 * Get chip, dot, and bar styles for a classification name.
 * Light-mode only; dark mode is generated automatically via scripts/gen-dark-theme.mjs
 */
export function classificationStyle(name: string): ClassificationStyle {
  switch (name) {
    case 'Assistant to Reply': {
      // indigo
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200',
        dot: 'size-1.5 rounded-full bg-indigo-500',
        bar: 'bg-indigo-500',
      };
    }
    case 'Client to Reply': {
      // orange
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200',
        dot: 'size-1.5 rounded-full bg-orange-500',
        bar: 'bg-orange-500',
      };
    }
    case 'No Reply Needed': {
      // slate (quietest)
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200',
        dot: 'size-1.5 rounded-full bg-slate-400',
        bar: 'bg-slate-400',
      };
    }
    case 'Action Required': {
      // rose
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
        dot: 'size-1.5 rounded-full bg-rose-500',
        bar: 'bg-rose-500',
      };
    }
    case 'Waiting for Response': {
      // sky
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
        dot: 'size-1.5 rounded-full bg-sky-500',
        bar: 'bg-sky-500',
      };
    }
    case 'Meetings': {
      // emerald
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
        dot: 'size-1.5 rounded-full bg-emerald-500',
        bar: 'bg-emerald-500',
      };
    }
    case 'Important': {
      // fuchsia
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-200',
        dot: 'size-1.5 rounded-full bg-fuchsia-500',
        bar: 'bg-fuchsia-500',
      };
    }
    default: {
      // Unknown -> slate fallback
      return {
        chip: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200',
        dot: 'size-1.5 rounded-full bg-slate-400',
        bar: 'bg-slate-400',
      };
    }
  }
}

/**
 * Get the fill color classes for a confidence bar (3px high, rounded).
 * Color is based on confidence value, not classification.
 * Track is always bg-slate-100.
 */
export function confidenceBarStyle(confidence: number): string {
  if (confidence >= 85) {
    return 'bg-emerald-500';
  }
  if (confidence >= 70) {
    return 'bg-sky-500';
  }
  return 'bg-amber-500';
}