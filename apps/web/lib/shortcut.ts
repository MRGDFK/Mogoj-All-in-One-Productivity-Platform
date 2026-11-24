/** A key combo stored by physical key (`KeyboardEvent.code`) so it survives keyboard layouts. `mod` is Cmd on mac, Ctrl elsewhere. */
export interface Shortcut {
  code: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
}

type KeyLike = Pick<KeyboardEvent, "code" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">;
type Prefs = Record<string, unknown>;

export const DEFAULT_QUICK_CAPTURE_SHORTCUT: Shortcut = { code: "KeyK", mod: true, shift: true, alt: false };

const CODE = /^[A-Za-z0-9]{1,20}$/;
const MODIFIER_CODE = /^(Shift|Control|Alt|Meta|OS)(Left|Right)?$/;
const SYMBOLS: Record<string, string> = {
  Space: "Space",
  Slash: "/",
  Period: ".",
  Comma: ",",
  Semicolon: ";",
  Quote: "'",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Minus: "-",
  Equal: "=",
  Backquote: "`",
  Enter: "↵",
};

export const isMacPlatform = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const isShortcut = (v: unknown): v is Shortcut => {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.code === "string" &&
    CODE.test(s.code) &&
    typeof s.mod === "boolean" &&
    typeof s.shift === "boolean" &&
    typeof s.alt === "boolean" &&
    // Needs Mod or Alt, otherwise it would fire while typing
    (s.mod || s.alt)
  );
};

/** The saved quick-capture shortcut, or the default when missing/malformed (preferences is free-form JSON). */
export function readShortcut(prefs: unknown): Shortcut {
  const raw = typeof prefs === "object" && prefs !== null ? (prefs as Prefs).quickCaptureShortcut : undefined;
  return isShortcut(raw) ? { code: raw.code, mod: raw.mod, shift: raw.shift, alt: raw.alt } : DEFAULT_QUICK_CAPTURE_SHORTCUT;
}

export function matchesShortcut(e: KeyLike, s: Shortcut, isMac: boolean): boolean {
  const mod = isMac ? e.metaKey : e.ctrlKey;
  const other = isMac ? e.ctrlKey : e.metaKey;
  return e.code === s.code && mod === s.mod && !other && e.shiftKey === s.shift && e.altKey === s.alt;
}

/** Turns a keydown into a shortcut while recording; null until a real key is pressed with Mod or Alt. */
export function eventToShortcut(e: KeyLike, isMac: boolean): Shortcut | null {
  if (MODIFIER_CODE.test(e.code) || !CODE.test(e.code)) return null;
  const s = { code: e.code, mod: isMac ? e.metaKey : e.ctrlKey, shift: e.shiftKey, alt: e.altKey };
  return s.mod || s.alt ? s : null;
}

/** Mod+K opens the command palette. */
export const isReservedShortcut = (s: Shortcut) => s.code === "KeyK" && s.mod && !s.shift && !s.alt;

export function formatShortcut(s: Shortcut, isMac: boolean): string[] {
  const key = s.code.replace(/^Key|^Digit/, "");
  const label = SYMBOLS[s.code] ?? key;
  const keys: string[] = [];
  if (s.mod) keys.push(isMac ? "⌘" : "Ctrl");
  if (s.alt) keys.push(isMac ? "⌥" : "Alt");
  if (s.shift) keys.push(isMac ? "⇧" : "Shift");
  keys.push(label);
  return keys;
}

/** New preferences with the shortcut set, or removed (back to default) when null. */
export function withShortcut(prefs: Prefs | undefined, s: Shortcut | null): Prefs {
  const next = { ...(prefs ?? {}) };
  if (s) next.quickCaptureShortcut = s;
  else delete next.quickCaptureShortcut;
  return next;
}
