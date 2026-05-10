import { unstable_cache } from "next/cache";

const REVALIDATE_SECONDS = 60;

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const ALTERNATIVE_API_BASE = "https://api.alternative.me";

type CachedFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

interface FetchJsonResult<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

interface CoinGeckoGlobalResponse {
  data?: {
    active_cryptocurrencies?: number | null;
    markets?: number | null;
    total_market_cap?: {
      usd?: number | null;
    } | null;
    market_cap_change_percentage_24h_usd?: number | null;
    total_volume?: {
      usd?: number | null;
    } | null;
    market_cap_percentage?: {
      btc?: number | null;
      eth?: number | null;
    } | null;
  } | null;
}

interface AlternativeFearAndGreedResponse {
  data?: Array<{
    value?: string | null;
    value_classification?: string | null;
  }>;
}

interface CoinGeckoTrendingResponse {
  coins?: Array<{
    item?: {
      id?: string;
      name?: string;
      symbol?: string;
      small?: string;
      large?: string;
      data?: {
        price?: number | null;
        price_change_percentage_24h?:
          | {
              usd?: number | null;
            }
          | null;
      } | null;
    } | null;
  }>;
}

interface CoinGeckoSearchResponse {
  coins?: Array<{
    id?: string;
    name?: string;
    symbol?: string;
    thumb?: string | null;
    large?: string | null;
  }>;
}

interface CoinGeckoCoinDetailResponse {
  id?: string;
  symbol?: string;
  name?: string;
  market_cap_rank?: number | null;
  platforms?: Record<string, string> | null;
  image?: {
    large?: string | null;
  } | null;
  description?: {
    en?: string | null;
  } | null;
  links?: {
    homepage?: Array<string | null> | null;
    blockchain_site?: Array<string | null> | null;
    twitter_screen_name?: string | null;
    whitepaper?: string | null;
  } | null;
  tickers?: Array<{
    base?: string | null;
    target?: string | null;
    market?: {
      identifier?: string | null;
    } | null;
  }> | null;
  market_data?: {
    current_price?: {
      usd?: number | null;
    } | null;
    price_change_percentage_24h?: number | null;
    market_cap?: {
      usd?: number | null;
    } | null;
    market_cap_change_percentage_24h?: number | null;
    total_volume?: {
      usd?: number | null;
    } | null;
    fully_diluted_valuation?: {
      usd?: number | null;
    } | null;
    total_supply?: number | null;
    max_supply?: number | null;
    circulating_supply?: number | null;
    low_24h?: {
      usd?: number | null;
    } | null;
    high_24h?: {
      usd?: number | null;
    } | null;
    ath?: {
      usd?: number | null;
    } | null;
    ath_change_percentage?: {
      usd?: number | null;
    } | null;
    ath_date?: {
      usd?: string | null;
    } | null;
    atl?: {
      usd?: number | null;
    } | null;
    atl_change_percentage?: {
      usd?: number | null;
    } | null;
    atl_date?: {
      usd?: string | null;
    } | null;
    sparkline_in_7d?: { price: number[] } | null;
  } | null;
}

interface CoinGeckoMarketCoin {
  id?: string;
  symbol?: string;
  name?: string;
  image?: string | null;
  current_price?: number | null;
  market_cap_rank?: number | null;
  total_volume?: number | null;
  market_cap?: number | null;
  price_change_percentage_24h?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_7d?: number | null;
  ["percent_7-day_price_change_in_currency"]?: number | null;
  sparkline_in_7d?: { price: number[] };
}

export interface GlobalMarketData {
  activeCryptocurrencies: number | null;
  markets: number | null;
  totalMarketCapUsd: number | null;
  marketCapChangePercentage24h: number | null;
  totalVolumeUsd: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  btcSparkline?: number[] | null;
}

export interface FearAndGreedData {
  value: number | null;
  label: string;
  apiClassification: string | null;
}

export interface HighlightCoin {
  id: string;
  name: string | null;
  symbol: string | null;
  image: string | null;
  price: number | null;
  change24h: number | null;
  sparkline?: number[] | null;
}

export interface SearchCoinResult {
  id: string;
  name: string | null;
  symbol: string | null;
  image: string | null;
}

