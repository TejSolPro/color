const $ = (id) => document.getElementById(id);
const defaults = { brand: "#9D3F2D", surface: "#F3EFE7" };

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

function luminance(color) {
  const channels = rgb(color).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function bestText(background) {
  return contrast(background, "#FFFFFF") >= contrast(background, "#171512") ? "#FFFFFF" : "#171512";
}

function render() {
  const brand = normaliseHex($("brandHex").value) || defaults.brand;
  const surface = normaliseHex($("surfaceHex").value) || defaults.surface;
  const onBrand = bestText(brand);
  const text = bestText(surface);
  const tokens = [
    ["canvas", surface], ["text", text], ["primary", brand], ["on-primary", onBrand],
    ["primary-hover", mix(brand, "#000000", 0.16)], ["primary-subtle", mix(brand, surface, 0.84)],
    ["border", mix(text, surface, 0.78)], ["focus-ring", mix(brand, "#FFFFFF", 0.25)]
  ];
  const ratio = contrast(brand, onBrand);
  $("preview").style.background = surface; $("preview").style.color = text;
  $("previewButton").style.background = brand; $("previewButton").style.color = onBrand;
  $("contrastStatus").textContent = `${ratio.toFixed(2)}:1 · ${ratio >= 4.5 ? "AA text pair" : ratio >= 3 ? "Large text only" : "Needs adjustment"}`;
  $("tokenList").innerHTML = tokens.map(([name, value]) => `<div class="token"><i class="token-swatch" style="--token:${value}" aria-hidden="true"></i><span>--color-${name}</span><b>${value}</b></div>`).join("");
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
