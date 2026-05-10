"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Check,
  Flame,
  Loader2,
  Lock,
  Minus,
  Plus,
  Search,
  Star,
} from "lucide-react";

import NewsSection from "@/components/news/NewsSection";
import LoginModal from "@/components/auth/LoginModal";
import CoinTable from "@/components/coin/CoinTable";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  addWatchlistCoins,
  removeWatchlistCoins,
} from "@/app/actions";
import type {
  HighlightCoin,
  SearchCoinResult,
  WatchlistSnapshot,
} from "@/lib/market-data";
import {
  fetchDiscoverSnapshot,
  fetchSearchCoinResults,
  fetchWatchlistSnapshot,
} from "@/lib/live-data-client";

const LIVE_WATCHLIST_REFRESH_INTERVAL_MS = 60_000;
const LIVE_WATCHLIST_RETRY_INTERVAL_MS = 5_000;

const EMPTY_WATCHLIST_SNAPSHOT: WatchlistSnapshot = {
  isAuthenticated: false,
  coinIds: [],
  coins: [],
  lastUpdated: null,
};

function mapHighlightToSearchCoin(coin: HighlightCoin): SearchCoinResult {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    image: coin.image,
  };
}

function mergeSuggestedCoins(
  trendingCoins: HighlightCoin[],
  topGainers: HighlightCoin[]
): SearchCoinResult[] {
  const mergedCoins = [...trendingCoins, ...topGainers].map(mapHighlightToSearchCoin);
  const uniqueCoins = new Map<string, SearchCoinResult>();

  for (const coin of mergedCoins) {
    if (!uniqueCoins.has(coin.id)) {
      uniqueCoins.set(coin.id, coin);
    }
  }

  return Array.from(uniqueCoins.values());
}

function CoinIdentityRow({
  coin,
  isSelected,
  isDisabled = false,
  onClick,
  variant,
}: {
  coin: SearchCoinResult;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  variant: "add" | "remove";
}) {
  const activeStyles =
    variant === "add"
      ? "bg-[#00E5FF] border-[#00E5FF]"
      : "bg-red-500 border-red-500";
  const iconColor = variant === "add" ? "text-slate-900" : "text-white";

  return (
    <div
      onClick={() => {
        if (!isDisabled) {
          onClick();
        }
      }}
      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
        isDisabled
          ? "cursor-default opacity-60"
          : "cursor-pointer hover:bg-white/5 active:scale-[0.98]"
      }`}
    >
      <div className="flex items-center gap-3">
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
        <div className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-slate-200">
            {coin.name ?? "-"}
          </span>
          <span className="text-[11px] font-medium uppercase text-slate-500">
            {coin.symbol ?? "-"}
          </span>
        </div>
      </div>

      <div className="flex items-center">
        {isDisabled ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20">
            <Check className="h-3 w-3 text-cyan-400" />
          </div>
        ) : (
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-[4px] border transition-colors ${
              isSelected
                ? activeStyles
                : "border-slate-600 bg-transparent group-hover:border-slate-500"
            }`}
          >
            {isSelected ? <Check className={`h-3.5 w-3.5 ${iconColor}`} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function ModalEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
        <Search className="h-6 w-6 text-slate-600" />
      </div>
      <p className="text-sm font-bold text-slate-500">{message}</p>
    </div>
  );
}

