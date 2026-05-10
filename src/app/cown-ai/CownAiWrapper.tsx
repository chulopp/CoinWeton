"use client";

import dynamic from "next/dynamic";
import type { CoinMarketRow, GlobalMarketData, FearAndGreedData, HighlightCoin } from "@/lib/market-data";
import type { NewsArticle } from "@/lib/news-data";

const CownAiClient = dynamic(() => import("./CownAiClient"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-[calc(100dvh-64px)] sm:h-[calc(100dvh-80px)] w-full max-w-5xl mx-auto bg-transparent items-center justify-center">
      <div className="animate-pulse text-slate-400 font-medium">Initializing Cown AI...</div>
    </div>
  ),
});

interface CownAiWrapperProps {
  marketData?: CoinMarketRow[];
  globalData?: GlobalMarketData;
  fearAndGreed?: FearAndGreedData;
  trendingCoins?: HighlightCoin[];
  newsData?: NewsArticle[];
}

export default function CownAiWrapper(props: CownAiWrapperProps) {
  return <CownAiClient {...props} />;
}
