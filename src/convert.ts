const NUMBER = String.raw`-?(?:\d+|\d*\.\d+)`;
const SHORTCUT_PATTERN = new RegExp(`(${NUMBER})(prem|pxrem)$`, 'i');
const SELECTION_PATTERN = new RegExp(`^(${NUMBER})(prem|pxrem|px)?$`, 'i');
const INVALID_PREFIX_PATTERN = /[\p{L}_.]$/u;
const MAX_FRACTION_DIGITS = 5;

export const DEFAULT_PIXELS_PER_REM = 16;

export interface ShortcutValue {
  pixels: number;
  rawValue: string;
}

/**
 * Finds a `<number>prem` / `<number>pxrem` shortcut at the end of `linePrefix`.
 * Values glued to an identifier (e.g. `w-16prem`) or another number (e.g. `1.2.5prem`) are ignored.
 */
export function findShortcut(linePrefix: string): ShortcutValue | undefined {
  const match = linePrefix.match(SHORTCUT_PATTERN);
  if (!match || match.index === undefined) {
    return undefined;
  }

  if (INVALID_PREFIX_PATTERN.test(linePrefix.slice(0, match.index))) {
    return undefined;
  }

  return toValue(match[1], match[0]);
}

/**
 * Parses a selection that consists of exactly one value: `16px`, `16prem`, `16pxrem` or a bare number (treated as pixels).
 * Surrounding whitespace is allowed; anything else is rejected.
 */
export function parseSelection(text: string): ShortcutValue | undefined {
  const match = text.trim().match(SELECTION_PATTERN);
  if (!match) {
    return undefined;
  }

  return toValue(match[1], match[0]);
}

export function toRemText(pixels: number, pixelsPerRem: number): string {
  return `${formatRemValue(pixels / pixelsPerRem)}rem`;
}

export function normalizePixelsPerRem(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1
    ? value
    : DEFAULT_PIXELS_PER_REM;
}

function toValue(numericValue: string, rawValue: string): ShortcutValue | undefined {
  const pixels = Number.parseFloat(numericValue);
  if (!Number.isFinite(pixels)) {
    return undefined;
  }

  return { pixels, rawValue };
}

function formatRemValue(value: number): string {
  // Round the magnitude so that negative values round the same way as positive ones.
  const factor = 10 ** MAX_FRACTION_DIGITS;
  const rounded = Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;

  if (rounded === 0) {
    return '0';
  }

  return (Math.sign(value) * rounded).toString();
}
