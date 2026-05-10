"use client";

import useSWR from "swr";
import type { HighlightsSnapshot } from "@/lib/market-data";
import { fetchHighlightsSnapshot } from "@/lib/live-data-client";
import HighlightsSection from "./HighlightsSection";

const LIVE_HIGHLIGHTS_REFRESH_INTERVAL_MS = 60_000;
const LIVE_HIGHLIGHTS_RETRY_INTERVAL_MS = 5_000;

function hasMeaningfulHighlights(snapshot: HighlightsSnapshot) {
  return (
    snapshot.globalData.totalMarketCapUsd !== null ||
    snapshot.fearAndGreed.value !== null ||
    snapshot.trendingCoins.length > 0 ||
    snapshot.topGainers.length > 0
  );
}

function HighlightsSectionSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-4 space-y-2">
        <div className="h-8 w-72 animate-pulse rounded bg-slate-800/70" />
        <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-slate-800/50" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex h-full flex-col gap-4">
          <div className="h-[140px] animate-pulse rounded-xl border border-[#1E293B] bg-slate-900/60" />
          <div className="h-[140px] animate-pulse rounded-xl border border-[#1E293B] bg-slate-900/60" />
        </div>
        <div className="h-[296px] animate-pulse rounded-xl border border-[#1E293B] bg-slate-900/60" />
        <div className="h-[296px] animate-pulse rounded-xl border border-[#1E293B] bg-slate-900/60" />
      </div>
    </section>
  );
}

export default function HighlightsSectionClient({
  initialSnapshot,
}: {
  initialSnapshot: HighlightsSnapshot;
}) {
  const { data, isValidating } = useSWR<HighlightsSnapshot>(
    "/api/highlights",
    fetchHighlightsSnapshot,
    {
      fallbackData: initialSnapshot,
      refreshInterval: LIVE_HIGHLIGHTS_REFRESH_INTERVAL_MS,
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryInterval: LIVE_HIGHLIGHTS_RETRY_INTERVAL_MS,
      onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 5) {
          return;
        }

        setTimeout(() => {
          void revalidate({ retryCount });
        }, LIVE_HIGHLIGHTS_RETRY_INTERVAL_MS);
      },
    }
  );

  const snapshot = data ?? initialSnapshot;

  if (!hasMeaningfulHighlights(snapshot) && isValidating) {
    return <HighlightsSectionSkeleton />;
  }

  return (
    <HighlightsSection
      globalData={snapshot.globalData}
      fearAndGreed={snapshot.fearAndGreed}
      trendingCoins={snapshot.trendingCoins}
      topGainers={snapshot.topGainers}
    />
  );
}
