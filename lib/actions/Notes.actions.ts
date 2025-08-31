// lib/actions/Notes.actions.ts

"use server";

import { DATABASE_ID, db, NOTE_COLLECTION_ID } from "../appwrite";
import { getDriveClient } from "../googleDrive";

interface DeleteNoteParams {
  noteId: string;
  fileId: string;
}

export async function deleteNote({ noteId, fileId }: DeleteNoteParams) {
  try {
    const drive = await getDriveClient();
    await db.deleteDocument(DATABASE_ID!, NOTE_COLLECTION_ID!, noteId);
    await drive.files.delete({
      fileId: fileId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { success: false, error: "Failed to delete note." };
  }
}

export interface EditNotesModalFunctionProps {
  noteId: string;
  title: string;
  description: string;
  type_of_file: string;
}

export const editNotes = async (data: EditNotesModalFunctionProps) => {
  try {
    await db.updateDocument(DATABASE_ID!, NOTE_COLLECTION_ID!, data.noteId, {
      title: data.title,
      description: data.description,
      type_of_file: data.type_of_file,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating note:", error);
    return { success: false, error: "Failed to update note." };
  }
};
