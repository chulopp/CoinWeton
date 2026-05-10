
import HighlightsSectionClient from "@/components/highlights/HighlightsSectionClient";
import CoinTable from "@/components/coin/CoinTable";
import NewsSection from "@/components/news/NewsSection";
import { getSession, getUserWatchlist } from "./actions";
import {
  getHomeMarketData,
  type HighlightsSnapshot,
} from "@/lib/market-data";

export default async function HomePage() {
  const {
    globalData,
    fearAndGreed,
    trendingCoins,
    topGainers,
    highlightsLastUpdated,
    marketData,
    lastUpdated,
  } = await getHomeMarketData(1);

  const user = await getSession();

  const watchlistedCoinIds = user ? await getUserWatchlist() : [];
  const initialHighlightsSnapshot: HighlightsSnapshot = {
    globalData,
    fearAndGreed,
    trendingCoins,
    topGainers,
    lastUpdated: highlightsLastUpdated,
  };

  return (
    <main className="flex min-h-screen flex-col flex-1">
      <HighlightsSectionClient initialSnapshot={initialHighlightsSnapshot} />
      <CoinTable
        coinsData={marketData}
        isLoggedIn={!!user}
        watchlistedCoinIds={watchlistedCoinIds}
        initialMarketSnapshot={{
          marketData,
          lastUpdated,
        }}
      />
      <NewsSection marketData={marketData} />
    </main>
  );
}
