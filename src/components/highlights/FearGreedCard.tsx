import { Card } from "@/components/ui/card";
import type { FearAndGreedData } from "@/lib/market-data";

export default function FearGreedCard({
  fearAndGreed,
}: {
  fearAndGreed: FearAndGreedData;
}) {
  const value = fearAndGreed.value;
  const safeValue = value ?? 0;
  const angle = -180 + (safeValue / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 60 + 44 * Math.cos(rad);
  const cy = 70 + 44 * Math.sin(rad);

  return (
    <Card className="flex h-full flex-row items-center border-[#1E293B] bg-background p-4 transition-colors hover:bg-slate-800/30">
      <div className="flex w-full items-center gap-6">
        <div className="relative w-24 shrink-0">
          <svg viewBox="0 0 120 75" className="w-full">
            {[
              { color: "#ef4444" },
              { color: "#f97316" },
              { color: "#eab308" },
              { color: "#84cc16" },
              { color: "#22c55e" },
            ].map((segment, index) => {
              const angleOffset = 8.5;
              const startAngle = -180 + index * 36 + angleOffset;
              const endAngle = -180 + (index + 1) * 36 - angleOffset;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = 60 + 44 * Math.cos(startRad);
              const y1 = 70 + 44 * Math.sin(startRad);
              const x2 = 60 + 44 * Math.cos(endRad);
              const y2 = 70 + 44 * Math.sin(endRad);

              return (
                <path
                  key={index}
                  d={`M ${x1.toFixed(2)} ${y1.toFixed(
                    2
                  )} A 44 44 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              );
            })}
            {value !== null && (
              <circle
                cx={cx}
                cy={cy}
                r="6"
                fill="white"
                stroke="#1e293b"
                strokeWidth="3"
              />
            )}
            <text
              x="60"
              y="68"
              textAnchor="middle"
              className="fill-white text-[24px] font-bold"
            >
              {value ?? "-"}
            </text>
          </svg>
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="mb-1 text-sm font-medium text-slate-400">
            Fear & Greed Index
          </h2>
          <span className="text-xl font-bold leading-none text-white">
            {fearAndGreed.label}
          </span>
        </div>
      </div>
    </Card>
  );
}
