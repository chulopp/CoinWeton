import { TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatPercent,
  formatUsdPrice,
  type HighlightCoin,
} from "@/lib/market-data";
import Sparkline from "@/components/ui/Sparkline";

export default function PeopleAlsoWatch({
  coins,
}: {
  coins: HighlightCoin[];
}) {
  if (coins.length === 0) {
    return null;
  }

  return (
    <section className="scroll-mt-24">
      <div className="flex items-center gap-2.5 mb-4">
        <TrendingUp className="h-5 w-5 text-cyan-400" />
        <h3 className="text-base font-bold text-white">People Also Watch</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {coins.map((coin) => {
          const isPositive = (coin.change24h ?? 0) >= 0;

          return (
            <Link
              key={coin.id}
              href={`/coins/${coin.id}`}
              className="group flex flex-col rounded-xl border border-[#1E293B] bg-[#121825] p-3.5 transition-all hover:border-slate-600 hover:bg-[#161D2B] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 overflow-hidden">
                  {coin.image ? (
                    <Image
                      src={coin.image}
                      alt={`${coin.name ?? coin.symbol ?? coin.id} logo`}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white">
                      {(coin.symbol ?? "?").slice(0, 1)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {coin.name ?? coin.id}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {coin.symbol ?? "-"}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <div className="h-10 w-full mb-3">
                  <Sparkline 
                    data={coin.sparkline || []} 
                    isPositive={isPositive} 
                    height={40} 
                  />
                </div>
                
                <p className="text-sm font-bold text-white tabular-nums">
                  {formatUsdPrice(coin.price)}
                </p>
                <p
                  className={`text-xs font-semibold tabular-nums mt-0.5 ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatPercent(coin.change24h, 2)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
