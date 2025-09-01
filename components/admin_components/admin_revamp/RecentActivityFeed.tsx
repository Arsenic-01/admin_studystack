// components/admin_components/admin_revamp/RecentActivityFeed.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentActivity } from "@/hooks/useAdminData";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  Link as LinkIcon,
  UserPlus,
  Youtube,
} from "lucide-react";

// Configuration for each activity type for better styling and icons
const activityConfig = {
  note: {
    icon: FileText,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    badge: "Note",
    badgeVariant: "default" as const,
  },
  user: {
    icon: UserPlus,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-600 dark:text-green-400",
    badge: "User",
    badgeVariant: "secondary" as const,
  },
  youtube: {
    icon: Youtube,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-600 dark:text-red-400",
    badge: "YouTube",
    badgeVariant: "destructive" as const,
  },
  form: {
    icon: LinkIcon,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    badge: "Form",
    badgeVariant: "outline" as const,
  },
};

export function RecentActivityFeed() {
  const { data: activities, isLoading, isError } = useRecentActivity();

  // 4. Render a skeleton loader while the data is being fetched
  if (isLoading) {
    return <ActivityFeedSkeleton />;
  }

  // 5. Render an error message if the fetch fails
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-destructive pr-2">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Failed to load activity.</p>
            <p className="text-sm text-center">
              Please try refreshing the page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest activities across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[343px] pr-4">
          {activities?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground pr-2">
              <Activity className="h-8 w-8 mb-2" />
              <p>No recent activity to display.</p>
            </div>
          ) : (
            <div className="relative space-y-6 pr-2">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />

              {activities?.map((activity, index) => {
                const config = activityConfig[activity.type];
                const Icon = config.icon;

                return (
                  <div
                    key={index}
                    className="relative flex items-start gap-4 group pl-1"
                  >
                    {/* Timeline Dot with Icon */}
                    <div className="z-5 flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-full ${config.bgColor}`}
                      >
                        <Icon className={`h-4 w-4 ${config.textColor}`} />
                      </span>
                    </div>
                    {/* Activity Content */}
                    <div className="flex-1 space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={config.badgeVariant}
                          className="text-xs"
                        >
                          {config.badge}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

const ActivityFeedSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest activities across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[343px] pr-4">
          <div className="relative space-y-6 pr-2">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative flex items-start gap-4 pl-1">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
