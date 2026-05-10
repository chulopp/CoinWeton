"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Info,
  Globe,
  Search,
  FileText,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import SecurityCard from "@/components/coin-detail/SecurityCard";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toggleWatchlist } from "@/app/actions";
import {
  formatCompactUsd,
  formatUsdPrice,
  type CoinDetailData,
} from "@/lib/market-data";


const METRIC_TOOLTIPS = {
  marketCap:
    "The market capitalization of a cryptocurrency is the total market value of its circulating supply. It is calculated by multiplying the current asset price by the number of coins or tokens that are currently circulating in the market. Market cap is widely used to compare the relative size of digital assets and to assess where an asset sits within the broader crypto market.",
  volume24h:
    "24-hour trading volume measures the total value of all spot trading activity recorded for this asset across tracked exchanges over the past 24 hours. It is commonly used as a proxy for market activity and liquidity. Higher volume generally indicates deeper markets and easier trade execution, while lower volume can suggest thinner order books and higher slippage risk.",
  fdv:
    "Fully Diluted Valuation (FDV) represents the theoretical market capitalization of an asset if its maximum supply were already in circulation. It is calculated by multiplying the current token price by the maximum supply. FDV can be useful for understanding potential dilution over time, especially for assets with emissions schedules, token unlocks, or vesting structures.",
  totalSupply:
    "Total supply refers to the number of coins or tokens that currently exist, excluding assets that have been permanently burned. It includes both circulating and non-circulating tokens, such as treasury holdings, locked allocations, vested tokens, and other reserves. This metric helps investors understand the broader token base beyond what is actively trading in the market.",
  maxSupply:
    "Maximum supply is the upper limit on the total number of coins or tokens that can ever exist for this asset, according to its protocol design or issuance schedule. Not every cryptocurrency has a maximum supply. When available, this metric is important for evaluating long-term scarcity, future dilution potential, and the asset's overall monetary structure.",
  circulatingSupply:
    "Circulating supply is the amount of coins or tokens that is publicly available and actively circulating in the market. It excludes tokens that are locked, reserved, vested, or otherwise not yet available for open trading. This is the supply figure most commonly used in market capitalization calculations because it reflects the portion of the asset that the market can currently access.",
} as const;

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733-16z" />
    <path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" />
  </svg>
);

type SidebarMode = "default" | "headerOnly" | "bodyOnly";

interface CoinSidebarProps {
  coin: CoinDetailData;
  mode?: SidebarMode;
  isLoggedIn?: boolean;
  isWatchlisted?: boolean;
  coinId?: string;
  coinName?: string;
}

interface OfficialLink {
  label: string;
  icon: ReactNode;
  url: string;
}

function formatSupply(
  value: number | null | undefined,
  symbol: string | null | undefined
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });

  return symbol ? `${formatted} ${symbol}` : formatted;
}

