// lib/posthog.ts

import { PostHog } from "posthog-node";

// This function creates a new PostHog client instance for server-side use.
// It uses the secret POSTHOG_API_KEY.
function PostHogClient() {
  const posthogClient = new PostHog(process.env.POSTHOG_API_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // It's good practice to disable server-side feature flags if you're only using client-side ones.
    // This can prevent unnecessary requests.
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

// Create a singleton instance of the PostHog client to be reused across the server.
export const posthog = PostHogClient();
