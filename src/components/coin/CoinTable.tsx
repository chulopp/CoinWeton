"use client";

import React, {
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { toggleWatchlist } from "@/app/actions";
import {
  type CoinMarketRow,
  type MarketTableSnapshot,
  formatUsdPrice,
  formatUsdWholeNumber,
} from "@/lib/market-data";
import { fetchMarketTableSnapshot } from "@/lib/market-table-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Sparkline from "@/components/ui/Sparkline";

export type CoinMarketMock = CoinMarketRow;

export const allMockCoins: CoinMarketMock[] = [
  { id: "bitcoin", rank: 1, name: "Bitcoin", symbol: "BTC", price: 75971.51, change1h: 0.6, change24h: 0.0, change7d: 6.3, marketCap: 1522009428092, volume24h: 52323173120, color: "#f7931a", sparkline: [68000, 69500, 71200, 70800, 73400, 74200, 75971] },
  { id: "ethereum", rank: 2, name: "Ethereum", symbol: "ETH", price: 2339.86, change1h: 0.6, change24h: -0.5, change7d: 6.1, marketCap: 282537042826, volume24h: 13496678941, color: "#627eea", sparkline: [2100, 2150, 2200, 2180, 2250, 2300, 2339] },
  { id: "tether", rank: 3, name: "Tether", symbol: "USDT", price: 1.0, change1h: 0.0, change24h: 0.0, change7d: 0.0, marketCap: 187136865684, volume24h: 76656410998, color: "#26a17b", sparkline: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] },
  { id: "ripple", rank: 4, name: "XRP", symbol: "XRP", price: 1.44, change1h: 0.9, change24h: 0.4, change7d: 8.1, marketCap: 88686315175, volume24h: 2229084886, color: "#00aae4", sparkline: [1.2, 1.25, 1.3, 1.28, 1.35, 1.4, 1.44] },
  { id: "binancecoin", rank: 5, name: "BNB", symbol: "BNB", price: 625.52, change1h: 0.4, change24h: -1.1, change7d: 5.4, marketCap: 84322331472, volume24h: 879687001, color: "#f3ba2f", sparkline: [580, 590, 600, 610, 615, 620, 625] },
  { id: "usdc", rank: 6, name: "USDC", symbol: "USDC", price: 0.9999, change1h: 0.0, change24h: 0.0, change7d: 0.0, marketCap: 78398605289, volume24h: 10186795475, color: "#2775ca", sparkline: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] },
  { id: "solana", rank: 7, name: "Solana", symbol: "SOL", price: 178.92, change1h: 1.2, change24h: 3.4, change7d: 12.5, marketCap: 78000000000, volume24h: 3200000000, color: "#9945ff", sparkline: [140, 150, 155, 160, 168, 172, 178] },
  { id: "cardano", rank: 8, name: "Cardano", symbol: "ADA", price: 0.4512, change1h: -0.3, change24h: 1.8, change7d: 3.2, marketCap: 16000000000, volume24h: 540000000, color: "#0033ad", sparkline: [0.4, 0.41, 0.42, 0.43, 0.44, 0.45, 0.45] },
  { id: "dogecoin", rank: 9, name: "Dogecoin", symbol: "DOGE", price: 0.1234, change1h: 0.8, change24h: 5.6, change7d: 7.9, marketCap: 17500000000, volume24h: 890000000, color: "#c2a633", sparkline: [0.1, 0.105, 0.11, 0.112, 0.118, 0.12, 0.123] },
  { id: "tron", rank: 10, name: "TRON", symbol: "TRX", price: 0.2456, change1h: 0.1, change24h: -0.3, change7d: 1.5, marketCap: 21300000000, volume24h: 670000000, color: "#ff0013", sparkline: [0.23, 0.235, 0.24, 0.238, 0.242, 0.244, 0.245] },
  { id: "polkadot", rank: 11, name: "Polkadot", symbol: "DOT", price: 7.89, change1h: -0.1, change24h: -2.3, change7d: -4.1, marketCap: 10500000000, volume24h: 320000000, color: "#e6007a", sparkline: [8.5, 8.3, 8.1, 7.9, 7.85, 7.8, 7.89] },
  { id: "avalanche", rank: 12, name: "Avalanche", symbol: "AVAX", price: 38.56, change1h: 0.7, change24h: 4.1, change7d: 9.2, marketCap: 14200000000, volume24h: 580000000, color: "#e84142", sparkline: [32, 33, 34, 35, 36, 37.5, 38.56] },
  { id: "chainlink", rank: 13, name: "Chainlink", symbol: "LINK", price: 14.23, change1h: -0.3, change24h: 1.8, change7d: 5.6, marketCap: 8300000000, volume24h: 410000000, color: "#2a5ada", sparkline: [12.5, 12.8, 13.2, 13.5, 13.8, 14.0, 14.23] },
  { id: "shiba-inu", rank: 14, name: "Shiba Inu", symbol: "SHIB", price: 0.00001456, change1h: 1.5, change24h: 8.2, change7d: 14.3, marketCap: 8500000000, volume24h: 620000000, color: "#ffa409", sparkline: [0.000011, 0.000012, 0.0000125, 0.000013, 0.0000135, 0.000014, 0.00001456] },
  { id: "polygon", rank: 15, name: "Polygon", symbol: "POL", price: 0.5678, change1h: 0.2, change24h: -1.2, change7d: 2.8, marketCap: 5600000000, volume24h: 340000000, color: "#8247e5", sparkline: [0.52, 0.53, 0.54, 0.55, 0.56, 0.565, 0.567] },
  { id: "litecoin", rank: 16, name: "Litecoin", symbol: "LTC", price: 89.34, change1h: -0.4, change24h: 0.9, change7d: -1.7, marketCap: 6700000000, volume24h: 290000000, color: "#bfbbbb", sparkline: [92, 91, 90, 89.5, 89, 89.2, 89.34] },
  { id: "uniswap", rank: 17, name: "Uniswap", symbol: "UNI", price: 9.87, change1h: 0.5, change24h: 3.4, change7d: 7.8, marketCap: 5900000000, volume24h: 280000000, color: "#ff007a", sparkline: [8.5, 8.8, 9.0, 9.2, 9.4, 9.6, 9.87] },
  { id: "near", rank: 18, name: "NEAR Protocol", symbol: "NEAR", price: 5.67, change1h: -0.2, change24h: 2.1, change7d: 4.5, marketCap: 5400000000, volume24h: 250000000, color: "#00ec97", sparkline: [5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.67] },
  { id: "pepe", rank: 19, name: "Pepe", symbol: "PEPE", price: 0.00001234, change1h: 2.1, change24h: 12.4, change7d: 28.6, marketCap: 5200000000, volume24h: 1200000000, color: "#22c55e", sparkline: [0.000008, 0.000009, 0.0000095, 0.00001, 0.000011, 0.0000118, 0.00001234] },
  { id: "stellar", rank: 20, name: "Stellar", symbol: "XLM", price: 0.1345, change1h: 0.3, change24h: -0.8, change7d: 1.9, marketCap: 3900000000, volume24h: 120000000, color: "#14b6d7", sparkline: [0.128, 0.13, 0.131, 0.132, 0.133, 0.134, 0.1345] },
  { id: "cosmos", rank: 21, name: "Cosmos", symbol: "ATOM", price: 8.94, change1h: -0.1, change24h: 1.3, change7d: 3.7, marketCap: 3500000000, volume24h: 180000000, color: "#2e3148", sparkline: [8.2, 8.3, 8.5, 8.6, 8.7, 8.8, 8.94] },
  { id: "filecoin", rank: 22, name: "Filecoin", symbol: "FIL", price: 5.23, change1h: 0.4, change24h: 2.8, change7d: 6.1, marketCap: 2800000000, volume24h: 160000000, color: "#0090ff", sparkline: [4.5, 4.7, 4.8, 4.9, 5.0, 5.1, 5.23] },
  { id: "hedera", rank: 23, name: "Hedera", symbol: "HBAR", price: 0.0867, change1h: 0.6, change24h: -1.5, change7d: 2.3, marketCap: 2700000000, volume24h: 95000000, color: "#00d8d5", sparkline: [0.08, 0.082, 0.084, 0.085, 0.086, 0.0865, 0.0867] },
  { id: "arbitrum", rank: 24, name: "Arbitrum", symbol: "ARB", price: 1.12, change1h: -0.5, change24h: 3.2, change7d: 8.4, marketCap: 2600000000, volume24h: 310000000, color: "#213147", sparkline: [0.95, 0.98, 1.0, 1.02, 1.05, 1.08, 1.12] },
  { id: "optimism", rank: 25, name: "Optimism", symbol: "OP", price: 2.34, change1h: 0.8, change24h: 4.5, change7d: 10.2, marketCap: 2500000000, volume24h: 220000000, color: "#ff0420", sparkline: [1.9, 2.0, 2.05, 2.1, 2.15, 2.25, 2.34] },
  { id: "injective", rank: 26, name: "Injective", symbol: "INJ", price: 24.56, change1h: 1.1, change24h: 6.2, change7d: 12.8, marketCap: 2400000000, volume24h: 190000000, color: "#8b5cf6", sparkline: [20, 21, 22, 22.5, 23, 24, 24.56] },
  { id: "immutable", rank: 27, name: "Immutable", symbol: "IMX", price: 1.89, change1h: -0.2, change24h: -2.1, change7d: -3.5, marketCap: 2300000000, volume24h: 85000000, color: "#00b2ff", sparkline: [2.0, 1.98, 1.95, 1.93, 1.91, 1.9, 1.89] },
  { id: "render", rank: 28, name: "Render", symbol: "RNDR", price: 8.42, change1h: 0.9, change24h: 5.1, change7d: 11.3, marketCap: 2200000000, volume24h: 170000000, color: "#3b82f6", sparkline: [7.0, 7.3, 7.5, 7.7, 7.9, 8.1, 8.42] },
  { id: "algorand", rank: 29, name: "Algorand", symbol: "ALGO", price: 0.2134, change1h: 0.1, change24h: 0.7, change7d: 1.9, marketCap: 1700000000, volume24h: 65000000, color: "#000000", sparkline: [0.2, 0.205, 0.207, 0.209, 0.21, 0.212, 0.2134] },
  { id: "aave", rank: 30, name: "Aave", symbol: "AAVE", price: 98.45, change1h: -0.3, change24h: 2.4, change7d: 5.7, marketCap: 1500000000, volume24h: 130000000, color: "#b6509e", sparkline: [88, 90, 92, 94, 95, 97, 98.45] },
  { id: "sui", rank: 31, name: "Sui", symbol: "SUI", price: 1.78, change1h: 1.4, change24h: 5.8, change7d: 15.2, marketCap: 2100000000, volume24h: 340000000, color: "#4da2ff", sparkline: [1.4, 1.45, 1.5, 1.55, 1.6, 1.7, 1.78] },
  { id: "celestia", rank: 32, name: "Celestia", symbol: "TIA", price: 12.34, change1h: 0.7, change24h: 4.9, change7d: 9.8, marketCap: 2000000000, volume24h: 270000000, color: "#7b2bf9", sparkline: [10.5, 10.8, 11.0, 11.3, 11.6, 12.0, 12.34] },
  { id: "the-graph", rank: 33, name: "The Graph", symbol: "GRT", price: 0.1567, change1h: -0.4, change24h: 1.2, change7d: 3.4, marketCap: 1400000000, volume24h: 78000000, color: "#6747ed", sparkline: [0.14, 0.145, 0.148, 0.15, 0.152, 0.155, 0.1567] },
  { id: "theta", rank: 34, name: "Theta Network", symbol: "THETA", price: 1.45, change1h: 0.2, change24h: -0.5, change7d: 2.1, marketCap: 1450000000, volume24h: 45000000, color: "#2ab8e6", sparkline: [1.38, 1.4, 1.42, 1.43, 1.44, 1.445, 1.45] },
  { id: "eos", rank: 35, name: "EOS", symbol: "EOS", price: 0.8923, change1h: -0.1, change24h: 0.3, change7d: -1.2, marketCap: 1000000000, volume24h: 120000000, color: "#443f54", sparkline: [0.91, 0.905, 0.9, 0.895, 0.893, 0.892, 0.8923] },
  { id: "fantom", rank: 36, name: "Fantom", symbol: "FTM", price: 0.4289, change1h: 0.6, change24h: 3.7, change7d: 8.5, marketCap: 1200000000, volume24h: 150000000, color: "#1969ff", sparkline: [0.37, 0.38, 0.39, 0.4, 0.41, 0.42, 0.4289] },
  { id: "aptos", rank: 37, name: "Aptos", symbol: "APT", price: 9.12, change1h: -0.2, change24h: 1.9, change7d: 4.3, marketCap: 3800000000, volume24h: 200000000, color: "#46d5b3", sparkline: [8.2, 8.4, 8.6, 8.7, 8.85, 9.0, 9.12] },
  { id: "mantle", rank: 38, name: "Mantle", symbol: "MNT", price: 0.5634, change1h: 0.3, change24h: -0.9, change7d: 1.6, marketCap: 1800000000, volume24h: 88000000, color: "#000000", sparkline: [0.54, 0.545, 0.55, 0.555, 0.56, 0.562, 0.5634] },
  { id: "sei", rank: 39, name: "Sei", symbol: "SEI", price: 0.5612, change1h: 1.0, change24h: 7.2, change7d: 13.6, marketCap: 1600000000, volume24h: 210000000, color: "#9c1f1f", sparkline: [0.45, 0.47, 0.48, 0.5, 0.52, 0.54, 0.5612] },
  { id: "stacks", rank: 40, name: "Stacks", symbol: "STX", price: 2.89, change1h: 0.4, change24h: 2.6, change7d: 6.9, marketCap: 4100000000, volume24h: 175000000, color: "#5546ff", sparkline: [2.5, 2.55, 2.6, 2.65, 2.7, 2.8, 2.89] },
  { id: "flow", rank: 41, name: "Flow", symbol: "FLOW", price: 0.8912, change1h: -0.3, change24h: 1.5, change7d: 3.8, marketCap: 1350000000, volume24h: 67000000, color: "#00ef8b", sparkline: [0.82, 0.84, 0.85, 0.86, 0.87, 0.885, 0.8912] },
  { id: "quant", rank: 42, name: "Quant", symbol: "QNT", price: 112.45, change1h: 0.2, change24h: -0.4, change7d: 2.1, marketCap: 1350000000, volume24h: 32000000, color: "#585858", sparkline: [108, 109, 110, 111, 111.5, 112, 112.45] },
  { id: "tezos", rank: 43, name: "Tezos", symbol: "XTZ", price: 0.9823, change1h: 0.5, change24h: 2.8, change7d: 5.4, marketCap: 950000000, volume24h: 28000000, color: "#2c7df7", sparkline: [0.9, 0.92, 0.93, 0.95, 0.96, 0.97, 0.9823] },
  { id: "axie-infinity", rank: 44, name: "Axie Infinity", symbol: "AXS", price: 7.56, change1h: -0.6, change24h: -1.8, change7d: -3.2, marketCap: 1020000000, volume24h: 45000000, color: "#0055d5", sparkline: [8.0, 7.9, 7.8, 7.7, 7.65, 7.6, 7.56] },
  { id: "sandbox", rank: 45, name: "The Sandbox", symbol: "SAND", price: 0.4456, change1h: 0.8, change24h: 4.2, change7d: 9.1, marketCap: 880000000, volume24h: 120000000, color: "#04adef", sparkline: [0.38, 0.39, 0.4, 0.41, 0.42, 0.44, 0.4456] },
  { id: "decentraland", rank: 46, name: "Decentraland", symbol: "MANA", price: 0.4123, change1h: 0.3, change24h: 1.9, change7d: 4.7, marketCap: 780000000, volume24h: 95000000, color: "#ff2d55", sparkline: [0.37, 0.38, 0.39, 0.395, 0.4, 0.41, 0.4123] },
  { id: "gala", rank: 47, name: "Gala", symbol: "GALA", price: 0.0289, change1h: 1.2, change24h: 6.8, change7d: 14.5, marketCap: 890000000, volume24h: 190000000, color: "#000000", sparkline: [0.022, 0.023, 0.024, 0.025, 0.026, 0.028, 0.0289] },
  { id: "curve-dao", rank: 48, name: "Curve DAO", symbol: "CRV", price: 0.5678, change1h: -0.4, change24h: 2.3, change7d: 5.8, marketCap: 700000000, volume24h: 88000000, color: "#a8a3ff", sparkline: [0.5, 0.52, 0.53, 0.54, 0.55, 0.56, 0.5678] },
  { id: "mina", rank: 49, name: "Mina Protocol", symbol: "MINA", price: 0.6789, change1h: 0.1, change24h: -0.6, change7d: 1.2, marketCap: 680000000, volume24h: 25000000, color: "#e39b3f", sparkline: [0.66, 0.665, 0.67, 0.672, 0.675, 0.677, 0.6789] },
  { id: "1inch", rank: 50, name: "1inch", symbol: "1INCH", price: 0.3456, change1h: 0.7, change24h: 3.9, change7d: 7.6, marketCap: 420000000, volume24h: 38000000, color: "#94a6c3", sparkline: [0.3, 0.31, 0.32, 0.325, 0.33, 0.34, 0.3456] },
  { id: "compound", rank: 51, name: "Compound", symbol: "COMP", price: 52.34, change1h: -0.2, change24h: 1.1, change7d: 3.4, marketCap: 440000000, volume24h: 42000000, color: "#00d395", sparkline: [49, 50, 50.5, 51, 51.5, 52, 52.34] },
  { id: "maker", rank: 52, name: "Maker", symbol: "MKR", price: 1456.78, change1h: 0.3, change24h: -0.7, change7d: 2.8, marketCap: 1300000000, volume24h: 56000000, color: "#1aab9b", sparkline: [1400, 1410, 1420, 1430, 1440, 1450, 1456.78] },
  { id: "ens", rank: 53, name: "Ethereum Name Service", symbol: "ENS", price: 18.92, change1h: 0.9, change24h: 5.3, change7d: 11.7, marketCap: 580000000, volume24h: 78000000, color: "#5298ff", sparkline: [16, 16.5, 17, 17.5, 18, 18.5, 18.92] },
  { id: "lido-dao", rank: 54, name: "Lido DAO", symbol: "LDO", price: 2.45, change1h: -0.5, change24h: 2.8, change7d: 6.3, marketCap: 2200000000, volume24h: 130000000, color: "#00a3ff", sparkline: [2.1, 2.15, 2.2, 2.25, 2.3, 2.4, 2.45] },
  { id: "bonk", rank: 55, name: "Bonk", symbol: "BONK", price: 0.00002345, change1h: 3.2, change24h: 18.7, change7d: 34.5, marketCap: 1500000000, volume24h: 450000000, color: "#ff9500", sparkline: [0.000015, 0.000016, 0.000017, 0.000019, 0.00002, 0.000022, 0.00002345] },
  { id: "worldcoin", rank: 56, name: "Worldcoin", symbol: "WLD", price: 3.14, change1h: 0.4, change24h: -1.2, change7d: 2.8, marketCap: 680000000, volume24h: 92000000, color: "#000000", sparkline: [2.9, 2.95, 3.0, 3.05, 3.08, 3.1, 3.14] },
  { id: "pyth-network", rank: 57, name: "Pyth Network", symbol: "PYTH", price: 0.4234, change1h: 0.6, change24h: 3.5, change7d: 8.9, marketCap: 620000000, volume24h: 85000000, color: "#e6dafe", sparkline: [0.36, 0.37, 0.38, 0.39, 0.4, 0.41, 0.4234] },
  { id: "jupiter", rank: 58, name: "Jupiter", symbol: "JUP", price: 0.8912, change1h: 1.1, change24h: 4.8, change7d: 10.4, marketCap: 1100000000, volume24h: 220000000, color: "#12ca93", sparkline: [0.75, 0.78, 0.8, 0.82, 0.84, 0.87, 0.8912] },
  { id: "ondo", rank: 59, name: "Ondo Finance", symbol: "ONDO", price: 1.34, change1h: -0.1, change24h: 2.1, change7d: 5.6, marketCap: 1900000000, volume24h: 150000000, color: "#1a73e8", sparkline: [1.2, 1.22, 1.25, 1.27, 1.3, 1.32, 1.34] },
  { id: "floki", rank: 60, name: "Floki", symbol: "FLOKI", price: 0.00018901, change1h: 1.8, change24h: 9.4, change7d: 21.3, marketCap: 1800000000, volume24h: 320000000, color: "#f5a623", sparkline: [0.00014, 0.00015, 0.000155, 0.00016, 0.000165, 0.000175, 0.00018901] },
];

