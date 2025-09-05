// components/admin_components/admin_revamp/TeacherContributionChart.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookUser, ChevronDown, Loader2 } from "lucide-react";
import * as React from "react";
import { Pie, PieChart } from "recharts";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TeacherContributionDetail } from "@/lib/actions/Admin.actions";

type ContributionType = keyof Omit<TeacherContributionDetail, "name">;

const contributionOptions: { value: ContributionType; label: string }[] = [
  { value: "total", label: "All Contributions" },
  { value: "notes", label: "Notes" },
  { value: "forms", label: "Forms & Quizzes" },
  { value: "youtube", label: "YouTube Links" },
];

const fetchContributions = async (): Promise<TeacherContributionDetail[]> => {
  const res = await fetch("/api/admin/stats/teacher-contributions");
  if (!res.ok) throw new Error("Failed to fetch teacher contributions");
  return res.json();
};

const generateChartConfig = (
  data: TeacherContributionDetail[]
): ChartConfig => {
  const config: ChartConfig = {
    notes: { label: "Notes" },
    forms: { label: "Forms" },
    youtube: { label: "YouTube" },
    total: { label: "Total" },
  };
  data.forEach((item, index) => {
    config[item.name] = {
      label: item.name,
      color: `var(--chart-${(index % 5) + 1})`,
    };
  });
  return config;
};

export function TeacherContributionChart() {
  const [type, setType] = React.useState<ContributionType>("total");

  const { data, isLoading, error } = useQuery<TeacherContributionDetail[]>({
    queryKey: ["teacherContributions"],
    queryFn: fetchContributions,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });

  const chartConfig = React.useMemo(
    () => (data ? generateChartConfig(data) : {}),
    [data]
  );

  const chartData = React.useMemo(() => {
    return (
      data
        ?.filter((item) => item[type] > 0) // Only show teachers with contributions of the selected type
        .map((item) => ({
          name: item.name,
          value: item[type],
          fill: chartConfig[item.name]?.color,
        })) || []
    );
  }, [data, type, chartConfig]);

  const totalContributions = React.useMemo(() => {
    return data?.reduce((acc, curr) => acc + curr[type], 0) || 0;
  }, [data, type]);

  const currentTypeLabel = contributionOptions.find(
    (opt) => opt.value === type
  )?.label;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <BookUser className="h-5 w-5" />
          Teacher Contributions
        </CardTitle>
        <CardDescription>
          Content submitted by each teacher, by type.
        </CardDescription>
        <div className="pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                {currentTypeLabel}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {contributionOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setType(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading && (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading...
          </div>
        )}
        {error && (
          <div className="flex h-[250px] flex-col items-center justify-center text-destructive">
            <AlertTriangle className="mb-2 h-8 w-8" />
            <p>Could not load contribution data.</p>
          </div>
        )}
        {data && chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[240px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              />
            </PieChart>
          </ChartContainer>
        ) : (
          !isLoading &&
          !error && (
            <div className="flex h-[240px] items-center justify-center text-muted-foreground">
              No contributions of this type.
            </div>
          )
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing a total of{" "}
          <strong>{totalContributions.toLocaleString()}</strong>{" "}
          {currentTypeLabel?.toLowerCase()}
        </div>
      </CardFooter>
    </Card>
  );
}
