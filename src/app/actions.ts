"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { watchlists } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSession() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function getUserWatchlist(): Promise<string[]> {
  try {
    const user = await getSession();
    if (!user?.id) return [];

    const rows = await db
      .select({ coinId: watchlists.coinId })
      .from(watchlists)
      .where(eq(watchlists.userId, user.id));

    return rows.map((r) => r.coinId);
  } catch {
    return [];
  }
}

function normalizeCoinIds(coinIds: string[]): string[] {
  return Array.from(
    new Set(
      coinIds
        .map((coinId) => coinId.trim())
        .filter((coinId) => coinId.length > 0)
    )
  );
}

export async function toggleWatchlist(
  coinId: string
): Promise<{ success: boolean; action?: "added" | "removed"; error?: string }> {
  try {
    const user = await getSession();
    if (!user?.id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const existing = await db.query.watchlists.findFirst({
      where: (wl, { and, eq }) =>
        and(eq(wl.userId, user.id!), eq(wl.coinId, coinId)),
    });

    if (existing) {
      await db.delete(watchlists).where(eq(watchlists.id, existing.id));
      revalidatePath("/", "layout");
      revalidatePath("/watchlist", "page");
      return { success: true, action: "removed" };
    } else {
      await db.insert(watchlists).values({
        userId: user.id,
        coinId,
      });
      revalidatePath("/", "layout");
      revalidatePath("/watchlist", "page");
      return { success: true, action: "added" };
    }
  } catch (e) {
    console.error("toggleWatchlist error:", e);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}

export async function addWatchlistCoins(
  coinIds: string[]
): Promise<{ success: boolean; addedCount?: number; error?: string }> {
  try {
    const user = await getSession();
    if (!user?.id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const normalizedCoinIds = normalizeCoinIds(coinIds);

    if (normalizedCoinIds.length === 0) {
      return { success: true, addedCount: 0 };
    }

    const existingRows = await db
      .select({ coinId: watchlists.coinId })
      .from(watchlists)
      .where(
        and(
          eq(watchlists.userId, user.id),
          inArray(watchlists.coinId, normalizedCoinIds)
        )
      );

    const existingCoinIds = new Set(existingRows.map((row) => row.coinId));
    const coinsToInsert = normalizedCoinIds.filter(
      (coinId) => !existingCoinIds.has(coinId)
    );

    if (coinsToInsert.length > 0) {
      await db.insert(watchlists).values(
        coinsToInsert.map((coinId) => ({
          userId: user.id!,
          coinId,
        }))
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/watchlist", "page");
    return { success: true, addedCount: coinsToInsert.length };
  } catch (error) {
    console.error("addWatchlistCoins error:", error);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}

export async function removeWatchlistCoins(
  coinIds: string[]
): Promise<{ success: boolean; removedCount?: number; error?: string }> {
  try {
    const user = await getSession();
    if (!user?.id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const normalizedCoinIds = normalizeCoinIds(coinIds);

    if (normalizedCoinIds.length === 0) {
      return { success: true, removedCount: 0 };
    }

    await db
      .delete(watchlists)
      .where(
        and(
          eq(watchlists.userId, user.id),
          inArray(watchlists.coinId, normalizedCoinIds)
        )
      );

    revalidatePath("/", "layout");
    revalidatePath("/watchlist", "page");
    return { success: true, removedCount: normalizedCoinIds.length };
  } catch (error) {
    console.error("removeWatchlistCoins error:", error);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
