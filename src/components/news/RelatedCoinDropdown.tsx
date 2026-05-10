"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import type { CoinMarketRow } from "@/lib/market-data";

interface MatchedCoin {
  id: string;
  symbol: string;
  image: string | null;
  change24h: number | null;
}

function formatChange(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  return `${Math.abs(value).toFixed(1)}%`;
}

function getMatchedCoins(
  coinSymbols: string[] | null | undefined,
  marketData: CoinMarketRow[] | null | undefined
): MatchedCoin[] {
  if (!Array.isArray(coinSymbols) || coinSymbols.length === 0) {
    return [];
  }

  const coinsBySymbol = new Map<string, CoinMarketRow>();

  for (const coin of marketData ?? []) {
    if (coin.symbol) {
      coinsBySymbol.set(coin.symbol.toUpperCase(), coin);
    }
  }

  return coinSymbols
    .map((symbol) => {
      const marketCoin = coinsBySymbol.get(symbol.toUpperCase());

      if (!marketCoin?.id || !marketCoin.symbol) {
        return null;
      }

      return {
        id: marketCoin.id,
        symbol: marketCoin.symbol,
        image: marketCoin.image ?? null,
        change24h: marketCoin.change24h,
      } satisfies MatchedCoin;
    })
    .filter((coin): coin is MatchedCoin => coin !== null);
}

export default function RelatedCoinDropdown({
  coinSymbols,
  marketData,
}: {
  coinSymbols?: string[] | null;
  marketData?: CoinMarketRow[] | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const matchedCoins = getMatchedCoins(coinSymbols, marketData);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (matchedCoins.length === 0) {
    return null;
  }

  const primaryCoin = matchedCoins[0];
  const primaryIsPositive = (primaryCoin.change24h ?? 0) >= 0;

  return (
    <div className="relative pointer-events-auto shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((currentOpen) => !currentOpen);
        }}
        className="flex items-center gap-1.5 rounded bg-[#1e293b]/60 px-2 py-1 text-xs border border-[#334155]/60 transition-colors hover:bg-[#1e293b] hover:border-[#475569]"
      >
        {primaryCoin.image ? (
          <Image
            src={primaryCoin.image}
            alt={`${primaryCoin.symbol} logo`}
            width={16}
            height={16}
            className="h-4 w-4 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[8px] font-bold text-white shadow-sm">
            {primaryCoin.symbol.slice(0, 1)}
          </div>
        )}
        <span className="text-slate-200 font-semibold">{primaryCoin.symbol}</span>
        <span
          className={`text-[10px] font-medium flex items-center gap-0.5 ${
            primaryIsPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {primaryIsPositive ? "\u25B2" : "\u25BC"} {formatChange(primaryCoin.change24h)}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-[190px] rounded-lg border border-slate-700 bg-slate-900 py-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.8)]">
          <div className="flex max-h-[220px] flex-col overflow-y-auto px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {matchedCoins.map((coin) => {
              const isPositive = (coin.change24h ?? 0) >= 0;

              return (
                <Link
                  key={coin.id}
                  href={`/coins/${coin.id}`}
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="flex items-center justify-between rounded px-2 py-2 transition-colors hover:bg-slate-800/80"
                >
                  <div className="flex items-center gap-2">
                    {coin.image ? (
                      <Image
                        src={coin.image}
                        alt={`${coin.symbol} logo`}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white shadow-sm">
                        {coin.symbol.slice(0, 1)}
                      </div>
                    )}
                    <span className="text-[13px] font-semibold text-slate-200">
                      {coin.symbol}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-medium flex items-center gap-0.5 ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isPositive ? "\u25B2" : "\u25BC"}
                    {formatChange(coin.change24h)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
