// components/admin_components/admin_helper_components/UserLogsDialog.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Laptop,
  Smartphone,
  Clock,
  ServerCrash,
  Terminal,
  Calendar,
} from "lucide-react";
import type { UserSession } from "@/app/api/admin/user-sessions/[userId]/route";

// Helper function to format duration from seconds into a readable string
const formatDuration = (seconds: number | null) => {
  if (seconds === null) return "N/A";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

// Fetcher function for React Query
const fetchUserSessions = async ({
  pageParam = 0,
  userId,
}: {
  pageParam: number;
  userId: string;
}) => {
  const res = await fetch(
    `/api/admin/user-sessions/${userId}?offset=${pageParam}&limit=10`
  );
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
};

export function UserLogsDialog({
  user,
  open,
  onClose,
}: {
  user: { id: string; name: string } | null;
  open: boolean;
  onClose: () => void;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["user-sessions", user?.id],
    queryFn: ({ pageParam }) =>
      fetchUserSessions({ pageParam, userId: user!.id }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasNextPage ? allPages.length * 10 : undefined;
    },
    initialPageParam: 0,
    enabled: !!user && open, // Only fetch when the dialog is open with a user
  });

  const allSessions = data?.pages.flatMap((page) => page.sessions) ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Session History: <span className="text-primary">{user?.name}</span>
          </DialogTitle>
          <DialogDescription>
            A log of recent sessions for this user, pulled from analytics.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4 -mr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 text-destructive">
              <ServerCrash className="h-10 w-10 mb-2" />
              <p>Could not load session data.</p>
            </div>
          ) : allSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Clock className="h-10 w-10 mb-2" />
              <p>No session history found for this user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allSessions.map((session: UserSession) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {session.os?.toLowerCase().includes("windows") ? (
                      <Laptop />
                    ) : (
                      <Smartphone />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {session.browser || "Unknown"} on{" "}
                      {session.os || "Unknown OS"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {format(
                        new Date(session.start_time),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatDuration(session.duration_seconds)}
                  </Badge>
                </div>
              ))}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
