// components/admin_components/admin_revamp/TopContentList.tsx
"use client";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
import { Loader2, AlertTriangle, FileText, BarChartIcon } from "lucide-react";

const fetchTopPages = async () => {
  const res = await fetch("/api/admin/trends/top-pages");
  if (!res.ok) throw new Error("Failed to fetch top pages");
  return res.json();
};

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig;

export function TopContentList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["topPages"],
    queryFn: fetchTopPages,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" />
          Most Viewed Content
        </CardTitle>
        <CardDescription>Top 5 most visited pages by users.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading...
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-[200px] text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Could not load content data.</p>
          </div>
        )}
        {data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <FileText className="h-8 w-8 mb-2" />
            <p>Not enough content data yet.</p>
          </div>
        )}
        {data && data.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 10 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="path"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={80}
                fontSize={12}
                className="truncate"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="views" fill="var(--color-views)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
