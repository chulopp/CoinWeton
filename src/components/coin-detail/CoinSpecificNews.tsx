"use client";

import React from "react";
import Link from "next/link";
import useSWR from "swr";

import NewsImage from "@/components/news/NewsImage";

interface CoinSpecificNewsProps {
  coinName?: string;
  coinSymbol?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CoinSpecificNews({ coinName = "Bitcoin", coinSymbol = "BTC" }: CoinSpecificNewsProps) {
  // Step 1: Fetch coin-specific news
  const { data: coinData, error: coinError, isLoading: isCoinLoading } = useSWR(
    `/api/news?coin=${encodeURIComponent(coinName)}`,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const coinArticles = coinData?.results || [];
  const shouldFetchGeneral = !isCoinLoading && coinArticles.length === 0;

  // Step 2: Fallback to general crypto news if coin-specific returns empty
  const { data: generalData, error: generalError, isLoading: isGeneralLoading } = useSWR(
    shouldFetchGeneral ? `/api/news` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const isLoading = isCoinLoading || isGeneralLoading;

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center text-slate-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const articles = coinArticles.length > 0 ? coinArticles : (generalData?.results || []);
  const hasError = coinArticles.length > 0 ? coinError : generalError;

  if (articles.length === 0 || hasError) {
    return null;
  }

  const featured = articles[0];
  const list = articles.slice(1, 4); // Only 3 for the right column

  return (
    <div>
      {/* 1. SECTION HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-200">
          {coinName} News
        </h2>
        <Link 
          href="/news"
          className="text-xs font-semibold text-[#00E5FF] px-3 py-1.5 border border-[#1E293B] rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
        >
          More News
        </Link>
      </div>

      {/* 2. MAIN CONTENT (SPLIT LAYOUT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 3. LEFT COLUMN (FEATURED NEWS) */}
        <a 
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-3 group cursor-pointer"
        >
          <NewsImage 
            src={featured.image_url} 
            alt={featured.title} 
            className="w-full h-52 object-cover rounded-xl transition-opacity group-hover:opacity-90"
          />
          <span className="text-xs text-slate-400 font-medium mt-1 uppercase">
            {featured.source_id} • {featured.pubDate}
          </span>
          <h3 className="text-lg font-bold text-slate-200 group-hover:text-[#00E5FF] transition-colors line-clamp-3 leading-snug">
            {featured.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">
            {featured.description || "Click to read the full story on " + featured.source_id}
          </p>
        </a>

        {/* 4. RIGHT COLUMN (NEWS LIST VERTICAL) */}
        <div className="flex flex-col justify-between h-full gap-5">
          {list.map((item: any) => (
            <a 
              key={item.article_id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 group cursor-pointer border-b border-[#1E293B]/50 pb-4 last:border-b-0 last:pb-0"
            >
              <span className="text-xs text-slate-400 font-medium uppercase">
                {item.source_id} • {item.pubDate}
              </span>
              <h4 className="text-[15px] font-bold text-slate-200 group-hover:text-[#00E5FF] transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h4>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
