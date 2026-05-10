"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HighlightCoin } from "@/lib/market-data";
import {
  formatPercent,
  formatUsdPrice,
  getPercentageColorClass,
} from "@/lib/market-data";

function CoinRow({ coin, onClick }: { coin: HighlightCoin; onClick?: () => void }) {
  return (
    <Link 
      href={`/coins/${coin.id}`}
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-center gap-2">
        {coin.image ? (
          <Image
            src={coin.image}
            alt={`${coin.name ?? coin.symbol ?? "Coin"} logo`}
            width={24}
            height={24}
            sizes="24px"
            className="h-6 w-6 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white">
            {(coin.symbol ?? "?").slice(0, 2)}
          </div>
        )}
        <div className="text-left">
          <p className="text-sm font-medium leading-tight text-foreground">
            {coin.name ?? "-"}
          </p>
          <p className="mt-0.5 text-[11px] uppercase leading-tight text-muted-foreground">
            {coin.symbol ?? "-"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatUsdPrice(coin.price)}
        </span>
        <span
          className={`text-xs font-medium tabular-nums ${getPercentageColorClass(
            coin.change24h
          )}`}
        >
          {formatPercent(coin.change24h)}
        </span>
      </div>
    </Link>
  );
}

export default function TrendingCoinsCard({
  coins,
}: {
  coins: HighlightCoin[];
}) {
  const [viewMoreOpen, setViewMoreOpen] = useState(false);
  const previewCoins = coins.slice(0, 3);

  return (
    <>
      <Card className="flex h-full flex-col border-[#1E293B] bg-background">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <CardTitle className="text-lg font-bold text-slate-300">
            Trending Coins
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between pb-3 pt-0">
          <div className="space-y-0.5">
            {previewCoins.map((coin) => (
              <CoinRow key={coin.id} coin={coin} />
            ))}
          </div>
          <button
            onClick={() => setViewMoreOpen(true)}
            className="mt-4 w-full rounded-lg border border-[#1E293B] bg-slate-800/30 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-[#1E293B] hover:text-white"
          >
            View More
          </button>
        </CardContent>
      </Card>

      <Dialog open={viewMoreOpen} onOpenChange={setViewMoreOpen}>
        <DialogContent className="border-slate-700/50 bg-slate-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Flame className="h-4 w-4 text-orange-400" />
              Top 10 Trending Coins
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] space-y-0.5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {coins.map((coin) => (
              <CoinRow key={coin.id} coin={coin} onClick={() => setViewMoreOpen(false)} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
