import type { NavigationSource } from "./browser-state";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Person = { _id: string; name: string };

export type Site = {
  _id: string;
  address: string;
  title: string;
  safeHtml: string;
  authorId: { _id: string; name: string };
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message;
    throw new ApiError(message ?? "The small web did not respond", response.status);
  }

  return response.json() as Promise<T>;
}

export function getPeople(): Promise<Person[]> {
  return request<Person[]>("/people");
}

export function getSite(address: string): Promise<Site> {
  return request<Site>(`/sites/${encodeURIComponent(address)}`);
}

export function recordVisit(
  personId: string,
  address: string,
  source: NavigationSource,
): Promise<unknown> {
  return request("/visits", {
    method: "POST",
    body: JSON.stringify({ personId, address, source }),
  });
}
