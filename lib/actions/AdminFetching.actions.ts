// lib/actions/AdminFetching.actions.ts

"use server";

import {
  db,
  DATABASE_ID,
  USER_COLLECTION_ID,
  Query,
  NOTE_COLLECTION_ID,
  YOUTUBE_COLLECTION_ID,
  FORM_COLLECTION_ID,
  SUBJECT_COLLECTION_ID,
  CACHE_COLLECTION_ID,
  STATS_DOCUMENT_ID,
  functions,
  UPLOADERS_CACHE_DOCUMENT_ID,
} from "@/lib/appwrite";

export interface TeacherContributionDetail {
  name: string;
  notes: number;
  forms: number;
  youtube: number;
  total: number;
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function fetchAdminDashboardStats() {
  try {
    const [
      users,
      notes,
      youtubeLinks,
      formLinks,
      subjects,
      students,
      teachers,
      admins,
    ] = await Promise.all([
      db.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [Query.limit(1)]),
      db.listDocuments(DATABASE_ID!, NOTE_COLLECTION_ID!, [Query.limit(1)]),
      db.listDocuments(DATABASE_ID!, YOUTUBE_COLLECTION_ID!, [Query.limit(1)]),
      db.listDocuments(DATABASE_ID!, FORM_COLLECTION_ID!, [Query.limit(1)]),
      db.listDocuments(DATABASE_ID!, SUBJECT_COLLECTION_ID!, [Query.limit(1)]),
      db.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [
        Query.equal("role", "student"),
        Query.limit(1),
      ]),
      db.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [
        Query.equal("role", "teacher"),
        Query.limit(1),
      ]),
      db.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [
        Query.equal("role", "admin"),
        Query.limit(1),
      ]),
    ]);

    return {
      totalUsers: users.total,
      totalNotes: notes.total,
      totalYoutubeLinks: youtubeLinks.total,
      totalFormLinks: formLinks.total,
      totalSubjects: subjects.total,
      totalLinks: youtubeLinks.total + formLinks.total,
      userRoles: {
        students: students.total,
        teachers: teachers.total,
        admins: admins.total,
      },
      contentDistribution: {
        notes: notes.total,
        youtube: youtubeLinks.total,
        forms: formLinks.total,
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      totalNotes: 0,
      totalYoutubeLinks: 0,
      totalFormLinks: 0,
      totalSubjects: 0,
      totalLinks: 0,
      userRoles: { students: 0, teachers: 0, admins: 0 },
      contentDistribution: { notes: 0, youtube: 0, forms: 0 },
    };
  }
}

// ============================================
// RECENT ACTIVITY (NOW POWERED BY APPWRITE FUNCTION)
// ============================================

export async function fetchRecentActivity() {
  try {
    // 1. Call the Appwrite Function to get the accurately sorted recent activities
    const response = await functions.createExecution(
      process.env.APPWRITE_ACTIVITY_FUNC_ID!
    );

    if (response.responseStatusCode !== 200) {
      console.error("Appwrite function execution failed:", response);
      throw new Error("Failed to execute recent activity function");
    }

    // 2. Parse the response and return it
    return JSON.parse(response.responseBody);
  } catch (error) {
    console.error("Error fetching recent activity from function:", error);
    return []; // Return empty array as a fallback
  }
}

// ============================================
// PAGINATION & FILTER FUNCTIONS
// ============================================

export async function fetchPaginatedUsers({
  limit = 10,
  offset = 0,
  search = "",
  role = "all",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
}) {
  try {
    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];
    if (search && search.trim() !== "")
      queries.push(Query.search("name", search));
    if (role && role !== "all") queries.push(Query.equal("role", role));
    const response = await db.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      queries
    );
    return {
      documents: response.documents.map((doc) => ({
        id: doc.$id,
        prnNo: doc.prnNo,
        name: doc.name,
        role: doc.role as "admin" | "student" | "teacher",
        email: doc.email,
        createdAt: doc.$createdAt,
      })),
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    return { documents: [], total: 0 };
  }
}

export async function fetchPaginatedNotesForAdmin({
  limit = 10,
  offset = 0,
  search = "",
  typeFilter = "all",
  teacherFilter = "all",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  typeFilter?: string;
  teacherFilter?: string;
}) {
  try {
    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.offset(offset),
    ];
    if (search && search.trim() !== "")
      queries.push(Query.search("title", search));
    if (typeFilter && typeFilter !== "all")
      queries.push(Query.equal("type_of_file", typeFilter));
    if (teacherFilter && teacherFilter !== "all")
      queries.push(Query.equal("userName", teacherFilter));
    const response = await db.listDocuments(
      DATABASE_ID!,
      NOTE_COLLECTION_ID!,
      queries
    );
    return {
      documents: response.documents.map((doc) => ({
        noteId: doc.$id,
        title: doc.title,
        description: doc.description,
        createdAt: doc.$createdAt,
        fileId: doc.fileId,
        semester: doc.semester || "",
        type_of_file: doc.type_of_file || "",
        unit: doc.unit || [],
        users: {
          name: doc.userName || "Unknown User",
          userId: doc.userId || "",
        },
        abbreviation: doc.abbreviation || "",
        fileUrl: doc.fileUrl || "",
        mimeType: doc.mimeType || "",
        fileSize: doc.fileSize || "",
        thumbNail: doc.thumbNail || "",
      })),
      total: response.total,
    };
  } catch (error) {
    console.error("Error fetching paginated notes for admin:", error);
    return { documents: [], total: 0 };
  }
}
interface UploaderCache {
  all: string[];
  [subjectAbbreviation: string]: string[];
}

