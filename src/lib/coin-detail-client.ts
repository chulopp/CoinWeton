import type { CoinDetailSnapshot } from "@/lib/market-data";

interface CoinDetailApiError {
  error?: string;
}

export async function fetchCoinDetailSnapshot(
  url: string
): Promise<CoinDetailSnapshot> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Unable to refresh coin data right now.";

    try {
      const payload = (await response.json()) as CoinDetailApiError;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parsing issues and fall back to the default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as CoinDetailSnapshot;
}
