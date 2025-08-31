import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The shape of the data returned by the PostHog query
interface PostHogQueryResponse {
  results: [string | null, string | null, number][];
}

// The final formatted shape for our API response
interface TopUser {
  name: string;
  activity: number;
}

export async function GET() {
  try {
    // This query now counts the number of *distinct URLs* a user has visited.
    const hogqlQuery = `
      SELECT
        person.properties.name as name,
        person.properties.email as email,
        -- MODIFICATION: Use count(DISTINCT ...) to count unique pages
        count(DISTINCT properties.$current_url) as unique_pageviews
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
        -- MODIFICATION: Order by the new unique_pageviews count
        unique_pageviews DESC
      LIMIT 5
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
      const errorBody = await response.text();
      console.error("PostHog API Error:", errorBody);
      throw new Error(`PostHog API responded with status ${response.status}`);
    }

    const queryResponse: PostHogQueryResponse = await response.json();

    const formattedData: TopUser[] = queryResponse.results.map(
      ([name, email, unique_pageviews]) => ({
        // Use name, fallback to email, then to "Unknown"
        name: name ?? email ?? "Unknown",
        // This 'activity' now represents the count of unique pages visited
        activity: unique_pageviews,
      })
    );

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(
      "Error fetching top users by unique page views from PostHog:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch top users" },
      { status: 500 }
    );
  }
}
