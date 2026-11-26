import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { activeTab } from "./mobileNav";

describe("activeTab", () => {
  it("lights Home only on the HQ root", () => {
    assert.equal(activeTab("/"), "home");
  });

  it("lights Tasks on /tasks and anything under it", () => {
    assert.equal(activeTab("/tasks"), "tasks");
    assert.equal(activeTab("/tasks/"), "tasks");
    assert.equal(activeTab("/tasks/abc"), "tasks");
  });

  it("lights Projects on the list and on project detail pages", () => {
    assert.equal(activeTab("/projects"), "projects");
    assert.equal(activeTab("/projects/cmwt0saz60006xlwf6gwnb58n"), "projects");
  });

  it("puts every other page under More", () => {
    for (const p of ["/inbox", "/areas", "/areas/x", "/resources/x", "/archive", "/settings"]) {
      assert.equal(activeTab(p), "more", p);
    }
  });

  it("matches whole path segments, not prefixes", () => {
    assert.equal(activeTab("/projectsarchive"), "more");
    assert.equal(activeTab("/tasksx"), "more");
  });
});
