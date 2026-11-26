// Below this, the visual viewport shrank for something else (e.g. the address bar collapsing)
const MIN_KEYBOARD_PX = 80;

/**
 * Height of the on-screen keyboard covering the bottom of the layout viewport, from
 * window.innerHeight and window.visualViewport. Android Chrome and iOS Safari shrink only
 * the visual viewport when the keyboard opens, so fixed bottom elements must lift by this.
 */
export function keyboardInset(innerHeight: number, visualHeight: number, visualOffsetTop: number): number {
  const covered = innerHeight - visualHeight - visualOffsetTop;
  return covered >= MIN_KEYBOARD_PX ? Math.round(covered) : 0;
}
