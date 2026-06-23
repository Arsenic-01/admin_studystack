// app/api/admin/user-sessions/[userId]/route.ts

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Define the activity threshold in minutes
const ACTIVITY_THRESHOLD_MINUTES = 30;

export interface UserSession {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  browser: string | null;
  os: string | null;
  isActive: boolean;
}

interface PostHogQueryResponse {
  results: [
    string,
    string,
    string | null,
    number | null,
    string | null,
    string | null,
  ][];
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Number.parseInt(searchParams.get("limit") ?? "10", 10);

  // 1. Replace 'offset' with 'cursor'
  const cursor = searchParams.get("cursor");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // 2. Conditionally add a HAVING clause if a cursor is provided
    const havingClause = cursor ? `HAVING min(timestamp) < {cursor}` : "";

    // 3. Remove OFFSET entirely and insert the havingClause
    const hogqlQuery = `
      SELECT
        properties.$session_id,
        min(timestamp) as start_time,
        max(timestamp) as end_time,
        date_diff('second', min(timestamp), max(timestamp)) as duration_seconds,
        any(properties.$browser) as browser,
        any(properties.$os) as os
      FROM events
      WHERE distinct_id = {userId}
      GROUP BY properties.$session_id
      ${havingClause}
      ORDER BY start_time DESC
      LIMIT ${limit}
    `;

    const apiUrl = `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`;

    // 4. Pass the cursor into the values object so PostHog can safely inject it
    const queryValues: Record<string, string> = { userId };
    if (cursor) {
      queryValues.cursor = cursor;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: hogqlQuery,
          values: queryValues,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      console.error("PostHog API Error:", errorBody);
      throw new Error(`PostHog API responded with status ${response.status}`);
    }

    const queryResponse: PostHogQueryResponse = await response.json();
    const now = new Date();

    const sessions: UserSession[] = queryResponse.results.map(
      ([id, start_time, end_time, duration_seconds, browser, os]) => {
        const lastSeen = new Date(end_time!);
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
        const isActive = diffMinutes < ACTIVITY_THRESHOLD_MINUTES;

        const currentDuration = isActive
          ? Math.round((now.getTime() - new Date(start_time).getTime()) / 1000)
          : duration_seconds;

        return {
          id,
          start_time,
          end_time,
          duration_seconds: currentDuration,
          browser,
          os,
          isActive,
        };
      },
    );

    // 5. Calculate the next cursor based on the last item in the results
    const nextCursor =
      sessions.length === limit
        ? sessions[sessions.length - 1].start_time
        : null;

    return NextResponse.json({
      sessions,
      hasNextPage: sessions.length === limit,
      nextCursor, // Return this so the frontend knows what to ask for next
    });
  } catch (error) {
    console.error(`Error fetching sessions for user ${userId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch user sessions" },
      { status: 500 },
    );
  }
}
