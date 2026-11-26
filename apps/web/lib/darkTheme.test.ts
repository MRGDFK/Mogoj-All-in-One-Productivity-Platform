// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
// Source-level guards for dark-theme regressions found in docs/UI_UX_AUDIT.md.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return tsxFiles(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

describe("dark theme guards", () => {
  it("every Typography `prose` surface is inverted for the dark theme (P0-1)", () => {
    const offenders = [...tsxFiles(join(webRoot, "components")), ...tsxFiles(join(webRoot, "app"))].filter((f) => {
      const src = readFileSync(f, "utf8");
      return /["'\s]prose[\s"']/.test(src) && !src.includes("prose-invert");
    });
    assert.deepEqual(offenders, []);
  });

  it("charts that draw a <Line> next to an <Area> use ComposedChart (P0-4)", () => {
    const src = readFileSync(join(webRoot, "components/dashboard/ThroughputChart.tsx"), "utf8");
    if (src.includes("<Line") && src.includes("<Area")) {
      assert.match(src, /<ComposedChart/);
      assert.doesNotMatch(src, /<AreaChart/);
    }
  });
});

describe("frosted graphite surfaces", () => {
  const css = readFileSync(join(webRoot, "app/globals.css"), "utf8");
  const block = (selector: RegExp) => {
    const m = selector.exec(css);
    assert.ok(m, `missing ${selector}`);
    return css.slice(m.index, css.indexOf("}", m.index));
  };

  it("glass lets the ambient canvas through with an 18px frosted blur and a specular top edge", () => {
    const glass = block(/@utility glass \{/);
    assert.match(glass, /rgb\(20 22 27 \/ 0\.58\)/);
    assert.match(glass, /blur\(18px\) saturate\(145%\)/);
    assert.match(glass, /inset 0 1px 0 rgb\(255 255 255 \/ 0\.09\)/);
  });

  // Floating surfaces must stay frosted when a browser reports backdrop-filter support but
  // doesn't draw it (seen on Android Chrome): at 58–76% page text read straight through.
  const alpha = (src: string) => Number(/background-color: rgb\(\d+ \d+ \d+ \/ ([\d.]+)\)/.exec(src)?.[1]);

  it("glass-overlay stays frosted without blur (>= 98% opaque) and keeps a stronger blur", () => {
    const overlay = block(/@utility glass-overlay \{/);
    assert.ok(alpha(overlay) >= 0.98, `glass-overlay alpha ${alpha(overlay)}`);
    assert.match(overlay, /blur\(28px\) saturate\(160%\)/);
  });

  it("glass-frost (floating mobile bar) stays frosted without blur (>= 98% opaque)", () => {
    const frost = block(/@utility glass-frost \{/);
    assert.ok(alpha(frost) >= 0.98, `glass-frost alpha ${alpha(frost)}`);
    assert.match(frost, /backdrop-filter: blur\(24px\)/);
  });

  it("repeated cards get a machined-graphite surface WITHOUT backdrop blur", () => {
    const surface = block(/@utility surface-card \{/);
    assert.match(surface, /rgb\(255 255 255 \/ 0\.035\)/);
    assert.match(surface, /inset 0 1px 0 rgb\(255 255 255 \/ 0\.05\)/);
    assert.doesNotMatch(surface, /backdrop-filter/);
  });

  it("has an ambient grain layer and a solid fallback when backdrop-filter is unsupported", () => {
    assert.match(css, /body::after\s*\{[\s\S]*?feTurbulence/);
    assert.match(css, /@supports not \(backdrop-filter: blur\(1px\)\)/);
  });

  it("the cursor spotlight is pure CSS driven by --mx/--my (no blur)", () => {
    const spot = block(/\.spotlight::before\s*\{/);
    assert.match(spot, /var\(--mx/);
    assert.doesNotMatch(spot, /backdrop-filter/);
  });
});

describe("motion", () => {
  const all = [...tsxFiles(join(webRoot, "components")), ...tsxFiles(join(webRoot, "app"))];

  it("the app shell uses LazyMotion (strict) with domMax", () => {
    const provider = readFileSync(join(webRoot, "providers/MotionProvider.tsx"), "utf8");
    assert.match(provider, /<LazyMotion features=\{domMax\} strict>/);
  });

  it("no component imports the full `motion` component (use `m` under LazyMotion)", () => {
    const offenders = all.filter((f) => /<motion\.[a-z]/.test(readFileSync(f, "utf8")));
    assert.deepEqual(offenders, []);
  });

  it("drawers use the no-overshoot spring from lib/motion", () => {
    const m = readFileSync(join(webRoot, "lib/motion.ts"), "utf8");
    assert.match(m, /stiffness:\s*380/);
    assert.match(m, /damping:\s*34/);
    assert.match(readFileSync(join(webRoot, "components/shared/Sheet.tsx"), "utf8"), /SPRING_DRAWER/);
  });
});
