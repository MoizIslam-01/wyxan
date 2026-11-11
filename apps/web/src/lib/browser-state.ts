export type NavigationSource =
  | "typed"
  | "link"
  | "search"
  | "history"
  | "back"
  | "forward";

export type PageEntry = {
  kind: "page";
  key: string;
  address: string;
  title: string | null;
  html: string | null;
  authorName: string | null;
  status: "found" | "not-found";
  source: NavigationSource;
};

export type SearchResultSnapshot = {
  id: string;
  address: string;
  title: string;
  authorName: string;
  excerpt: string;
};

export type SearchEntry = {
  kind: "search";
  key: string;
  query: string;
  results: SearchResultSnapshot[];
};

export type BrowserEntry = PageEntry | SearchEntry;

export type BrowserState = {
  entries: BrowserEntry[];
  index: number;
};

export type BrowserAction =
  | { type: "navigate"; entry: BrowserEntry }
  | { type: "replace"; entry: BrowserEntry }
  | { type: "back" }
  | { type: "forward" }
  | { type: "reset" };

export const initialBrowserState: BrowserState = { entries: [], index: -1 };

export function browserReducer(
  state: BrowserState,
  action: BrowserAction,
): BrowserState {
  switch (action.type) {
    case "navigate": {
      const retainedEntries = state.entries.slice(0, state.index + 1);
      return {
        entries: [...retainedEntries, action.entry],
        index: retainedEntries.length,
      };
    }
    case "back":
      return state.index > 0 ? { ...state, index: state.index - 1 } : state;
    case "forward":
      return state.index < state.entries.length - 1
        ? { ...state, index: state.index + 1 }
        : state;
    case "replace": {
      if (state.index < 0) return state;
      const entries = [...state.entries];
      entries[state.index] = action.entry;
      return { ...state, entries };
    }
    case "reset":
      return initialBrowserState;
  }
}

export function currentEntry(state: BrowserState): BrowserEntry | null {
  return state.entries[state.index] ?? null;
}

export function canGoBack(state: BrowserState): boolean {
  return state.index > 0;
}

export function canGoForward(state: BrowserState): boolean {
  return state.index >= 0 && state.index < state.entries.length - 1;
}
