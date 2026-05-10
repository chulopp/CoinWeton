"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Flame,
  Loader2,
  Rocket,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type { HighlightCoin, SearchCoinResult } from "@/lib/market-data";
import { formatUsdPrice } from "@/lib/market-data";
import {
  fetchDiscoverSnapshot,
  fetchSearchCoinResults,
} from "@/lib/live-data-client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/* ---------- Trending / Top Gainer row (with price + change) ---------- */

function HighlightResultRow({
  coin,
  rank,
  onClose,
}: {
  coin: HighlightCoin;
  rank: number;
  onClose: () => void;
}) {
  const isPositive = (coin.change24h ?? 0) >= 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Link 
      href={`/coins/${coin.id}`}
      onClick={onClose}
      className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="w-4 text-[10px] font-bold text-slate-600">{rank}</span>
        {coin.image ? (
          <Image
            src={coin.image}
            alt={`${coin.name ?? coin.symbol ?? "Coin"} logo`}
            width={32}
            height={32}
            sizes="32px"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200 ring-1 ring-white/5">
            {(coin.symbol ?? "?").slice(0, 2)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[13px] font-bold leading-tight text-slate-200">
            {coin.name ?? "-"}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {coin.symbol ?? "-"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-right">
        <span className="text-[13px] font-bold tabular-nums text-slate-200">
          {formatUsdPrice(coin.price)}
        </span>
        <div
          className={`flex w-20 items-center justify-end gap-1 text-[11px] font-bold tabular-nums ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          <ChangeIcon className="h-3.5 w-3.5" />
          <span>
            {coin.change24h === null
              ? "-"
              : `${isPositive ? "+" : ""}${coin.change24h.toFixed(2)}%`}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ---------- API search result row (icon + name + symbol only) ---------- */

function SearchResultRow({
  coin,
  rank,
  onClose,
}: {
  coin: SearchCoinResult;
  rank: number;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/coins/${coin.id}`}
      onClick={onClose}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
    >
      <span className="w-4 text-[10px] font-bold text-slate-600">{rank}</span>
      {coin.image ? (
        <Image
          src={coin.image}
          alt={`${coin.name ?? coin.symbol ?? "Coin"} logo`}
          width={32}
          height={32}
          sizes="32px"
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200 ring-1 ring-white/5">
          {(coin.symbol ?? "?").slice(0, 2)}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-[13px] font-bold leading-tight text-slate-200">
          {coin.name ?? "-"}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {coin.symbol ?? "-"}
        </span>
      </div>
    </Link>
  );
}

/* ---------- Skeleton loading state ---------- */

function LoadingState() {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-xl px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <div className="h-3 w-4 animate-pulse rounded bg-slate-800" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800" />
            <div className="space-y-1">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
              <div className="h-2 w-12 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="ml-auto h-3 w-20 animate-pulse rounded bg-slate-800" />
            <div className="ml-auto h-2 w-14 animate-pulse rounded bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function SearchModal({
  open,
  onOpenChange,
  children,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Trending" | "Top Gainer">(
    "Trending"
  );

  // Debounce the search query (300ms)
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const isSearchActive = debouncedQuery.length > 0;

  // Fetch trending + top gainers as default suggestions
  const { data: discoverData, error: discoverError, isLoading: isDiscoverLoading } = useSWR(
    open ? "/api/discover" : null,
    fetchDiscoverSnapshot,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: true,
      keepPreviousData: true,
    }
  );

  // Fetch full CoinGecko search results when user types a query
  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearchLoading,
  } = useSWR(
    open && isSearchActive
      ? `/api/search/coins?query=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetchSearchCoinResults,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  // Default suggestions from the active tab
  const currentHighlightData = useMemo(() => {
    if (!discoverData) {
      return [];
    }

    return activeTab === "Trending" ? discoverData.trendingCoins : discoverData.topGainers;
  }, [activeTab, discoverData]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
      setActiveTab("Trending");
    }

    onOpenChange(isOpen);
  };

  const handleClose = () => onOpenChange(false);

  // Determine what to render in the results area
  const renderResults = () => {
    /* ---- Active search mode ---- */
    if (isSearchActive) {
      if (isSearchLoading && !searchResults) {
        return (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        );
      }

      if (searchError && !searchResults) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
              <Search className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-400">
              Unable to search coins right now.
            </p>
          </div>
        );
      }

      if (searchResults && searchResults.length > 0) {
        return (
          <div className="space-y-0.5">
            {searchResults.map((coin, index) => (
              <SearchResultRow
                key={coin.id}
                coin={coin}
                rank={index + 1}
                onClose={handleClose}
              />
            ))}
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
            <Search className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-sm font-bold text-slate-500">
            No assets found for &quot;{debouncedQuery}&quot;
          </p>
        </div>
      );
    }

    /* ---- Default mode: Trending / Top Gainer tabs ---- */
    if (isDiscoverLoading && !discoverData) {
      return <LoadingState />;
    }

    if (discoverError && !discoverData) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
            <Search className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-sm font-bold text-slate-400">
            Unable to load discovery data right now.
          </p>
        </div>
      );
    }

    if (currentHighlightData.length > 0) {
      return (
        <div className="space-y-0.5">
          {currentHighlightData.map((coin, index) => (
            <HighlightResultRow
              key={coin.id}
              coin={coin}
              rank={index + 1}
              onClose={handleClose}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
          <Search className="h-6 w-6 text-slate-600" />
        </div>
        <p className="text-sm font-bold text-slate-500">
          No suggestions available right now.
        </p>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-1rem)] overflow-hidden border-slate-700/50 bg-slate-900/95 p-0 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:w-[500px] sm:rounded-xl"
        align="end"
        side="bottom"
        sideOffset={-36}
      >
        <div className="p-3 pb-0">
          <div className="relative flex items-center border-b border-slate-700/50 pb-2">
            <div className="absolute left-0 top-0 flex h-9 w-10 items-center justify-center text-slate-500">
              <Search className="h-4 w-4" />
            </div>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search coins..."
              className="h-9 w-full border-none bg-transparent pl-9 pr-16 text-sm font-medium placeholder:text-muted-foreground/40 focus-visible:ring-0"
              autoFocus
            />
            <div className="absolute right-0 flex items-center gap-2">
              {isSearchActive && isSearchLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
              ) : null}
              <div className="hidden items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 sm:flex">
                <span>ESC</span>
              </div>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab buttons — only visible when search is NOT active */}
        {!isSearchActive ? (
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => setActiveTab("Trending")}
              type="button"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                activeTab === "Trending"
                  ? "bg-[#00E5FF] text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              <Flame className="h-3 w-3" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab("Top Gainer")}
              type="button"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                activeTab === "Top Gainer"
                  ? "bg-[#00E5FF] text-slate-900"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              <Rocket className="h-3 w-3" />
              Top Gainer
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-300">
              <Search className="h-3 w-3 text-cyan-400" />
              Search Results
            </div>
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto px-1 pb-3 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] sm:max-h-[350px] [&::-webkit-scrollbar]:hidden">
          {renderResults()}
        </div>
      </PopoverContent>
    </Popover>
  );
}
