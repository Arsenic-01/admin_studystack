// hooks/useAdminData.ts
"use client";

import { deleteUser } from "@/lib/actions/Admin.actions";
import {
  fetchPaginatedLinksForAdmin,
  fetchPaginatedNotesForAdmin,
  fetchPaginatedSubjects,
  fetchPaginatedUsers,
  getLinksFilterOptions,
  getAllUploaders,
  getSemesterOptions,
  fetchRecentActivity,
  fetchAdminDashboardStats,
} from "@/lib/actions/AdminFetching.actions";
import { deleteFormLink, editFormLink } from "@/lib/actions/Form.actions";
import { deleteNote } from "@/lib/actions/Notes.actions";
import { triggerRevalidation } from "@/lib/actions/revalidate";
import {
  createSubject,
  deleteSubject,
  updateSubject,
} from "@/lib/actions/Subjects.actions";
import {
  deleteYoutubeLink,
  editYoutubeLink,
} from "@/lib/actions/Youtube.actions";
import { Subject } from "@/lib/appwrite_types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// ============================================
// USERS HOOKS
// ============================================

export function useAdminUsers({
  search = "",
  role = "all",
  limit = 10,
}: {
  search?: string;
  role?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["admin-users", { search, role, limit }],
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedUsers({
        limit,
        offset: pageParam * limit,
        search,
        role,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * limit;
      return totalFetched < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: deleteUser,
  });
}

export function useAdminNotes({
  search = "",
  typeFilter = "all",
  teacherFilter = "all",
  limit = 10,
}: {
  search?: string;
  typeFilter?: string;
  teacherFilter?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["admin-notes", { search, typeFilter, teacherFilter, limit }],
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedNotesForAdmin({
        limit,
        offset: pageParam * limit,
        search,
        typeFilter,
        teacherFilter,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * limit;
      return totalFetched < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotesFilterOptions() {
  return useQuery({
    queryKey: ["notes-filter-options"],
    queryFn: getAllUploaders,
    staleTime: 15 * 60 * 1000,
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
    },
    onError: (error) => {
      console.error("Delete note error:", error);
    },
  });
}

// ============================================
// LINKS HOOKS
// ============================================

export function useAdminLinks({
  search = "",
  typeFilter = "all",
  teacherFilter = "all",
  limit = 10,
}: {
  search?: string;
  typeFilter?: string;
  teacherFilter?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["admin-links", { search, typeFilter, teacherFilter, limit }],
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedLinksForAdmin({
        limit,
        offset: pageParam * limit,
        search,
        typeFilter,
        teacherFilter,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * limit;
      return totalFetched < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLinksFilterOptions() {
  return useQuery({
    queryKey: ["links-filter-options"],
    queryFn: getLinksFilterOptions,
    staleTime: 15 * 60 * 1000,
  });
}

// --- Unified Mutation Hooks for Links ---

export function useUpdateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string;
      type: "youtube" | "form";
      title: string;
      url: string;
      formType?: "googleForm" | "assignment" | "other";
    }) => {
      if (data.type === "youtube") {
        return editYoutubeLink({
          id: data.id,
          title: data.title,
          youtubeLink: data.url,
        });
      } else {
        return editFormLink({
          id: data.id,
          quizName: data.title,
          googleFormLink: data.url,
          formType: data.formType!,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
    },
    onError: (error) => {
      console.error("Update link error:", error);
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; type: "youtube" | "form" }) => {
      if (data.type === "youtube") {
        return deleteYoutubeLink({ id: data.id });
      } else {
        return deleteFormLink({ id: data.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
    },
    onError: (error) => {
      console.error("Delete link error:", error);
    },
  });
}

// ============================================
// SUBJECTS HOOKS
// ============================================

const onMutationSuccess = () => {
  triggerRevalidation("subjects");
};

export function useAdminSubjects({
  search = "",
  semesterFilter = "all",
  limit = 10,
}: {
  search?: string;
  semesterFilter?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["admin-subjects", { search, semesterFilter, limit }],
    queryFn: ({ pageParam = 0 }) =>
      fetchPaginatedSubjects({
        limit,
        offset: pageParam * limit,
        search,
        semesterFilter,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * limit;
      return totalFetched < lastPage.total ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSemesterOptions() {
  return useQuery({
    queryKey: ["semester-options"],
    queryFn: getSemesterOptions,
    staleTime: Infinity,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subject: Omit<Subject, "subjectId">) => createSubject(subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      onMutationSuccess();
    },
    onError: (error) => {
      console.error("Create subject error:", error);
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subject: Subject) => updateSubject(subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      onMutationSuccess();
    },
    onError: (error) => {
      console.error("Update subject error:", error);
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => deleteSubject({ subjectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
      onMutationSuccess();
    },
    onError: (error) => {
      console.error("Delete subject error:", error);
    },
  });
}

// Recent Activity Hook

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
    staleTime: 5 * 60 * 1000,
  });
}

// Admin Dashboard Stats Hook

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchAdminDashboardStats,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// Hook for real-time cache invalidation
export function useInvalidateAdminQueries() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
    queryClient.invalidateQueries({ queryKey: ["admin-links"] });
    queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
  };

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const invalidateNotes = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
  };

  const invalidateLinks = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-links"] });
  };

  const invalidateSubjects = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-subjects"] });
  };

  return {
    invalidateAll,
    invalidateUsers,
    invalidateNotes,
    invalidateLinks,
    invalidateSubjects,
  };
}
