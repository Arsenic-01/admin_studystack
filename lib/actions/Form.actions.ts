// lib/actions/Form.actions.ts

"use server";

import { DATABASE_ID, db, FORM_COLLECTION_ID } from "../appwrite";

export async function editFormLink({
  id,
  googleFormLink,
  quizName,
  formType,
}: {
  id: string;
  googleFormLink: string;
  quizName: string;
  formType: "googleForm" | "assignment" | "other";
}) {
  try {
    await db.updateDocument(DATABASE_ID!, FORM_COLLECTION_ID!, id, {
      url: googleFormLink,
      title: quizName,
      formType,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating Google Form link:", error);
    return { success: false, error: "Failed to update link." };
  }
}

export async function deleteFormLink({ id }: { id: string }) {
  try {
    await db.deleteDocument(DATABASE_ID!, FORM_COLLECTION_ID!, id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting Google Form link:", error);
    return { success: false, error: "Failed to delete link." };
  }
}
