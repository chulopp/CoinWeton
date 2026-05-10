import { getHighlightsSnapshot } from "@/lib/market-data";

function hasMeaningfulHighlightsData(snapshot: Awaited<ReturnType<typeof getHighlightsSnapshot>>) {
  return (
    snapshot.globalData.totalMarketCapUsd !== null ||
    snapshot.fearAndGreed.value !== null ||
    snapshot.trendingCoins.length > 0 ||
    snapshot.topGainers.length > 0
  );
}

export async function GET() {
  const snapshot = await getHighlightsSnapshot({
    cache: "no-store",
  });

  if (!hasMeaningfulHighlightsData(snapshot)) {
    return Response.json(
      {
        error: "Unable to refresh highlights right now.",
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
