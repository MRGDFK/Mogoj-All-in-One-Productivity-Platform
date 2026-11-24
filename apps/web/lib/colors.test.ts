// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HIGHLIGHT_COLORS, ICON_COLORS, TEXT_COLORS } from "./colors";

// --- WCAG 2.x contrast helpers (test-only) ---
type RGB = [number, number, number];
const BG: RGB = [0x0a, 0x0b, 0x0e]; // --background
const SURFACE: RGB = [0x16, 0x18, 0x1d]; // lightest surface text sits on (glass over --background)
const FOREGROUND: RGB = [0xec, 0xec, 0xef]; // --foreground

function parse(color: string): { rgb: RGB; alpha: number } {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], alpha: 1 };
  }
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(color);
  assert.ok(rgba, `unparseable color ${color}`);
  return { rgb: [+rgba[1]!, +rgba[2]!, +rgba[3]!], alpha: +rgba[4]! };
}

function over(color: string, base: RGB): RGB {
  const { rgb, alpha } = parse(color);
  return rgb.map((c, i) => c * alpha + base[i]! * (1 - alpha)) as RGB;
}

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe("ICON_COLORS", () => {
  it("offers 24 swatches (3 rows of 8)", () => {
    assert.equal(ICON_COLORS.length, 24);
  });

  it("are unique, lowercase #rrggbb (the API accepts only 6-digit hex)", () => {
    for (const c of ICON_COLORS) assert.match(c, /^#[0-9a-f]{6}$/);
    assert.equal(new Set(ICON_COLORS).size, ICON_COLORS.length);
  });

  it("are all visible on the dark background (WCAG 3:1 for graphics)", () => {
    for (const c of ICON_COLORS) {
      const ratio = contrast(parse(c).rgb, BG);
      assert.ok(ratio >= 3, `${c} contrast ${ratio.toFixed(2)} < 3`);
    }
  });

  it("defaults new projects and areas to the brand blue", () => {
    assert.equal(ICON_COLORS[0], "#7c9cff");
  });
});

describe("TEXT_COLORS", () => {
  it("are readable as text on the darkest and lightest surfaces (WCAG 4.5:1)", () => {
    for (const { label, value } of TEXT_COLORS) {
      for (const surface of [BG, SURFACE]) {
        const ratio = contrast(parse(value).rgb, surface);
        assert.ok(ratio >= 4.5, `${label} ${value} contrast ${ratio.toFixed(2)} < 4.5`);
      }
    }
  });

  it("do not include black (the default color option covers 'no color')", () => {
    assert.ok(!TEXT_COLORS.some((c) => c.label === "Black"));
  });
});

describe("HIGHLIGHT_COLORS", () => {
  it("keep default text readable on top of the highlight (WCAG 4.5:1)", () => {
    for (const { label, value } of HIGHLIGHT_COLORS) {
      const behindText = over(value, SURFACE);
      const ratio = contrast(FOREGROUND, behindText);
      assert.ok(ratio >= 4.5, `${label} ${value} contrast ${ratio.toFixed(2)} < 4.5`);
    }
  });
});
