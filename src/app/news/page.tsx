import { Suspense } from "react";


import NewsPageClient from "@/components/news/NewsPageClient";
import NewsTickerBanner from "@/components/news/NewsTickerBanner";
import { getMarketTableData } from "@/lib/market-data";
import { getInitialCryptoNewsFeed } from "@/lib/news-data";

async function NewsPageContent() {
  const marketTable = await getMarketTableData(1);

  return (
    <NewsPageClient
      marketData={marketTable.marketData}
    />
  );
}

function NewsPageFallback() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-0 pb-8">
      <p className="text-sm text-slate-400">Loading latest news...</p>
    </section>
  );
}

export default function NewsPage() {
  return (
    <main className="flex min-h-screen flex-col flex-1">
      <NewsTickerBanner />

      <section className="mx-auto w-full max-w-7xl px-4 pt-2 pb-1">
        <h1 className="text-2xl font-bold text-foreground">Latest Crypto News</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay updated with the latest cryptocurrency news, market analysis,
          and industry insights.
        </p>
      </section>

      <Suspense fallback={<NewsPageFallback />}>
        <NewsPageContent />
      </Suspense>
    </main>
  );
}
