import { notFound } from "next/navigation";
import CoinDetailWrapper from "./CoinDetailWrapper";
import { getSession, getUserWatchlist } from "@/app/actions";
import { getCoinDetail, getTrending, getMarketTableData } from "@/lib/market-data";

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [coin, trendingCoins, user, marketTable] = await Promise.all([
    getCoinDetail(id),
    getTrending(6),
    getSession(),
    getMarketTableData(1),
  ]);

  if (!coin) {
    notFound();
  }

  const watchlistedCoinIds = user ? await getUserWatchlist() : [];
  const isLoggedIn = !!user;
  const isWatchlisted = watchlistedCoinIds.includes(coin.id);

  return (
    <main className="flex min-h-screen flex-col flex-1">
      <CoinDetailWrapper
        initialCoin={coin}
        trendingCoins={trendingCoins}
        isLoggedIn={isLoggedIn}
        isWatchlisted={isWatchlisted}
        marketData={marketTable.marketData}
      />
    </main>
  );
}
