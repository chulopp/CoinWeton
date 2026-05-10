import { TrendingDown, TrendingUp } from "lucide-react";
import type {
  FearAndGreedData,
  GlobalMarketData,
  HighlightCoin,
} from "@/lib/market-data";
import {
  formatCompactUsd,
  formatPercent,
  getPercentageColorClass,
} from "@/lib/market-data";
import GlobalMarketCapCard from "./GlobalMarketCapCard";
import FearGreedCard from "./FearGreedCard";
import TrendingCoinsCard from "./TrendingCoinsCard";
import TopGainersCard from "./TopGainersCard";

interface HighlightsSectionProps {
  globalData: GlobalMarketData;
  fearAndGreed: FearAndGreedData;
  trendingCoins: HighlightCoin[];
  topGainers: HighlightCoin[];
}

export default function HighlightsSection({
  globalData,
  fearAndGreed,
  trendingCoins,
  topGainers,
}: HighlightsSectionProps) {
  const marketCapChange = globalData.marketCapChangePercentage24h;
  const isPositive = (marketCapChange ?? 0) >= 0;

  return (
    <section id="market" className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Cryptocurrency Prices by Market Cap
        </h1>
        <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
          <p className="text-sm text-muted-foreground">
            The global cryptocurrency market cap today is{" "}
            <span className="font-medium text-foreground/80">
              {formatCompactUsd(globalData.totalMarketCapUsd)}
            </span>
            , a{" "}
              <span
                className={`inline-flex items-center gap-1 font-medium ${getPercentageColorClass(
                  marketCapChange
                )}`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
              {formatPercent(marketCapChange)}
            </span>{" "}
            change in the last 24 hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex h-full flex-col gap-4">
          <GlobalMarketCapCard globalData={globalData} />
          <FearGreedCard fearAndGreed={fearAndGreed} />
        </div>

        <TrendingCoinsCard coins={trendingCoins} />

        <TopGainersCard coins={topGainers} />
      </div>
    </section>
  );
}
