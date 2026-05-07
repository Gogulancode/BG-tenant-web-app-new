import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrencyINR, formatPercent } from "@/lib/utils";
import type { WeeklySalesSummaryItem } from "@/lib/api";

interface SalesTrendChartProps {
  items: WeeklySalesSummaryItem[];
  className?: string;
}

interface ChartDataItem {
  week: string;
  weekNum: number;
  target: number;
  achieved: number;
  achievementPercent: number;
  stageName: string | null;
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: ChartDataItem }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-semibold text-sm mb-2">{label}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Target:</span>
          <span className="font-medium">{formatCurrencyINR(data.target)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Achieved:</span>
          <span className="font-medium">{formatCurrencyINR(data.achieved)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-transparent" />
          <span className="text-muted-foreground">Achievement:</span>
          <span className="font-medium">{formatPercent(data.achievementPercent, 1)}</span>
        </div>
        {data.stageName && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-transparent" />
            <span className="text-muted-foreground">Stage:</span>
            <span className="font-medium">{data.stageName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SalesTrendChartComponent({ items, className }: SalesTrendChartProps) {
  const chartData = useMemo<ChartDataItem[]>(() => {
    return items.map((item) => ({
      week: `W${item.week}`,
      weekNum: item.week,
      target: item.target,
      achieved: item.achieved,
      achievementPercent: item.achievementPercent,
      stageName: item.stage?.name ?? null,
    }));
  }, [items]);

  // Calculate Y-axis domain for better visualization
  const yAxisMax = useMemo(() => {
    const maxValue = Math.max(
      ...items.map((item) => Math.max(item.target, item.achieved))
    );
    // Round up to nearest 10000 for cleaner axis
    return Math.ceil(maxValue / 10000) * 10000 || 10000;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for the selected range
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value)
            }
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            domain={[0, yAxisMax]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="target"
            name="Target"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="achieved"
            name="Achieved"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export const SalesTrendChart = React.memo(SalesTrendChartComponent);
