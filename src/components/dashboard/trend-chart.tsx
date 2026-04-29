"use client";

import { useMemo } from "react";
import { UtmLink } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface TrendChartProps {
  links: UtmLink[];
}

export function TrendChart({ links }: TrendChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dailyCounts[dateStr] = 0;
    }

    links.forEach((link) => {
      const dateStr = new Date(link.createdAt).toISOString().split("T")[0];
      if (dateStr in dailyCounts) {
        dailyCounts[dateStr]++;
      }
    });

    return Object.entries(dailyCounts).map(([dateString, count]) => ({
      dateString,
      displayDate: new Date(dateString + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count
    }));
  }, [links]);

  return (
    <div className="bg-white border border-border rounded-[10px] p-6 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-indigo-950">Link Generation Trend</h2>
        <p className="text-sm text-neutral-500">Trailing 30 Days</p>
      </div>

      <div className="h-[280px] w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E7FF" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              dy={10}
              minTickGap={20}
            />
            <YAxis 
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
            />
            <Tooltip
              contentStyle={{ 
                borderRadius: "8px", 
                border: "1px solid #E0E7FF",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                color: "#1a1a1a"
              }}
              labelStyle={{ color: "#6B7280", marginBottom: "4px" }}
              itemStyle={{ color: "#4F46E5", fontWeight: 600 }}
              cursor={{ stroke: "#E0E7FF", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Links Created"
              stroke="#4F46E5"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#4F46E5", stroke: "#FFF", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
