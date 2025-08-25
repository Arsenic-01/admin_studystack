// lib/actions/Subjects.actions.ts
"use server";

import { DATABASE_ID, db, Query, SUBJECT_COLLECTION_ID } from "../appwrite";
import { Subject } from "../appwrite_types";
import { ID } from "node-appwrite";

// Fetches subjects with pagination and filtering for the client
export async function fetchPaginatedSubjects({
  limit = 10,
  offset = 0,
  search = "",
  semesterFilter = "all",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  semesterFilter?: string;
}) {
  try {
    const queries = [
      Query.orderAsc("semester"),
      Query.orderAsc("name"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (search && search.trim() !== "") {
      queries.push(Query.search("name", search));
    }

    if (semesterFilter && semesterFilter !== "all") {
      queries.push(Query.equal("semester", semesterFilter));
    }

    const response = await db.listDocuments(
      DATABASE_ID!,
      SUBJECT_COLLECTION_ID!,
      queries
    );

    return {
      documents: response.documents.map((doc) => ({
        subjectId: doc.$id,
        name: doc.name,
        abbreviation: doc.abbreviation,
        code: doc.code,
        semester: doc.semester,
        unit: doc.unit || [],
      })),
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching paginated subjects:", error);
    return { documents: [], total: 0 };
  }
}

// Fetches all unique semester values for the filter dropdown
export async function getSemesterOptions() {
  try {
    const response = await db.listDocuments(
      DATABASE_ID!,
      SUBJECT_COLLECTION_ID!,
      [Query.limit(100), Query.select(["semester"])]
    );

    const semesterOptions = [
      ...new Set(response.documents.map((doc) => doc.semester).filter(Boolean)),
    ];

    return semesterOptions.sort();
  } catch (error) {
    console.error("Error fetching semester options:", error);
    return [];
  }
}

// UPDATED: Server actions are now pure functions without revalidation
export const deleteSubject = async ({ subjectId }: { subjectId: string }) => {
  try {
    await db.deleteDocument(DATABASE_ID!, SUBJECT_COLLECTION_ID!, subjectId);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const updateSubject = async (subject: Subject) => {
  try {
    const { subjectId, ...updateData } = subject;
    await db.updateDocument(
      DATABASE_ID!,
      SUBJECT_COLLECTION_ID!,
      subjectId,
      updateData
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const createSubject = async (subject: Omit<Subject, "subjectId">) => {
  try {
    await db.createDocument(
      DATABASE_ID!,
      SUBJECT_COLLECTION_ID!,
      ID.unique(),
      subject
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
