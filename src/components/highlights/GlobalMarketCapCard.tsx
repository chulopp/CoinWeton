import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { GlobalMarketData } from "@/lib/market-data";
import {
  formatPercent,
  formatUsdWholeNumber,
  getPercentageColorClass,
} from "@/lib/market-data";
import Sparkline from "@/components/ui/Sparkline";

export default function GlobalMarketCapCard({
  globalData,
}: {
  globalData: GlobalMarketData;
}) {
  const marketCapChange = globalData.marketCapChangePercentage24h;

  return (
    <Card className="relative flex h-full flex-col justify-center overflow-hidden border-[#1E293B] bg-background p-5 transition-colors hover:bg-slate-800/30">
      <div className="relative z-10 w-fit">
        <div className="text-[22px] font-bold tabular-nums leading-none tracking-tight text-white">
          {formatUsdWholeNumber(globalData.totalMarketCapUsd)}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">Market Cap</span>
          <span
            className={`flex items-center gap-0.5 text-sm font-medium ${getPercentageColorClass(
              marketCapChange
            )}`}
          >
            {marketCapChange !== null &&
              (marketCapChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              ))}
            {formatPercent(marketCapChange)}
          </span>
        </div>
      </div>

      {globalData.btcSparkline && globalData.btcSparkline.length > 1 ? (
        <div className="pointer-events-none absolute right-4 top-1/2 h-[50px] w-[130px] -translate-y-1/2 opacity-90">
          <Sparkline
            data={globalData.btcSparkline}
            isPositive={(marketCapChange ?? 0) >= 0}
            height={50}
          />
        </div>
      ) : (
        <div className="pointer-events-none absolute right-4 top-1/2 h-[60px] w-[130px] -translate-y-1/2 opacity-90">
          <svg
            viewBox="0 0 100 40"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="marketCapGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path
              d="M0,30 L10,28 L20,32 L30,25 L40,28 L50,15 L60,18 L70,10 L80,12 L90,5 L100,2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0,30 L10,28 L20,32 L30,25 L40,28 L50,15 L60,18 L70,10 L80,12 L90,5 L100,2 L100,40 L0,40 Z"
              fill="url(#marketCapGradient)"
            />
          </svg>
        </div>
      )}
    </Card>
  );
}
