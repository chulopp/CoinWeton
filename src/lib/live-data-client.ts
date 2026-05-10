import type {
  DiscoverSnapshot,
  HighlightsSnapshot,
  SearchCoinResult,
  WatchlistSnapshot,
} from "@/lib/market-data";

interface ApiErrorPayload {
  error?: string;
}

async function fetchJsonOrThrow<T>(
  url: string,
  fallbackMessage: string
): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parsing issues and fall back to the default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchHighlightsSnapshot(url: string): Promise<HighlightsSnapshot> {
  return fetchJsonOrThrow(url, "Unable to refresh highlights right now.");
}

export function fetchDiscoverSnapshot(url: string): Promise<DiscoverSnapshot> {
  return fetchJsonOrThrow(url, "Unable to load discovery data right now.");
}

export function fetchWatchlistSnapshot(url: string): Promise<WatchlistSnapshot> {
  return fetchJsonOrThrow(url, "Unable to refresh watchlist data right now.");
}

export function fetchSearchCoinResults(url: string): Promise<SearchCoinResult[]> {
  return fetchJsonOrThrow(url, "Unable to search coins right now.");
}
