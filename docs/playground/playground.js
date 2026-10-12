// The complete compiler comes from packages/core. `pnpm build:docs` (and the
// Pages workflow) copies the built package here so the live tool and CLI always
// use the same versioned contract.
import { compileOneBrandTheme, exportThemeCss } from "./color-core.js";

const $ = (id) => document.getElementById(id);
const defaults = { brand: "#9D3F2D", surface: "#F3EFE7" };

function normaliseHex(value) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split("").map((c) => c + c).join("")}`.toUpperCase();
  return /^[0-9a-f]{6}$/i.test(raw) ? `#${raw}`.toUpperCase() : null;
}

function render() {
  const brand = normaliseHex($("brandHex").value) || defaults.brand;
  const canvas = normaliseHex($("surfaceHex").value) || defaults.surface;
  const theme = compileOneBrandTheme({ brand, canvas });

  $("preview").style.background = theme.tokens.surface;
  $("preview").style.color = theme.tokens.text;
  $("previewButton").style.background = theme.tokens.primary;
  $("previewButton").style.color = theme.tokens.onPrimary;
  $("previewButton").style.border = `2px solid ${theme.tokens.primaryBorder}`;
  $("contrastStatus").textContent = theme.allRequiredPairsPass
    ? `All ${theme.audits.length} intended pairs pass`
    : `${theme.audits.filter((audit) => !audit.passes).length} pairs need attention`;
  $("schemaVersion").textContent = `Schema ${theme.schemaVersion} · ${theme.algorithm}`;
  $("tokenList").innerHTML = Object.entries(theme.tokens).map(([name, value]) => `<div class="token"><i class="token-swatch" style="--token:${value}" aria-hidden="true"></i><span>${name}</span><b>${value.toUpperCase()}</b></div>`).join("");
  $("pairAudit").innerHTML = theme.audits.map((audit) => {
    const foreground = theme.tokens[audit.foreground];
    const background = theme.tokens[audit.background];
    return `<div class="token"><i class="token-swatch token-sample" style="--token:${background};color:${foreground}" aria-hidden="true">Aa</i><span>${audit.foreground} on ${audit.background}<br /><small>${audit.criterion} · needs ${audit.requiredRatio}:1<br />${audit.note}</small></span><b>${audit.ratio.toFixed(2)}:1 · ${audit.passes ? "Pass" : "Fail"}</b></div>`;
  }).join("");
  window.generatedCss = exportThemeCss(theme);
  window.generatedJson = JSON.stringify(theme, null, 2);
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
$("copyJson").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(window.generatedJson); $("copyMessage").textContent = "Versioned JSON copied."; }
  catch { $("copyMessage").textContent = "Copy was blocked by your browser."; }
});
$("resetTool").addEventListener("click", () => {
  $("brandPicker").value = defaults.brand; $("brandHex").value = defaults.brand;
  $("surfacePicker").value = defaults.surface; $("surfaceHex").value = defaults.surface; $("copyMessage").textContent = ""; render();
});
render();
