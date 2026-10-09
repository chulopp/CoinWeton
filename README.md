<p align="center">
  <img src="./public/icon.svg" alt="COINWETON Logo" width="80" />
</p>

<h1 align="center">COINWETON</h1>
<p align="center"><strong>Smart Crypto Tracker and AI Assistant</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E5FF?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon Postgres" />
  <img src="https://img.shields.io/badge/Auth.js-NextAuth-black?style=for-the-badge&logo=nextauth&logoColor=white" alt="Auth.js" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
</p>

## About the Project

COINWETON is a web-based crypto intelligence platform built to tackle market volatility and information asymmetry in digital asset investing. Retail investors often face high market risks, misinformation, and emotional decision-making such as FOMO. COINWETON provides structured, real-time market data alongside automated security vetting, enabling users to make informed, data-driven decisions.

Beyond standard price monitoring, COINWETON integrates an automated smart contract security audit engine to detect honeypots and malicious contracts before users interact with them. It also features Cown AI, a contextual assistant designed to interpret real-time market metrics and contract safety data on demand.

## Key Features

### Real-Time Market Dashboard
The main dashboard delivers live global cryptocurrency metrics, including prices, 24-hour trading volumes, market capitalization, Bitcoin dominance, and market sentiment tracking through the Fear and Greed Index. The layout is optimized for desktop and mobile workflows with a dark interface.

### Dual-Chart System
Visual data inspection uses two dedicated charting implementations:
* **Recharts**: Custom sparkline visualizations on the dashboard for rapid trend assessment across coin lists.
* **TradingView**: Interactive technical analysis widgets on individual coin pages supporting multiple intervals (1H, 24H, 7D, 30D, and 1Y).

### Smart Contract Security Audit
Automated token risk inspection is powered by GoPlus Security API. Every EVM-compatible token (Ethereum, BNB Chain, Polygon, and others) is screened for:
* **Honeypot Verification**: Validates whether token sell transactions are blocked or restricted.
* **Mint Functions**: Checks if the contract owner can arbitrarily inflate token supply.
* **Buy and Sell Taxes**: Detects hidden slippage fees or extortionate tax rates.
* **Ownership Status**: Evaluates ownership renunciation and administrative privilege controls.

Audit outputs are summarized with visual risk indicators: SAFE, CAUTION, or DANGER.

### Cown AI Contextual Assistant
An integrated AI assistant built on a two-tier Retrieval-Augmented Generation (RAG) structure:
* **Macro Context**: Gathers overall market trends, market cap shifts, and global news sentiment.
* **Micro Context**: Pulls coin-specific telemetry, fundamental statistics, and smart contract audit outputs.

This context grounding keeps responses anchored in live data and prevents hallucinations during technical queries.

### Cloud Watchlist and Authentication
A persistent watchlist lets users track target assets across sessions. The authentication system uses Google OAuth integrated with Auth.js, storing watchlist references directly in a serverless PostgreSQL database.

## Architecture and Stack

### Core Technologies

| Category | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | React Server Components and Server Actions |
| **Language** | TypeScript 5 | Strict type checking across client and server |
| **Styling** | Tailwind CSS 4 | Utility styling and responsive design |
| **UI Components** | Shadcn UI and Lucide Icons | Headless component primitives |
| **Database** | Neon Serverless PostgreSQL | Serverless connection pooling |
| **ORM** | Drizzle ORM | Type-safe PostgreSQL schema and queries |
| **Authentication** | Auth.js (NextAuth v5) | Google OAuth with stateless JWT sessions |
| **State and Cache** | SWR | Client-side revalidation and caching |
| **Charts** | Recharts and TradingView | Dual-chart visualization system |

### External API Integrations

| Provider | Purpose | Protocol |
|---|---|---|
| **CoinGecko API** | Real-time prices, volume, and market rankings | REST API |
| **GoPlus Security API** | Automated EVM smart contract risk screening | REST API |
| **OpenRouter** | LLM gateway powering Cown AI | REST API |
| **NewsData API** | Global cryptocurrency news aggregation | REST API |

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                      │
│          Next.js App Router: RSC + Client Components     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Dashboard │  │ Coin Detail  │  │ Cown AI Terminal │  │
│  └───────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP / Server Actions
┌────────────────────────▼─────────────────────────────────┐
│           NEXT.JS SERVER (API Route Handlers)             │
│                                                           │
│  /api/coins      → CoinGecko        (ISR cache 60s)      │
│  /api/market     → CoinGecko        (ISR cache 60s)      │
│  /api/news       → NewsData         (ISR cache 300s)     │
│  /api/chat       → OpenRouter LLM   (Streaming POST)     │
│  /api/highlights → CoinGecko        (ISR cache 120s)     │
│  /api/watchlist  → Drizzle ORM      (Session verified)   │
│                                                           │
│  ┌─────────────────┐    ┌────────────────────────────┐   │
│  │   Drizzle ORM   │    │     Auth.js (NextAuth)     │   │
│  └────────┬────────┘    └──────────────┬─────────────┘   │
└───────────┼────────────────────────────┼─────────────────┘
            │                            │
