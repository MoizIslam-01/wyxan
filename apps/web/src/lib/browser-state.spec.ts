import { describe, expect, it } from "vitest";
import {
  browserReducer,
  canGoForward,
  currentEntry,
  initialBrowserState,
  type BrowserState,
  type PageEntry,
} from "./browser-state";

function entry(address: string, html = `<p>${address}</p>`): PageEntry {
  return {
    kind: "page",
    key: address,
    address,
    title: address,
    html,
    authorName: "Test Author",
    status: "found",
    source: "link",
  };
}

function currentPage(state: BrowserState): PageEntry {
  const current = currentEntry(state);
  if (current?.kind !== "page") throw new Error("Expected the current entry to be a page");
  return current;
}

describe("browserReducer", () => {
  it("moves backward and forward through a trail", () => {
    let state = initialBrowserState;
    for (const address of ["a.zz", "b.zz", "c.zz", "d.zz"]) {
      state = browserReducer(state, { type: "navigate", entry: entry(address) });
    }

    state = browserReducer(state, { type: "back" });
    state = browserReducer(state, { type: "back" });
    expect(currentPage(state).address).toBe("b.zz");

    state = browserReducer(state, { type: "forward" });
    expect(currentPage(state).address).toBe("c.zz");
  });

  it("discards the forward branch after a new navigation", () => {
    let state = initialBrowserState;
    for (const address of ["a.zz", "b.zz", "c.zz", "d.zz"]) {
      state = browserReducer(state, { type: "navigate", entry: entry(address) });
    }
    state = browserReducer(state, { type: "back" });
    state = browserReducer(state, { type: "back" });
    state = browserReducer(state, { type: "navigate", entry: entry("e.zz") });

    expect(state.entries.map((item) => (item.kind === "page" ? item.address : "search"))).toEqual([
      "a.zz",
      "b.zz",
      "e.zz",
    ]);
    expect(canGoForward(state)).toBe(false);
  });

  it("restores the original snapshot without replacing its HTML", () => {
    let state = browserReducer(initialBrowserState, {
      type: "navigate",
      entry: entry("a.zz", "<p>Original snapshot</p>"),
    });
    state = browserReducer(state, {
      type: "navigate",
      entry: entry("b.zz"),
    });
    state = browserReducer(state, { type: "back" });

    expect(currentPage(state).html).toBe("<p>Original snapshot</p>");
  });

  it("keeps a broken address in the navigation trail", () => {
    const broken: PageEntry = {
      ...entry("missing.zz"),
      title: null,
      html: null,
      authorName: null,
      status: "not-found",
    };
    const state = browserReducer(initialBrowserState, {
      type: "navigate",
      entry: broken,
    });

    expect(currentEntry(state)).toEqual(broken);
  });

  it("restores a saved search entry after opening a result", () => {
    const search = {
      kind: "search" as const,
      key: "search-moss",
      query: "moss",
      results: [
        {
          id: "1",
          address: "mosslibrary.zz",
          title: "The Moss Library",
          authorName: "Noor",
          excerpt: "Moss records a place without words.",
        },
      ],
    };
    let state = browserReducer(initialBrowserState, { type: "navigate", entry: search });
    state = browserReducer(state, {
      type: "navigate",
      entry: entry("mosslibrary.zz"),
    });
    state = browserReducer(state, { type: "back" });

    expect(currentEntry(state)).toEqual(search);
  });
});
