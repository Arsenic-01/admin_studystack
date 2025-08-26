// components/admin_components/admin_revamp/RecentActivityFeed.tsx
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Clock,
  FileText,
  Link as LinkIcon,
  UserPlus,
  Youtube,
} from "lucide-react";

interface ActivityItem {
  type: "note" | "user" | "youtube" | "form";
  title: string;
  user: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

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

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
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
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground pr-2">
              <Activity className="h-8 w-8 mb-2" />
              <p>No recent activity to display.</p>
            </div>
          ) : (
            <div className="relative space-y-6 pr-2">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />

              {activities.map((activity, index) => {
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
