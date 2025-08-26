// app/api/admin/trends/device-users/route.ts
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface PostHogQueryResponse {
  results: [string, number, number][]; // [day, desktop_users, mobile_users]
}

interface DeviceUser {
  date: string;
  desktop: number;
  mobile: number;
}

function getInterval(period: string): string {
  switch (period) {
    case "1m":
      return "1 MONTH";
    case "3m":
      return "3 MONTH";
    case "1y":
      return "1 YEAR";
    default:
      return "1 MONTH"; // Default to 1 month
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "1m";
    const interval = getInterval(period);

    // UPDATED HOGQL QUERY:
    // 1. Counts DISTINCT person.properties.email for each device type.
    // 2. Adds a WHERE clause to ensure only identified users are counted.
    const hogqlQuery = `
      SELECT
        toStartOfDay(timestamp) as day,
        count(DISTINCT if(properties.$device_type = 'Desktop', person.properties.email, NULL)) as desktop_users,
        count(DISTINCT if(properties.$device_type = 'Mobile', person.properties.email, NULL)) as mobile_users
      FROM events
      WHERE 
        event = '$pageview' AND 
        timestamp >= now() - INTERVAL ${interval} AND
        person.properties.email IS NOT NULL
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

    const formattedData: DeviceUser[] = queryResponse.results.map(
      ([day, desktop, mobile]) => ({
        date: new Date(day).toISOString().split("T")[0],
        desktop: desktop,
        mobile: mobile,
      })
    );

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching device users from PostHog:", error);
    return NextResponse.json(
      { error: "Failed to fetch device users" },
      { status: 500 }
    );
  }
}
