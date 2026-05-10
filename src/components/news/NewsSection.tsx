"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { CoinMarketRow } from "@/lib/market-data";
import { getSharedCryptoNews, type NewsArticle } from "@/lib/news-data";
import NewsCard from "./NewsCard";

export default function NewsSection({
  marketData,
}: {
  marketData?: CoinMarketRow[] | null;
}) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    
    getSharedCryptoNews().then(setArticles).catch(console.error);
  }, []);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section id="news" className="mx-auto w-full max-w-7xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Latest Crypto News
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            marketData={marketData}
          />
        ))}
      </div>

      <div className="flex justify-center text-center w-full mt-6">
        <Link
          href="/news"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#222E42] border border-white/20 px-6 py-2.5 text-sm font-bold text-[#00E5FF] hover:bg-[#2A374D] transition-colors"
        >
          See more news <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
