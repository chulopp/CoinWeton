"use client";

import dynamic from "next/dynamic";
import type { CoinDetailData, HighlightCoin, CoinMarketRow } from "@/lib/market-data";

const CoinDetailClient = dynamic(() => import("@/components/coin-detail/CoinDetailClient"), {
  ssr: false,
});

interface CoinDetailWrapperProps {
  initialCoin: CoinDetailData;
  trendingCoins: HighlightCoin[];
  isLoggedIn: boolean;
  isWatchlisted: boolean;
  marketData: CoinMarketRow[];
}

export default function CoinDetailWrapper(props: CoinDetailWrapperProps) {
  return <CoinDetailClient {...props} />;
}
