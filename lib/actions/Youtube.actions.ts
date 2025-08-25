"use server";

import { DATABASE_ID, db, YOUTUBE_COLLECTION_ID } from "../appwrite";

export async function editYoutubeLink({
  id,
  youtubeLink,
  title,
}: {
  id: string;
  youtubeLink: string;
  title: string;
}) {
  try {
    await db.updateDocument(DATABASE_ID!, YOUTUBE_COLLECTION_ID!, id, {
      url: youtubeLink,
      title: title,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating YouTube link:", error);
    return { success: false, error: "Failed to update link." };
  }
}

export async function deleteYoutubeLink({ id }: { id: string }) {
  try {
    await db.deleteDocument(DATABASE_ID!, YOUTUBE_COLLECTION_ID!, id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting YouTube link:", error);
    return { success: false, error: "Failed to delete link." };
  }
}
