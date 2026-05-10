import React from "react";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number | string;
  height?: number | string;
}

export default function Sparkline({
  data,
  isPositive,
  width = "100%",
  height = 50,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((price, i) => ({ price, index: i }));
  const color = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide={true} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
