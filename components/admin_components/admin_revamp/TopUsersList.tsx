// components/admin_components/admin_revamp/TopUsersList.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Award, Loader2, AlertTriangle, Activity, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Function to get initials from a name
const getInitials = (name: string) => {
  if (!name) return "??";
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name.substring(0, 2);
};

// The fetcher function for React Query
const fetchTopUsers = async () => {
  const res = await fetch("/api/admin/trends/top-users");
  if (!res.ok) throw new Error("Failed to fetch top users");
  return res.json();
};

export function TopUsersList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["topUsers"],
    queryFn: fetchTopUsers,
    // This tells React Query the data is fresh for 5 minutes,
    // preventing refetches on window focus during this time.
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Top Active Users
        </CardTitle>
        <CardDescription>Most active users in the last 7 days.</CardDescription>
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
            <p>Could not load user data.</p>
          </div>
        )}
        {data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p>No user activity yet.</p>
          </div>
        )}
        {data && data.length > 0 && (
          <div className="space-y-4">
            {data.map(
              (user: { name: string; activity: number }, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user.name}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 mr-1.5" />
                    {user.activity.toLocaleString()}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
