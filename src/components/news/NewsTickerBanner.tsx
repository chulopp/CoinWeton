"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

import { formatUsdPrice } from "@/lib/market-data";

const marqueeStyles = `
  @keyframes marquee-scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee-smooth {
    display: flex;
    width: max-content;
    animation: marquee-scroll 35s linear infinite;
    will-change: transform;
    transform: translateZ(0);
  }
  .animate-marquee-smooth:hover {
    animation-play-state: paused;
  }
`;

interface Asset {
  id: string;
  symbol: string;
  price: string;
  change: number;
  image?: string | null;
}

function BrandItem() {
  return (
    <div className="flex items-center flex-shrink-0">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-300 whitespace-nowrap">
          Powered by
        </span>
        <div
          className="flex items-center gap-1.5 h-8"
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        >
          <Image
            src="/icon.svg"
            alt="Icon"
            width={32}
            height={32}
            priority
            className="h-8 w-auto select-none pointer-events-none"
          />
          <Image
            src="/text5.svg"
            alt="Text"
            width={120}
            height={28}
            priority
            className="h-7 w-auto block translate-y-[3px] select-none pointer-events-none"
          />
        </div>
      </Link>
      <span className="mx-6 text-[#1E293B] font-light text-sm">|</span>
    </div>
  );
}

function TickerItem({ asset }: { asset: Asset }) {
  return (
    <div className="flex items-center flex-shrink-0">
      <Link
        href={`/coins/${asset.id}`}
        className="flex items-center gap-2 text-sm whitespace-nowrap tabular-nums group"
      >
        {asset.image ? (
          <Image
            src={asset.image}
            alt={`${asset.symbol} logo`}
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover group-hover:ring-1 group-hover:ring-cyan-500/30 transition-all"
          />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700/40 border border-slate-600/20 text-[8px] font-bold text-white group-hover:border-cyan-500/30 transition-colors">
            {(asset.symbol ?? "?").slice(0, 2)}
          </div>
        )}
        <span className="text-slate-400 font-bold tracking-tight group-hover:text-white transition-colors">
          {asset.symbol}
        </span>
        <span className="text-white font-semibold">{asset.price}</span>
        <span
          className={`font-bold flex items-center gap-0.5 ${
            asset.symbol === "USDT" || asset.change > 0
              ? "text-green-400"
              : asset.change < 0
                ? "text-red-400"
                : "text-slate-400"
          }`}
        >
          {asset.symbol === "USDT" || asset.change >= 0 ? "\u25B2" : "\u25BC"}
          {Math.abs(asset.change).toFixed(1)}%
        </span>
      </Link>
      <span className="mx-6 text-[#1E293B] font-light text-sm">|</span>
    </div>
  );
}

export default function NewsTickerBanner() {
  const fallbackAssets: Asset[] = [
    { id: "bitcoin", symbol: "BTC", price: "$75,971.51", change: 6.3 },
    { id: "ethereum", symbol: "ETH", price: "$2,339.86", change: -0.5 },
    { id: "tether", symbol: "USDT", price: "$1.00", change: 0.0 },
    { id: "binancecoin", symbol: "BNB", price: "$632.48", change: 1.4 },
    { id: "solana", symbol: "SOL", price: "$178.92", change: 12.5 },
  ];

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data } = useSWR("/api/market?page=1", fetcher, {
    refreshInterval: 60000,
  });

  const assets: Asset[] = data?.marketData
    ? data.marketData.slice(0, 5).map(
        (coin: {
          id: string;
          symbol: string;
          price: number | null;
          change24h?: number | null;
          image?: string | null;
        }) => ({
          id: coin.id,
          symbol: coin.symbol,
          price: formatUsdPrice(coin.price),
          change: coin.change24h ?? 0,
          image: coin.image,
        })
      )
    : fallbackAssets;

  const content = (
    <div className="flex items-center">
      <BrandItem />
      {assets.map((asset) => (
        <TickerItem key={asset.id} asset={asset} />
      ))}
    </div>
  );

  return (
    <div className="w-full bg-[#0F172A] border-b border-[#1E293B] overflow-hidden py-3 select-none">
      <style>{marqueeStyles}</style>
      <div className="animate-marquee-smooth">
        {content}
        {content}
      </div>
    </div>
  );
}
