"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon?: React.ReactNode;
  sparklineData?: number[];
}

const defaultSparkline = [30, 40, 35, 50, 49, 60, 70, 65, 80, 75, 90, 85];

export default function StatsCard({
  title,
  value,
  subtitle,
  accent = "text-mad-accent",
  change,
  changeType = "positive",
  icon,
  sparklineData = defaultSparkline,
}: StatsCardProps) {
  const chartColor = changeType === "positive" ? "#10b981" : "#ef4444";
  const chartData = sparklineData.map((v) => ({ v }));

  return (
    <div className="group rounded-2xl border border-mad-border bg-mad-surface p-4 sm:p-5 transition-all hover:border-mad-accent/30 hover:shadow-lg hover:shadow-mad-accent/5">
      <div className="mb-2 sm:mb-3 flex items-center justify-between">
        <p className="text-xs sm:text-sm font-medium text-mad-muted">{title}</p>
        {icon && (
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-mad-accent/10 text-mad-accent transition-colors group-hover:bg-mad-accent group-hover:text-white">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl sm:text-3xl font-bold ${accent}`}>{value}</p>
          {change && (
            <p
              className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs font-medium ${
                changeType === "positive" ? "text-green-500" : "text-red-500"
              }`}
            >
              {changeType === "positive" ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                </svg>
              )}
              {change}
            </p>
          )}
          {subtitle && <p className="mt-1 text-xs text-mad-muted">{subtitle}</p>}
        </div>
        <div className="h-12 w-24 opacity-60 transition-opacity group-hover:opacity-100">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
