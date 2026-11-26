"use client";

import { useSyncExternalStore } from "react";
import { keyboardInset } from "@/lib/keyboardInset";

function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", onChange);
  vv.addEventListener("scroll", onChange);
  return () => {
    vv.removeEventListener("resize", onChange);
    vv.removeEventListener("scroll", onChange);
  };
}

const snapshot = () => {
  const vv = window.visualViewport;
  return vv ? keyboardInset(window.innerHeight, vv.height, vv.offsetTop) : 0;
};

/** On-screen keyboard height in px (0 when closed or unknown), so fixed bottom UI can sit above it. */
export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
