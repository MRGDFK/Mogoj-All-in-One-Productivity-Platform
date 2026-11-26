// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
// Source-level guards for mobile layout regressions found on a Galaxy S24 (2026-11-27).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(join(webRoot, path), "utf8");

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return tsxFiles(full);
    return full.endsWith(".tsx") ? [full] : [];
  });
}

describe("detail sheets can always be closed on phones", () => {
  // SheetContent is full-width on phones, so there is nothing outside it to tap and no Escape key.
  // The Sidebar's "More" sheet is ~85% wide, so tapping the backdrop closes it.
  const sheets = tsxFiles(join(webRoot, "components"))
    .filter((f) => !f.endsWith("shared/Sheet.tsx") && !f.endsWith("layout/Sidebar.tsx"))
    .filter((f) => readFileSync(f, "utf8").includes("<SheetContent"));

  it("finds the detail sheets", () => {
    assert.ok(sheets.length >= 3, `only found ${sheets.length}`);
  });

  for (const file of sheets) {
    const name = relative(webRoot, file);
    it(`${name} has a visible close control`, () => {
      assert.match(readFileSync(file, "utf8"), /Dialog\.Close|aria-label="Close"/);
    });
    it(`${name} names the dialog for screen readers`, () => {
      assert.match(readFileSync(file, "utf8"), /Dialog\.Title/);
    });
  }
});

describe("view switches never bleed into each other", () => {
  it("each AnimatedViewSwitch panel clips its own horizontal overflow", () => {
    const panelLine = read("components/shared/AnimatedViewSwitch.tsx")
      .split("\n")
      .find((l) => l.includes("inert={i !== index}"));
    assert.ok(panelLine, "panel element not found");
    assert.match(panelLine, /overflow-x-clip/);
  });
});

describe("table-style lists have a phone layout", () => {
  const unprefixedColumns = /(^|[\s"])grid-cols-\[/;

  it("ProjectRow's fixed columns only apply from sm up", () => {
    const grid = /PROJECT_ROW_GRID =\s*"([^"]+)"/.exec(read("components/projects/ProjectRow.tsx"))?.[1] ?? "";
    assert.match(grid, /sm:grid-cols-\[/);
    assert.doesNotMatch(grid, unprefixedColumns);
  });

  it("the projects list header is hidden on phones", () => {
    const header = read("components/projects/ProjectList.tsx").split("\n").find((l) => l.includes("cn(PROJECT_ROW_GRID,"));
    assert.ok(header, "header row not found");
    assert.match(header, /max-sm:hidden/);
  });

  it("AreaList's fixed columns only apply from sm up and its header is hidden on phones", () => {
    const src = read("components/areas/AreaList.tsx");
    const grid = /ROW_GRID =\s*"([^"]+)"/.exec(src)?.[1] ?? "";
    assert.match(grid, /sm:grid-cols-\[/);
    assert.doesNotMatch(grid, unprefixedColumns);
    const header = src.split("\n").find((l) => l.includes("ROW_GRID,") && l.includes("border-b"));
    assert.ok(header, "header row not found");
    assert.match(header, /max-sm:hidden/);
  });
});
