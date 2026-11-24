import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_QUICK_CAPTURE_SHORTCUT,
  eventToShortcut,
  formatShortcut,
  isReservedShortcut,
  matchesShortcut,
  readShortcut,
  withShortcut,
} from "./shortcut";

const ev = (code: string, mods: Partial<{ metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }> = {}) => ({
  code,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
});

test("readShortcut falls back to the default for missing or malformed prefs", () => {
  assert.deepEqual(readShortcut(undefined), DEFAULT_QUICK_CAPTURE_SHORTCUT);
  assert.deepEqual(readShortcut({ quickCaptureShortcut: "cmd+k" }), DEFAULT_QUICK_CAPTURE_SHORTCUT);
  assert.deepEqual(readShortcut({ quickCaptureShortcut: { code: "<script>", mod: true } }), DEFAULT_QUICK_CAPTURE_SHORTCUT);
  // A shortcut with no modifier would hijack normal typing
  assert.deepEqual(readShortcut({ quickCaptureShortcut: { code: "KeyJ", mod: false, shift: false, alt: false } }), DEFAULT_QUICK_CAPTURE_SHORTCUT);
});

test("readShortcut keeps a valid saved shortcut", () => {
  const s = { code: "KeyJ", mod: false, shift: false, alt: true };
  assert.deepEqual(readShortcut({ quickCaptureShortcut: s }), s);
});

test("matchesShortcut maps Mod to Cmd on mac and Ctrl elsewhere", () => {
  const s = { code: "KeyJ", mod: true, shift: true, alt: false };
  assert.equal(matchesShortcut(ev("KeyJ", { metaKey: true, shiftKey: true }), s, true), true);
  assert.equal(matchesShortcut(ev("KeyJ", { ctrlKey: true, shiftKey: true }), s, true), false);
  assert.equal(matchesShortcut(ev("KeyJ", { ctrlKey: true, shiftKey: true }), s, false), true);
});

test("matchesShortcut requires the exact modifier set", () => {
  const s = { code: "KeyJ", mod: true, shift: false, alt: false };
  assert.equal(matchesShortcut(ev("KeyJ", { metaKey: true, shiftKey: true }), s, true), false);
  assert.equal(matchesShortcut(ev("KeyJ", { metaKey: true, altKey: true }), s, true), false);
  assert.equal(matchesShortcut(ev("KeyH", { metaKey: true }), s, true), false);
});

test("eventToShortcut ignores bare modifiers and unmodified keys", () => {
  assert.equal(eventToShortcut(ev("ShiftLeft", { shiftKey: true }), true), null);
  assert.equal(eventToShortcut(ev("MetaLeft", { metaKey: true }), true), null);
  assert.equal(eventToShortcut(ev("KeyJ"), true), null);
  assert.equal(eventToShortcut(ev("KeyJ", { shiftKey: true }), true), null);
});

test("eventToShortcut records a modified key", () => {
  assert.deepEqual(eventToShortcut(ev("KeyJ", { metaKey: true, altKey: true }), true), { code: "KeyJ", mod: true, shift: false, alt: true });
  assert.deepEqual(eventToShortcut(ev("Space", { ctrlKey: true }), false), { code: "Space", mod: true, shift: false, alt: false });
});

test("isReservedShortcut flags the command palette key", () => {
  assert.equal(isReservedShortcut({ code: "KeyK", mod: true, shift: false, alt: false }), true);
  assert.equal(isReservedShortcut({ code: "KeyK", mod: true, shift: true, alt: false }), false);
});

test("formatShortcut renders platform labels", () => {
  const s = { code: "KeyK", mod: true, shift: true, alt: false };
  assert.deepEqual(formatShortcut(s, true), ["⌘", "⇧", "K"]);
  assert.deepEqual(formatShortcut(s, false), ["Ctrl", "Shift", "K"]);
  assert.deepEqual(formatShortcut({ code: "Digit3", mod: false, shift: false, alt: true }, true), ["⌥", "3"]);
  assert.deepEqual(formatShortcut({ code: "Space", mod: true, shift: false, alt: false }, false), ["Ctrl", "Space"]);
});

test("withShortcut merges without dropping other preferences or mutating input", () => {
  const prefs = { kanbanColors: { task: { todo: "#ffffff" } } };
  const s = { code: "KeyJ", mod: true, shift: false, alt: false };
  const out = withShortcut(prefs, s);
  assert.deepEqual(out, { kanbanColors: { task: { todo: "#ffffff" } }, quickCaptureShortcut: s });
  assert.equal("quickCaptureShortcut" in prefs, false);
  assert.deepEqual(withShortcut(out, null), { kanbanColors: { task: { todo: "#ffffff" } } });
});
