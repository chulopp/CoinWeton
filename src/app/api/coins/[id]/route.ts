import { getCoinDetailResult } from "@/lib/market-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const detail = await getCoinDetailResult(id, {
    cache: "no-store",
  });

  if (!detail.ok || !detail.coin) {
    return Response.json(
      {
        error:
          detail.error ??
          (detail.status === 404
            ? "Coin not found."
            : "Unable to refresh coin data right now."),
      },
      {
        status: detail.status === 404 ? 404 : 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  return Response.json(
    {
      coin: detail.coin,
      lastUpdated: detail.lastUpdated,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