const ITEMS_PER_PAGE = 20;
const LIVE_MARKET_REFRESH_INTERVAL_MS = 60_000;
const LIVE_MARKET_RETRY_INTERVAL_MS = 5_000;

type SortKey =
  | "rank"
  | "name"
  | "price"
  | "change1h"
  | "change24h"
  | "change7d"
  | "marketCap"
  | "volume24h";
type SortDir = "asc" | "desc";
type OptimisticWatchlistAction =
  | {
      type: "toggle";
      coinId: string;
      shouldWatch: boolean;
    }
  | {
      type: "replace";
      ids: Set<string>;
    };

function ChangeCell({ value }: { value: number | null }) {
  if (value === null || Number.isNaN(value)) {
    return <span className="font-medium tabular-nums text-muted-foreground">-</span>;
  }

  return (
    <span
      className={`font-medium tabular-nums ${
        value >= 0 ? "text-green-400" : "text-red-400"
      }`}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}


function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = currentKey === sortKey;

  return (
    <TableHead
      className={`cursor-pointer select-none text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-end gap-1">
        <span>{label}</span>
        <div className="flex flex-col -space-y-1">
          <ChevronUp
            className={`h-3 w-3 ${
              isActive && currentDir === "asc"
                ? "text-cyan-400"
                : "text-muted-foreground/30"
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 ${
              isActive && currentDir === "desc"
                ? "text-cyan-400"
                : "text-muted-foreground/30"
            }`}
          />
        </div>
      </div>
    </TableHead>
  );
}

function getFallbackBadgeColor(color?: string | null) {
  if (!color || color === "#000000") {
    return "#374151";
  }

  return color;
}

function getNumericValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return Number.NEGATIVE_INFINITY;
  }

  return value;
}

export default function CoinTable({
  coinsData = allMockCoins,
  isWatchlist = false,
  watchlistedCoinIds = [],
  isLoggedIn = false,
  onToggle,
  onToggleSuccess,
  initialMarketSnapshot = null,
  marketPage = 1,
}: {
  coinsData?: CoinMarketMock[];
  isWatchlist?: boolean;
  watchlistedCoinIds?: string[];
  isLoggedIn?: boolean;
  onToggle?: (coinId: string) => void;
  onToggleSuccess?: (coinId: string, action: "added" | "removed") => void;
  initialMarketSnapshot?: MarketTableSnapshot | null;
  marketPage?: number;
}) {
  const initialOptimisticIds = useMemo(
    () => new Set(watchlistedCoinIds),
    [watchlistedCoinIds]
  );
  const [optimisticIds, setOptimisticIds] = useOptimistic(
    initialOptimisticIds,
    (currentValue, action: OptimisticWatchlistAction) => {
      if (action.type === "replace") {
        return action.ids;
      }

      const nextValue = new Set(currentValue);

      if (action.shouldWatch) {
        nextValue.add(action.coinId);
      } else {
        nextValue.delete(action.coinId);
      }

      return nextValue;
    }
  );
  const [, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [lastSuccessfulUpdatedAt, setLastSuccessfulUpdatedAt] = useState(
    initialMarketSnapshot?.lastUpdated ?? null
  );
  const shouldUseLiveMarketData = !isWatchlist && initialMarketSnapshot !== null;

  const { data: liveMarketSnapshot, error: liveMarketError, isValidating } =
    useSWR<MarketTableSnapshot>(
      shouldUseLiveMarketData ? `/api/market?page=${marketPage}` : null,
      fetchMarketTableSnapshot,
      {
        fallbackData: initialMarketSnapshot ?? undefined,
        refreshInterval: LIVE_MARKET_REFRESH_INTERVAL_MS,
        keepPreviousData: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryInterval: LIVE_MARKET_RETRY_INTERVAL_MS,
        onSuccess: (nextSnapshot) => {
          if (nextSnapshot.lastUpdated) {
            setLastSuccessfulUpdatedAt(nextSnapshot.lastUpdated);
          }
        },
        onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
          if (retryCount >= 5) {
            return;
          }

          setTimeout(() => {
            void revalidate({ retryCount });
          }, LIVE_MARKET_RETRY_INTERVAL_MS);
        },
      }
    );

  const resolvedCoinsData = liveMarketSnapshot?.marketData ?? coinsData;

  const handleStarClick = async (
    event: React.MouseEvent,
    coin: CoinMarketMock
  ) => {
    event.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Oops! Log in first to use this feature. Locked.");
      return;
    }

    const wasWatchlisted = optimisticIds.has(coin.id);

    setOptimisticIds({
      type: "toggle",
      coinId: coin.id,
      shouldWatch: !wasWatchlisted,
    });

    onToggle?.(coin.id);

    startTransition(async () => {
      const result = await toggleWatchlist(coin.id);

      if (!result.success) {
        setOptimisticIds({
          type: "toggle",
          coinId: coin.id,
          shouldWatch: wasWatchlisted,
        });
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (result.action === "added") {
        toast.success(`${coin.name ?? coin.symbol ?? "Coin"} added to Watchlist.`);
      } else {
        toast(`${coin.name ?? coin.symbol ?? "Coin"} removed from Watchlist.`);
      }

      if (result.action) {
        onToggleSuccess?.(coin.id, result.action);
      }
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((previousValue) =>
        previousValue === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const displayCoins = useMemo(() => {
    if (!isWatchlist) {
      return resolvedCoinsData;
    }

    return resolvedCoinsData.filter((coin) => optimisticIds.has(coin.id));
  }, [isWatchlist, optimisticIds, resolvedCoinsData]);

  const sortedCoins = useMemo(() => {
    const coins = [...displayCoins];

    coins.sort((left, right) => {
      let comparison = 0;

      switch (sortKey) {
        case "rank":
          comparison = getNumericValue(left.rank) - getNumericValue(right.rank);
          break;
        case "name":
          comparison = (left.name ?? "").localeCompare(right.name ?? "");
          break;
        case "price":
          comparison = getNumericValue(left.price) - getNumericValue(right.price);
          break;
        case "change1h":
          comparison =
            getNumericValue(left.change1h) - getNumericValue(right.change1h);
          break;
        case "change24h":
          comparison =
            getNumericValue(left.change24h) - getNumericValue(right.change24h);
          break;
        case "change7d":
          comparison =
            getNumericValue(left.change7d) - getNumericValue(right.change7d);
          break;
        case "marketCap":
          comparison =
            getNumericValue(left.marketCap) - getNumericValue(right.marketCap);
          break;
        case "volume24h":
          comparison =
            getNumericValue(left.volume24h) - getNumericValue(right.volume24h);
          break;
      }

      return sortDir === "asc" ? comparison : -comparison;
    });

    return coins;
  }, [displayCoins, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(displayCoins.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedCoins = sortedCoins.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  return (
    <section className="w-full pb-8">
      {shouldUseLiveMarketData ? (
        <div className="mb-3 flex items-center justify-between gap-3 px-4">
          <span className="text-xs font-medium text-muted-foreground">
            {liveMarketError
              ? "Refresh issue detected. Retrying shortly while keeping the last snapshot."
              : isValidating
                ? "Refreshing market data in the background..."
                : "Market data auto-refreshes every minute."}
          </span>
          <span className="whitespace-nowrap text-xs font-medium tabular-nums text-muted-foreground">
            Last updated:{" "}
            <span className="text-foreground/80">
              {lastSuccessfulUpdatedAt ?? "-"}
            </span>
          </span>
        </div>
      ) : null}

      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-slate-800 hover:bg-transparent">
              <TableHead className="w-10 pl-4 text-center text-muted-foreground/70">
                <Star className="mx-auto h-3.5 w-3.5" />
              </TableHead>
              <TableHead
                className="w-12 cursor-pointer select-none text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => handleSort("rank")}
              >
                <div className="flex items-center gap-1">
                  <span>#</span>
                  <div className="flex flex-col -space-y-1">
                    <ChevronUp
                      className={`h-3 w-3 ${
                        sortKey === "rank" && sortDir === "asc"
                          ? "text-cyan-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortKey === "rank" && sortDir === "desc"
                          ? "text-cyan-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead
                className="min-w-[180px] cursor-pointer select-none pl-2 text-left text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  <span>Coin</span>
                  <div className="flex flex-col -space-y-1">
                    <ChevronUp
                      className={`h-3 w-3 ${
                        sortKey === "name" && sortDir === "asc"
                          ? "text-cyan-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 ${
                        sortKey === "name" && sortDir === "desc"
                          ? "text-cyan-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </div>
                </div>
              </TableHead>
              <SortableHeader
                label="Price"
                sortKey="price"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="w-[120px] text-right"
              />
              <SortableHeader
                label="1h"
                sortKey="change1h"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="w-[90px] text-right"
              />
              <SortableHeader
                label="24h"
                sortKey="change24h"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="w-[90px] text-right"
              />
              <SortableHeader
                label="7d"
                sortKey="change7d"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="w-[90px] text-right"
              />
              <SortableHeader
                label="24h Volume"
                sortKey="volume24h"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="w-[160px] text-right"
              />
              <SortableHeader
                label="Market Cap"
                sortKey="marketCap"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="w-[160px] text-right"
              />
              <TableHead className="w-[130px] pr-4 text-right text-xs font-semibold text-muted-foreground">
                Last 7 Days
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCoins.length === 0 && isWatchlist ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={10} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center p-8">
                    <Star className="mb-3 h-10 w-10 text-slate-600" />
                    <p className="text-lg font-medium text-slate-300">
                      Your watchlist is empty
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Click the star icon next to a coin or add via the add coin
                      button to add it to your portfolio.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCoins.map((coin) => (
                <TableRow
                  key={coin.id}
                  className="cursor-pointer border-b border-slate-800 transition-colors hover:bg-slate-900/50"
                  onClick={() => {
                    window.location.href = `/coins/${coin.id}`;
                  }}
                >
                  <TableCell
                    className="py-4 pl-2 text-center sm:pl-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="group/star relative z-10 cursor-pointer p-1 outline-none"
                      onClick={(event) => handleStarClick(event, coin)}
                      aria-label={
                        optimisticIds.has(coin.id)
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                    >
                      <Star
                        className={`h-3.5 w-3.5 transition-all duration-200 ${
                          optimisticIds.has(coin.id)
                            ? "scale-110 fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30 group-hover/star:scale-110 group-hover/star:text-yellow-400"
                        }`}
                      />
                    </button>
                  </TableCell>

                  <TableCell className="px-1 py-4 text-sm font-medium tabular-nums text-muted-foreground/80 sm:px-3">
                    {coin.rank ?? "-"}
                  </TableCell>

                  <TableCell className="py-4 pl-1 text-left sm:pl-2">
                    <Link
                      href={`/coins/${coin.id}`}
                      className="flex w-full items-center gap-2 text-left"
                      prefetch={false}
                    >
                      {coin.image ? (
                        <Image
                          src={coin.image}
                          alt={`${coin.name ?? coin.symbol ?? "Coin"} logo`}
                          width={32}
                          height={32}
                          sizes="32px"
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
                          style={{
                            backgroundColor: getFallbackBadgeColor(coin.color),
                            boxShadow: `0 0 12px ${getFallbackBadgeColor(
                              coin.color
                            )}33`,
                          }}
                        >
                          {(coin.symbol ?? "?").slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-semibold leading-tight text-foreground">
                          {coin.name ?? "-"}
                        </p>
                        <p className="mt-0.5 text-xs uppercase leading-tight text-muted-foreground">
                          {coin.symbol ?? "-"}
                        </p>
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell className="px-1 py-4 text-right text-sm font-semibold tabular-nums text-foreground sm:px-3">
                    {formatUsdPrice(coin.price)}
                  </TableCell>

                  <TableCell className="py-4 text-right text-sm tabular-nums">
                    <ChangeCell value={coin.change1h} />
                  </TableCell>

                  <TableCell className="px-1 py-4 text-right text-sm tabular-nums sm:px-3">
                    <ChangeCell value={coin.change24h} />
                  </TableCell>

                  <TableCell className="py-4 text-right text-sm tabular-nums">
                    <ChangeCell value={coin.change7d} />
                  </TableCell>

                  <TableCell className="py-4 text-right text-sm font-medium tabular-nums text-muted-foreground/90">
                    {formatUsdWholeNumber(coin.volume24h)}
                  </TableCell>

                  <TableCell className="w-[160px] py-4 text-right text-sm font-medium tabular-nums text-muted-foreground/90">
                    {formatUsdWholeNumber(coin.marketCap)}
                  </TableCell>

                  <TableCell className="w-[130px] py-4 text-right">
                    <div className="flex justify-end pr-2">
                      {coin.sparkline && coin.sparkline.length > 1 ? (
                        <div className="w-[120px] h-[40px]">
                          <Sparkline
                            data={coin.sparkline}
                            isPositive={(coin.change7d ?? 0) >= 0 || (coin.change24h ?? 0) >= 0}
                            height={40}
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                          -
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
          disabled={activePage === 1}
          className="rounded-lg border border-border bg-card px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
        >
          <span className="sm:hidden">{"<"}</span>
          <span className="hidden sm:inline">{"<"} Previous</span>
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === activePage
                    ? "bg-cyan-600 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
          disabled={activePage === totalPages}
          className="rounded-lg border border-border bg-card px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
        >
          <span className="sm:hidden">{">"}</span>
          <span className="hidden sm:inline">Next {">"}</span>
        </button>
      </div>
    </section>
  );
}
