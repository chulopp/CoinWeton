import { getCoinSearchResults } from "@/lib/market-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";

  const results = await getCoinSearchResults(query, 20, {
    cache: "no-store",
  });

  return Response.json(results, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
