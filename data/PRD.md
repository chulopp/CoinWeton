# COINWETON — Product Requirements Document (PRD)
### Crypto Market Aggregator · National Web Development Competition
**Version:** 1.0.0  
**Status:** Final Draft  
**Last Updated:** April 2026  
**Document Type:** Source of Truth for AI Vibe Coding

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Schema](#3-database-schema)
4. [API Route Mapping](#4-api-route-mapping)
5. [UI/UX Component Tree](#5-uiux-component-tree)
6. [Sprint Plan & Step-by-Step Implementation](#6-sprint-plan--step-by-step-implementation)

---

## 1. Executive Summary

### 1.1 Product Overview

**COINWETON** is a full-stack, production-grade Crypto Market Aggregator web application. It is designed for submission in a national-level web development competition, emphasizing technical depth, innovative killer features, and professional UX parity with industry leaders such as CoinGecko and CoinMarketCap.

The application aggregates real-time cryptocurrency market data, global crypto news, and on-chain security intelligence into a single, cohesive interface. It introduces two competition-grade killer features: a **Contextual AI Analyst ("Ask AI")** powered by a mini-RAG architecture, and an **Automated Smart Contract Security Badge** via the GoPlus Security API — both of which are absent from most competing student projects.

### 1.2 Core Value Propositions

| Pillar | Value |
|---|---|
| **Data Aggregation** | Real-time prices, market cap, volume, and fundamentals sourced from CoinGecko API |
| **News Intelligence** | Global and coin-specific crypto news aggregated from CryptoPanic API |
| **AI Analysis** | Context-aware AI analyst that answers questions grounded in live coin data (no hallucination) |
| **Web3 Security** | Automated EVM smart contract audit displayed as a visual risk badge via GoPlus API |
| **User Personalization** | Authenticated watchlist system backed by Supabase + Drizzle ORM |

### 1.3 Target Users

- Retail crypto investors seeking a unified dashboard
- Competition judges evaluating technical complexity and UI/UX polish
- Developers and researchers needing quick fundamental + security data

### 1.4 Competition Differentiators

1. **Killer Feature Depth**: The Ask AI + Security Badge combination demonstrates mastery of AI SDK integration and Web3 security concepts — areas rarely seen in student submissions.
2. **Architecture Discipline**: ISR caching prevents API rate-limiting and ensures instant page loads during judge evaluation.
3. **Anti-Lag Deployment Strategy**: Co-located Vercel + Supabase in `ap-southeast-1` (Singapore) minimizes latency for Indonesian judges.
4. **Design Fidelity**: Soft Dark Mode with Inter font and `tabular-nums` utility produces a professional, readable financial UI.

---

## 2. Tech Stack & Architecture

### 2.1 Full Technology Matrix

| Category | Technology | Version / Notes |
|---|---|---|
| **Framework** | Next.js | 14 or 15, App Router, React Server Components (RSC) |
| **Language** | TypeScript | Strict mode (`"strict": true` in `tsconfig.json`) |
| **Styling** | Tailwind CSS | v3+, JIT mode |
| **Component Library** | Shadcn UI | Latest; installed via CLI per-component |
| **Icon Library** | Lucide React | Consistent icon system |
| **Font** | Inter (Google Fonts) | Imported via `next/font/google` |
| **Database** | PostgreSQL via Supabase | Region: `ap-southeast-1` (Singapore) |
| **ORM** | Drizzle ORM | `drizzle-orm` + `drizzle-kit` |
| **Auth** | Supabase Auth | Email/Password + OAuth (optional) |
| **AI SDK** | Vercel AI SDK | `ai` + `@ai-sdk/groq` or `@ai-sdk/google` |
| **LLM Provider** | Groq (primary) / Gemini (fallback) | Fast inference for streaming responses |
| **Chart Library** | TradingView Lightweight Charts | `lightweight-charts` npm package |
| **Data Fetching** | Native `fetch` with Next.js ISR | `next: { revalidate: N }` cache options |
| **State Management** | Zustand (lightweight) + React `useOptimistic` | Only for Watchlist UI state |
| **Deployment** | Vercel | Frontend + Serverless API Routes |
| **CI/CD** | GitHub Actions (optional) + Vercel Git Integration | Feature branching strategy |

### 2.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│   Next.js App Router (RSC + Client Components)          │
│   ┌──────────┐  ┌──────────┐  ┌───────────────────┐    │
│   │ Main Page│  │Coin Detail│  │ Watchlist / Auth  │    │
│   └──────────┘  └──────────┘  └───────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / Streaming
┌────────────────────────▼────────────────────────────────┐
│              NEXT.JS SERVER (Vercel Edge/Node)          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           API Route Handlers (/api/*)            │  │
│  │  /api/coins      → CoinGecko (ISR 60s)           │  │
│  │  /api/coin/[id]  → CoinGecko (ISR 120s)          │  │
│  │  /api/news       → CryptoPanic (ISR 300s)        │  │
│  │  /api/chat       → Vercel AI SDK (Streaming)     │  │
│  │  /api/security   → GoPlus Security API           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────┐   ┌──────────────────────────┐   │
│  │  Drizzle ORM     │   │  Supabase Auth Client    │   │
│  └────────┬─────────┘   └─────────────┬────────────┘   │
└───────────┼─────────────────────────── ┼ ───────────────┘
            │                            │
┌───────────▼────────────────────────────▼───────────────┐
│              SUPABASE (ap-southeast-1)                  │
│   PostgreSQL: users, watchlists tables                  │
└─────────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────┐
│                EXTERNAL APIs                              │
│  CoinGecko (Free)  │  CryptoPanic (Free)  │  GoPlus(Free)│
└───────────────────────────────────────────────────────────┘
```

### 2.3 Caching Strategy (ISR)

ISR is the **primary defense** against API rate limits and the **primary driver** of fast page loads for judges.

| Route | Revalidation Interval | Rationale |
|---|---|---|
| `/api/coins` (list) | 60 seconds | Price data is near-real-time but not tick-by-tick |
| `/api/coin/[id]` (detail) | 120 seconds | Fundamental data changes rarely |
| `/api/news` (global) | 300 seconds | News cycle is slow relative to price |
| `/api/news/[coinId]` | 300 seconds | Same rationale |
| `/api/security/[address]` | 3600 seconds | Contract audit results are static |

### 2.4 Rendering Strategy per Page

| Page | Strategy | Reason |
|---|---|---|
| `/` (Main) | ISR (RSC) | Market table benefits from cached server render |
| `/coin/[id]` | ISR (RSC) | Static shell, dynamic chart hydrated client-side |
| `/watchlist` | CSR (Client Component) | Personalized; cannot be statically cached |
| `/api/*` | Serverless Functions | Thin proxy layer with ISR headers |

### 2.5 Design System Tokens

```typescript
// tailwind.config.ts — extend section
theme: {
  extend: {
    colors: {
      background: '#111827',       // bg-gray-900 (Soft Dark base)
      surface:    '#1e293b',       // bg-slate-800 (Card/Panel)
      border:     '#334155',       // border-slate-700
      textPrimary:'#f1f5f9',       // text-slate-100
      textMuted:  '#94a3b8',       // text-slate-400
      accent:     '#3b82f6',       // blue-500 (CTA, links)
      positive:   '#22c55e',       // green-500 (price up)
      negative:   '#ef4444',       // red-500 (price down)
      warning:    '#f59e0b',       // amber-500 (caution badge)
    },
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  }
}
```

**Global Rule:** Any element displaying a price, percentage, or numeric value **must** include the `tabular-nums` Tailwind utility class to prevent layout shift from number changes.

---

## 3. Database Schema

### 3.1 Design Philosophy

The database schema is intentionally **ultra-minimalist**. COINWETON is a **read-heavy aggregator** — all market data is fetched live from external APIs and never persisted locally. The database's sole responsibility is **user identity** and **watchlist relationships**.

This minimalism has a direct competition benefit: the Supabase Free Tier remains well within resource limits, and there is zero risk of the database entering **Auto-Pause** mode during the judge evaluation window (May 3–14, 2026).

### 3.2 Drizzle ORM Schema (`schema.ts`)

```typescript
// src/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────────────────────
// TABLE: users
// Mirrors Supabase Auth's auth.users table.
// We keep a public-facing shadow for FK references.
// ─────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  // This UUID must match auth.users.id from Supabase Auth.
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─────────────────────────────────────────────
// TABLE: watchlists
// Stores user <-> coin relationships only.
// coin_id is the CoinGecko slug (e.g., 'bitcoin', 'pepe').
// ─────────────────────────────────────────────
export const watchlists = pgTable(
  'watchlists',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    coinId: text('coin_id').notNull(),
    // CoinGecko slug, e.g. 'bitcoin', 'ethereum', 'pepe'
    addedAt: timestamp('added_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Composite unique constraint: a user can only watch a coin once
    uniqueUserCoin: primaryKey({ columns: [table.userId, table.coinId] }),
    // Index on userId for fast watchlist lookups
    userIdIndex: index('watchlists_user_id_idx').on(table.userId),
  })
);

// ─────────────────────────────────────────────
// RELATIONS (for Drizzle query builder)
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  watchlists: many(watchlists),
}));

export const watchlistsRelations = relations(watchlists, ({ one }) => ({
  user: one(users, {
    fields: [watchlists.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// TYPE EXPORTS (for use in Server Actions / API Routes)
// ─────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Watchlist = typeof watchlists.$inferSelect;
export type NewWatchlist = typeof watchlists.$inferInsert;
```

### 3.3 Drizzle Config (`drizzle.config.ts`)

```typescript
// drizzle.config.ts (root of project)
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
    // DATABASE_URL = Supabase connection string (pooled via pgBouncer)
  },
} satisfies Config;
```

### 3.4 Row-Level Security (RLS) Policies

The following SQL policies must be applied in the Supabase dashboard SQL editor after running migrations:

```sql
-- Enable RLS on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- users: A user can only read/update their own row
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- watchlists: A user can only CRUD their own watchlist entries
CREATE POLICY "Users manage their own watchlist"
  ON public.watchlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3.5 Database Connection (`src/db/index.ts`)

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Use a single shared client in development to prevent
// connection pool exhaustion due to Next.js hot-reload.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
```

---

## 4. API Route Mapping

### 4.1 External API Specifications

#### A. CoinGecko API (Free Tier)

Base URL: `https://api.coingecko.com/api/v3`  
Rate Limit: ~30 calls/minute (Free), ~10–50 calls/minute (varies)  
Auth: Optional `x-cg-demo-api-key` header for Demo API key

| Purpose | Endpoint | Key Params | ISR TTL |
|---|---|---|---|
| Global market metrics | `GET /global` | — | 60s |
| Coin list with prices | `GET /coins/markets` | `vs_currency=usd&order=market_cap_desc&per_page=20&page={n}&sparkline=true` | 60s |
| Trending coins | `GET /search/trending` | — | 300s |
| Coin detail (fundamentals) | `GET /coins/{id}` | `localization=false&tickers=false&community_data=false` | 120s |
| Price chart (OHLCV) | `GET /coins/{id}/ohlc` | `vs_currency=usd&days={days}` | 120s |
| Historical chart line | `GET /coins/{id}/market_chart` | `vs_currency=usd&days={days}&interval=daily` | 120s |
| Top gainers (workaround) | `GET /coins/markets` | `order=price_change_percentage_24h_desc&per_page=5` | 120s |

#### B. CryptoPanic API (Free Tier)

Base URL: `https://cryptopanic.com/api/v1`  
Auth: `auth_token` query parameter (required, free registration)

| Purpose | Endpoint | Key Params | ISR TTL |
|---|---|---|---|
| Global crypto news | `GET /posts/` | `auth_token={token}&kind=news&public=true` | 300s |
| Coin-specific news | `GET /posts/` | `auth_token={token}&currencies={TICKER}&kind=news` | 300s |

#### C. GoPlus Security API (Free Tier)

Base URL: `https://api.gopluslabs.io/api/v1`  
Auth: None required for basic tier

| Purpose | Endpoint | Key Params | ISR TTL |
|---|---|---|---|
| Token security audit | `GET /token_security/{chainId}` | `contract_addresses={address}` | 3600s |

Supported `chainId` values: `1` (Ethereum), `56` (BSC), `137` (Polygon), `42161` (Arbitrum), `10` (Optimism)

#### D. Vercel AI SDK / LLM Providers

| Provider | Model (Recommended) | SDK Package |
|---|---|---|
| Groq (Primary) | `llama-3.3-70b-versatile` | `@ai-sdk/groq` |
| Google Gemini (Fallback) | `gemini-1.5-flash` | `@ai-sdk/google` |

---

### 4.2 Next.js Internal Route Handlers

All routes live under `src/app/api/`. Each is a thin proxy that adds ISR caching and hides external API keys from the client.

#### `GET /api/global`
```typescript
// src/app/api/global/route.ts
// Fetches /global from CoinGecko
// Returns: { market_cap_usd, total_volume_usd, btc_dominance, market_cap_change_24h }
// Cache: next: { revalidate: 60 }
```

#### `GET /api/coins?page={n}&sort={field}&order={asc|desc}`
```typescript
// src/app/api/coins/route.ts
// Fetches /coins/markets from CoinGecko
// Returns: CoinGecko market array (20 items)
// Cache: next: { revalidate: 60 }
// Query Params: page (default: 1), sortField, sortOrder
```

#### `GET /api/coins/trending`
```typescript
// src/app/api/coins/trending/route.ts
// Fetches /search/trending from CoinGecko
// Returns: trending coin array (top 7)
// Cache: next: { revalidate: 300 }
```

#### `GET /api/coins/gainers`
```typescript
// src/app/api/coins/gainers/route.ts
// Fetches /coins/markets with price_change_percentage_24h_desc
// Returns: top 5 gainers
// Cache: next: { revalidate: 120 }
```

#### `GET /api/coin/[id]`
```typescript
// src/app/api/coin/[id]/route.ts
// Fetches /coins/{id} with all fundamental data
// Returns: full CoinGecko coin detail object
// Cache: next: { revalidate: 120 }
```

#### `GET /api/coin/[id]/chart?days={1|7|30|90|365}&type={line|ohlc}`
```typescript
// src/app/api/coin/[id]/chart/route.ts
// Fetches /coins/{id}/market_chart or /coins/{id}/ohlc
// Returns: { prices: [timestamp, value][] } or OHLCV array
// Cache: next: { revalidate: 120 }
```

#### `GET /api/news?coinId={optional}`
```typescript
// src/app/api/news/route.ts
// Fetches CryptoPanic /posts/
// If coinId is provided, fetches coin-specific news
// Returns: news posts array (max 20)
// Cache: next: { revalidate: 300 }
```

#### `POST /api/chat` (Streaming)
```typescript
// src/app/api/chat/route.ts
// Consumes: { messages: CoreMessage[], coinContext: CoinContextPayload }
// Injects coinContext into system prompt (mini-RAG)
// Streams back: LLM response via Vercel AI SDK streamText()
// NO ISR — this is a live POST endpoint
```

#### `GET /api/security/[address]?chainId={chainId}`
```typescript
// src/app/api/security/[address]/route.ts
// Fetches GoPlus token_security/{chainId}?contract_addresses={address}
// Returns: SecurityAuditResult (processed, not raw GoPlus response)
// Cache: next: { revalidate: 3600 }
```

#### `GET /api/watchlist` (Auth Required)
```typescript
// src/app/api/watchlist/route.ts
// Reads watchlists table for authenticated user via Drizzle
// Returns: { coinIds: string[] }
// NO ISR — personalized data
```

#### `POST /api/watchlist` (Auth Required)
```typescript
// Body: { coinId: string, action: 'add' | 'remove' }
// Mutates watchlists table via Drizzle
// Returns: { success: boolean }
```

---

### 4.3 TypeScript Interface Definitions

```typescript
// src/types/api.ts

// ── CoinGecko ──────────────────────────────────────────────────
export interface CoinMarket {
  id: string;                           // 'bitcoin'
  symbol: string;                       // 'btc'
  name: string;                         // 'Bitcoin'
  image: string;                        // URL
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail extends CoinMarket {
  description: { en: string };
  contract_address?: string;
  asset_platform_id?: string;           // 'ethereum', 'binance-smart-chain'
  platforms?: Record<string, string>;   // platform → contract address
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    fully_diluted_valuation: { usd: number };
    total_volume: { usd: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    atl: { usd: number };
    ath_date: { usd: string };
    atl_date: { usd: string };
    high_24h: { usd: number };
    low_24h: { usd: number };
  };
}

export interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    data: { price_change_percentage_24h: { usd: number } };
  };
}

// ── CryptoPanic ────────────────────────────────────────────────
export interface NewsPost {
  id: number;
  title: string;
  url: string;
  source: { title: string; domain: string };
  published_at: string;
  currencies?: { code: string; title: string }[];
}

// ── GoPlus Security ────────────────────────────────────────────
export interface SecurityAuditResult {
  contractAddress: string;
  chainId: string;
  isHoneypot: boolean;
  isMintable: boolean;
  ownerRenounced: boolean;
  buyTax: number;          // 0–100 percent
  sellTax: number;         // 0–100 percent
  riskLevel: 'safe' | 'caution' | 'danger';
  riskReasons: string[];   // human-readable list of flags
}

// ── Ask AI Chat ────────────────────────────────────────────────
export interface CoinContextPayload {
  coinName: string;
  coinId: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange1h?: number;
  ath: number;
  atl: number;
  circulatingSupply: number;
  totalSupply: number | null;
}
```

---

## 5. UI/UX Component Tree

### 5.1 Global Layout

```
src/app/
├── layout.tsx                    # Root layout
│   ├── <html> (Inter font class)
│   ├── <body> (bg-gray-900 text-slate-100)
│   ├── <Providers>               # Supabase Auth context, Zustand store
│   └── <children />
│
├── page.tsx                      # Main Page (ISR)
├── coin/[id]/page.tsx            # Coin Detail Page (ISR)
├── watchlist/page.tsx            # Watchlist Page (CSR)
└── auth/
    ├── login/page.tsx
    └── callback/route.ts         # Supabase OAuth callback
```

### 5.2 Main Page (`/`) — Component Hierarchy

```
<MainPage>                              # RSC: fetches global metrics + coin list
├── <Navbar>
│   ├── <NavbarTopTier>                 # Scrolling/static global metrics bar
│   │   ├── <GlobalMetricBadge label="Market Cap" value="$2.6T" change="+1.2%" />
│   │   ├── <GlobalMetricBadge label="24h Vol" value="$94B" />
│   │   └── <GlobalMetricBadge label="BTC Dom." value="52.3%" />
│   └── <NavbarBottomTier>
│       ├── <Logo />                    # Left: COINWETON wordmark
│       ├── <div />                     # Center: intentionally empty
│       └── <NavbarActions>             # Right cluster
│           ├── <SearchBar />           # Combobox/Command (Shadcn)
│           ├── <WatchlistIcon />       # Icon button → /watchlist
│           └── <AuthButton />         # "Login" or <UserAvatar>
│
├── <HighlightsSection>                 # 3-column grid
│   ├── <GlobalMarketCapCard>           # Mini sparkline chart (Lightweight Charts)
│   ├── <TrendingCoinsCard>            # Ordered list with 24h% badges
│   └── <TopGainersCard>               # Top 5 movers with badges
│
├── <CoinTableSection>
│   ├── <CoinTable>                     # Client Component (for interactivity)
│   │   ├── <CoinTableHeader>          # Sortable columns (onClick triggers sort)
│   │   │   └── [Star | # | Coin | Price | 1h% | 24h% | Mkt Cap | Volume]
│   │   ├── <CoinTableBody>
│   │   │   └── <CoinTableRow> × 20   # Each row is a link to /coin/[id]
│   │   │       ├── <WatchlistStar coinId={id} />  # Optimistic UI toggle
│   │   │       ├── <CoinRank />
│   │   │       ├── <CoinNameCell />   # Image + Name + Ticker
│   │   │       ├── <PriceCell className="tabular-nums" />
│   │   │       ├── <ChangeCell positive={n>0} className="tabular-nums" />
│   │   │       ├── <ChangeCell positive={n>0} className="tabular-nums" />  # 24h
│   │   │       ├── <MarketCapCell className="tabular-nums" />
│   │   │       └── <VolumeCell className="tabular-nums" />
│   │   └── <CoinTablePagination />    # Prev / Page N / Next
│   └── <TableSortState />             # Zustand or local state
│
├── <GlobalNewsSection>
│   ├── <SectionHeader title="Latest Crypto News" />
│   └── <NewsGrid>                     # 3-column responsive grid
│       └── <NewsCard> × 6–12
│           ├── <NewsSourceBadge />
│           ├── <NewsTitle />
│           └── <NewsTimestamp />
│
└── <Footer>
    ├── <DisclaimerText />              # Competition disclaimer
    └── <GitHubLink />
```

### 5.3 Coin Detail Page (`/coin/[id]`) — Component Hierarchy

```
<CoinDetailPage>                        # RSC: fetches coin detail
├── <Navbar />                          # Reused global navbar
│
├── <CoinDetailLayout>                  # 2-column grid (left 30% | right 70%)
│   │
│   ├── <LeftSidebar>                  # Sticky, scrolls with page
│   │   ├── <CoinHeader>
│   │   │   ├── <CoinImage />
│   │   │   ├── <CoinName />
│   │   │   └── <CoinTicker className="uppercase text-muted" />
│   │   ├── <PriceDisplay className="text-5xl font-bold tabular-nums" />
│   │   ├── <PriceChangeBadge className="tabular-nums" />
│   │   │
│   │   ├── <FundamentalMetrics>
│   │   │   ├── <MetricRow label="Market Cap" />
│   │   │   ├── <MetricRow label="FDV" />
│   │   │   ├── <MetricRow label="24h Volume" />
│   │   │   ├── <MetricRow label="Circulating Supply" />
│   │   │   ├── <MetricRow label="Total Supply" />
│   │   │   └── <ContractAddressRow />  # Copy-to-clipboard button
│   │   │
│   │   └── <PricePerformance>
│   │       ├── <RangeBar label="24h Range" low={low} high={high} current={price} />
│   │       ├── <MetricRow label="All-Time High" />
│   │       └── <MetricRow label="All-Time Low" />
│   │
│   └── <MainContent>
│       ├── <ChartSection>
│       │   ├── <ChartTimeframeSelector>   # [1D | 7D | 30D | 90D | 1Y]
│       │   ├── <ChartTypeSelector>        # [Line | Candlestick]
│       │   └── <LightweightChart />       # Client Component
│       │
│       ├── <AskAISection>                 # KILLER FEATURE 1
│       │   ├── <SectionHeader title="Ask AI Analyst" />
│       │   ├── <AskAITriggerButton>       # Opens Sheet
│       │   │   └── "Ask about {coinName}"
│       │   └── <AskAISheet>              # Shadcn Sheet (slides from right)
│       │       ├── <SheetHeader title="AI Crypto Analyst" />
│       │       ├── <ChatMessageList>      # Scrollable message history
│       │       │   ├── <SystemContextBadge />  # "Analyzing {coinName} data"
│       │       │   └── <ChatMessage> × N (role: user | assistant)
│       │       ├── <SuggestionButtons>    # Pre-built prompts
│       │       │   ├── "Is {coin} a good buy right now?"
│       │       │   ├── "What is the current market sentiment?"
│       │       │   └── "Explain the ATH vs current price difference"
│       │       └── <ChatInputForm>
│       │           ├── <Input placeholder="Ask anything..." />
│       │           └── <SendButton />
│       │
│       ├── <SecurityBadgeSection>         # KILLER FEATURE 2
│       │   ├── <SectionHeader title="Smart Contract Security" />
│       │   └── <SecurityBadge>           # Conditional render
│       │       ├── [IF EVM contract found]
│       │       │   ├── <RiskLevelBadge level="safe|caution|danger" />
│       │       │   └── <SecurityCheckList>
│       │       │       ├── <SecurityCheckRow label="Honeypot" />
│       │       │       ├── <SecurityCheckRow label="Mintable" />
│       │       │       ├── <SecurityCheckRow label="Buy Tax" />
│       │       │       ├── <SecurityCheckRow label="Sell Tax" />
│       │       │       └── <SecurityCheckRow label="Owner Renounced" />
│       │       └── [IF no contract] <NotApplicableBadge />  # e.g. Bitcoin
│       │
│       ├── <CoinNewsSection>
│       │   ├── <SectionHeader title="Latest News" />
│       │   └── <NewsGrid>               # Reused component, filtered by ticker
│       │       └── <NewsCard> × 6
│       │
│       ├── <AboutSection>
│       │   ├── <SectionHeader title={`About ${coinName}`} />
│       │   └── <DescriptionText>        # Truncated with "Read more" toggle
│       │
│       └── <PeopleAlsoWatchSection>
│           ├── <SectionHeader title="People Also Watch" />
│           └── <TrendingCoinCarousel>   # Horizontal scroll row
│               └── <MiniCoinCard> × 7
│                   ├── <CoinImage />
│                   ├── <CoinName />
│                   └── <PriceChangeBadge className="tabular-nums" />
│
└── <Footer />
```

### 5.4 Shared / Reusable Components

```
src/components/
├── ui/                              # Shadcn UI (auto-generated, DO NOT EDIT)
│   ├── button.tsx
│   ├── sheet.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   ├── command.tsx                  # Used for SearchBar
│   └── ...
│
├── layout/
│   ├── Navbar.tsx
│   ├── NavbarTopTier.tsx
│   ├── NavbarBottomTier.tsx
│   └── Footer.tsx
│
├── coin/
│   ├── CoinTable.tsx               # Client Component
│   ├── CoinTableRow.tsx
│   ├── WatchlistStar.tsx           # useOptimistic pattern
│   ├── PriceCell.tsx
│   └── ChangeCell.tsx
│
├── chart/
│   └── LightweightChart.tsx        # Client Component (dynamic import)
│
├── ai/
│   ├── AskAISheet.tsx              # Client Component
│   ├── ChatMessage.tsx
│   └── SuggestionButtons.tsx
│
├── security/
│   ├── SecurityBadge.tsx
│   └── SecurityCheckRow.tsx
│
├── news/
│   ├── NewsGrid.tsx
│   └── NewsCard.tsx
│
└── common/
    ├── GlobalMetricBadge.tsx
    ├── MetricRow.tsx
    ├── RangeBar.tsx
    ├── SectionHeader.tsx
    └── SearchBar.tsx
```

---

## 6. Sprint Plan & Step-by-Step Implementation

> **Vibe Coding Philosophy:** Every sprint produces a **visually shippable, runnable state** of the app. Never break the main branch. Use feature branches for each sprint and merge via pull request.

---

### Sprint 0 — Project Initialization (Day 1)
**Goal:** Working Next.js skeleton with all tooling configured.

**Steps:**

**0.1 — Scaffold the Next.js project**
```bash
npx create-next-app@latest coinweton \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
cd coinweton
```

**0.2 — Install all production dependencies**
```bash
# UI & Styling
npx shadcn@latest init
# During Shadcn init: Select "Default" style, "Zinc" base color, CSS variables: YES

# Core libraries
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr

# AI
npm install ai @ai-sdk/groq @ai-sdk/google

# Charts
npm install lightweight-charts

# State
npm install zustand

# Dev
npm install -D drizzle-kit
```

**0.3 — Install required Shadcn components**
```bash
npx shadcn@latest add button badge card sheet input command \
  separator skeleton tooltip scroll-area
```

**0.4 — Configure Tailwind theme**  
Open `tailwind.config.ts` and add the design tokens from Section 2.5.

**0.5 — Configure TypeScript strict mode**  
In `tsconfig.json`, verify `"strict": true` is present under `compilerOptions`.

**0.6 — Set up environment variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
COINGECKO_API_KEY=CG-xxxxxxxxxxxx   # Optional, Demo key
CRYPTOPANIC_API_TOKEN=xxxxxxxx
GOPLUS_API_BASE=https://api.gopluslabs.io/api/v1
GROQ_API_KEY=gsk_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**0.7 — Initialize Drizzle and run first migration**
```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

**0.8 — Apply RLS policies in Supabase Dashboard**  
Navigate to Supabase SQL editor and run the RLS SQL from Section 3.4.

**0.9 — Initialize Git and create branch structure**
```bash
git init
git add -A && git commit -m "feat: project initialization"
git checkout -b sprint/1-static-ui
```

✅ **Sprint 0 Acceptance Criteria:** `npm run dev` runs without errors. `http://localhost:3000` renders the Next.js default page. Supabase connection is testable.

---

### Sprint 1 — Static UI Shell (Days 2–3)
**Goal:** All pages are visually complete with placeholder/mock data. No real API calls yet.

**Steps:**

**1.1 — Build the Navbar (both tiers)**
- Create `src/components/layout/Navbar.tsx`
- Top tier: static array of `[{label, value}]` — no API
- Bottom tier: hardcode the Logo text "COINWETON", placeholder SearchBar `<Input>`, WatchlistIcon (Lucide `Bookmark`), and "Login" `<Button>`
- Apply `bg-slate-900 border-b border-slate-700` styling

**1.2 — Build the Footer**
- Simple centered text: disclaimer + GitHub icon link

**1.3 — Build the Main Page layout with mock data**
- Create mock arrays in `src/lib/mock-data.ts` with 20 fake coins
- Build the 3-card `<HighlightsSection>` with hardcoded values
- Build the `<CoinTable>` with mock data, styled but non-interactive (no sorting yet)
- Build `<NewsGrid>` with 6 placeholder news cards

**1.4 — Build the Coin Detail Page layout with mock data**
- Create `src/app/coin/[id]/page.tsx`
- Build the 2-column layout (sidebar + main content)
- Sidebar: hardcoded price ($43,251.22), all metric rows populated
- Main content area: placeholder rectangle for chart, placeholder sections for AI, Security, News, About, and People Also Watch

**1.5 — Ensure responsive behavior**
- Main Page: Table collapses gracefully on mobile (hide 1h%, FDV columns)
- Coin Detail: Stack sidebar above main content on mobile

**1.6 — Apply global typography rules**
- Add `tabular-nums` to every price/percentage cell — do this NOW before real data arrives

✅ **Sprint 1 Acceptance Criteria:** Both pages are visually polished with mock data. Font, colors, and spacing match the design system. Responsive on 375px and 1440px viewports.

---

### Sprint 2 — Core API Integration (Days 4–5)
**Goal:** Replace all mock data with live CoinGecko and CryptoPanic data.

**Steps:**

**2.1 — Build CoinGecko API Route Handlers**
- Implement `src/app/api/global/route.ts`
- Implement `src/app/api/coins/route.ts` with query param handling
- Implement `src/app/api/coins/trending/route.ts`
- Implement `src/app/api/coins/gainers/route.ts`
- Implement `src/app/api/coin/[id]/route.ts`
- Implement `src/app/api/coin/[id]/chart/route.ts`
- **Crucial:** Add `next: { revalidate: N }` to every `fetch()` call per the ISR TTL table in Section 4.1

**2.2 — Wire Main Page to live data**
- Convert `src/app/page.tsx` to async RSC
- Fetch from `/api/global` → populate NavbarTopTier
- Fetch from `/api/coins?page=1` → populate CoinTable
- Fetch from `/api/coins/trending` → populate TrendingCoinsCard
- Fetch from `/api/coins/gainers` → populate TopGainersCard

**2.3 — Implement CoinTable client-side interactions**
- Convert `<CoinTable>` to a Client Component
- Implement column sorting: clicking headers toggles `asc/desc` and refetches `/api/coins?sort=field&order=asc`
- Implement pagination: clicking Prev/Next updates `page` param and refetches

**2.4 — Build SearchBar autocomplete**
- Use Shadcn `<Command>` component
- On input change (debounced 300ms), call CoinGecko `/search?query={q}` endpoint
- Display coin name + symbol + image in dropdown results
- On selection, navigate to `/coin/[id]`

**2.5 — Wire Coin Detail Page to live data**
- Convert `src/app/coin/[id]/page.tsx` to async RSC
- Fetch from `/api/coin/[id]` → populate all sidebar metrics
- Wire timeframe selector buttons to trigger chart data fetch

**2.6 — Build Interactive Price Chart**
- Create `src/components/chart/LightweightChart.tsx` as a Client Component
- Use `dynamic(() => import(...), { ssr: false })` to import — chart requires `window`
- Implement `lightweight-charts` `createChart()`, `addLineSeries()`, and `addCandlestickSeries()`
- Connect timeframe selector buttons to update `days` param and refetch chart data

**2.7 — Wire Global and Coin-Specific News**
- Implement `src/app/api/news/route.ts` proxying CryptoPanic
- Wire `<GlobalNewsSection>` on Main Page
- Wire `<CoinNewsSection>` on Coin Detail Page (pass `coinId` to derive ticker)

✅ **Sprint 2 Acceptance Criteria:** Live market data displays on both pages. Chart renders and responds to timeframe changes. Search bar returns live results. No console errors related to API rate limiting (ISR is working).

---

### Sprint 3 — Authentication & Watchlist (Day 6)
**Goal:** Users can sign up, log in, and add/remove coins from their watchlist with instant UI feedback.

**Steps:**

**3.1 — Set up Supabase Auth client utilities**
- Create `src/lib/supabase/client.ts` (browser client using `@supabase/ssr`)
- Create `src/lib/supabase/server.ts` (server client using cookies)
- Create `src/middleware.ts` to refresh sessions on every request

**3.2 — Build Auth flow**
- Build `src/app/auth/login/page.tsx` with email/password form
- Implement Supabase `signInWithPassword()` and `signUp()`
- Add Supabase OAuth (GitHub/Google) as a bonus flow
- Implement `src/app/auth/callback/route.ts` to handle OAuth redirects
- Update `<AuthButton>` in Navbar: show user avatar + logout option when authenticated

**3.3 — Implement Watchlist API Routes**
- Implement `GET /api/watchlist` using Drizzle + Supabase server client
- Implement `POST /api/watchlist` for add/remove mutations
- Apply auth guard: return 401 if no active session

**3.4 — Implement WatchlistStar with Optimistic UI**
- Build `src/components/coin/WatchlistStar.tsx` as a Client Component
- Use `useOptimistic` hook pattern:
  ```typescript
  const [optimisticWatched, addOptimistic] = useOptimistic(
    isWatched,
    (state, action: 'add' | 'remove') => action === 'add'
  );
  ```
- On star click: immediately update UI, then call POST `/api/watchlist` in background
- On error: revert to previous state and show toast notification

**3.5 — Build Watchlist Page**
- `src/app/watchlist/page.tsx` — Client Component
- Fetch user's watched coin IDs from `/api/watchlist`
- Batch-fetch coin data for those IDs from `/api/coins` (using `ids` param in CoinGecko)
- Render using the same `<CoinTable>` component (reuse)

✅ **Sprint 3 Acceptance Criteria:** Full auth flow works end-to-end. Star toggle on any coin updates the watchlist instantly (optimistic) and persists after page refresh. Watchlist page shows personalized data.

---

### Sprint 4 — Killer Feature 1: Ask AI (Day 7)
**Goal:** Fully functional AI chat assistant on the Coin Detail Page with accurate, context-grounded responses.

**Steps:**

**4.1 — Set up the AI Chat API Route**

Create `src/app/api/chat/route.ts`:
```typescript
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { NextRequest } from 'next/server';
import type { CoinContextPayload } from '@/types/api';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, coinContext }: { 
    messages: any[], 
    coinContext: CoinContextPayload 
  } = await req.json();

  const systemPrompt = `You are a concise crypto market analyst. 
The user is viewing the ${coinContext.coinName} (${coinContext.coinId}) token page.

Current market data (source: CoinGecko, live):
- Price: $${coinContext.currentPrice.toLocaleString()}
- Market Cap: $${(coinContext.marketCap / 1e9).toFixed(2)}B
- 24h Volume: $${(coinContext.volume24h / 1e9).toFixed(2)}B
- 24h Change: ${coinContext.priceChange24h.toFixed(2)}%
- All-Time High: $${coinContext.ath.toLocaleString()}
- All-Time Low: $${coinContext.atl.toLocaleString()}
- Circulating Supply: ${coinContext.circulatingSupply.toLocaleString()}
- Total Supply: ${coinContext.totalSupply?.toLocaleString() ?? 'Unlimited'}

Instructions:
1. Answer ONLY using the context data above. Do not guess or hallucinate.
2. Be concise (3–5 sentences max per response).
3. If asked about future price predictions, state that you can only analyze current data.
4. Always refer to numbers from the context, not from your training data.`;

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: systemPrompt,
    messages,
    maxTokens: 512,
  });

  return result.toDataStreamResponse();
}
```

**4.2 — Build the AskAISheet Client Component**
- Create `src/components/ai/AskAISheet.tsx`
- Use Vercel AI SDK's `useChat()` hook from `@ai-sdk/react`
- Pass `body: { coinContext }` to `useChat()` options so context is sent with every message
- Build the chat message list with distinct styling for `user` vs `assistant` roles
- Add a loading spinner (Lucide `Loader2` with `animate-spin`) while streaming

**4.3 — Build Suggestion Buttons**
- Create 3 pre-built prompt buttons that call `append()` from `useChat`
- Suggestions adapt to coin name dynamically:
  - "Is {coinName} overvalued compared to its ATH?"
  - "What does the 24h volume suggest about current sentiment?"
  - "How much has {coinName} dropped from its all-time high?"

**4.4 — Integrate into Coin Detail Page**
- Add `<AskAITriggerButton>` and `<AskAISheet>` to `<CoinDetailPage>`
- Pass `coinContext` payload constructed from the RSC-fetched `CoinDetail` data

✅ **Sprint 4 Acceptance Criteria:** Opening the AI Sheet and asking a question returns a streamed, accurate response. Suggestion buttons pre-populate prompts. AI does not hallucinate prices (verified by comparing AI answer to sidebar data).

---

### Sprint 5 — Killer Feature 2: Security Badge (Day 8)
**Goal:** Automated EVM smart contract audit badge displays on all eligible token pages.

**Steps:**

**5.1 — Build the GoPlus Security API Route**

Create `src/app/api/security/[address]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { SecurityAuditResult } from '@/types/api';

const CHAIN_ID_MAP: Record<string, string> = {
  ethereum: '1',
  'binance-smart-chain': '56',
  'polygon-pos': '137',
  'arbitrum-one': '42161',
  optimism: '10',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const chainLabel = req.nextUrl.searchParams.get('chain') ?? 'ethereum';
  const chainId = CHAIN_ID_MAP[chainLabel] ?? '1';
  const { address } = params;

  const res = await fetch(
    `${process.env.GOPLUS_API_BASE}/token_security/${chainId}?contract_addresses=${address}`,
    { next: { revalidate: 3600 } }
  );
  const raw = await res.json();
  const tokenData = raw.result?.[address.toLowerCase()];

  if (!tokenData) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  // ── Risk scoring utility ──────────────────────────────────
  const riskReasons: string[] = [];
  if (tokenData.is_honeypot === '1') riskReasons.push('Honeypot detected');
  if (tokenData.is_mintable === '1') riskReasons.push('Token is mintable');
  if (Number(tokenData.buy_tax) > 10) riskReasons.push(`High buy tax: ${tokenData.buy_tax}%`);
  if (Number(tokenData.sell_tax) > 10) riskReasons.push(`High sell tax: ${tokenData.sell_tax}%`);
  if (tokenData.owner_address && tokenData.owner_address !== '0x0000000000000000000000000000000000000000') {
    riskReasons.push('Owner not renounced');
  }

  const riskLevel: SecurityAuditResult['riskLevel'] =
    riskReasons.some(r => r.includes('Honeypot')) ? 'danger'
    : riskReasons.length > 1 ? 'caution'
    : 'safe';

  const result: SecurityAuditResult = {
    contractAddress: address,
    chainId,
    isHoneypot: tokenData.is_honeypot === '1',
    isMintable: tokenData.is_mintable === '1',
    ownerRenounced: !tokenData.owner_address 
      || tokenData.owner_address === '0x0000000000000000000000000000000000000000',
    buyTax: Number(tokenData.buy_tax ?? 0),
    sellTax: Number(tokenData.sell_tax ?? 0),
    riskLevel,
    riskReasons,
  };

  return NextResponse.json(result);
}
```

**5.2 — Build SecurityBadge Component**
- Create `src/components/security/SecurityBadge.tsx` as a Client Component
- Use `useEffect` + `useState` to fetch `/api/security/[address]?chain={chain}` on mount
- Display:
  - **`safe`**: Green `<Badge>` with checkmark — "Verified Safe"
  - **`caution`**: Amber `<Badge>` with warning icon — "Exercise Caution"
  - **`danger`**: Red `<Badge>` with skull icon — "High Risk"
- Show loading skeleton while fetching, hide if no contract address available

**5.3 — Extract contract address from CoinGecko data**
- In `src/app/coin/[id]/page.tsx`, after fetching coin detail:
  ```typescript
  const platforms = coinDetail.platforms ?? {};
  // Find first supported EVM chain
  const evmChains = ['ethereum', 'binance-smart-chain', 'polygon-pos', 'arbitrum-one'];
  const evmChain = evmChains.find(chain => platforms[chain]);
  const contractAddress = evmChain ? platforms[evmChain] : null;
  ```
- Pass `contractAddress` and `evmChain` as props to `<SecurityBadge>`

**5.4 — Handle non-EVM coins gracefully**
- Bitcoin, Litecoin, etc. have no `platforms` entry
- Render `<NotApplicableBadge>` with neutral gray styling and tooltip: "Native blockchain asset — contract audit not applicable"

✅ **Sprint 5 Acceptance Criteria:** Navigating to an ERC-20 token page (e.g., Chainlink, PEPE) displays the Security Badge with correct audit data. Navigating to Bitcoin shows the "Not Applicable" badge. The badge updates correctly between different tokens.

---

### Sprint 6 — Polish, Performance & Deployment (Days 9–10)
**Goal:** Production-ready application deployed to Vercel + Supabase with zero critical bugs.

**Steps:**

**6.1 — Loading and Error states**
- Add `src/app/loading.tsx` (skeleton loader for Main Page)
- Add `src/app/coin/[id]/loading.tsx` (skeleton for Coin Detail)
- Add `src/app/error.tsx` (error boundary with retry button)
- Add `<Skeleton>` components to every data-dependent section

**6.2 — SEO and Metadata**
```typescript
// In src/app/coin/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const coin = await fetchCoinDetail(params.id);
  return {
    title: `${coin.name} (${coin.symbol.toUpperCase()}) Price Today | COINWETON`,
    description: `${coin.name} price, market cap, and analysis. ${coin.market_data.current_price.usd.toLocaleString()} USD today.`,
    openGraph: { images: [coin.image.large] }
  };
}
```

**6.3 — Performance audit**
- Run `next build` and check bundle sizes
- Ensure `LightweightChart` is lazy-loaded with `dynamic(..., { ssr: false })`
- Verify all ISR cache headers are present in Network tab (X-Vercel-Cache: HIT)

**6.4 — Mobile responsiveness final pass**
- Coin Detail sidebar: collapse to accordion on < 768px
- Coin Table: hide `1h%`, `FDV` columns on mobile, keep Price + 24h%
- AI Sheet: full-screen on mobile

**6.5 — Deploy to Vercel**
```bash
# Push to GitHub first
git push origin main

# In Vercel dashboard:
# 1. Import repository
# 2. Set all environment variables (from .env.local)
# 3. Set region: Singapore (iad1 → override to sin1 if available, else use default)
# 4. Deploy
```

**6.6 — Anti-Pause Supabase Strategy**
- Set a weekly calendar reminder to visit the Supabase dashboard and run one query
- Alternatively, set up a simple cron job (Vercel Cron or GitHub Actions) to ping `/api/watchlist` every 5 days during the judge window (May 3–14, 2026)

**6.7 — Final verification checklist**
- [ ] Main Page loads in < 2 seconds on first visit (ISR warm cache)
- [ ] Coin Table pagination works (page 1, 2, 3)
- [ ] Search returns results for "bitcoin", "ethereum", "pepe"
- [ ] Coin Detail chart renders and responds to timeframe changes
- [ ] Sign Up → Login → Add to Watchlist → Logout → Login → Watchlist persisted
- [ ] Ask AI responds accurately without hallucinating prices
- [ ] Security Badge shows `safe/caution/danger` for a known token
- [ ] No CORS errors, no 500 errors in production logs
- [ ] All numeric values use `tabular-nums` class

✅ **Sprint 6 Acceptance Criteria:** Application is live on Vercel. All core features pass the verification checklist. Lighthouse Performance score ≥ 85 on desktop.

---

## Appendix A — File Structure Reference

```
coinweton/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── coin/[id]/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── watchlist/
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts
│   │   └── api/
│   │       ├── global/route.ts
│   │       ├── coins/route.ts
│   │       ├── coins/trending/route.ts
│   │       ├── coins/gainers/route.ts
│   │       ├── coin/[id]/route.ts
│   │       ├── coin/[id]/chart/route.ts
│   │       ├── news/route.ts
│   │       ├── chat/route.ts
│   │       ├── security/[address]/route.ts
│   │       └── watchlist/route.ts
│   ├── components/
│   │   ├── ui/                    # Shadcn (auto-generated)
│   │   ├── layout/
│   │   ├── coin/
│   │   ├── chart/
│   │   ├── ai/
│   │   ├── security/
│   │   ├── news/
│   │   └── common/
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── utils.ts
│   │   └── format.ts              # Currency/number formatters
│   └── types/
│       └── api.ts
├── drizzle/
│   └── migrations/
├── drizzle.config.ts
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## Appendix B — Number Formatting Utilities

```typescript
// src/lib/format.ts

export const formatCurrency = (value: number, decimals = 2): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(decimals)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(decimals)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(decimals)}M`;
  if (value >= 1e3)  return `$${(value / 1e3).toFixed(decimals)}K`;
  return `$${value.toFixed(decimals)}`;
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatSupply = (value: number | null): string => {
  if (value === null) return '∞';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
};
```

---

*This document is the single Source of Truth for all AI Vibe Coding sessions on the COINWETON project. Any changes to architecture, schema, or feature scope must be reflected here before implementation begins.*