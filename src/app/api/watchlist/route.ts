import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { watchlists } from "@/db/schema";
import {
  getWatchlistSnapshot,
  type WatchlistSnapshot,
} from "@/lib/market-data";

const EMPTY_WATCHLIST_SNAPSHOT: WatchlistSnapshot = {
  isAuthenticated: false,
  coinIds: [],
  coins: [],
  lastUpdated: null,
};

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(EMPTY_WATCHLIST_SNAPSHOT, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  const rows = await db
    .select({ coinId: watchlists.coinId })
    .from(watchlists)
    .where(eq(watchlists.userId, session.user.id));

  const coinIds = rows.map((row) => row.coinId);

  if (coinIds.length === 0) {
    return Response.json(
      {
        isAuthenticated: true,
        coinIds: [],
        coins: [],
        lastUpdated: null,
      } satisfies WatchlistSnapshot,
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const snapshot = await getWatchlistSnapshot(coinIds, {
    cache: "no-store",
  });

  if (!snapshot.ok) {
    return Response.json(
      {
        error: snapshot.error ?? "Unable to refresh watchlist data right now.",
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
      isAuthenticated: true,
      coinIds: snapshot.coinIds,
      coins: snapshot.coins,
      lastUpdated: snapshot.lastUpdated,
    } satisfies WatchlistSnapshot,
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
