"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Image from "next/image";

interface CustomPriceChartProps {
  coinId: string;
  timeframe: string;
}

export default function CustomPriceChart({ coinId, timeframe }: CustomPriceChartProps) {
  const [data, setData] = useState<{ date: number; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartError, setChartError] = useState(false);

  useEffect(() => {
    let days = "30";
    switch (timeframe) {
      case "24H":
        days = "1";
        break;
      case "7D":
        days = "7";
        break;
      case "1M":
        days = "30";
        break;
      case "3M":
        days = "90";
        break;
      case "YTD": {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startOfYear.getTime());
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
        break;
      }
      case "1Y":
        days = "365";
        break;
    }

    const fetchData = async () => {
      setLoading(true);
      setChartError(false);
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const json = await response.json();
        
        if (json.prices) {
          const formattedData = json.prices.map(([timestamp, price]: [number, number]) => ({
            date: timestamp,
            price: price,
          }));
          setData(formattedData);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coinId, timeframe]);

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    if (timeframe === "24H") {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (timeframe === "7D" || timeframe === "1M") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[350px]">
        <p className="text-slate-400 text-sm">Rate limit exceeded. Please wait a moment.</p>
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const padding = (maxPrice - minPrice) * 0.05;

  const formatYAxis = (value: number) => {
    if (value < 0.01) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(value);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  return (
    <div className="relative w-full h-full p-4">
      <div className="absolute bottom-14 left-4 flex items-center gap-1 opacity-60 pointer-events-none select-none z-0">
        <Image
          src="/icon.svg"
          alt="CoinWeton"
          width={36}
          height={36}
          className="w-6 h-6 sm:w-9 sm:h-9"
        />
        <Image
          src="/text5.svg"
          alt="CoinWeton"
          width={124}
          height={28}
          className="h-4 sm:h-[22px] w-auto"
        />
      </div>
      <div className="w-full h-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              minTickGap={30}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              orientation="right"
              dataKey="price"
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={formatYAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickMargin={5}
              width={60}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={false}
              dot={(props) => renderCustomDot({ ...props, dataLength: data.length })}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomDot = (props: any) => {
  const { cx, cy, index, dataLength } = props;
  if (index === dataLength - 1) {
    return (
      <g key={`custom-dot-${index}`}>
        {/* Inner strong dot */}
        <circle cx={cx} cy={cy} r={4.5} fill="#06b6d4" className="z-10" />
        {/* Amplified Outer Glow */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={12} 
          fill="rgba(34, 211, 238, 0.4)" 
          stroke="#22d3ee" 
          strokeWidth={1.5} 
          className="animate-pulse" 
        />
      </g>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const dateStr = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return (
      <div className="bg-[#1e293b] border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-xs mb-1">
          {dateStr}
        </p>
        <p className="text-white font-medium text-sm">
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </p>
      </div>
    );
  }
  return null;
};
