export type HexColor = `#${string}`;

export interface ContrastAudit {
  readonly foreground: HexColor;
  readonly background: HexColor;
  readonly ratio: number;
  readonly normalText: boolean;
  readonly largeText: boolean;
  readonly nonText: boolean;
}

export const ONE_BRAND_THEME_SCHEMA_VERSION = "0.1.0" as const;

export type ThemeTokenName =
  | "canvas"
  | "surface"
  | "text"
  | "mutedText"
  | "primary"
  | "onPrimary"
  | "primaryHover"
  | "primarySubtle"
  | "border"
  | "primaryBorder"
  | "focusRing";

export interface OneBrandThemeRequest {
  readonly brand: string;
  readonly canvas?: string;
}

export interface OneBrandThemeTokens {
  readonly canvas: HexColor;
  readonly surface: HexColor;
  readonly text: HexColor;
  readonly mutedText: HexColor;
  readonly primary: HexColor;
  readonly onPrimary: HexColor;
  readonly primaryHover: HexColor;
  readonly primarySubtle: HexColor;
  readonly border: HexColor;
  readonly primaryBorder: HexColor;
  readonly focusRing: HexColor;
}

export interface ThemePairAudit {
  readonly id: string;
  readonly foreground: ThemeTokenName;
  readonly background: ThemeTokenName;
  readonly criterion: "WCAG 2.2 SC 1.4.3" | "WCAG 2.2 SC 1.4.11";
  readonly requiredRatio: 4.5 | 3;
  readonly ratio: number;
  readonly passes: boolean;
  readonly note: string;
}

export interface ThemeTokenProvenance {
  readonly token: ThemeTokenName;
  readonly sources: readonly ("request.brand" | "request.canvas" | "default.canvas" | ThemeTokenName)[];
  readonly method: string;
}

export interface OneBrandTheme {
  readonly schemaVersion: typeof ONE_BRAND_THEME_SCHEMA_VERSION;
  readonly algorithm: "srgb-v0.1";
  readonly request: {
    readonly brand: HexColor;
    readonly canvas: HexColor;
  };
  readonly tokens: OneBrandThemeTokens;
  readonly audits: readonly ThemePairAudit[];
  readonly allRequiredPairsPass: boolean;
  readonly provenance: readonly ThemeTokenProvenance[];
}

const HEX_PATTERN = /^#([\da-f]{3}|[\da-f]{6})$/i;

export function normalizeHex(input: string): HexColor {
  if (!HEX_PATTERN.test(input)) {
    throw new TypeError(`Invalid hexadecimal color: ${input}`);
  }

  const value = input.toLowerCase();
  if (value.length === 7) return value as HexColor;

  const [r, g, b] = value.slice(1).split("");
  return `#${r}${r}${g}${g}${b}${b}` as HexColor;
}

function rgb(input: string): readonly [number, number, number] {
  const color = normalizeHex(input);
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
}

function toHex(channels: readonly number[]): HexColor {
  const value = channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("");
  return `#${value}` as HexColor;
}

