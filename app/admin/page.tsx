// app/admin/page.tsx

import { DailyActiveUsersChart } from "@/components/admin_components/admin_revamp/DailyActiveUsersChart";
import { DashboardStatCards } from "@/components/admin_components/admin_revamp/DashboardStatCards";
import { DeviceUsersChart } from "@/components/admin_components/admin_revamp/DeviceUsersChart";
import { RecentActivityFeed } from "@/components/admin_components/admin_revamp/RecentActivityFeed";
import { TeacherContributionChart } from "@/components/admin_components/admin_revamp/TeacherContributionChart";
import { TopContentList } from "@/components/admin_components/admin_revamp/TopContentList";
import { TopUsersList } from "@/components/admin_components/admin_revamp/TopUsersList"; // <-- Import the new component
import { UserRoleDistributionChart } from "@/components/admin_components/admin_revamp/UserRoleDistributionChart";

export default async function AdminOverviewPage() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 xl:py-8 xl:px-10 mb-20 mt-1 md:mt-0">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here’s an overview of your platform&#39;s performance.
        </p>
      </div>

      {/* Top Stat Cards */}
      <DashboardStatCards />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Main Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <DailyActiveUsersChart />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UserRoleDistributionChart />
            <TopContentList />
          </div>
        </div>

        {/* Right Column: Activity Feed & Top Users */}
        <div className="lg:col-span-1 space-y-6">
          <RecentActivityFeed />
          <TopUsersList />
        </div>
        <div className="lg:col-span-2">
          <DeviceUsersChart />
        </div>
        <div className="lg:col-span-1">
          <TeacherContributionChart />
        </div>
      </div>
    </main>
  );
}
