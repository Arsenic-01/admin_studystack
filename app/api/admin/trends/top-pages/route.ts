// app/api/admin/trends/top-pages/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PostHogQueryResponse {
  results: [string, number][]; // each row = [url, views]
}

interface PageView {
  path: string;
  views: number;
}

export async function GET() {
  try {
    // HogQL query to get the top 5 most viewed pages
    const hogqlQuery = `
      SELECT
        properties."$current_url",
        count() as views
      FROM
        events
      WHERE
        event = '$pageview' AND
        properties."$current_url" IS NOT NULL AND
        properties."$current_url" NOT LIKE '%/admin%'
      AND properties."$current_url" NOT LIKE '%://%/'
      AND properties."$current_url" != '/'
      GROUP BY
        properties."$current_url"
      ORDER BY
        views DESC
      LIMIT 5
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

    if (!response.ok)
      throw new Error(`PostHog API responded with status ${response.status}`);

    const queryResponse: PostHogQueryResponse = await response.json();

    const aggregated = queryResponse.results
      .map<PageView>(([rawPath, views]) => {
        let path = rawPath;

        // Normalize path: try to extract pathname if it's a full URL
        try {
          path = new URL(path).pathname;
        } catch {
          // already just a pathname
        }

        // Remove trailing slashes (so `/home/` = `/home`)
        if (path.length > 1 && path.endsWith("/")) {
          path = path.slice(0, -1);
        }

        return { path, views };
      })
      .reduce<Record<string, number>>((acc, { path, views }) => {
        acc[path] = (acc[path] || 0) + views;
        return acc;
      }, {});

    // Convert back to array + sort + top 5
    const uniqueData: PageView[] = Object.entries(aggregated)
      .map(([path, views]) => ({ path, views }))
      .filter((item) => item.path !== "/") // exclude homepage
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return NextResponse.json<PageView[]>(uniqueData);
  } catch (error) {
    console.error("Error fetching top pages from PostHog:", error);
    return NextResponse.json(
      { error: "Failed to fetch top pages" },
      { status: 500 }
    );
  }
}
