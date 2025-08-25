// components/admin_components/admin_revamp/DailyActiveUsersChart.tsx
"use client";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Loader2, AlertTriangle } from "lucide-react";

const fetchDAU = async () => {
  const res = await fetch("/api/admin/trends/daily-active-users");
  if (!res.ok) throw new Error("Failed to fetch daily active users");
  return res.json();
};

const chartConfig = {
  users: {
    label: "Unique Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DailyActiveUsersChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dailyActiveUsers"],
    queryFn: fetchDAU,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weekly Active Users
        </CardTitle>
        <CardDescription>
          Unique users who visited the platform each day in the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="pr-3 pl-0">
        {isLoading && (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading
            Analytics...
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-[250px] text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Could not load analytics data.</p>
          </div>
        )}
        {data && (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12, top: 10 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-users)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-users)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="users"
                type="natural"
                fill="url(#fillUsers)"
                stroke="var(--color-users)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