export interface CoinMarketRow {
  id: string;
  rank: number | null;
  name: string | null;
  symbol: string | null;
  image?: string | null;
  price: number | null;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  marketCap: number | null;
  volume24h: number | null;
  color?: string | null;
  sparkline?: number[] | null;
}

export interface MarketTableSnapshot {
  marketData: CoinMarketRow[];
  lastUpdated: string | null;
}

export interface HighlightsSnapshot {
  globalData: GlobalMarketData;
  fearAndGreed: FearAndGreedData;
  trendingCoins: HighlightCoin[];
  topGainers: HighlightCoin[];
  lastUpdated: string | null;
}

export interface DiscoverSnapshot {
  trendingCoins: HighlightCoin[];
  topGainers: HighlightCoin[];
  lastUpdated: string | null;
}

export interface WatchlistSnapshot {
  isAuthenticated: boolean;
  coinIds: string[];
  coins: CoinMarketRow[];
  lastUpdated: string | null;
}

export interface CoinDetailData {
  id: string;
  name: string | null;
  symbol: string | null;
  marketCapRank: number | null;
  image: string | null;
  description: string | null;
  tradingViewSymbol: string | null;
  platforms: Record<string, string> | null;
  links: {
    website: string | null;
    explorer: string | null;
    twitter: string | null;
    whitepaper: string | null;
  };
  marketData: {
    currentPriceUsd: number | null;
    priceChangePercentage24h: number | null;
    marketCapUsd: number | null;
    marketCapChangePercentage24h: number | null;
    totalVolumeUsd: number | null;
    fullyDilutedValuationUsd: number | null;
    totalSupply: number | null;
    maxSupply: number | null;
    circulatingSupply: number | null;
    low24hUsd: number | null;
    high24hUsd: number | null;
    athUsd: number | null;
    athChangePercentageUsd: number | null;
    athDateUsd: string | null;
    atlUsd: number | null;
    atlChangePercentageUsd: number | null;
    atlDateUsd: string | null;
    sparkline: number[] | null;
  };
}

export interface CoinDetailSnapshot {
  coin: CoinDetailData;
  lastUpdated: string | null;
}

interface CoinDetailResult {
  coin: CoinDetailData | null;
  lastUpdated: string | null;
  ok: boolean;
  error: string | null;
  status: number | null;
}

interface MarketTableResult extends MarketTableSnapshot {
  ok: boolean;
  error: string | null;
}

const emptyGlobalData: GlobalMarketData = {
  activeCryptocurrencies: null,
  markets: null,
  totalMarketCapUsd: null,
  marketCapChangePercentage24h: null,
  totalVolumeUsd: null,
  btcDominance: null,
  ethDominance: null,
  btcSparkline: null,
};

const emptyFearAndGreed: FearAndGreedData = {
  value: null,
  label: "-",
  apiClassification: null,
};

const SUPPORTED_TRADING_VIEW_EXCHANGES = new Set([
  "BINANCE",
  "MEXC",
  "BYBIT",
  "OKX",
  "KUCOIN",
  "COINBASE",
  "KRAKEN",
]);

function getCoinGeckoHeaders(): HeadersInit {
  const demoApiKey =
    process.env.COINGECKO_DEMO_API_KEY ??
    process.env.COINGECKO_API_KEY ??
    null;

  if (!demoApiKey) {
    return {
      accept: "application/json",
    };
  }

  return {
    accept: "application/json",
    "x-cg-demo-api-key": demoApiKey,
  };
}

