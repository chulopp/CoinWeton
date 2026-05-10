"use client";

import { useState } from "react";
import useSWR from "swr";
import CoinSidebar from "@/components/coin-detail/CoinSidebar";
import CoinDetailStickyNav from "@/components/coin-detail/CoinDetailStickyNav";
import CoinChartSection from "@/components/coin-detail/CoinChartSection";
import CwtAiCard from "@/components/coin-detail/CwtAiCard";
import CoinSpecificNews from "@/components/coin-detail/CoinSpecificNews";
import CoinInfoTabs from "@/components/coin-detail/CoinInfoTabs";
import PeopleAlsoWatch from "@/components/coin-detail/PeopleAlsoWatch";
import NewsSection from "@/components/news/NewsSection";
import {
  formatLastUpdatedTime,
  type CoinDetailData,
  type CoinDetailSnapshot,
  type HighlightCoin,
  type CoinMarketRow,
} from "@/lib/market-data";
import { fetchCoinDetailSnapshot } from "@/lib/coin-detail-client";

const LIVE_COIN_REFRESH_INTERVAL_MS = 60_000;
const LIVE_COIN_RETRY_INTERVAL_MS = 5_000;

interface CoinDetailClientProps {
  initialCoin: CoinDetailData;
  trendingCoins: HighlightCoin[];
  isLoggedIn: boolean;
  isWatchlisted: boolean;
  marketData?: CoinMarketRow[];
}

export default function CoinDetailClient({
  initialCoin,
  trendingCoins,
  isLoggedIn,
  isWatchlisted,
  marketData,
}: CoinDetailClientProps) {
  const [lastSuccessfulUpdatedAt, setLastSuccessfulUpdatedAt] = useState<string | null>(
    formatLastUpdatedTime()
  );

  const { data } = useSWR<CoinDetailSnapshot>(
    `/api/coins/${initialCoin.id}`,
    fetchCoinDetailSnapshot,
    {
      fallbackData: {
        coin: initialCoin,
        lastUpdated: lastSuccessfulUpdatedAt,
      },
      refreshInterval: LIVE_COIN_REFRESH_INTERVAL_MS,
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryInterval: LIVE_COIN_RETRY_INTERVAL_MS,
      onSuccess: (nextSnapshot) => {
        if (nextSnapshot.lastUpdated) {
          setLastSuccessfulUpdatedAt(nextSnapshot.lastUpdated);
        }
      },
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 5) {
          return;
        }

        setTimeout(() => {
          void revalidate({ retryCount });
        }, LIVE_COIN_RETRY_INTERVAL_MS);
      },
    }
  );

  const coin = data?.coin ?? initialCoin;
  const peopleAlsoWatch = trendingCoins
    .filter((trendingCoin) => trendingCoin.id !== coin.id)
    .slice(0, 5);

  const hasTokenomicsData =
    coin.marketData.totalSupply !== null ||
    coin.marketData.maxSupply !== null ||
    coin.marketData.circulatingSupply !== null;

  return (
    <main className="flex-1 w-full flex flex-col items-center">
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row lg:h-[calc(100vh-64px)]">
        <div className="hidden lg:block w-[340px] xl:w-[380px] shrink-0 border-r border-[#1E293B] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-8">
          <CoinSidebar
            coin={coin}
            mode="default"
            isLoggedIn={isLoggedIn}
            isWatchlisted={isWatchlisted}
            coinId={coin.id}
            coinName={coin.name ?? "Unknown Coin"}
          />
        </div>

        <div
          className="flex-1 min-w-0 lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
          id="main-scroll"
        >
          <div className="lg:hidden">
            <CoinSidebar
              coin={coin}
              mode="headerOnly"
              isLoggedIn={isLoggedIn}
              isWatchlisted={isWatchlisted}
              coinId={coin.id}
              coinName={coin.name ?? "Unknown Coin"}
            />
          </div>

          <CoinDetailStickyNav lastUpdated={lastSuccessfulUpdatedAt} />

          <div className="flex flex-col gap-8 lg:gap-12 p-4 lg:p-6 pt-2 lg:pt-6">
            <div id="chart" className="scroll-mt-20">
              <CoinChartSection 
                key={coin.tradingViewSymbol || coin.id} 
                tradingViewSymbol={coin.tradingViewSymbol} 
                coinId={coin.id}
              />
            </div>

            <div className="lg:hidden scroll-mt-20" id="fundamentals-section">
              <CoinSidebar
                coin={coin}
                mode="bodyOnly"
                isLoggedIn={isLoggedIn}
                isWatchlisted={isWatchlisted}
                coinId={coin.id}
                coinName={coin.name ?? "Unknown Coin"}
              />
            </div>

            <div id="cwt-ai-section" className="scroll-mt-20">
              <CwtAiCard coinName={coin.name ?? "This Coin"} isLoggedIn={isLoggedIn} coin={coin} />
            </div>

            <div id="news-section" className="scroll-mt-20">
              <CoinSpecificNews coinName={coin.name ?? "This Coin"} />
            </div>

            <div id="about" className="scroll-mt-20">
              <CoinInfoTabs
                coinName={coin.name ?? "Unknown Coin"}
                coinSymbol={coin.symbol ?? "-"}
                description={coin.description}
                tokenomics={
                  hasTokenomicsData
                    ? {
                        totalSupply: coin.marketData.totalSupply,
                        circulatingSupply: coin.marketData.circulatingSupply,
                        maxSupply: coin.marketData.maxSupply,
                        symbol: coin.symbol,
                      }
                    : null
                }
              />
            </div>

            <PeopleAlsoWatch coins={peopleAlsoWatch} />
          </div>
        </div>
      </div>

      <div className="w-full border-t border-[#1E293B] bg-background mt-6">
        <NewsSection marketData={marketData} />
      </div>
    </main>
  );
}
