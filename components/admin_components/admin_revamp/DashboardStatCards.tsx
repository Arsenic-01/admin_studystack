// components/admin_components/admin_revamp/DashboardStatCards.tsx

"use client";

import { useDashboardStats } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BookOpen,
  FileText,
  Link as LinkIcon,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DashboardStatCards() {
  const {
    data: dashboardStats,
    isLoading,
    isError,
    refetch,
  } = useDashboardStats();

  if (isLoading) {
    return <StatCardsSkeleton />;
  }

  if (isError || !dashboardStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-4">
          <Card className="flex min-h-[118px] w-full flex-col items-center justify-center border-2 border-dashed bg-muted/50 py-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-3 text-lg font-semibold text-destructive">
                Failed to Load Statistics
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                An error occurred while fetching the data.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetch()} // Add the retry action
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 4. Define the card data using the fetched stats
  const statCards = [
    {
      title: "Total Users",
      icon: Users,
      count: dashboardStats.totalUsers,
      href: "/admin/users",
    },
    {
      title: "Total Notes",
      icon: FileText,
      count: dashboardStats.totalNotes,
      href: "/admin/notes",
    },
    {
      title: "Total Links",
      icon: LinkIcon,
      count: dashboardStats.totalLinks,
      href: "/admin/links",
    },
    {
      title: "Total Subjects",
      icon: BookOpen,
      count: dashboardStats.totalSubjects,
      href: "/admin/subjects",
    },
  ];

  // 5. Render the final UI with the data
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Link href={card.href} key={card.title}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.count.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// A dedicated skeleton component for the stat cards
const StatCardsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-12" />
        </CardContent>
      </Card>
    ))}
  </div>
);
