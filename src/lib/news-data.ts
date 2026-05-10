import { getBaseUrl } from "@/lib/utils";

const NEWS_DATA_API_BASE = "https://newsdata.io/api/1/crypto";

const NEWS_QUERY = "crypto";
const NEWS_REVALIDATE_SECONDS = 300;

export const NEWS_PLACEHOLDER_SRC = "/news-placeholder.svg";
export const NEWS_PAGE_SIZE = 10;
export const SHARED_NEWS_ARTICLE_COUNT = 8;

export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  link: string;
  image_url: string;
  source_id: string;
  pubDate: string;
  published_at: string | null;
  coinSymbols: string[];
}

export interface NewsPageResult {
  articles: NewsArticle[];
  nextPage: string | null;
  status: number | null;
}

export interface NewsDataItem {
  article_id?: string | null;
  title?: string | null;
  description?: string | null;
  link?: string | null;
  image_url?: string | null;
  source_id?: string | null;
  pubDate?: string | null;
  coin?: string[] | string | null;
}

interface NewsDataResponse {
  results?: NewsDataItem[] | null;
  nextPage?: string | null;
}

type NewsFetchMode = "cached" | "no-store";

function toNonEmptyString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeCoinSymbols(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((symbol) => toNonEmptyString(symbol)?.toUpperCase() ?? null)
          .filter((symbol): symbol is string => symbol !== null)
      )
    );
  }

  const rawValue = toNonEmptyString(value);

  if (!rawValue) {
    return [];
  }

  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((symbol) => toNonEmptyString(symbol)?.toUpperCase() ?? null)
        .filter((symbol): symbol is string => symbol !== null)
    )
  );
}

function formatSourceName(value: string | null | undefined): string {
  const source = toNonEmptyString(value);

  if (!source) {
    return "NewsData";
  }

  return source
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRelativeTime(value: string | null | undefined): string {
  const publishedAt = toNonEmptyString(value);

  if (!publishedAt) {
    return "Recently";
  }

  const timestamp = new Date(publishedAt).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Recently";
  }

  const diffInMilliseconds = timestamp - Date.now();
  const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.round(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, "minute");
  }

  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, "hour");
  }

  return formatter.format(diffInDays, "day");
}

export function mapArticle(article: NewsDataItem, index: number): NewsArticle | null {
  const title = toNonEmptyString(article.title);
  const link = toNonEmptyString(article.link);

  if (!title || !link) {
    return null;
  }

  const publishedAt = toNonEmptyString(article.pubDate);

  return {
    id: toNonEmptyString(article.article_id) ?? `${link}-${index}`,
    title,
    description: toNonEmptyString(article.description),
    link,
    image_url: toNonEmptyString(article.image_url) ?? NEWS_PLACEHOLDER_SRC,
    source_id: formatSourceName(article.source_id),
    pubDate: formatRelativeTime(publishedAt),
    published_at: publishedAt,
    coinSymbols: normalizeCoinSymbols(article.coin),
  };
}

export function mergeNewsArticles(
  ...articleGroups: Array<NewsArticle[] | null | undefined>
): NewsArticle[] {
  const dedupedArticles = new Map<string, NewsArticle>();

  for (const group of articleGroups) {
    for (const article of group ?? []) {
      if (!dedupedArticles.has(article.link)) {
        dedupedArticles.set(article.link, article);
      }
    }
  }

  return Array.from(dedupedArticles.values());
}

export async function getCryptoNewsPage({
  pageToken,
  limit = NEWS_PAGE_SIZE,
  fetchMode = "cached",
}: {
  pageToken?: string | null;
  limit?: number;
  fetchMode?: NewsFetchMode;
} = {}): Promise<NewsPageResult> {
  const searchParams = new URLSearchParams();
  if (pageToken) {
    searchParams.set("page", pageToken);
  }
  if (limit) {
    searchParams.set("limit", limit.toString());
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/news?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      ...(fetchMode === "no-store"
        ? {
            cache: "no-store",
          }
        : {
            next: {
              revalidate: NEWS_REVALIDATE_SECONDS,
            },
          }),
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch NewsData crypto articles: ${response.status} ${response.statusText}`
      );

      return {
        articles: [],
        nextPage: null,
        status: response.status,
      };
    }

    const payload = (await response.json()) as NewsDataResponse;
    const mappedArticles = (payload.results ?? [])
      .map((article, index) => mapArticle(article, index))
      .filter((article): article is NewsArticle => article !== null);

    return {
      articles: mergeNewsArticles(mappedArticles).slice(0, limit),
      nextPage: toNonEmptyString(payload.nextPage),
      status: response.status,
    };
  } catch (error) {
    console.error("Failed to fetch NewsData crypto articles:", error);

    return {
      articles: [],
      nextPage: null,
      status: null,
    };
  }
}

export async function getInitialCryptoNewsFeed(): Promise<NewsPageResult> {
  const firstPage = await getCryptoNewsPage();

  if (!firstPage.nextPage) {
    return firstPage;
  }

  const secondPage = await getCryptoNewsPage({
    pageToken: firstPage.nextPage,
  });

  return {
    articles: mergeNewsArticles(firstPage.articles, secondPage.articles),
    nextPage:
      secondPage.status === 200 ? secondPage.nextPage : firstPage.nextPage,
    status: secondPage.status ?? firstPage.status,
  };
}

export async function getSharedCryptoNews(): Promise<NewsArticle[]> {
  const firstPage = await getCryptoNewsPage({
    limit: NEWS_PAGE_SIZE,
  });

  return firstPage.articles.slice(0, SHARED_NEWS_ARTICLE_COUNT);
}