async function fetchJson<T>(
  url: string,
  init: CachedFetchInit = {}
): Promise<FetchJsonResult<T>> {
  try {
    const { headers, next, cache, ...requestInit } = init;
    const response = await fetch(url, {
      ...requestInit,
      cache,
      headers: {
        accept: "application/json",
        ...(headers ?? {}),
      },
      ...(cache === "no-store"
        ? {}
        : {
            next: {
              revalidate: REVALIDATE_SECONDS,
              ...(next ?? {}),
            },
          }),
    });

    if (!response.ok) {
      const error = `Request failed with status ${response.status}`;
      console.error(`Failed to fetch ${url}: ${error}`);
      return {
        data: null,
        error,
        status: response.status,
      };
    }

    return {
      data: (await response.json()) as T,
      error: null,
      status: response.status,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown fetch error";
    console.error(`Failed to fetch ${url}:`, error);
    return {
      data: null,
      error: message,
      status: null,
    };
  }
}

function toNumber(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toNonEmptyString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const EXCHANGE_TV_CODES: Record<string, string> = {
  "gdax": "COINBASE",
  "binance": "BINANCE",
  "mexc": "MEXC",
  "bybit_spot": "BYBIT",
  "okex": "OKX",
  "kucoin": "KUCOIN",
  "kraken": "KRAKEN",
  "bitfinex": "BITFINEX",
  "bittrex": "BITTREX",
  "upbit": "UPBIT",
  "huobi": "HUOBI",
  "gate": "GATEIO",
  "deribit": "DERIBIT"
};

function getTradingViewSymbolFromTickers(
  tickers: CoinGeckoCoinDetailResponse["tickers"],
  coinSymbol?: string | null
): string | null {
  const safeTickers = tickers ?? [];
  if (safeTickers.length === 0) {
    return coinSymbol ? `CRYPTO:${coinSymbol.toUpperCase()}USD` : null;
  }

  // 1. Get the very first ticker from data.tickers
  const firstTicker = safeTickers[0];

  // 2. Extract marketId, base, and target
  const marketId = firstTicker.market?.identifier?.toLowerCase() || null;
  const base = firstTicker.base?.toUpperCase() || coinSymbol?.toUpperCase() || null;
  let target = firstTicker.target?.toUpperCase() || "USD";

  if (!base) {
    return null;
  }

  // 5. Handle Fallbacks: Use USDT or USD pairs if USDC is requested
  if (target === "USDC") {
    target = "USDT";
  }

  // 3. Construct the Exchange Prefix
  let exchangePrefix = "CRYPTO";
  if (marketId) {
    if (EXCHANGE_TV_CODES[marketId]) {
      exchangePrefix = EXCHANGE_TV_CODES[marketId];
    } else {
      exchangePrefix = marketId.toUpperCase();
    }
  }

  // 4. Construct the TradingView symbol string
  return `${exchangePrefix}:${base}${target}`;
}

export function getFearAndGreedLabel(value: number | null): string {
  if (value === null) {
    return "-";
  }

  if (value <= 24) {
    return "Extreme Fear";
  }

  if (value <= 44) {
    return "Fear";
  }

  if (value <= 54) {
    return "Neutral";
  }

  if (value <= 74) {
    return "Greed";
  }

  return "Extreme Greed";
}

export function formatLastUpdatedTime(value: Date = new Date()): string {
  return value.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function mapMarketCoin(coin: CoinGeckoMarketCoin): CoinMarketRow | null {
  if (!coin.id) {
    return null;
  }

  return {
    id: coin.id,
    rank: toNumber(coin.market_cap_rank),
    name: coin.name ?? null,
    symbol: coin.symbol ? coin.symbol.toUpperCase() : null,
    image: coin.image ?? null,
    price: toNumber(coin.current_price),
    change1h: toNumber(coin.price_change_percentage_1h_in_currency),
    change24h: toNumber(
      coin.price_change_percentage_24h_in_currency ??
        coin.price_change_percentage_24h
    ),
    change7d: toNumber(
      coin.price_change_percentage_7d_in_currency ??
        coin.price_change_percentage_7d ??
        coin["percent_7-day_price_change_in_currency"]
    ),
    marketCap: toNumber(coin.market_cap),
    volume24h: toNumber(coin.total_volume),
    color: null,
    sparkline: coin.sparkline_in_7d?.price ?? null,
  };
}

export async function getGlobalData(
  init: CachedFetchInit = {}
): Promise<GlobalMarketData> {
  const { data } = await fetchJson<CoinGeckoGlobalResponse>(
    `${COINGECKO_API_BASE}/global`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  const payload = data?.data;

  let btcSparkline = null;
  try {
    const { data: btcData } = await fetchJson<CoinGeckoMarketCoin[]>(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=bitcoin&sparkline=true`,
      {
        ...init,
        headers: getCoinGeckoHeaders(),
      }
    );
    btcSparkline = btcData?.[0]?.sparkline_in_7d?.price ?? null;
  } catch (e) {
    // Ignore error, fallback to null
  }

  if (!payload) {
    return emptyGlobalData;
  }

  return {
    activeCryptocurrencies: toNumber(payload.active_cryptocurrencies),
    markets: toNumber(payload.markets),
    totalMarketCapUsd: toNumber(payload.total_market_cap?.usd),
    marketCapChangePercentage24h: toNumber(
      payload.market_cap_change_percentage_24h_usd
    ),
    totalVolumeUsd: toNumber(payload.total_volume?.usd),
    btcDominance: toNumber(payload.market_cap_percentage?.btc),
    ethDominance: toNumber(payload.market_cap_percentage?.eth),
    btcSparkline,
  };
}

export async function getFearAndGreed(
  init: CachedFetchInit = {}
): Promise<FearAndGreedData> {
  const { data } = await fetchJson<AlternativeFearAndGreedResponse>(
    `${ALTERNATIVE_API_BASE}/fng/`,
    init
  );

  const latest = data?.data?.[0];
  const value = toNumber(latest?.value);

  if (!latest) {
    return emptyFearAndGreed;
  }

  return {
    value,
    label: getFearAndGreedLabel(value),
    apiClassification: latest.value_classification ?? null,
  };
}

export async function getTrending(
  limit = 10,
  init: CachedFetchInit = {}
): Promise<HighlightCoin[]> {
  const { data } = await fetchJson<CoinGeckoTrendingResponse>(
    `${COINGECKO_API_BASE}/search/trending`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  const coinIds = (data?.coins ?? [])
    .map((entry) => entry.item?.id)
    .filter((id): id is string => !!id);

  if (coinIds.length === 0) {
    return [];
  }

  // Fetch detailed market data including sparklines for these trending coins
  const marketDataResult = await getMarketTableDataByIds(coinIds, init);

  return marketDataResult.marketData
    .slice(0, limit)
    .map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image ?? null,
      price: coin.price,
      change24h: coin.change24h,
      sparkline: coin.sparkline,
    }));
}

export async function getCoinDetail(
  id: string
): Promise<CoinDetailData | null> {
  const { coin } = await getCoinDetailResult(id);
  return coin;
}

export async function getCoinDetailResult(
  id: string,
  init: CachedFetchInit = {}
): Promise<CoinDetailResult> {
  const query = new URLSearchParams({
    localization: "false",
    tickers: "true",
    market_data: "true",
    community_data: "false",
    developer_data: "false",
    sparkline: "true",
  });

  const { data, status, error } = await fetchJson<CoinGeckoCoinDetailResponse>(
    `${COINGECKO_API_BASE}/coins/${encodeURIComponent(id)}?${query.toString()}`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  if (status === 404 || !data?.id) {
    return {
      coin: null,
      lastUpdated: null,
      ok: false,
      error: error ?? (status === 404 ? "Coin not found." : "Unable to load coin data."),
      status,
    };
  }

  return {
    coin: {
    id: data.id,
    name: data.name ?? null,
    symbol: data.symbol ? data.symbol.toUpperCase() : null,
    marketCapRank: toNumber(data.market_cap_rank),
    image: toNonEmptyString(data.image?.large),
    description: toNonEmptyString(data.description?.en),
    tradingViewSymbol: getTradingViewSymbolFromTickers(data.tickers, data.symbol),
    platforms: data.platforms && Object.keys(data.platforms).length > 0
      ? Object.fromEntries(
          Object.entries(data.platforms).filter(([, v]) => v && v.trim().length > 0)
        )
      : null,
    links: {
      website: toNonEmptyString(data.links?.homepage?.[0]),
      explorer: toNonEmptyString(data.links?.blockchain_site?.[0]),
      twitter: data.links?.twitter_screen_name
        ? `https://twitter.com/${data.links.twitter_screen_name}`
        : null,
      whitepaper: toNonEmptyString(data.links?.whitepaper),
    },
    marketData: {
      currentPriceUsd: toNumber(data.market_data?.current_price?.usd),
      priceChangePercentage24h: toNumber(
        data.market_data?.price_change_percentage_24h
      ),
      marketCapUsd: toNumber(data.market_data?.market_cap?.usd),
      marketCapChangePercentage24h: toNumber(
        data.market_data?.market_cap_change_percentage_24h
      ),
      totalVolumeUsd: toNumber(data.market_data?.total_volume?.usd),
      fullyDilutedValuationUsd: toNumber(
        data.market_data?.fully_diluted_valuation?.usd
      ),
      totalSupply: toNumber(data.market_data?.total_supply),
      maxSupply: toNumber(data.market_data?.max_supply),
      circulatingSupply: toNumber(data.market_data?.circulating_supply),
      low24hUsd: toNumber(data.market_data?.low_24h?.usd),
      high24hUsd: toNumber(data.market_data?.high_24h?.usd),
      athUsd: toNumber(data.market_data?.ath?.usd),
      athChangePercentageUsd: toNumber(
        data.market_data?.ath_change_percentage?.usd
      ),
      athDateUsd: toNonEmptyString(data.market_data?.ath_date?.usd),
      atlUsd: toNumber(data.market_data?.atl?.usd),
      atlChangePercentageUsd: toNumber(
        data.market_data?.atl_change_percentage?.usd
      ),
      atlDateUsd: toNonEmptyString(data.market_data?.atl_date?.usd),
      sparkline: data.market_data?.sparkline_in_7d?.price ?? null,
    },
    },
    lastUpdated: formatLastUpdatedTime(),
    ok: true,
    error: null,
    status,
  };
}

export async function getMarketTableData(
  page = 1,
  init: CachedFetchInit = {}
): Promise<MarketTableResult> {
  const query = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: "100",
    page: page.toString(),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  });

  const { data, error } = await fetchJson<CoinGeckoMarketCoin[]>(
    `${COINGECKO_API_BASE}/coins/markets?${query.toString()}`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  return {
    marketData: (data ?? [])
      .map(mapMarketCoin)
      .filter((coin): coin is CoinMarketRow => coin !== null),
    lastUpdated: error ? null : formatLastUpdatedTime(),
    ok: error === null,
    error,
  };
}

export async function getMarketTableDataByIds(
  coinIds: string[],
  init: CachedFetchInit = {}
): Promise<MarketTableResult> {
  const normalizedCoinIds = Array.from(
    new Set(
      coinIds
        .map((coinId) => coinId.trim())
        .filter((coinId) => coinId.length > 0)
    )
  );

  if (normalizedCoinIds.length === 0) {
    return {
      marketData: [],
      lastUpdated: null,
      ok: true,
      error: null,
    };
  }

  const query = new URLSearchParams({
    vs_currency: "usd",
    ids: normalizedCoinIds.join(","),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  });

  const { data, error } = await fetchJson<CoinGeckoMarketCoin[]>(
    `${COINGECKO_API_BASE}/coins/markets?${query.toString()}`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  const coinsById = new Map(
    (data ?? [])
      .map(mapMarketCoin)
      .filter((coin): coin is CoinMarketRow => coin !== null)
      .map((coin) => [coin.id, coin] as const)
  );

  return {
    marketData: normalizedCoinIds
      .map((coinId) => coinsById.get(coinId) ?? null)
      .filter((coin): coin is CoinMarketRow => coin !== null),
    lastUpdated: error ? null : formatLastUpdatedTime(),
    ok: error === null,
    error,
  };
}

export async function getMarketData(page = 1): Promise<CoinMarketRow[]> {
  const { marketData } = await getMarketTableData(page);
  return marketData;
}

export async function getTopGainers(
  limit = 10,
  init: CachedFetchInit = {}
): Promise<HighlightCoin[]> {
  const query = new URLSearchParams({
    vs_currency: "usd",
    order: "volume_desc",
    per_page: "100",
    page: "1",
    sparkline: "false",
    price_change_percentage: "24h",
  });

  const { data } = await fetchJson<CoinGeckoMarketCoin[]>(
    `${COINGECKO_API_BASE}/coins/markets?${query.toString()}`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  return (data ?? [])
    .map(mapMarketCoin)
    .filter((coin): coin is CoinMarketRow => coin !== null)
    .sort((left, right) => {
      const leftValue = left.change24h ?? Number.NEGATIVE_INFINITY;
      const rightValue = right.change24h ?? Number.NEGATIVE_INFINITY;

      return rightValue - leftValue;
    })
    .slice(0, limit)
    .map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image ?? null,
      price: coin.price,
      change24h: coin.change24h,
    }));
}

export async function getHighlightsSnapshot(
  init: CachedFetchInit = {}
): Promise<HighlightsSnapshot> {
  const [globalData, fearAndGreed, trendingCoins, topGainers] =
    await Promise.all([
      getGlobalData(init),
      getFearAndGreed(init),
      getTrending(10, init),
      getTopGainers(10, init),
    ]);

  const hasData =
    globalData.totalMarketCapUsd !== null ||
    fearAndGreed.value !== null ||
    trendingCoins.length > 0 ||
    topGainers.length > 0;

  return {
    globalData,
    fearAndGreed,
    trendingCoins,
    topGainers,
    lastUpdated: hasData ? formatLastUpdatedTime() : null,
  };
}

export async function getDiscoverSnapshot(
  init: CachedFetchInit = {}
): Promise<DiscoverSnapshot> {
  const [trendingCoins, topGainers] = await Promise.all([
    getTrending(10, init),
    getTopGainers(10, init),
  ]);

  const hasData = trendingCoins.length > 0 || topGainers.length > 0;

  return {
    trendingCoins,
    topGainers,
    lastUpdated: hasData ? formatLastUpdatedTime() : null,
  };
}

export async function getCoinSearchResults(
  query: string,
  limit = 20,
  init: CachedFetchInit = {}
): Promise<SearchCoinResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const encodedQuery = new URLSearchParams({
    query: normalizedQuery,
  });

  const { data } = await fetchJson<CoinGeckoSearchResponse>(
    `${COINGECKO_API_BASE}/search?${encodedQuery.toString()}`,
    {
      ...init,
      headers: getCoinGeckoHeaders(),
    }
  );

  return (data?.coins ?? [])
    .map((coin) => {
      if (!coin.id) {
        return null;
      }

      return {
        id: coin.id,
        name: coin.name ?? null,
        symbol: coin.symbol ? coin.symbol.toUpperCase() : null,
        image: coin.thumb ?? coin.large ?? null,
      } satisfies SearchCoinResult;
    })
    .filter((coin): coin is SearchCoinResult => coin !== null)
    .slice(0, limit);
}

