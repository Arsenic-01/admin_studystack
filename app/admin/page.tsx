// app/admin/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAdminDashboardStats,
  fetchRecentActivity,
} from "@/lib/actions/AdminFetching.actions";
import { BookOpen, FileText, Link as LinkIcon, Users } from "lucide-react";
import Link from "next/link";

import { DailyActiveUsersChart } from "@/components/admin_components/admin_revamp/DailyActiveUsersChart";
import { RecentActivityFeed } from "@/components/admin_components/admin_revamp/RecentActivityFeed";
import { TopContentList } from "@/components/admin_components/admin_revamp/TopContentList";
import { TopUsersList } from "@/components/admin_components/admin_revamp/TopUsersList"; // <-- Import the new component
import { UserRoleDistributionChart } from "@/components/admin_components/admin_revamp/UserRoleDistributionChart";

export default async function AdminOverviewPage() {
  const [dashboardStats, recentActivity] = await Promise.all([
    fetchAdminDashboardStats(),
    fetchRecentActivity(),
  ]);

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

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 xl:p-10 mb-20 mt-1 md:mt-0">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here’s an overview of your platform&#39;s performance.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card>
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

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Main Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <DailyActiveUsersChart />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UserRoleDistributionChart data={dashboardStats.userRoles} />
            <TopContentList />
          </div>
        </div>

        {/* Right Column: Activity Feed & Top Users */}
        <div className="lg:col-span-1 space-y-6">
          <RecentActivityFeed activities={recentActivity} />
          <TopUsersList />
        </div>
      </div>
    </main>
  );
}