async function getUploaderOptions(): Promise<UploaderCache> {
  try {
    const document = await db.getDocument(
      DATABASE_ID!,
      CACHE_COLLECTION_ID!,
      UPLOADERS_CACHE_DOCUMENT_ID!
    );

    // The data is stored as a string, so we need to parse it
    if (document.data) {
      return JSON.parse(document.data) as UploaderCache;
    }

    return { all: [] }; // Return empty state if data is not available
  } catch (error) {
    console.error("Error fetching uploader cache:", error);
    // Return a default empty object on error so the UI doesn't crash
    return { all: [] };
  }
}

export async function getAllUploaders() {
  const options = await getUploaderOptions();
  return options.all || [];
}

export interface AdminLink {
  id: string;
  title: string;
  url: string;
  createdBy: string;
  abbreviation: string;
  semester: string;
  createdAt: string;
  type: "youtube" | "form";
  formType?: "googleForm" | "assignment" | "other";
}

export async function fetchPaginatedLinksForAdmin({
  limit = 10,
  offset = 0,
  search = "",
  typeFilter = "all",
  teacherFilter = "all",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  typeFilter?: string;
  teacherFilter?: string;
}) {
  try {
    let allLinks: AdminLink[] = [];
    let totalCount = 0;
    const buildQueries = (baseLimit: number, baseOffset: number) => {
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(baseLimit),
        Query.offset(baseOffset),
      ];
      if (search && search.trim() !== "")
        queries.push(Query.search("title", search));
      if (teacherFilter && teacherFilter !== "all")
        queries.push(Query.equal("createdBy", teacherFilter));
      return queries;
    };

    if (typeFilter === "all" || typeFilter === "youtube") {
      const youtubeResponse = await db.listDocuments(
        DATABASE_ID!,
        YOUTUBE_COLLECTION_ID!,
        buildQueries(limit, offset)
      );
      allLinks.push(
        ...youtubeResponse.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title,
          url: doc.url,
          createdBy: doc.createdBy,
          abbreviation: doc.abbreviation,
          semester: doc.semester,
          createdAt: doc.$createdAt,
          type: "youtube" as const,
        }))
      );
      totalCount += youtubeResponse.total;
    }

    if (typeFilter === "all" || typeFilter === "form") {
      const formResponse = await db.listDocuments(
        DATABASE_ID!,
        FORM_COLLECTION_ID!,
        buildQueries(limit, offset)
      );
      allLinks.push(
        ...formResponse.documents.map((doc) => ({
          id: doc.$id,
          title: doc.title,
          url: doc.url,
          createdBy: doc.createdBy,
          abbreviation: doc.abbreviation,
          semester: doc.semester,
          createdAt: doc.$createdAt,
          type: "form" as const,
          formType: doc.formType,
        }))
      );
      totalCount += formResponse.total;
    }

    allLinks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (typeFilter === "all") allLinks = allLinks.slice(offset, offset + limit);
    return { documents: allLinks, total: totalCount };
  } catch (error) {
    console.error("Error fetching paginated links for admin:", error);
    return { documents: [], total: 0 };
  }
}

export async function getLinksFilterOptions() {
  try {
    const response = await db.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [
      Query.equal("role", "teacher"),
      Query.limit(100),
      Query.select(["name"]),
    ]);
    const teacherOptions = [
      ...new Set(response.documents.map((doc) => doc.name).filter(Boolean)),
    ];
    teacherOptions.sort();
    return { teacherOptions };
  } catch (error) {
    console.error("Error fetching links filter options:", error);
    return { teacherOptions: [] };
  }
}

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
    if (search && search.trim() !== "")
      queries.push(Query.search("name", search));
    if (semesterFilter && semesterFilter !== "all")
      queries.push(Query.equal("semester", semesterFilter));
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

export async function getSemesterOptions() {
  try {
    return ["1", "2", "3", "4", "5", "6"];
  } catch (error) {
    console.error("Error generating semester options:", error);
    return [];
  }
}

export async function fetchTeacherContributions(): Promise<
  TeacherContributionDetail[]
> {
  try {
    // 1. Fetch the single, pre-calculated document from our AdminStats collection
    const statsDoc = await db.getDocument(
      DATABASE_ID!,
      CACHE_COLLECTION_ID!,
      STATS_DOCUMENT_ID!
    );

    // 2. The data is stored as a JSON string, so we need to parse it
    return JSON.parse(statsDoc.data);
  } catch (error) {
    console.error(
      "Failed to fetch pre-calculated teacher contributions:",
      error
    );
    // Return empty array as a fallback if the stats haven't been generated yet
    return [];
  }
}
