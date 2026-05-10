import { getDiscoverSnapshot } from "@/lib/market-data";

export async function GET() {
  const snapshot = await getDiscoverSnapshot({
    cache: "no-store",
  });

  if (snapshot.trendingCoins.length === 0 && snapshot.topGainers.length === 0) {
    return Response.json(
      {
        error: "Unable to load discovery data right now.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