export async function getWatchlistSnapshot(
  coinIds: string[],
  init: CachedFetchInit = {}
): Promise<WatchlistSnapshot & { ok: boolean; error: string | null }> {
  const marketTable = await getMarketTableDataByIds(coinIds, init);

  return {
    isAuthenticated: true,
    coinIds,
    coins: marketTable.marketData,
    lastUpdated: marketTable.lastUpdated,
    ok: marketTable.ok,
    error: marketTable.error,
  };
}

export function formatUsdPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const decimals = absoluteValue < 0.0001 ? 8 : absoluteValue < 0.01 ? 6 : 4;

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUsdWholeNumber(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatCompactUsd(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export function formatPercent(
  value: number | null | undefined,
  digits = 1
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function getPercentageColorClass(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "text-muted-foreground";
  }

  return value >= 0 ? "text-green-400" : "text-red-400";
}

export const getHomeMarketData = unstable_cache(
  async (page: number = 1) => {
    const [highlightsSnapshot, marketTable] =
      await Promise.all([
        getHighlightsSnapshot(),
        getMarketTableData(page),
      ]);

    return {
      globalData: highlightsSnapshot.globalData,
      fearAndGreed: highlightsSnapshot.fearAndGreed,
      trendingCoins: highlightsSnapshot.trendingCoins,
      topGainers: highlightsSnapshot.topGainers,
      highlightsLastUpdated: highlightsSnapshot.lastUpdated,
      marketData: marketTable.marketData,
      lastUpdated: marketTable.lastUpdated,
    };
  },
  ["home-market-data"],
  { revalidate: REVALIDATE_SECONDS }
);
