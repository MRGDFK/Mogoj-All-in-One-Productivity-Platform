// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BREATHE_CLASS, BREATHE_STRIP_CLASS, shouldBreathe } from "./priorityBreath";

describe("shouldBreathe", () => {
  it("breathes for critical items that are still open", () => {
    for (const status of ["todo", "in_progress", "in_review", "active", "on_hold"]) {
      assert.equal(shouldBreathe("critical", status), true, status);
    }
  });

  it("breathes for critical when the status is unknown", () => {
    assert.equal(shouldBreathe("critical"), true);
    assert.equal(shouldBreathe("critical", null), true);
  });

  it("stops breathing once a task is done or a project is completed/archived", () => {
    for (const status of ["done", "completed", "archived"]) {
      assert.equal(shouldBreathe("critical", status), false, status);
    }
  });

  it("never breathes for non-critical priorities", () => {
    for (const priority of ["low", "medium", "high"]) {
      assert.equal(shouldBreathe(priority, "todo"), false, priority);
    }
  });
});

describe("breathing CSS", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

  it("defines the breathing class and its keyframes in globals.css", () => {
    assert.match(css, new RegExp(`\\.${BREATHE_CLASS}::after`));
    assert.match(css, /@keyframes\s+breathe-critical/);
  });

  const keyframes = (name: string) => {
    const m = new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css);
    assert.ok(m, `missing @keyframes ${name}`);
    return [...m[1]!.matchAll(/opacity:\s*([\d.]+)/g)].map((x) => Number(x[1]));
  };

  it("fades the WHOLE tag in and out, down to 0.3 at the exhale", () => {
    assert.match(css, /\.breathe-critical\s*\{[^}]*animation:\s*breathe-critical-fade\b/);
    const o = keyframes("breathe-critical-fade");
    assert.equal(Math.max(...o), 1, "tag must return to full opacity");
    assert.equal(Math.min(...o), 0.3, "user-chosen low point (deep fade)");
  });

  it("breathes at the user-chosen 2.6s cycle, tag and glow in sync", () => {
    const durations = [...css.matchAll(/animation:\s*breathe-critical-(?:fade|glow)\s+([\d.]+)s/g)].map((m) => Number(m[1]));
    assert.ok(durations.length >= 3, "tag, strip label and glow all animate");
    assert.deepEqual([...new Set(durations)], [2.6]);
  });

  it("swells the glow to full strength in step with the tag", () => {
    assert.equal(Math.max(...keyframes("breathe-critical-glow")), 1);
  });

  it("on Kanban cards fades only the strip label, not the card body", () => {
    assert.match(css, new RegExp(`\\.${BREATHE_STRIP_CLASS}::after`), "strip shell keeps the glow");
    assert.match(css, new RegExp(`\\.${BREATHE_STRIP_CLASS}\\s+\\.prio-strip-label\\s*\\{[^}]*animation:\\s*breathe-critical-fade`));
    assert.doesNotMatch(css, new RegExp(`\\.${BREATHE_STRIP_CLASS}\\s*\\{[^}]*animation:`), "card shell itself must not fade");
  });

  it("is not clipped by the view switcher (no overflow-hidden on its viewport)", () => {
    const sw = readFileSync(new URL("../components/shared/AnimatedViewSwitch.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(sw, /overflow-hidden/);
    assert.match(sw, /overflow-x-clip/);
  });

  it("is covered by the global reduced-motion rule", () => {
    assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*animation-duration:\s*0\.01ms/);
  });
});
