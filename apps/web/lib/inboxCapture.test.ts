import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildInboxCapture } from "./inboxCapture";

describe("buildInboxCapture", () => {
  it("returns null for empty or whitespace-only text", () => {
    assert.equal(buildInboxCapture("", "task"), null);
    assert.equal(buildInboxCapture("   \n\t \n", "idea"), null);
  });

  it("uses a single line as the title with no body", () => {
    assert.deepEqual(buildInboxCapture("  Renew passport  ", "task"), {
      title: "Renew passport",
      type: "task",
      attachments: [],
    });
  });

  it("turns the first line into the title and the rest into body paragraphs", () => {
    const item = buildInboxCapture("Garden ideas\nraised beds\n\nherb spiral", "idea");
    assert.equal(item?.title, "Garden ideas");
    assert.deepEqual(item?.body, {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "raised beds" }] },
        { type: "paragraph", content: [{ type: "text", text: "herb spiral" }] },
      ],
    });
  });

  it("skips leading blank lines when picking the title", () => {
    assert.equal(buildInboxCapture("\n\n  Call mum\n", "task")?.title, "Call mum");
  });

  it("keeps the full text when the first line exceeds the 300-char title limit", () => {
    const long = "x".repeat(350);
    const item = buildInboxCapture(long, "note");
    assert.equal(item?.title.length, 300);
    assert.equal((item?.body?.content?.[0] as { content?: { text: string }[] } | undefined)?.content?.[0]?.text, long);
  });

  it("passes the chosen type through", () => {
    assert.equal(buildInboxCapture("Launch site", "project")?.type, "project");
  });
});
