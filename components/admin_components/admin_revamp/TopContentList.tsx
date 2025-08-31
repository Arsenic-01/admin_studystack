// components/admin_components/admin_revamp/TopContentList.tsx
"use client";
import { useMemo } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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

// API fetching function remains the same
const fetchTopPages = async () => {
  const res = await fetch("/api/admin/trends/top-pages");
  if (!res.ok) throw new Error("Failed to fetch top pages");
  // Assuming the API returns an array of objects like { path: string, visitors: number }
  return res.json();
};

// Updated chart configuration for a new look
const chartConfig = {
  visitors: {
    label: "visitors",
    color: "var(--chart-6)",
  },
  label: {
    color: "var(--color-5)",
  },
} satisfies ChartConfig;

export function TopContentList() {
  const { data, isLoading, error } = useQuery<
    { path: string; visitors: number }[]
  >({
    queryKey: ["topPages"],
    queryFn: fetchTopPages,
    staleTime: 1000 * 60 * 5,
  });

  // Memoize the formatted data to prevent recalculation on every render
  const formattedData = useMemo(() => {
    if (!data) return [];

    // This helper function makes long paths more readable.
    // You can adjust the logic based on your specific URL structure.
    const formatPath = (path: string) =>
      path
        .replace(/^\/notes\//i, "") // Remove common prefixes
        .replace(/^\//, "")
        .replace(/-/g, " ") // Replace hyphens with spaces
        .split("/")
        .map((part) =>
          part.length > 20 ? `${part.substring(0, 18)}...` : part
        ) // Truncate long parts
        .join(" / ");

    return data.map((item) => ({
      ...item,
      formattedPath: formatPath(item.path),
    }));
  }, [data]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="h-5 w-5" />
          Most Viewed Content
        </CardTitle>
        <CardDescription>Top 5 most visited pages by users.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading...
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Could not load content data.</p>
          </div>
        )}
        {data && data.length === 0 && (
          <div className="flex flex-col items-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2" />
            <p>Not enough content data yet.</p>
          </div>
        )}
        {/* The updated chart visualization */}
        {formattedData && formattedData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={formattedData}
              layout="vertical"
              margin={{
                left: 10,
                right: 50, // Added more margin for the numeric label on the right
              }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="path" type="category" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="visitors" fill="var(--color-visitors)" radius={5}>
                {/* Label for the page path, displayed inside the bar */}
                <LabelList
                  dataKey="formattedPath"
                  position="insideLeft"
                  offset={8}
                  className="fill-cyan-100 font-medium"
                  fontSize={12}
                />
                {/* Label for the view count, displayed outside the bar */}
                <LabelList
                  dataKey="visitors"
                  position="right"
                  offset={8}
                  className="fill-foreground font-semibold"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
