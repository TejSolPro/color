// Contrast maths comes from packages/core. `pnpm build:docs` (and the Pages
// workflow) copies the built package to ./color-core.js so the site and the
// package can never disagree about a ratio.
import { contrastRatio } from "./color-core.js";

const $ = (id) => document.getElementById(id);
const defaults = { brand: "#9D3F2D", surface: "#F3EFE7" };
const DARK_TEXT = "#171512";
const TEXT = { criterion: "WCAG 2.2 SC 1.4.3", threshold: 4.5 };
const NON_TEXT = { criterion: "WCAG 2.2 SC 1.4.11", threshold: 3 };

function normaliseHex(value) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split("").map((c) => c + c).join("")}`.toUpperCase();
  return /^[0-9a-f]{6}$/i.test(raw) ? `#${raw}`.toUpperCase() : null;
}

function rgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function hex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function mix(a, b, amount) {
  const first = rgb(a); const second = rgb(b);
  return hex(first.map((value, index) => value + (second[index] - value) * amount));
}

// Truncate, never round up, so a failing pair can never display as 4.50:1.
const showRatio = (ratio) => (Math.floor(ratio * 100) / 100).toFixed(2);

function bestText(background) {
  return contrastRatio(background, "#FFFFFF") >= contrastRatio(background, DARK_TEXT) ? "#FFFFFF" : DARK_TEXT;
}

// Start from a light tint of the brand. If that cannot reach 3:1 on the canvas,
// move the brand toward black or white (whichever contrasts more with the
// canvas) in small steps. Pure black or white always reaches 3:1, so the loop
// always ends with a passing colour.
function focusRing(brand, canvas) {
  const preferred = mix(brand, "#FFFFFF", 0.25);
  if (contrastRatio(preferred, canvas) >= NON_TEXT.threshold) return { value: preferred, note: "" };
  const towardBlack = contrastRatio("#000000", canvas) >= contrastRatio("#FFFFFF", canvas);
  const target = towardBlack ? "#000000" : "#FFFFFF";
  for (let step = 0; step <= 20; step += 1) {
    const candidate = mix(brand, target, step / 20);
    if (contrastRatio(candidate, canvas) >= NON_TEXT.threshold) {
      return { value: candidate, note: `Adjusted toward ${towardBlack ? "black" : "white"} to reach 3:1 on the canvas.` };
    }
  }
  return { value: target, note: `Fell back to ${towardBlack ? "black" : "white"}.` };
}

function render() {
  const brand = normaliseHex($("brandHex").value) || defaults.brand;
  const surface = normaliseHex($("surfaceHex").value) || defaults.surface;
  const onBrand = bestText(brand);
  const text = bestText(surface);
  const focus = focusRing(brand, surface);
  const colors = {
    canvas: surface, text, primary: brand, "on-primary": onBrand,
    "primary-hover": mix(brand, "#000000", 0.16), "primary-subtle": mix(brand, surface, 0.84),
    border: mix(text, surface, 0.78), "focus-ring": focus.value,
  };
  const tokens = Object.entries(colors);

  // Every foreground/background pair the generated system intends to use.
  const pairs = [
    ["text", "canvas", TEXT],
    ["on-primary", "primary", TEXT],
    ["on-primary", "primary-hover", TEXT],
    ["text", "primary-subtle", TEXT],
    ["primary", "primary-subtle", TEXT],
    ["focus-ring", "canvas", NON_TEXT, focus.note],
    ["border", "canvas", null, "Decorative divider only. Do not use for input or control boundaries, which need 3:1 (SC 1.4.11)."],
  ].map(([fg, bg, rule, note = ""]) => {
    const ratio = contrastRatio(colors[fg], colors[bg]);
    const status = rule ? (ratio >= rule.threshold ? "Pass" : "Fail") : "Info";
    return { fg, bg, rule, note, ratio, status };
  });

  const audited = pairs.filter((pair) => pair.rule);
  const failures = audited.filter((pair) => pair.status === "Fail").length;

  $("preview").style.background = surface; $("preview").style.color = text;
  $("previewButton").style.background = brand; $("previewButton").style.color = onBrand;
  $("contrastStatus").textContent = failures
    ? `${failures} of ${audited.length} pairs fail`
    : `All ${audited.length} audited pairs pass`;
  $("tokenList").innerHTML = tokens.map(([name, value]) => `<div class="token"><i class="token-swatch" style="--token:${value}" aria-hidden="true"></i><span>--color-${name}</span><b>${value}</b></div>`).join("");
  $("pairAudit").innerHTML = pairs.map((pair) => {
    const requirement = pair.rule ? `${pair.rule.criterion} · needs ${pair.rule.threshold}:1` : "Not audited";
    const note = pair.note ? `<br /><small>${pair.note}</small>` : "";
    return `<div class="token"><i class="token-swatch" style="--token:${colors[pair.bg]};color:${colors[pair.fg]};display:grid;place-items:center;font-style:normal;font-weight:800" aria-hidden="true">Aa</i><span>${pair.fg} on ${pair.bg}<br /><small>${requirement}</small>${note}</span><b>${showRatio(pair.ratio)}:1 · ${pair.status}</b></div>`;
  }).join("");
  window.generatedCss = `:root {\n${tokens.map(([name, value]) => `  --color-${name}: ${value};`).join("\n")}\n}`;
}

function bindPair(pickerId, textId) {
  $(pickerId).addEventListener("input", (event) => { $(textId).value = event.target.value.toUpperCase(); render(); });
  $(textId).addEventListener("input", (event) => { const value = normaliseHex(event.target.value); if (value) { $(pickerId).value = value; render(); } });
}

bindPair("brandPicker", "brandHex"); bindPair("surfacePicker", "surfaceHex");
$("copyCss").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(window.generatedCss); $("copyMessage").textContent = "CSS variables copied."; }
  catch { $("copyMessage").textContent = "Copy was blocked by your browser."; }
});
$("resetTool").addEventListener("click", () => {
  $("brandPicker").value = defaults.brand; $("brandHex").value = defaults.brand;
  $("surfacePicker").value = defaults.surface; $("surfaceHex").value = defaults.surface; $("copyMessage").textContent = ""; render();
});
render();
