// app/api/admin/user-sessions/[userId]/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Type for a single session we return to the frontend
export interface UserSession {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  browser: string | null;
  os: string | null;
}

// Type for a single row returned by PostHog query
type PostHogSessionRow = [
  id: string,
  start_time: string,
  end_time: string | null,
  duration_seconds: number | null,
  browser: string | null,
  os: string | null
];

// Expected shape of PostHog query response
interface PostHogQueryResponse {
  results: PostHogSessionRow[];
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 10);
  const offset = Number(searchParams.get("offset") ?? 0);

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const hogqlQuery = `
      SELECT
        session_id,
        min(timestamp) as start_time,
        max(timestamp) as end_time,
        date_diff('second', min(timestamp), max(timestamp)) as duration_seconds,
        any(properties.$browser) as browser,
        any(properties.$os) as os
      FROM events
      WHERE person_id = '${userId}'
      GROUP BY session_id
      ORDER BY start_time DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const apiUrl = `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: { kind: "HogQLQuery", query: hogqlQuery },
      }),
    });

    if (!response.ok) {
      throw new Error(`PostHog API responded with status ${response.status}`);
    }

    const queryResponse: PostHogQueryResponse = await response.json();

    const sessions: UserSession[] = queryResponse.results.map(
      (row: PostHogSessionRow): UserSession => ({
        id: row[0],
        start_time: row[1],
        end_time: row[2],
        duration_seconds: row[3],
        browser: row[4],
        os: row[5],
      })
    );

    return NextResponse.json({
      sessions,
      hasNextPage: sessions.length === limit,
    });
  } catch (error) {
    console.error(`Error fetching sessions for user ${userId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch user sessions" },
      { status: 500 }
    );
  }
}
