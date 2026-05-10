"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

import type { CoinMarketRow } from "@/lib/market-data";
import type { NewsArticle, NewsDataItem } from "@/lib/news-data";
import { mergeNewsArticles, mapArticle } from "@/lib/news-data";

import NewsCard from "./NewsCard";
import NewsImage from "./NewsImage";
import RelatedCoinDropdown from "./RelatedCoinDropdown";

const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 8;

interface NewsPageClientProps {
  initialArticles?: NewsArticle[] | null;
  initialNextPage?: string | null;
  marketData?: CoinMarketRow[] | null;
}

export default function NewsPageClient({
  initialArticles,
  initialNextPage,
  marketData,
}: NewsPageClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(
    Array.isArray(initialArticles) ? initialArticles : []
  );
  const [nextPageToken, setNextPageToken] = useState<string | null>(
    initialNextPage ?? null
  );

  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || articles.length > 0) return;
    fetched.current = true;
    
    import("@/lib/news-data").then(({ getInitialCryptoNewsFeed }) => {
      getInitialCryptoNewsFeed().then(res => {
        setArticles(res.articles);
        setNextPageToken(res.nextPage);
      }).catch(console.error);
    });
  }, [articles.length]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const newsList = Array.isArray(articles) ? articles : [];
  const featuredNews = newsList.length >= 4 ? newsList.slice(0, 4) : [];
  const featuredArticle = featuredNews[0] ?? null;
  const secondaryArticles = featuredNews.slice(1);
  const allNews = newsList.slice(4);
  const visibleArticles = allNews.slice(0, visibleCount);
  const hasMore =
    visibleCount < allNews.length || Boolean(nextPageToken);

  async function handleLoadMore() {
    if (visibleCount >= 24) return;
    const nextVisibleCount = Math.min(visibleCount + LOAD_MORE_COUNT, 24);

    setLoadMoreError(null);

    // If we already have enough articles, just show them without fetching
    if (allNews.length >= nextVisibleCount) {
      setVisibleCount(nextVisibleCount);
      return;
    }

    if (!nextPageToken || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await fetch(
        `/api/news?page=${encodeURIComponent(nextPageToken)}`,
        {
          cache: "no-store",
        }
      );

      const newData = await response.json();

      if (!response.ok) {
        throw new Error(newData.error ?? "Unable to load more news right now.");
      }

      if (newData && Array.isArray(newData.results)) {
        const mappedArticles = newData.results
          .map((article: NewsDataItem, index: number) => mapArticle(article, index))
          .filter((a: NewsArticle | null): a is NewsArticle => a !== null);

        setArticles((currentArticles) =>
          mergeNewsArticles(currentArticles, mappedArticles)
        );
        setNextPageToken(newData.nextPage ?? null);
        setVisibleCount(nextVisibleCount);
      }
    } catch (error) {
      setLoadMoreError(
        error instanceof Error
          ? error.message
          : "Unable to load more news right now."
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (newsList.length === 0) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <p className="text-sm text-slate-400">
          Latest news is unavailable right now. Please check back shortly.
        </p>
      </section>
    );
  }

  return (
    <>
      {featuredArticle ? (
        <section className="mx-auto w-full max-w-7xl px-4 pt-0 pb-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="group relative lg:col-span-3">
              <a
                href={featuredArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={featuredArticle.title}
                className="absolute inset-0 z-0"
              />
              <div className="relative z-10 pointer-events-none">
                <NewsImage
                  src={featuredArticle.image_url}
                  alt={featuredArticle.title}
                  className="w-full h-[260px] rounded-xl object-cover transition-opacity group-hover:opacity-90 sm:h-[340px]"
                  loading="eager"
                />
                <div className="mt-4 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RelatedCoinDropdown
                      coinSymbols={featuredArticle.coinSymbols}
                      marketData={marketData}
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-cyan-400 transition-colors leading-snug line-clamp-3">
                    {featuredArticle.title}
                  </h2>
                  {featuredArticle.description ? (
                    <p className="text-sm text-slate-400 line-clamp-2 mt-2">
                      {featuredArticle.description}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm font-semibold text-slate-200">
                      {featuredArticle.source_id}
                    </span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="text-xs font-normal text-slate-500">
                      {featuredArticle.pubDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-between gap-4">
              {secondaryArticles.map((article) => (
                <div
                  key={article.id}
                  className="group relative flex flex-row justify-between gap-4 border-b border-[#1E293B]/50 pb-4 last:border-b-0 last:pb-0"
                >
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={article.title}
                    className="absolute inset-0 z-0"
                  />
                  <div className="relative z-10 flex w-full flex-row justify-between gap-4 pointer-events-none">
                    <div className="flex flex-1 min-w-0 flex-col gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors line-clamp-3 leading-snug">
                        {article.title}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                        <RelatedCoinDropdown
                          coinSymbols={article.coinSymbols}
                          marketData={marketData}
                        />
                      </div>
                      <div className="mt-auto flex items-center gap-2 pt-1">
                        <span className="text-sm font-semibold text-slate-300">
                          {article.source_id}
                        </span>
                        <span className="text-slate-500 text-xs">&bull;</span>
                        <span className="text-sm font-normal text-slate-500">
                          {article.pubDate}
                        </span>
                      </div>
                    </div>

                    <NewsImage
                      src={article.image_url}
                      alt={article.title}
                      className="h-24 w-32 rounded-lg shrink-0 object-cover sm:h-28 sm:w-40"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="border-t border-[#1E293B]" />
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <h2 className="mb-6 text-xl font-bold text-foreground">All News</h2>

        {visibleArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                marketData={marketData}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No more news articles are available right now.
          </p>
        )}

        {loadMoreError ? (
          <p className="mt-4 text-center text-xs text-red-400">{loadMoreError}</p>
        ) : null}

        {visibleCount < 24 && nextPageToken && !isLoadingMore ? (
          <div className="flex justify-center text-center w-full mt-8">
            <button
              type="button"
              onClick={handleLoadMore}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#222E42] border border-white/20 px-6 py-2.5 text-sm font-bold text-[#00E5FF] hover:bg-[#2A374D] transition-colors"
            >
              See more news <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        {isLoadingMore ? (
          <div className="flex justify-center text-center w-full mt-8">
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#222E42] border border-white/20 px-6 py-2.5 text-sm font-bold text-[#00E5FF] opacity-70 cursor-not-allowed"
            >
              Loading more news...
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
