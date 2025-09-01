"use client";

import * as React from "react";
import { User, Users, AlertCircle } from "lucide-react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import { useDashboardStats } from "@/hooks/useAdminData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Define the chart configuration with labels and colors for each role.
const chartConfig = {
  users: { label: "Users" },
  students: { label: "Students", color: "var(--chart-1)" },
  teachers: { label: "Teachers", color: "var(--chart-2)" },
  admins: { label: "Admins", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function UserRoleDistributionChart() {
  const { data: dashboardStats, isLoading, isError } = useDashboardStats();

  // Use the 'userRoles' part of the fetched data
  const data = dashboardStats?.userRoles;

  const id = "user-roles-interactive";

  // Transform the incoming data into the format needed by the chart
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return [
      { role: "students", count: data.students, fill: "var(--chart-1)" },
      { role: "teachers", count: data.teachers, fill: "var(--chart-2)" },
      { role: "admins", count: data.admins, fill: "var(--chart-3)" },
    ].filter((item) => item.count > 0);
  }, [data]);

  const [activeRole, setActiveRole] = React.useState("");

  // Effect to set the initial active role once data is loaded
  React.useEffect(() => {
    if (chartData.length > 0 && !activeRole) {
      setActiveRole(chartData[0].role);
    }
  }, [chartData, activeRole]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.role === activeRole),
    [activeRole, chartData]
  );
  const roles = React.useMemo(
    () => chartData.map((item) => item.role),
    [chartData]
  );
  const totalUsers = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.count, 0),
    [chartData]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError) {
    return (
      <Card className="flex flex-col h-full items-center justify-center">
        <div className="text-center text-destructive p-4">
          <AlertCircle className="mx-auto h-8 w-8" />
          <p className="mt-2 font-semibold">Error loading chart data.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      {/* ... The rest of your component's return JSX remains exactly the same ... */}
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            User Role Distribution
          </CardTitle>
          <CardDescription>
            Total users on the platform: {totalUsers}
          </CardDescription>
        </div>
        <Select value={activeRole} onValueChange={setActiveRole}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a role"
          >
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {roles.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];
              if (!config) return null;
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `oklch(var(--chart-${
                          roles.indexOf(key) + 1
                        }))`,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        {totalUsers === 0 ? (
          <div className="flex flex-col w-full items-center justify-center h-full text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p>No user data available.</p>
          </div>
        ) : (
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="role"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 5} />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {chartData[activeIndex]?.count.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {
                              chartConfig[
                                activeRole as keyof typeof chartConfig
                              ]?.label
                            }
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const ChartSkeleton = () => (
  <Card className="flex flex-col h-full">
    <CardHeader className="flex-row items-start space-y-0 pb-0">
      <div className="grid gap-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>
      <Skeleton className="ml-auto h-7 w-[130px] rounded-lg" />
    </CardHeader>
    <CardContent className="flex flex-1 justify-center items-center pb-0">
      <Skeleton className="h-[200px] w-[200px] rounded-full" />
    </CardContent>
  </Card>
);
