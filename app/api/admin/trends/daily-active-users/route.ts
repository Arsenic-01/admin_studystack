// app/api/admin/trends/daily-active-users/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PostHogQueryResponse {
  // day (ISO string) + wau (unique users)
  results: [string, number][];
}

interface DailyActiveUser {
  date: string;
  users: number;
}

export async function GET() {
  try {
    const hogqlQuery = `
      SELECT 
        toStartOfDay(timestamp) as day,
        count(DISTINCT person_id) as wau
      FROM events
      WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY
      GROUP BY day
      ORDER BY day ASC
    `;

    const apiUrl = `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: { kind: "HogQLQuery", query: hogqlQuery },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Error response from PostHog API:", errorData);
      throw new Error(`PostHog API responded with status ${response.status}`);
    }

    const queryResponse: PostHogQueryResponse = await response.json();

    const formattedData: DailyActiveUser[] = queryResponse.results.map(
      ([day, wau]) => ({
        date: new Date(day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        users: wau,
      })
    );

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching daily active users from PostHog:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily active users" },
      { status: 500 }
    );
  }
}