function mix(first: string, second: string, amount: number): HexColor {
  const start = rgb(first);
  const end = rgb(second);
  return toHex(start.map((value, index) => value + (end[index]! - value) * amount));
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

/**
 * Truncates (never rounds up) to two decimals so a reported ratio can never
 * appear to meet a threshold that the unrounded value fails. WCAG compares
 * the exact ratio, so 4.496 must not be shown as 4.50.
 */
function displayRatio(ratio: number): number {
  return Math.floor(ratio * 100) / 100;
}

export function auditPair(foreground: string, background: string): ContrastAudit {
  const ratio = contrastRatio(foreground, background);

  return {
    foreground: normalizeHex(foreground),
    background: normalizeHex(background),
    ratio: displayRatio(ratio),
    normalText: ratio >= 4.5,
    largeText: ratio >= 3,
    nonText: ratio >= 3,
  };
}

const DEFAULT_CANVAS = "#f3efe7";
const PREFERRED_DARK_TEXT = "#171512";
const WHITE = "#ffffff";
const BLACK = "#000000";

function bestText(background: string): HexColor {
  const preferred = [PREFERRED_DARK_TEXT, WHITE]
    .map((value) => ({ value: normalizeHex(value), ratio: contrastRatio(value, background) }))
    .sort((first, second) => second.ratio - first.ratio)[0]!;

  if (preferred.ratio >= 4.5) return preferred.value;

  return contrastRatio(BLACK, background) >= contrastRatio(WHITE, background)
    ? normalizeHex(BLACK)
    : normalizeHex(WHITE);
}

function mostSubtlePassing(
  foreground: string,
  background: string,
  requiredRatio: number,
  maximumMix: number,
): HexColor {
  for (let step = Math.round(maximumMix * 100); step >= 0; step -= 1) {
    const candidate = mix(foreground, background, step / 100);
    if (contrastRatio(candidate, background) >= requiredRatio) return candidate;
  }
  return normalizeHex(foreground);
}

function tintThatPreservesText(
  brand: string,
  canvas: string,
  text: string,
  initialCanvasMix: number,
): HexColor {
  for (let step = Math.round(initialCanvasMix * 100); step <= 100; step += 1) {
    const candidate = mix(brand, canvas, step / 100);
    if (contrastRatio(text, candidate) >= 4.5) return candidate;
  }
  return normalizeHex(canvas);
}

function accessibleFocusRing(brand: string, canvas: string): HexColor {
  const preferred = mix(brand, WHITE, 0.25);
  if (contrastRatio(preferred, canvas) >= 3) return preferred;

  const target = contrastRatio(BLACK, canvas) >= contrastRatio(WHITE, canvas) ? BLACK : WHITE;
  for (let step = 0; step <= 20; step += 1) {
    const candidate = mix(brand, target, step / 20);
    if (contrastRatio(candidate, canvas) >= 3) return candidate;
  }
  return normalizeHex(target);
}

function makeAudit(
  id: string,
  foreground: ThemeTokenName,
  background: ThemeTokenName,
  tokens: OneBrandThemeTokens,
  kind: "text" | "non-text",
  note: string,
): ThemePairAudit {
  const requiredRatio = kind === "text" ? 4.5 : 3;
  const ratio = contrastRatio(tokens[foreground], tokens[background]);
  return {
    id,
    foreground,
    background,
    criterion: kind === "text" ? "WCAG 2.2 SC 1.4.3" : "WCAG 2.2 SC 1.4.11",
    requiredRatio,
    ratio: displayRatio(ratio),
    passes: ratio >= requiredRatio,
    note,
  };
}

/**
 * Compiles one locked brand color and an optional canvas into a deterministic
 * semantic theme. Generated support colors may change; the supplied brand and
 * canvas values are always preserved exactly after hexadecimal normalization.
 */
export function compileOneBrandTheme(request: OneBrandThemeRequest): OneBrandTheme {
  const brand = normalizeHex(request.brand);
  const canvas = normalizeHex(request.canvas ?? DEFAULT_CANVAS);
  const usesDefaultCanvas = request.canvas === undefined;
  const text = bestText(canvas);
  const onPrimary = bestText(brand);
  const surface = tintThatPreservesText(brand, canvas, text, 0.96);
  const primarySubtle = tintThatPreservesText(brand, canvas, text, 0.84);
  const primaryHover = mix(brand, onPrimary === normalizeHex(WHITE) ? BLACK : WHITE, 0.16);
  const border = mostSubtlePassing(text, canvas, 3, 0.75);
  const focusRing = accessibleFocusRing(brand, canvas);
  const primaryNeedsBoundaryFallback = contrastRatio(brand, canvas) < 3;
  const primaryBorder = primaryNeedsBoundaryFallback ? focusRing : brand;

  const tokens: OneBrandThemeTokens = {
    canvas,
    surface,
    text,
    mutedText: mostSubtlePassing(text, canvas, 4.5, 0.6),
    primary: brand,
    onPrimary,
    primaryHover,
    primarySubtle,
    border,
    primaryBorder,
    focusRing,
  };

  const audits = [
    makeAudit("body-text", "text", "canvas", tokens, "text", "Default body text on the page canvas."),
    makeAudit("muted-text", "mutedText", "canvas", tokens, "text", "Secondary text remains suitable for normal-size copy."),
    makeAudit("surface-text", "text", "surface", tokens, "text", "Default text on the generated surface."),
    makeAudit("primary-label", "onPrimary", "primary", tokens, "text", "Text and icons inside the locked brand-color action."),
    makeAudit("primary-hover-label", "onPrimary", "primaryHover", tokens, "text", "The same label remains readable in the hover state."),
    makeAudit("subtle-surface-text", "text", "primarySubtle", tokens, "text", "Default text on the brand-tinted subtle surface."),
    makeAudit("control-boundary", "primaryBorder", "canvas", tokens, "non-text", "Visible boundary for a primary control when its fill is too close to the canvas."),
    makeAudit("neutral-boundary", "border", "canvas", tokens, "non-text", "Boundary color for inputs and meaningful controls."),
    makeAudit("focus-indicator", "focusRing", "canvas", tokens, "non-text", "Keyboard focus indicator on the canvas."),
  ];

  const provenance: readonly ThemeTokenProvenance[] = [
    {
      token: "canvas",
      sources: [usesDefaultCanvas ? "default.canvas" : "request.canvas"],
      method: usesDefaultCanvas
        ? "Default warm canvas used because the request did not supply one."
        : "Locked input; normalized from three- or six-digit hexadecimal.",
    },
    { token: "surface", sources: ["request.brand", "canvas", "text"], method: "sRGB tint mixed toward canvas until body text reaches 4.5:1." },
    { token: "text", sources: ["canvas"], method: "Highest-contrast preferred dark or light foreground, with black fallback." },
    { token: "mutedText", sources: ["text", "canvas"], method: "Maximum 60% sRGB blend toward canvas that retains 4.5:1." },
    { token: "primary", sources: ["request.brand"], method: "Locked input; never altered." },
    { token: "onPrimary", sources: ["primary"], method: "Highest-contrast preferred dark or light foreground, with black fallback." },
    { token: "primaryHover", sources: ["primary", "onPrimary"], method: "16% sRGB mix away from the label color to increase contrast." },
    { token: "primarySubtle", sources: ["primary", "canvas", "text"], method: "sRGB tint mixed toward canvas until body text reaches 4.5:1." },
    { token: "border", sources: ["text", "canvas"], method: "Most subtle sRGB blend that retains 3:1 on canvas." },
    {
      token: "primaryBorder",
      sources: primaryNeedsBoundaryFallback
        ? ["primary", "canvas", "focusRing"]
        : ["primary", "canvas"],
      method: primaryNeedsBoundaryFallback
        ? "Accessible focus-ring color used because the locked brand does not reach 3:1 on canvas."
        : "Locked brand reused because it reaches 3:1 on canvas.",
    },
    { token: "focusRing", sources: ["request.brand", "canvas"], method: "Brand-derived ring adjusted toward black or white until it reaches 3:1." },
  ];

  return {
    schemaVersion: ONE_BRAND_THEME_SCHEMA_VERSION,
    algorithm: "srgb-v0.1",
    request: { brand, canvas },
    tokens,
    audits,
    allRequiredPairsPass: audits.every((audit) => audit.passes),
    provenance,
  };
}

const CSS_TOKEN_NAMES: Readonly<Record<ThemeTokenName, string>> = {
  canvas: "canvas",
  surface: "surface",
  text: "text",
  mutedText: "text-muted",
  primary: "primary",
  onPrimary: "on-primary",
  primaryHover: "primary-hover",
  primarySubtle: "primary-subtle",
  border: "border",
  primaryBorder: "primary-border",
  focusRing: "focus-ring",
};

export function exportThemeCss(theme: OneBrandTheme): string {
  const declarations = (Object.entries(theme.tokens) as [ThemeTokenName, HexColor][])
    .map(([name, value]) => `  --color-${CSS_TOKEN_NAMES[name]}: ${value};`)
    .join("\n");
  return `:root {\n${declarations}\n}`;
}