function formatTimeAgo(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return "just now";
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function formatDateLabel(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRangePercent(
  currentValue: number | null,
  low: number | null,
  high: number | null
): number {
  if (
    currentValue === null ||
    low === null ||
    high === null ||
    high <= low
  ) {
    return 0;
  }

  return Math.min(Math.max(((currentValue - low) / (high - low)) * 100, 0), 100);
}

function BoxLabel({
  text,
  tooltipContent,
}: {
  text: string;
  tooltipContent?: string;
}) {
  return (
    <div className="flex w-full items-center justify-center gap-1.5 text-slate-400 text-xs font-medium mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
      {text}
      {tooltipContent ? (
        <Popover>
          <PopoverTrigger asChild>
            <button className="focus:outline-none flex items-center justify-center">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-500 hover:text-slate-300 transition-colors" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="max-w-xs bg-[#1E293B] text-[#E2E8F0] border-slate-700 p-3 z-50"
          >
            <p className="text-xs leading-relaxed text-left">{tooltipContent}</p>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}

function PercentageText({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (
      <span className="text-[13px] font-semibold tabular-nums ml-1.5 text-slate-500">
        -
      </span>
    );
  }

  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={`text-[13px] font-semibold tabular-nums ml-1.5 ${
        positive ? "text-[#16c784]" : "text-[#ea3943]"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />
        {Math.abs(value).toFixed(2)}%
      </span>
    </span>
  );
}

function PriceChangeText({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <div className="text-[12px] font-bold tabular-nums text-slate-500">-</div>;
  }

  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`inline-flex items-center gap-1 text-[12px] font-bold tabular-nums ${
        positive ? "text-[#16c784]" : "text-[#ea3943]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(2)}% (24h)
    </div>
  );
}

function PerformanceChangeText({
  value,
}: {
  value: number | null | undefined;
}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="text-xs font-semibold text-slate-500 tabular-nums">-</span>;
  }

  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${
        positive ? "text-green-500" : "text-red-500"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export default function CoinSidebar({
  coin,
  mode = "default",
  isLoggedIn = false,
  isWatchlisted = false,
  coinId,
  coinName,
}: CoinSidebarProps) {
  const [watchlisted, setWatchlisted] = useState(isWatchlisted);
  const [isPending, startTransition] = useTransition();

  const resolvedCoinId = coinId ?? coin.id;
  const resolvedCoinName = coinName ?? coin.name ?? "Unknown Coin";
  const rangePercent = getRangePercent(
    coin.marketData.currentPriceUsd,
    coin.marketData.low24hUsd,
    coin.marketData.high24hUsd
  );

  const officialLinks: OfficialLink[] = [
    {
      label: "Website",
      icon: <Globe className="h-3.5 w-3.5" />,
      url: coin.links.website,
    },
    {
      label: "Explorer",
      icon: <Search className="h-3.5 w-3.5" />,
      url: coin.links.explorer,
    },
    {
      label: "Twitter",
      icon: <XIcon className="h-3.5 w-3.5" />,
      url: coin.links.twitter,
    },
    {
      label: "Whitepaper",
      icon: <FileText className="h-3.5 w-3.5" />,
      url: coin.links.whitepaper,
    },
  ].flatMap((link) => (link.url ? [{ ...link, url: link.url }] : []));

  const handleWatchlistToggle = () => {
    if (!isLoggedIn) {
      toast.error("Oops! Log in first to use this feature.");
      return;
    }

    const previousState = watchlisted;
    setWatchlisted(!previousState);

    startTransition(async () => {
      const result = await toggleWatchlist(resolvedCoinId);

      if (!result.success) {
        setWatchlisted(previousState);
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (result.action === "added") {
        toast.success(`${resolvedCoinName} added to Watchlist`);
        return;
      }

      toast(`${resolvedCoinName} removed from Watchlist.`);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {mode !== "bodyOnly" ? (
        <div className="lg:sticky lg:top-0 bg-background z-20 border-b border-border/50">
          <div className="px-5 pt-4 pb-5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-3">
              <Link href="/" className="hover:text-cyan-400 transition-colors">
                Coins
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-300 font-semibold">
                {coin.name ?? "Unknown Coin"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#222E42] overflow-hidden">
                  {coin.image ? (
                    <Image
                      src={coin.image}
                      alt={`${resolvedCoinName} logo`}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {(coin.symbol ?? "?").slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-[22px] font-bold text-white tracking-tight truncate">
                      {coin.name ?? "Unknown Coin"}
                    </h1>
                    <span className="text-[12px] font-semibold text-slate-400">
                      {coin.symbol ?? "-"}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-[#222E42] px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                      #{coin.marketCapRank ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleWatchlistToggle}
                disabled={isPending}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#222E42] border border-[#2A374D] px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-[#2A374D] transition-all outline-none cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <Star
                  className={`h-3 w-3 transition-all duration-200 ${
                    watchlisted ? "fill-yellow-500 text-yellow-500" : "text-slate-400"
                  }`}
                />
                {watchlisted ? "Watchlisted" : "Watchlist"}
              </button>
            </div>

            <div className="flex items-center mb-0">
              <span className="text-[28px] sm:text-[36px] font-bold text-white tabular-nums tracking-tighter">
                {formatUsdPrice(coin.marketData.currentPriceUsd)}
              </span>
            </div>

            <PriceChangeText value={coin.marketData.priceChangePercentage24h} />
          </div>
        </div>
      ) : null}

      {mode !== "headerOnly" ? (
        <div className="flex-1">
          <div className="p-4 border-b border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-background py-2.5 text-center transition-colors hover:bg-card/60">
                <BoxLabel text="Market cap" tooltipContent={METRIC_TOOLTIPS.marketCap} />
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatCompactUsd(coin.marketData.marketCapUsd)}
                  </span>
                  <PercentageText value={coin.marketData.marketCapChangePercentage24h} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background py-2.5 text-center transition-colors hover:bg-card/60">
                <BoxLabel text="24h volume" tooltipContent={METRIC_TOOLTIPS.volume24h} />
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatCompactUsd(coin.marketData.totalVolumeUsd)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background py-2.5 text-center transition-colors hover:bg-card/60">
                <BoxLabel text="FDV" tooltipContent={METRIC_TOOLTIPS.fdv} />
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatCompactUsd(coin.marketData.fullyDilutedValuationUsd)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background py-2.5 text-center transition-colors hover:bg-card/60">
                <BoxLabel text="Total supply" tooltipContent={METRIC_TOOLTIPS.totalSupply} />
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatSupply(coin.marketData.totalSupply, coin.symbol)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background py-2.5 text-center transition-colors hover:bg-card/60">
                <BoxLabel text="Max supply" tooltipContent={METRIC_TOOLTIPS.maxSupply} />
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatSupply(coin.marketData.maxSupply, coin.symbol)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background py-2.5 text-center transition-colors hover:bg-card/60">
                <BoxLabel text="Circulating supply" tooltipContent={METRIC_TOOLTIPS.circulatingSupply} />
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {formatSupply(coin.marketData.circulatingSupply, coin.symbol)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-border/50">
            <h3 className="text-base font-bold text-white mb-5">Price performance</h3>

            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
              <span>24h low</span>
              <span>24h high</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-white mb-3 tabular-nums">
              <span>{formatUsdPrice(coin.marketData.low24hUsd)}</span>
              <span>{formatUsdPrice(coin.marketData.high24hUsd)}</span>
            </div>

            <div className="relative h-1.5 w-full rounded-full bg-slate-800 mb-8">
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full bg-[#334155]"
                style={{ width: `${rangePercent}%` }}
              />
              <div
                className="absolute top-1/2 -mt-1.5 h-3 w-[2px] bg-white rounded-sm"
                style={{ left: `${rangePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-300">All-time high</span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {coin.marketData.athDateUsd
                    ? `${formatDateLabel(coin.marketData.athDateUsd)} (${formatTimeAgo(
                        coin.marketData.athDateUsd
                      )})`
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-bold text-white tabular-nums">
                  {formatUsdPrice(coin.marketData.athUsd)}
                </span>
                <PerformanceChangeText value={coin.marketData.athChangePercentageUsd} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-300">All-time low</span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {coin.marketData.atlDateUsd
                    ? `${formatDateLabel(coin.marketData.atlDateUsd)} (${formatTimeAgo(
                        coin.marketData.atlDateUsd
                      )})`
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-bold text-white tabular-nums">
                  {formatUsdPrice(coin.marketData.atlUsd)}
                </span>
                <PerformanceChangeText value={coin.marketData.atlChangePercentageUsd} />
              </div>
            </div>
          </div>

          <SecurityCard coin={coin} />

          {officialLinks.length > 0 ? (
            <div className="px-5 py-5 pb-10">
              <h3 className="text-sm font-bold text-slate-200 mb-3">Official Links</h3>
              <div className="flex flex-wrap gap-2">
                {officialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3.5 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-muted/80"
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
