import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { keyboardInset } from "./keyboardInset";

describe("keyboardInset", () => {
  it("is 0 when the keyboard is closed (visual viewport fills the window)", () => {
    assert.equal(keyboardInset(780, 780, 0), 0);
  });

  it("is the keyboard height when it covers the bottom (Galaxy S24: 780 → 430)", () => {
    assert.equal(keyboardInset(780, 430, 0), 350);
  });

  it("accounts for a visual viewport scrolled down under the keyboard", () => {
    assert.equal(keyboardInset(780, 430, 120), 230);
  });

  it("ignores small changes like the address bar collapsing (< 80px)", () => {
    assert.equal(keyboardInset(780, 720, 0), 0);
  });

  it("never goes negative", () => {
    assert.equal(keyboardInset(780, 800, 0), 0);
  });

  it("rounds fractional viewport sizes to whole pixels", () => {
    assert.equal(keyboardInset(780, 430.4, 0), 350);
  });
});
