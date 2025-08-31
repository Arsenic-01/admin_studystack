import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The shape of the data returned by the PostHog query
interface PostHogQueryResponse {
  results: [string, number][]; // each row = [url, unique_user_count]
}

// The final formatted shape for our API response
interface PageView {
  path: string;
  visitors: number;
}

export async function GET() {
  try {
    // HogQL query to get the top pages by unique identified users (with email)
    const hogqlQuery = `
      SELECT
        properties."$current_url",
        -- MODIFICATION: Count distinct identified users by email
        count(DISTINCT person.properties.email) as visitors
      FROM
        events
      WHERE
        event = '$pageview' AND
        properties."$current_url" IS NOT NULL AND
        -- Only count users who have been identified with an email
        person.properties.email IS NOT NULL AND
        -- Exclude admin pages from the results
        properties."$current_url" NOT LIKE '%/admin%'
      GROUP BY
        properties."$current_url"
      ORDER BY
        visitors DESC
      -- Fetch more than 5 to account for URL normalization combining rows
      LIMIT 20
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

    // This logic normalizes paths (e.g., full URLs vs. relative paths) and aggregates the counts.
    const aggregated = queryResponse.results
      .map<PageView>(([rawPath, visitors]) => {
        let path = rawPath;
        try {
          path = new URL(path).pathname;
        } catch {
          // Path was already relative, no change needed.
        }
        // Remove trailing slashes for consistency (so `/about/` becomes `/about`)
        if (path.length > 1 && path.endsWith("/")) {
          path = path.slice(0, -1);
        }
        return { path, visitors };
      })
      .reduce<Record<string, number>>((acc, { path, visitors }) => {
        acc[path] = (acc[path] || 0) + visitors;
        return acc;
      }, {});

    // Convert the aggregated object back to an array, sort, and take the top 5
    const finalData: PageView[] = Object.entries(aggregated)
      .map(([path, visitors]) => ({ path, visitors }))
      // Exclude the homepage from the list of top pages
      .filter((item) => item.path !== "/")
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5);

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Error fetching top pages from PostHog:", error);
    return NextResponse.json(
      { error: "Failed to fetch top pages" },
      { status: 500 }
    );
  }
}
