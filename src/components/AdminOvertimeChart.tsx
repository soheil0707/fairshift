"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface AdminOvertimeChartProps {
  data: Array<{
    date: string;
    regularHours: number;
    overtimeHours: number;
  }>;
}

export default function AdminOvertimeChart({ data }: AdminOvertimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No overtime shift logs available for this period.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              borderRadius: "12px",
              border: "none",
              fontSize: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number, name: string) => [
              `${value} hrs`,
              name === "regularHours" ? "Regular (Standard)" : "Overtime (2.0x Rate)",
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
            formatter={(val: string) => (val === "regularHours" ? "Regular Hours" : "Overtime Hours (2x)")}
          />
          <Bar
            dataKey="regularHours"
            name="regularHours"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
          <Bar
            dataKey="overtimeHours"
            name="overtimeHours"
            fill="#d97706"
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
