import { getMarketTableData } from "@/lib/market-data";

function getPageParam(request: Request): number {
  const { searchParams } = new URL(request.url);
  const value = Number(searchParams.get("page") ?? "1");

  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export async function GET(request: Request) {
  const page = getPageParam(request);
  const marketTable = await getMarketTableData(page, {
    cache: "no-store",
  });

  if (!marketTable.ok) {
    return Response.json(
      {
        error: marketTable.error ?? "Unable to refresh market data right now.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  return Response.json(
    {
      marketData: marketTable.marketData,
      lastUpdated: marketTable.lastUpdated,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
