// Run: pnpm --filter @mogoj/api exec tsx --test "<abs path to this file>"
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { updateAreaSchema, updateProjectSchema } from "@mogoj/shared";
import { NAME_MAX, resolveRename } from "./entityName";

describe("NAME_MAX", () => {
  it("matches the project name limit in the shared schema", () => {
    assert.equal(updateProjectSchema.safeParse({ name: "x".repeat(NAME_MAX.project) }).success, true);
    assert.equal(updateProjectSchema.safeParse({ name: "x".repeat(NAME_MAX.project + 1) }).success, false);
  });

  it("matches the area name limit in the shared schema", () => {
    assert.equal(updateAreaSchema.safeParse({ name: "x".repeat(NAME_MAX.area) }).success, true);
    assert.equal(updateAreaSchema.safeParse({ name: "x".repeat(NAME_MAX.area + 1) }).success, false);
  });
});

describe("resolveRename", () => {
  const max = 20;

  it("returns the trimmed name when it changed", () => {
    assert.equal(resolveRename("  Health ", "Fitness", max), "Health");
  });

  it("returns null when the name is unchanged after trimming", () => {
    assert.equal(resolveRename(" Fitness ", "Fitness", max), null);
  });

  it("returns null for an empty or whitespace-only name", () => {
    assert.equal(resolveRename("", "Fitness", max), null);
    assert.equal(resolveRename("   ", "Fitness", max), null);
  });

  it("returns null when longer than the given limit instead of sending a request that fails", () => {
    assert.equal(resolveRename("x".repeat(max + 1), "Fitness", max), null);
    assert.equal(resolveRename("x".repeat(max), "Fitness", max), "x".repeat(max));
  });
});
