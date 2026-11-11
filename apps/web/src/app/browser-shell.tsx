"use client";

import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import {
  browserReducer,
  canGoBack,
  canGoForward,
  currentEntry,
  initialBrowserState,
  type PageEntry,
  type NavigationSource,
} from "@/lib/browser-state";
import {
  ApiError,
  getHistory,
  getPeople,
  getSite,
  publishSite,
  recordVisit,
  searchSites,
  type Person,
  type Visit,
} from "@/lib/api";
import { SiteFrame } from "./site-frame";

const suggestions = ["tidepool.zz", "nightbus.zz", "windowgarden.zz"];

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "m7.5 4.5 5.5 5.5-5.5 5.5"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function normalizeAddress(value: string) {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

export function BrowserShell() {
  const [state, dispatch] = useReducer(browserReducer, initialBrowserState);
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [history, setHistory] = useState<Visit[]>([]);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishForm, setPublishForm] = useState({
    address: "",
    title: "",
    html: "",
    authorId: "",
  });
  const current = currentEntry(state);
  const currentTitle =
    current?.kind === "page"
      ? (current.title ?? current.address)
      : current?.query
        ? `Search: ${current.query}`
        : "Search the small web";
  const selectedPerson = useMemo(
    () => people.find((person) => person._id === personId) ?? null,
    [people, personId],
  );

  useEffect(() => {
    let active = true;
    getPeople()
      .then((result) => {
        if (!active) return;
        setPeople(result);
        setPersonId(result[0]?._id ?? "");
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not connect to the small web API",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveVisit(
    visitedAddress: string,
    source: NavigationSource,
  ) {
    if (!personId) return;
    try {
      await recordVisit(personId, visitedAddress, source);
    } catch {
      setNotice("Page opened, but this visit could not be added to history.");
    }
  }

  async function navigate(rawAddress: string, source: NavigationSource) {
    const nextAddress = normalizeAddress(rawAddress);
    if (!nextAddress) return;
    if (!personId) {
      setError("Choose a person before browsing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotice(null);

    let entry: PageEntry;
    try {
      const site = await getSite(nextAddress);
      entry = {
        kind: "page",
        key: crypto.randomUUID(),
        address: site.address,
        title: site.title,
        html: site.safeHtml,
        authorName: site.authorId.name,
        status: "found",
        source,
      };
    } catch (reason) {
      if (!(reason instanceof ApiError) || reason.status !== 404) {
        setError(
          reason instanceof Error ? reason.message : "This address could not be loaded",
        );
        setIsLoading(false);
        return;
      }
      entry = {
        kind: "page",
        key: crypto.randomUUID(),
        address: nextAddress,
        title: null,
        html: null,
        authorName: null,
        status: "not-found",
        source,
      };
    }

    dispatch({ type: "navigate", entry });
    setAddress(entry.address);
    setIsLoading(false);
    void saveVisit(entry.address, source);
  }

  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigate(address, "typed");
  }

  function move(direction: "back" | "forward") {
    const nextIndex = state.index + (direction === "back" ? -1 : 1);
    const target = state.entries[nextIndex];
    if (!target) return;
    dispatch({ type: direction });
    if (target.kind === "page") {
      setAddress(target.address);
      void saveVisit(target.address, direction);
    } else {
      setAddress("");
      setSearchInput(target.query);
    }
    setNotice(null);
  }

  function openSearch() {
    setIsHistoryOpen(false);
    setError(null);
    setNotice(null);
    setAddress("");
    if (current?.kind === "search") {
      setSearchInput(current.query);
      return;
    }
    setSearchInput("");
    dispatch({
      type: "navigate",
      entry: { kind: "search", key: crypto.randomUUID(), query: "", results: [] },
    });
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchInput.trim();
    if (!query || current?.kind !== "search") return;
    setIsSearching(true);
    setError(null);
    try {
      const results = await searchSites(query);
      dispatch({
        type: "replace",
        entry: { ...current, query, results },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Search could not be completed");
    } finally {
      setIsSearching(false);
    }
  }

  async function openHistory() {
    if (!personId) return;
    const nextOpen = !isHistoryOpen;
    setIsHistoryOpen(nextOpen);
    if (!nextOpen) return;
    setIsHistoryLoading(true);
    setError(null);
    try {
      setHistory(await getHistory(personId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "History could not be loaded");
    } finally {
      setIsHistoryLoading(false);
    }
  }

  function jumpFromHistory(visit: Visit) {
    setIsHistoryOpen(false);
    void navigate(visit.address, "history");
  }

  function openPublish() {
    setPublishForm({ address: "", title: "", html: "", authorId: personId });
    setPublishError(null);
    setIsPublishOpen(true);
  }

  async function submitPublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPublishing(true);
    setPublishError(null);
    try {
      await publishSite(publishForm);
      setIsPublishOpen(false);
      await navigate(publishForm.address, "typed");
      setNotice(`Published ${normalizeAddress(publishForm.address)}.`);
    } catch (reason) {
      setPublishError(reason instanceof Error ? reason.message : "This site could not be published");
    } finally {
      setIsPublishing(false);
    }
  }

  function changePerson(nextPersonId: string) {
    setPersonId(nextPersonId);
    setAddress("");
    setError(null);
    setNotice(null);
    setSearchInput("");
    setHistory([]);
    setIsHistoryOpen(false);
    dispatch({ type: "reset" });
  }

  return (
    <main className="app-shell" id="top">
      <header className="app-header">
        <a className="wordmark" href="#top" aria-label="The Small Web home">
          <span className="wordmark-mark">W</span>
          <span>
            <strong>The Small Web</strong>
            <small>community network</small>
          </span>
        </a>
        <div className="header-actions">
          <button
            type="button"
            className="publish-button"
            onClick={openPublish}
            disabled={people.length === 0}
          >
            + Publish a site
          </button>
          <label className="person-picker">
            <span>Browsing as</span>
            <select
              value={personId}
              onChange={(event) => changePerson(event.target.value)}
              disabled={people.length === 0}
            >
              {people.length === 0 && <option>Connecting…</option>}
              {people.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {isPublishOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="publish-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-title"
          >
            <header>
              <div>
                <p>Join the small web</p>
                <h2 id="publish-title">Publish a one-page site</h2>
              </div>
              <button
                type="button"
                aria-label="Close publishing form"
                onClick={() => setIsPublishOpen(false)}
              >
                ×
              </button>
            </header>
            <form onSubmit={submitPublish}>
              <div className="publish-row">
                <label>
                  <span>Address</span>
                  <input
                    required
                    maxLength={253}
                    value={publishForm.address}
                    onChange={(event) =>
                      setPublishForm((form) => ({ ...form, address: event.target.value }))
                    }
                    placeholder="my-place.zz"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </label>
                <label>
                  <span>Author</span>
                  <select
                    required
                    value={publishForm.authorId}
                    onChange={(event) =>
                      setPublishForm((form) => ({ ...form, authorId: event.target.value }))
                    }
                  >
                    {people.map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>Page title</span>
                <input
                  required
                  maxLength={120}
                  value={publishForm.title}
                  onChange={(event) =>
                    setPublishForm((form) => ({ ...form, title: event.target.value }))
                  }
                  placeholder="A title people will remember"
                />
              </label>
              <label>
                <span>HTML</span>
                <textarea
                  required
                  maxLength={50_000}
                  rows={11}
                  value={publishForm.html}
                  onChange={(event) =>
                    setPublishForm((form) => ({ ...form, html: event.target.value }))
                  }
                  placeholder={'<main>\n  <h1>Hello, small web.</h1>\n  <p>Write something worth finding.</p>\n  <a href="tidepool.zz">Visit the tidepools</a>\n</main>'}
                  spellCheck={false}
                />
                <small>Scripts, external resources, forms, and unsafe attributes are removed.</small>
              </label>
              {publishError && <p className="publish-error">{publishError}</p>}
              <footer>
                <button type="button" onClick={() => setIsPublishOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isPublishing}>
                  {isPublishing ? "Publishing…" : "Publish site"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      <section className="browser" aria-label="Small web browser">
        <div className="browser-topline">
          <div className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>{current ? currentTitle : "A browser for quieter places"}</p>
          <span className="trail-count">
            {state.entries.length} {state.entries.length === 1 ? "stop" : "stops"}
          </span>
        </div>

        <div className="toolbar">
          <div className="navigation-buttons">
            <button
              type="button"
              aria-label="Go back"
              disabled={!canGoBack(state) || isLoading}
              onClick={() => move("back")}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Go forward"
              disabled={!canGoForward(state) || isLoading}
              onClick={() => move("forward")}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>

          <form className="address-form" onSubmit={submitAddress}>
            <span className="address-status" aria-hidden="true" />
            <input
              aria-label="Address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="type an address, like tidepool.zz"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button type="submit" disabled={isLoading || !address.trim()}>
              {isLoading ? "Going…" : "Go"}
            </button>
          </form>

          <div className="utility-buttons">
            <button
              type="button"
              className={current?.kind === "search" ? "is-active" : ""}
              onClick={openSearch}
            >
              <span aria-hidden="true">⌕</span> Search
            </button>
            <button
              type="button"
              className={isHistoryOpen ? "is-active" : ""}
              onClick={() => void openHistory()}
            >
              <span aria-hidden="true">◷</span> History
            </button>
          </div>
        </div>

        {isHistoryOpen && (
          <aside className="history-drawer" aria-label="Browsing history">
            <header>
              <div>
                <p>Browsing history</p>
                <h2>{selectedPerson?.name}</h2>
              </div>
              <button
                type="button"
                aria-label="Close history"
                onClick={() => setIsHistoryOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="history-list">
              {isHistoryLoading && <p className="panel-message">Loading the trail…</p>}
              {!isHistoryLoading && history.length === 0 && (
                <p className="panel-message">No visits have been recorded yet.</p>
              )}
              {!isHistoryLoading &&
                history.map((visit) => (
                  <button
                    type="button"
                    key={visit._id}
                    className="history-item"
                    onClick={() => jumpFromHistory(visit)}
                  >
                    <span className={visit.status === "not-found" ? "history-mark is-broken" : "history-mark"} />
                    <span className="history-copy">
                      <strong>{visit.titleSnapshot ?? visit.address}</strong>
                      <small>{visit.address}</small>
                    </span>
                    <time dateTime={visit.visitedAt}>
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(visit.visitedAt))}
                    </time>
                  </button>
                ))}
            </div>
          </aside>
        )}

        <div className="browser-viewport">
          {isLoading && (
            <div className="loading-line" role="status">
              <span />
              Finding {normalizeAddress(address)}
            </div>
          )}

          {!current && (
            <div className="start-page">
              <p className="eyebrow">You are connected</p>
              <h1>Where would you like to wander?</h1>
              <p className="start-copy">
                This web is small enough to cross by hand. Type an address above,
                or begin with one of these well-worn paths.
              </p>
              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => void navigate(suggestion, "typed")}
                  >
                    <span>0{index + 1}</span>
                    <strong>{suggestion}</strong>
                    <small>
                      {index === 0
                        ? "shorelines and field notes"
                        : index === 1
                          ? "a city after midnight"
                          : "six pots on a windowsill"}
                    </small>
                  </button>
                ))}
              </div>
              {error && <p className="connection-error">{error}</p>}
            </div>
          )}

          {current?.kind === "search" && (
            <div className="search-page">
              <p className="eyebrow">Search every page</p>
              <h1>Find something written here.</h1>
              <form className="search-form" onSubmit={submitSearch}>
                <input
                  aria-label="Search all sites"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Try moss, city, garden…"
                  autoFocus
                />
                <button type="submit" disabled={isSearching || !searchInput.trim()}>
                  {isSearching ? "Searching…" : "Search"}
                </button>
              </form>

              {current.query && (
                <div className="search-summary">
                  <span>
                    {current.results.length} {current.results.length === 1 ? "page" : "pages"}
                  </span>
                  <p>Results for “{current.query}”</p>
                </div>
              )}

              {current.query && current.results.length === 0 && !isSearching && (
                <p className="search-empty">
                  Nothing matched that phrase. Try a shorter word or a different path.
                </p>
              )}

              <div className="search-results">
                {current.results.map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    onClick={() => void navigate(result.address, "search")}
                  >
                    <span className="result-address">{result.address}</span>
                    <strong>{result.title}</strong>
                    <p>{result.excerpt}</p>
                    <small>Written by {result.authorName}</small>
                  </button>
                ))}
              </div>
              {error && <p className="connection-error">{error}</p>}
            </div>
          )}

          {current?.kind === "page" && current.status === "found" && current.html && (
            <div className="page-view">
              <div className="page-meta">
                <span>{current.address}</span>
                <span>Written by {current.authorName}</span>
              </div>
              <SiteFrame
                key={current.key}
                html={current.html}
                title={current.title ?? current.address}
                onNavigate={(nextAddress) => void navigate(nextAddress, "link")}
              />
            </div>
          )}

          {current?.kind === "page" && current.status === "not-found" && (
            <div className="not-found-page">
              <p className="error-code">404 / nowhere</p>
              <h1>No page lives here.</h1>
              <p>
                <strong>{current.address}</strong> may have been mistyped, removed,
                or never published. It still belongs to your trail, so Back will
                take you exactly where you were.
              </p>
              <button type="button" onClick={() => move("back")} disabled={!canGoBack(state)}>
                <ArrowIcon direction="left" /> Return to the last page
              </button>
            </div>
          )}
        </div>

        <footer className="browser-status">
          <span className={error ? "status-dot status-dot-error" : "status-dot"} />
          <span>
            {error ??
              notice ??
              (selectedPerson
                ? `Trail belongs to ${selectedPerson.name}`
                : "Connecting to the small web")}
          </span>
          <span className="status-security">Untrusted pages are contained</span>
        </footer>
      </section>
    </main>
  );
}
