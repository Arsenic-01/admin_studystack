"use server";

/**
 * Calls the revalidation endpoint on the main production app.
 * @param tag The cache tag to revalidate.
 */
export async function triggerRevalidation(tag: string) {
  const revalidationUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/revalidate`;
  const token = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;

  if (!token) {
    console.error("Revalidation token is not set.");
    return;
  }

  try {
    const res = await fetch(revalidationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tag }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Failed to revalidate: ${res.status} ${
          res.statusText
        } - ${JSON.stringify(errorData)}`
      );
    }

    const data = await res.json();
    console.log("Successfully revalidated:", data);
  } catch (error) {
    console.error("Error triggering revalidation:", error);
  }
}
