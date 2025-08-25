// app/api/admin/trends/top-users/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PostHogQueryResponse {
  results: [string | null, string | null, number][];
}

interface TopUser {
  name: string;
  activity: number;
}

export async function GET() {
  try {
    const hogqlQuery = `
      SELECT
        person.properties.name as name,
        person.properties.email as email,
        count() as pageviews
      FROM
        events
      WHERE
        event = '$pageview' AND
        timestamp >= now() - INTERVAL 7 DAY AND
        person.properties.name IS NOT NULL
      GROUP BY
        person.properties.name,
        person.properties.email
      ORDER BY
        pageviews DESC
      LIMIT 5
    `;

    const apiUrl = `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_KEY ?? ""}`,
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

    const formattedData: TopUser[] = queryResponse.results.map(
      ([name, email, pageviews]) => ({
        name: name ?? email ?? "Unknown",
        activity: pageviews,
      })
    );

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching top users from PostHog:", error);
    return NextResponse.json(
      { error: "Failed to fetch top users" },
      { status: 500 }
    );
  }
}