export default function WatchlistPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isRemoveCoinsOpen, setIsRemoveCoinsOpen] = useState(false);
  const [selectedCoinIds, setSelectedCoinIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pendingAction, setPendingAction] = useState<"add" | "remove" | null>(
    null
  );

  const {
    data,
    error: watchlistError,
    isLoading,
    isValidating,
    mutate: mutateWatchlist,
  } = useSWR<WatchlistSnapshot>("/api/watchlist", fetchWatchlistSnapshot, {
    refreshInterval: LIVE_WATCHLIST_REFRESH_INTERVAL_MS,
    keepPreviousData: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryInterval: LIVE_WATCHLIST_RETRY_INTERVAL_MS,
    onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
      if (retryCount >= 5) {
        return;
      }

      setTimeout(() => {
        void revalidate({ retryCount });
      }, LIVE_WATCHLIST_RETRY_INTERVAL_MS);
    },
  });

  const watchlistSnapshot = data ?? EMPTY_WATCHLIST_SNAPSHOT;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const { data: discoverData, error: discoverError, isLoading: isDiscoverLoading } =
    useSWR(
      isAddAssetOpen ? "/api/discover" : null,
      fetchDiscoverSnapshot,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        shouldRetryOnError: true,
        keepPreviousData: true,
      }
    );

  const {
    data: searchedCoins,
    error: searchError,
    isLoading: isSearchLoading,
  } = useSWR(
    isAddAssetOpen && debouncedSearchTerm
      ? `/api/search/coins?query=${encodeURIComponent(debouncedSearchTerm)}`
      : null,
    fetchSearchCoinResults,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const suggestedCoins = useMemo(
    () =>
      discoverData
        ? mergeSuggestedCoins(discoverData.trendingCoins, discoverData.topGainers)
        : [],
    [discoverData]
  );

  const addModalCoins = useMemo(
    () => (debouncedSearchTerm ? searchedCoins ?? [] : suggestedCoins),
    [debouncedSearchTerm, searchedCoins, suggestedCoins]
  );

  const removableCoins = useMemo(
    () =>
      watchlistSnapshot.coins.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image ?? null,
      })),
    [watchlistSnapshot.coins]
  );

  const toggleCoinSelection = (coinId: string) => {
    setSelectedCoinIds((currentValue) =>
      currentValue.includes(coinId)
        ? currentValue.filter((id) => id !== coinId)
        : [...currentValue, coinId]
    );
  };

  const resetAddModalState = () => {
    setSelectedCoinIds([]);
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const resetRemoveModalState = () => {
    setSelectedCoinIds([]);
  };

  const handleAddModalOpenChange = (open: boolean) => {
    if (!open) {
      resetAddModalState();
    } else {
      resetRemoveModalState();
    }

    setIsAddAssetOpen(open);
  };

  const handleRemoveModalOpenChange = (open: boolean) => {
    if (!open) {
      resetRemoveModalState();
    } else {
      resetAddModalState();
    }

    setIsRemoveCoinsOpen(open);
  };

  const handleAddSelected = async () => {
    if (selectedCoinIds.length === 0) {
      return;
    }

    setPendingAction("add");

    const result = await addWatchlistCoins(selectedCoinIds);

    if (!result.success) {
      toast.error("Failed to add coins to your watchlist.");
      setPendingAction(null);
      return;
    }

    toast.success(
      `${result.addedCount ?? selectedCoinIds.length} coin${
        (result.addedCount ?? selectedCoinIds.length) === 1 ? "" : "s"
      } added to your watchlist.`
    );

    handleAddModalOpenChange(false);
    await mutateWatchlist();
    setPendingAction(null);
  };

  const handleRemoveSelected = async () => {
    if (selectedCoinIds.length === 0) {
      return;
    }

    setPendingAction("remove");

    const result = await removeWatchlistCoins(selectedCoinIds);

    if (!result.success) {
      toast.error("Failed to remove coins from your watchlist.");
      setPendingAction(null);
      return;
    }

    toast.success(
      `${result.removedCount ?? selectedCoinIds.length} coin${
        (result.removedCount ?? selectedCoinIds.length) === 1 ? "" : "s"
      } removed from your watchlist.`
    );

    handleRemoveModalOpenChange(false);
    await mutateWatchlist();
    setPendingAction(null);
  };

  const handleWatchlistToggleSuccess = (
    coinId: string,
    action: "added" | "removed"
  ) => {
    void mutateWatchlist((currentSnapshot) => {
      const snapshot = currentSnapshot ?? EMPTY_WATCHLIST_SNAPSHOT;

      if (action === "removed") {
        return {
          ...snapshot,
          coinIds: snapshot.coinIds.filter((id) => id !== coinId),
          coins: snapshot.coins.filter((coin) => coin.id !== coinId),
        };
      }

      return snapshot;
    }, false);
  };

  if (isLoading && !data) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col flex-1">
      <section className="w-full px-4 pb-2 pt-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                My Watchlist
              </h1>
            </div>

            {watchlistSnapshot.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddModalOpenChange(true)}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-slate-800/40 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/60"
                >
                  <Plus className="h-4 w-4" /> Add coin
                </button>
                <button
                  onClick={() => handleRemoveModalOpenChange(true)}
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-slate-800/40 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/60"
                >
                  <Minus className="h-4 w-4" /> Remove coin
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {watchlistSnapshot.isAuthenticated ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 px-4 md:px-8">
              <span className="text-xs font-medium text-muted-foreground">
                {watchlistError
                  ? "Refresh issue detected. Retrying shortly while keeping the last snapshot."
                  : isValidating
                    ? "Refreshing market data in the background..."
                    : "Market data auto-refreshes every minute."}
              </span>
              <span className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">
                Last updated:{" "}
                <span className="text-foreground/80">
                  {watchlistSnapshot.lastUpdated ?? "-"}
                </span>
              </span>
            </div>

            <CoinTable
              coinsData={watchlistSnapshot.coins}
              isWatchlist={true}
              isLoggedIn={true}
              watchlistedCoinIds={watchlistSnapshot.coinIds}
              onToggleSuccess={handleWatchlistToggleSuccess}
            />
          </>
        ) : (
          <section className="w-full px-4 pb-8 md:px-8">
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#1E293B] bg-[#121825]/50 py-20">
              <Lock className="mb-4 h-12 w-12 text-slate-600" />
              <p className="mb-2 text-lg font-semibold text-slate-400">
                Watchlist is Private
              </p>
              <p className="mb-6 text-sm text-slate-500">
                Please login to view your saved coins
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                type="button"
                className="h-10 rounded-lg border-b-[3px] border-[#0099cc] bg-[#00E5FF] px-6 text-sm font-bold text-slate-900 transition-all hover:bg-cyan-300 active:translate-y-1 active:border-b-0"
              >
                Login to View Watchlist
              </button>
            </div>
          </section>
        )}

        <NewsSection marketData={watchlistSnapshot.coins} />
      <Dialog open={isAddAssetOpen} onOpenChange={handleAddModalOpenChange}>
        <DialogContent className="flex flex-col overflow-hidden border-slate-700/50 bg-slate-900/95 p-0 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:max-w-[500px] sm:rounded-xl">
          <div className="p-4 pb-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Add Coins</DialogTitle>
              <DialogDescription>Add coins to your watchlist.</DialogDescription>
            </DialogHeader>
            <div className="relative flex items-center border-b border-slate-700/50 pb-2">
              <div className="absolute left-0 top-0 flex h-9 w-10 items-center justify-center text-slate-500">
                <Search className="h-4 w-4" />
              </div>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search coins"
                className="h-9 w-full border-none bg-transparent pl-9 pr-10 text-sm font-medium text-white placeholder:text-muted-foreground/40 focus-visible:ring-0"
                autoFocus
              />
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-300">
              <Flame className="h-3 w-3 text-orange-400" />
              Trending + Top Gainers
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto px-1 pb-3">
            {((!debouncedSearchTerm && isDiscoverLoading && !discoverData) ||
              (Boolean(debouncedSearchTerm) && isSearchLoading && !searchedCoins)) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : (!debouncedSearchTerm && discoverError && !discoverData) ||
              (Boolean(debouncedSearchTerm) && searchError && !searchedCoins) ? (
              <ModalEmptyState message="Unable to load coins right now." />
            ) : addModalCoins.length > 0 ? (
              <div className="space-y-0.5">
                {addModalCoins.map((coin) => {
                  const isSelected = selectedCoinIds.includes(coin.id);
                  const isAlreadyAdded = watchlistSnapshot.coinIds.includes(coin.id);

                  return (
                    <CoinIdentityRow
                      key={coin.id}
                      coin={coin}
                      isSelected={isSelected}
                      isDisabled={isAlreadyAdded}
                      onClick={() => toggleCoinSelection(coin.id)}
                      variant="add"
                    />
                  );
                })}
              </div>
            ) : (
              <ModalEmptyState
                message={
                  debouncedSearchTerm
                    ? `No coins found for "${debouncedSearchTerm}".`
                    : "No suggested coins are available right now."
                }
              />
            )}
          </div>

          <div className="border-t border-slate-700/50 p-4 pt-2">
            <button
              onClick={handleAddSelected}
              type="button"
              disabled={selectedCoinIds.length === 0 || pendingAction !== null}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border-b-[3px] border-[#0099cc] bg-[#00E5FF] text-sm font-bold text-slate-900 transition-all hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-1 active:border-b-0"
            >
              {pendingAction === "add" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {pendingAction === "add"
                ? "Saving..."
                : `Add ${selectedCoinIds.length > 0 ? selectedCoinIds.length : ""} Asset${
                    selectedCoinIds.length === 1 ? "" : "s"
                  }`}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveCoinsOpen} onOpenChange={handleRemoveModalOpenChange}>
        <DialogContent className="flex min-h-[500px] flex-col overflow-hidden border-[#1E293B] bg-[#121825] p-0 sm:max-w-[500px]">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Remove Coins from Your Watchlist
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-400">
                Delete the coins you marked
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 [-webkit-overflow-scrolling:touch] scrollbar-thin scrollbar-thumb-slate-700">
            <div className="flex flex-col gap-1">
              {removableCoins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Star className="mb-2 h-10 w-10 text-slate-700" />
                  <p className="text-sm text-slate-400">
                    Your watchlist is already empty.
                  </p>
                </div>
              ) : (
                removableCoins.map((coin) => (
                  <CoinIdentityRow
                    key={coin.id}
                    coin={coin}
                    isSelected={selectedCoinIds.includes(coin.id)}
                    onClick={() => toggleCoinSelection(coin.id)}
                    variant="remove"
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#1E293B] p-6 pt-4">
            <span className="text-sm font-medium text-slate-400">
              <strong className="text-white">{selectedCoinIds.length}</strong> coins
              selected
            </span>
            <button
              onClick={handleRemoveSelected}
              type="button"
              disabled={selectedCoinIds.length === 0 || pendingAction !== null}
              className={`flex h-10 items-center gap-2 rounded-lg border px-6 text-sm font-bold transition-colors ${
                selectedCoinIds.length > 0 && pendingAction === null
                  ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "cursor-not-allowed border-slate-700 bg-slate-800/50 text-slate-600"
              }`}
            >
              {pendingAction === "remove" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {pendingAction === "remove" ? "Removing..." : "Remove"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </main>
  );
}
