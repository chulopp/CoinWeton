import { Card } from "@/components/ui/card";
import type { CoinMarketRow } from "@/lib/market-data";
import type { NewsArticle } from "@/lib/news-data";

import NewsImage from "./NewsImage";
import RelatedCoinDropdown from "./RelatedCoinDropdown";

export default function NewsCard({
  article,
  marketData,
}: {
  article: NewsArticle;
  marketData?: CoinMarketRow[] | null;
}) {
  return (
    <Card className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-card/80 flex h-full flex-col gap-0 overflow-hidden py-0">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={article.title}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 flex h-full flex-col pointer-events-none">
        <NewsImage
          src={article.image_url}
          alt={article.title}
          className="h-40 w-full object-cover"
        />

        <div className="flex flex-1 flex-col p-3">
          <div className="flex-1">
            <h3 className="mb-2 text-sm font-semibold leading-snug text-foreground line-clamp-3 transition-colors group-hover:text-cyan-400">
              {article.title}
            </h3>
          </div>

          <div className="mt-auto flex w-full flex-col items-start gap-2.5 pt-4">
            <RelatedCoinDropdown
              coinSymbols={article.coinSymbols}
              marketData={marketData}
            />

            <div className="flex items-center gap-2 text-left">
              <span className="text-sm font-semibold text-slate-200">
                {article.source_id}
              </span>
              <span className="text-slate-500 text-xs">&bull;</span>
              <span className="text-xs font-normal text-slate-500">
                {article.pubDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