┌───────────▼────────────────────────────▼─────────────────┐
│              NEON SERVERLESS POSTGRESQL                  │
│          Tables: users, watchlists (pooled)              │
└──────────────────────────────────────────────────────────┘
```

## Getting Started

Follow these steps to run the application in a local development environment.

### Prerequisites

* Node.js version 18.0 or higher
* npm (bundled with Node.js)
* Git

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/chulopp/CoinWeton.git
cd CoinWeton
```

2. Install project dependencies:
```bash
npm install
```

3. Configure environment variables:
Copy the environment template file:
```bash
cp .env.example .env.local
```

Populate the required credentials in `.env.local`:

| Variable | Provider | Purpose |
|---|---|---|
| `DATABASE_URL` | Neon Console | Pooled PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js | Session encryption secret |
| `AUTH_GOOGLE_ID` | Google Cloud Console | OAuth 2.0 Client ID |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console | OAuth 2.0 Client Secret |
| `COINGECKO_API_KEY` | CoinGecko | Market data access |
| `NEWSDATA_API_KEY` | NewsData.io | Crypto news feed |
| `GOPLUS_API_BASE` | GoPlus Security | Contract audit endpoint |
| `OPENROUTER_API_KEY` | OpenRouter | AI model completions |

4. Start the development server:
```bash
npm run dev
```

5. Open the application:
Visit `http://localhost:3000` in your browser.

Active internet connectivity is required to fetch real-time feeds from CoinGecko, GoPlus, and OpenRouter.

## Project Structure

```
CoinWeton/
├── src/
│   ├── app/                    # Next.js App Router (pages and API routes)
│   │   ├── api/                # Backend API proxy handlers
│   │   │   ├── chat/           # Cown AI completion endpoint
│   │   │   ├── coins/          # CoinGecko market proxy
│   │   │   ├── highlights/     # Trending and gainer feeds
│   │   │   ├── market/         # Global market overview
│   │   │   ├── news/           # NewsData aggregation
│   │   │   ├── search/         # Coin search query handler
│   │   │   └── watchlist/      # Watchlist persistence routes
│   │   ├── coins/[id]/         # Coin detail view and TradingView chart
│   │   ├── cown-ai/            # Interactive Cown AI terminal
│   │   ├── watchlist/          # User watchlist view
│   │   └── page.tsx            # Main dashboard overview
│   ├── components/             # React UI components
│   │   ├── coin-detail/        # Coin metrics and chart modules
│   │   ├── highlights/         # Market sentiment and top movers
│   │   ├── layout/             # Navigation bars and footer
│   │   ├── market/             # Primary market table
│   │   └── ui/                 # Base component primitives
│   ├── db/                     # Drizzle ORM schema and database client
│   ├── lib/                    # Data fetchers and helper utilities
│   └── utils/                  # Shared helper functions
├── drizzle/                    # Database migration files
├── data/                       # Product requirements and documentation
├── public/                     # Static media and branding assets
├── .env.example                # Environment configuration template
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler options
```

## License and Acknowledgments

This project is licensed under the MIT License.

Data and infrastructure providers supporting the platform:

<p align="center">
  <img src="./public/coingecko-logo.svg" alt="CoinGecko" height="28" />
  <img src="./public/goplus1.svg" alt="GoPlus Security" height="28" />
  <img src="https://img.shields.io/badge/OpenRouter-API-blue?style=flat" alt="OpenRouter" height="24" />
  <img src="https://img.shields.io/badge/NewsData.io-News-orange?style=flat" alt="NewsData" height="24" />
  <img src="https://img.shields.io/badge/Neon-00E5FF?style=flat&logo=postgresql&logoColor=black" alt="Neon" height="24" />
</p>

