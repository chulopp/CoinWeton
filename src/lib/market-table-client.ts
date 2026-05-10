import type { MarketTableSnapshot } from "@/lib/market-data";

interface MarketTableApiError {
  error?: string;
}

export async function fetchMarketTableSnapshot(
  url: string
): Promise<MarketTableSnapshot> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Unable to refresh market data right now.";

    try {
      const payload = (await response.json()) as MarketTableApiError;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Ignore JSON parsing issues and fall back to the default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as MarketTableSnapshot;
}
