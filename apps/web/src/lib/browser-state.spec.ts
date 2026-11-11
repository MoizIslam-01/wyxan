import { describe, expect, it } from "vitest";
import {
  browserReducer,
  canGoForward,
  currentEntry,
  initialBrowserState,
  type NavigationEntry,
} from "./browser-state";

function entry(address: string, html = `<p>${address}</p>`): NavigationEntry {
  return {
    key: address,
    address,
    title: address,
    html,
    authorName: "Test Author",
    status: "found",
    source: "link",
  };
}

describe("browserReducer", () => {
  it("moves backward and forward through a trail", () => {
    let state = initialBrowserState;
    for (const address of ["a.zz", "b.zz", "c.zz", "d.zz"]) {
      state = browserReducer(state, { type: "navigate", entry: entry(address) });
    }

    state = browserReducer(state, { type: "back" });
    state = browserReducer(state, { type: "back" });
    expect(currentEntry(state)?.address).toBe("b.zz");

    state = browserReducer(state, { type: "forward" });
    expect(currentEntry(state)?.address).toBe("c.zz");
  });

  it("discards the forward branch after a new navigation", () => {
    let state = initialBrowserState;
    for (const address of ["a.zz", "b.zz", "c.zz", "d.zz"]) {
      state = browserReducer(state, { type: "navigate", entry: entry(address) });
    }
    state = browserReducer(state, { type: "back" });
    state = browserReducer(state, { type: "back" });
    state = browserReducer(state, { type: "navigate", entry: entry("e.zz") });

    expect(state.entries.map(({ address }) => address)).toEqual([
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

    expect(currentEntry(state)?.html).toBe("<p>Original snapshot</p>");
  });

  it("keeps a broken address in the navigation trail", () => {
    const broken: NavigationEntry = {
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
});
