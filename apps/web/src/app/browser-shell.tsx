"use client";

import { FormEvent, useEffect, useMemo, useReducer, useState } from "react";
import {
  browserReducer,
  canGoBack,
  canGoForward,
  currentEntry,
  initialBrowserState,
  type NavigationEntry,
  type NavigationSource,
} from "@/lib/browser-state";
import {
  ApiError,
  getPeople,
  getSite,
  recordVisit,
  type Person,
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
  const current = currentEntry(state);
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

    let entry: NavigationEntry;
    try {
      const site = await getSite(nextAddress);
      entry = {
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
    setAddress(target.address);
    setNotice(null);
    void saveVisit(target.address, direction);
  }

  function changePerson(nextPersonId: string) {
    setPersonId(nextPersonId);
    setAddress("");
    setError(null);
    setNotice(null);
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
      </header>

      <section className="browser" aria-label="Small web browser">
        <div className="browser-topline">
          <div className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>{current?.title ?? "A browser for quieter places"}</p>
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
        </div>

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

          {current?.status === "found" && current.html && (
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

          {current?.status === "not-found" && (
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
