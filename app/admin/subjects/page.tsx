// app/admin/subjects/page.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminSubjects,
  useCreateSubject,
  useDeleteSubject,
  useSemesterOptions,
  useUpdateSubject,
} from "@/hooks/useAdminData";
import { useDebounce } from "@/hooks/useDebounce";
import { Subject } from "@/lib/appwrite_types";
import {
  BookCopy,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  ServerCrash,
  Trash2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import CreateSubjectModal from "@/components/admin_components/admin_helper_components/subject_crud/CreateSubjectModal";
import EditSubjectModal from "@/components/admin_components/admin_helper_components/subject_crud/EditSubjectModal";

export default function AdminSubjectsPage() {
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useAdminSubjects({ search: debouncedSearch, semesterFilter });

  const { data: semesterOptions } = useSemesterOptions();
  const deleteSubjectMutation = useDeleteSubject();
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();

  const allSubjects = useMemo(
    () => data?.pages.flatMap((page) => page.documents) ?? [],
    [data]
  );
  const totalCount = data?.pages[0]?.total ?? 0;

  const handleDeleteSubject = () => {
    if (!subjectToDelete) return;
    deleteSubjectMutation.mutate(subjectToDelete.subjectId, {
      onSuccess: () => {
        toast.success(`Subject "${subjectToDelete.name}" deleted.`);
        setSubjectToDelete(null);
      },
    });
  };

  const handleCreateSubject = (subjectData: Omit<Subject, "subjectId">) => {
    createSubjectMutation.mutate(subjectData, {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  const handleUpdateSubject = (subjectData: Subject) => {
    updateSubjectMutation.mutate(subjectData, {
      onSuccess: () => {
        setSubjectToEdit(null);
      },
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ServerCrash className="w-16 h-16 mb-4 text-destructive" />
        <h2 className="text-2xl font-semibold text-destructive">
          Failed to Load Subjects
        </h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 space-y-6 p-4 md:p-6 xl:p-10 mt-1 md:mt-0 mb-20">
        <header className="flex flex-col gap-3 md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Subjects Management
            </h1>
            <p className="text-muted-foreground">
              Add, edit, and manage all course subjects.
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="w-full md:w-fit"
          >
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        </header>

        <Card className="mt-3 md:mt-0 rounded-md">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>
                All Subjects ({totalCount.toLocaleString()})
              </CardTitle>
              <div className="flex flex-col md:flex-row items-center gap-2 mt-3 md:mt-0">
                <div className="relative w-full">
                  <Search className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full text-sm"
                  />
                </div>
                <Select
                  value={semesterFilter}
                  onValueChange={setSemesterFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesterOptions?.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        Semester {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[350px]">Subject Name</TableHead>
                  <TableHead>Abbreviation</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : allSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BookCopy className="h-12 w-12 text-muted-foreground/50" />
                        <p className="font-medium">No Subjects Found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or creating a new subject.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  allSubjects.map((subject) => (
                    <TableRow
                      key={subject.subjectId}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-semibold">
                        {subject.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {subject.abbreviation}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {subject.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Sem {subject.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{subject.unit.length} Units</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSubjectToEdit(subject)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSubjectToDelete(subject)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          {hasNextPage && (
            <CardFooter className="flex justify-center border-t pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load More Subjects"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>

      {/* Modals */}
      <CreateSubjectModal
        open={isCreateModalOpen}
        closeModal={() => setCreateModalOpen(false)}
        onSubjectCreate={handleCreateSubject}
      />
      {subjectToEdit && (
        <EditSubjectModal
          open={!!subjectToEdit}
          closeModal={() => setSubjectToEdit(null)}
          subject={subjectToEdit}
          onSubjectUpdate={handleUpdateSubject}
        />
      )}
      <AlertDialog
        open={!!subjectToDelete}
        onOpenChange={() => setSubjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subject{" "}
              <strong>{subjectToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
