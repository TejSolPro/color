export type HexColor = `#${string}`;

export interface ContrastAudit {
  readonly foreground: HexColor;
  readonly background: HexColor;
  readonly ratio: number;
  readonly normalText: boolean;
  readonly largeText: boolean;
  readonly nonText: boolean;
}

const HEX_PATTERN = /^#([\da-f]{3}|[\da-f]{6})$/i;

function normalizeHex(input: string): HexColor {
  if (!HEX_PATTERN.test(input)) {
    throw new TypeError(`Invalid hexadecimal color: ${input}`);
  }

  const value = input.toLowerCase();
  if (value.length === 7) return value as HexColor;

  const [r, g, b] = value.slice(1).split("");
  return `#${r}${r}${g}${g}${b}${b}` as HexColor;
}

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(input: string): number {
  const color = normalizeHex(input);
  const channels = [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ].map(channelToLinear);

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export function auditPair(foreground: string, background: string): ContrastAudit {
  const ratio = contrastRatio(foreground, background);

  return {
    foreground: normalizeHex(foreground),
    background: normalizeHex(background),
    ratio: Number(ratio.toFixed(2)),
    normalText: ratio >= 4.5,
    largeText: ratio >= 3,
    nonText: ratio >= 3,
  };
}
