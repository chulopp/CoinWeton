import React from "react";
import useSWR from "swr";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { GlobalMarketData } from "@/lib/market-data";
import {
  formatCompactUsd,
  formatInteger,
  formatPercent,
  getPercentageColorClass,
} from "@/lib/market-data";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GlobalMetric {
  label: string;
  value: string;
  change?: number | null;
}

const fallbackMetrics: GlobalMetric[] = [
  { label: "Coins", value: "-" },
  { label: "Exchanges", value: "-" },
  { label: "Market Cap", value: "-" },
  { label: "24h Vol", value: "-" },
  { label: "Dominance", value: "BTC - ETH -" },
];

function buildMetrics(globalStats?: GlobalMarketData): GlobalMetric[] {
  if (!globalStats) {
    return fallbackMetrics;
  }

  return [
    {
      label: "Coins",
      value: formatInteger(globalStats.activeCryptocurrencies),
    },
    {
      label: "Exchanges",
      value: formatInteger(globalStats.markets),
    },
    {
      label: "Market Cap",
      value: formatCompactUsd(globalStats.totalMarketCapUsd),
      change: globalStats.marketCapChangePercentage24h,
    },
    {
      label: "24h Vol",
      value: formatCompactUsd(globalStats.totalVolumeUsd),
    },
    {
      label: "Dominance",
      value: `BTC ${formatPercent(globalStats.btcDominance)} ETH ${formatPercent(
        globalStats.ethDominance
      )}`,
    },
  ];
}

export default function NavbarTopTier() {
  const { data } = useSWR<{ globalData: GlobalMarketData }>(
    "/api/market/global",
    fetcher,
    { 
      refreshInterval: 60000,
      keepPreviousData: true,
      shouldRetryOnError: true,
      errorRetryInterval: 5000
    }
  );

  const globalMetrics = buildMetrics(data?.globalData);

  return (
    <div className="w-full overflow-hidden border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex w-full max-w-fit mx-auto items-center gap-1 overflow-x-auto whitespace-nowrap px-4 pr-8 py-1.5 text-xs text-muted-foreground md:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {globalMetrics.map((metric, index) => (
          <React.Fragment key={metric.label}>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-muted-foreground/60">{metric.label}:</span>{" "}
              <span className="font-medium text-foreground/80 tabular-nums">
                {metric.value}
              </span>
              {metric.change !== undefined && metric.change !== null && (
                <span
                  className={`flex items-center gap-0.5 font-medium tabular-nums ${getPercentageColorClass(
                    metric.change
                  )}`}
                >
                  {metric.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatPercent(metric.change)}
                </span>
              )}
            </span>
            {index < globalMetrics.length - 1 && (
              <span className="mx-1.5 text-muted-foreground/30">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
