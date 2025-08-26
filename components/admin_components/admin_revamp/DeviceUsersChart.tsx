// components/admin_components/admin_revamp/DeviceUsersChart.tsx
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  AlertTriangle,
  Smartphone,
  Monitor,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DeviceUser {
  date: string;
  desktop: number;
  mobile: number;
}

type Period = "1m" | "3m" | "1y";
type PeriodLabel = "Last month" | "Last 3 months" | "Last year";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
    icon: Monitor,
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
    icon: Smartphone,
  },
} satisfies ChartConfig;

type DeviceType = keyof typeof chartConfig;

const periodOptions: { value: Period; label: PeriodLabel }[] = [
  { value: "1m", label: "Last month" },
  { value: "3m", label: "Last 3 months" },
  { value: "1y", label: "Last year" },
];

const fetchDeviceUsers = async (period: Period): Promise<DeviceUser[]> => {
  const res = await fetch(`/api/admin/trends/device-users?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch device users");
  return res.json();
};

export function DeviceUsersChart() {
  const [period, setPeriod] = React.useState<Period>("1m");
  const [activeDevice, setActiveDevice] = React.useState<DeviceType>("desktop");

  const {
    data: chartData,
    isLoading,
    error,
  } = useQuery<DeviceUser[]>({
    queryKey: ["deviceUsers", period],
    queryFn: () => fetchDeviceUsers(period),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const total = React.useMemo(
    () => ({
      desktop: chartData?.reduce((acc, curr) => acc + curr.desktop, 0) || 0,
      mobile: chartData?.reduce((acc, curr) => acc + curr.mobile, 0) || 0,
    }),
    [chartData]
  );

  const currentPeriodLabel = periodOptions.find(
    (p) => p.value === period
  )?.label;

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <Smartphone className="h-5 w-5" />
            Desktop vs. Mobile Users
          </CardTitle>
          <CardDescription>Unique daily users by device type.</CardDescription>
        </div>
        <div className="flex items-center justify-end gap-2 sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[140px]">
                {currentPeriodLabel}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {periodOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setPeriod(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {isLoading && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading
              Analytics...
            </div>
          )}
          {error && (
            <div className="flex h-full flex-col items-center justify-center text-destructive">
              <AlertTriangle className="mb-2 h-8 w-8" />
              <p>Could not load analytics data.</p>
            </div>
          )}
          {chartData && (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 10, right: 12, left: -4 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Bar
                  dataKey={activeDevice}
                  fill={`var(--color-${activeDevice})`}
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <div className="flex items-center gap-4">
          {(Object.keys(chartConfig) as DeviceType[]).map((device) => {
            const isActive = activeDevice === device;
            return (
              <button
                key={device}
                onClick={() => setActiveDevice(device)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  isActive ? "bg-muted" : "bg-transparent hover:bg-muted/50"
                }`}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: chartConfig[device].color }}
                />
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    {chartConfig[device].label}
                  </span>
                  <span className="font-bold leading-none text-foreground">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      total[device].toLocaleString()
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
