"use client";

import EditNotesModal, { EditNoteSchema } from "./_components/EditNotesModal";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAdminNotes,
  useDeleteNote,
  useNotesFilterOptions,
} from "@/hooks/useAdminData";
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Atom,
  BookOpen,
  ClipboardCheck,
  Edit,
  ExternalLink,
  FileCode,
  File as FileIcon,
  FileText,
  FileVideo,
  FlaskConical,
  GraduationCap,
  MoreHorizontal,
  Presentation,
  Search,
  ServerCrash,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type NoteForEdit = Omit<EditNoteSchema, "noteId"> & { noteId: string };

// A new hook to handle bulk note deletions
const useDeleteMultipleNotes = () => {
  const queryClient = useQueryClient();
  const deleteNoteMutation = useDeleteNote(); // Reuse the single delete mutation

  return useMutation({
    mutationFn: async (notes: { noteId: string; fileId: string }[]) => {
      // Use Promise.all to run deletions in parallel for better performance
      await Promise.all(
        notes.map((note) =>
          deleteNoteMutation.mutateAsync({
            noteId: note.noteId,
            fileId: note.fileId,
          })
        )
      );
    },
    onSuccess: () => {
      // Invalidate queries to refetch the notes list after deletion
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] });
    },
  });
};

const typeIcons: { [key: string]: React.ElementType } = {
  Notes: FileText,
  PPTS: Presentation,
  Assignments: ClipboardCheck,
  SLA: ClipboardCheck,
  Lab_Manuals: FlaskConical,
  Modal_Solutions: BookOpen,
  MSBTE_QP: BookOpen,
  Videos: FileVideo,
  Animations: Atom,
  Programs: FileCode,
  Syllabus: GraduationCap,
  Other: FileIcon,
};

const noteFileTypes = [
  "Notes",
  "PPTS",
  "Assignments",
  "SLA",
  "Lab_Manuals",
  "Modal_Solutions",
  "MSBTE_QP",
  "Videos",
  "Animations",
  "Programs",
  "Syllabus",
  "Other",
];

export default function AdminNotesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [noteToDelete, setNoteToDelete] = useState<{
    noteId: string;
    fileId: string;
    title: string;
  } | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<NoteForEdit | null>(null);

  // State for bulk selection
  const [selectedNotes, setSelectedNotes] = useState(new Set<string>());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: notesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useAdminNotes({
    search: debouncedSearch,
    typeFilter,
    teacherFilter,
    limit: 15,
  });

  const { data: filterOptions } = useNotesFilterOptions();
  const deleteNoteMutation = useDeleteNote();
  const deleteMultipleNotesMutation = useDeleteMultipleNotes();

  const allNotes = useMemo(() => {
    return notesData?.pages.flatMap((page) => page.documents) ?? [];
  }, [notesData]);

  const totalCount = notesData?.pages[0]?.total ?? 0;

  const handleDeleteNote = () => {
    if (!noteToDelete) return;
    deleteNoteMutation.mutate(
      { noteId: noteToDelete.noteId, fileId: noteToDelete.fileId },
      {
        onSuccess: () => {
          toast.success(`Note "${noteToDelete.title}" deleted successfully.`);
          setNoteToDelete(null);
        },
        onError: () => {
          toast.error("Failed to delete note.");
        },
      }
    );
  };

  const handleBulkDelete = () => {
    const notesToDelete = Array.from(selectedNotes)
      .map((noteId) => {
        const note = allNotes.find((n) => n.noteId === noteId);
        return note ? { noteId: note.noteId, fileId: note.fileId } : null;
      })
      .filter(Boolean) as { noteId: string; fileId: string }[];

    if (notesToDelete.length === 0) return;

    deleteMultipleNotesMutation.mutate(notesToDelete, {
      onSuccess: () => {
        toast.success(`${notesToDelete.length} notes deleted successfully.`);
        setSelectedNotes(new Set());
        setIsBulkDeleteConfirmOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete some or all of the selected notes.");
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(allNotes.map((note) => note.noteId)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const handleRowSelect = (noteId: string, checked: boolean) => {
    const newSelectedNotes = new Set(selectedNotes);
    if (checked) newSelectedNotes.add(noteId);
    else newSelectedNotes.delete(noteId);
    setSelectedNotes(newSelectedNotes);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ServerCrash className="w-16 h-16 mb-4 text-destructive" />
        <h2 className="text-2xl font-semibold text-destructive">
          Failed to Load Notes
        </h2>
        <p className="text-muted-foreground">
          There was an error fetching the notes data. Please try again later.
        </p>
      </div>
    );
  }

  const numSelected = selectedNotes.size;

  return (
    <>
      <TooltipProvider>
        <main className="flex-1 space-y-6 p-4 md:p-6 xl:py-8 xl:px-10 mt-1 md:mt-0 mb-20">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Notes Management
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all uploaded notes and documents.
            </p>
          </header>

          <Card className="mt-3 md:mt-0 rounded-md">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {numSelected > 0 ? (
                  <div className="flex items-center gap-4">
                    <CardTitle>{numSelected} selected</CardTitle>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsBulkDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                    </Button>
                  </div>
                ) : (
                  <CardTitle>
                    All Notes ({totalCount.toLocaleString()})
                  </CardTitle>
                )}
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-fit mt-3 md:mt-0">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 text-sm w-full md:w-fit"
                    />
                  </div>
                  <div className="flex gap-2 items-center w-full md:w-fit">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {noteFileTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={teacherFilter}
                      onValueChange={setTeacherFilter}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teachers</SelectItem>
                        {filterOptions?.map((teacher: string) => (
                          <SelectItem key={teacher} value={teacher}>
                            {teacher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          numSelected > 0 &&
                          numSelected === allNotes.length &&
                          allNotes.length > 0
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(!!checked)
                        }
                        aria-label="Select all rows"
                        data-state={
                          numSelected > 0 && numSelected < allNotes.length
                            ? "indeterminate"
                            : numSelected === allNotes.length &&
                              allNotes.length > 0
                            ? "checked"
                            : "unchecked"
                        }
                      />
                    </TableHead>
                    <TableHead className="w-[400px]">Note Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : allNotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-7 md:size-10 text-muted-foreground/50" />
                          <p className="font-medium">No Notes Found</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allNotes.map((note) => {
                      const Icon = typeIcons[note.type_of_file] || FileIcon;
                      return (
                        <TableRow
                          key={note.noteId}
                          className="hover:bg-muted/50"
                          data-state={
                            selectedNotes.has(note.noteId)
                              ? "selected"
                              : "unselected"
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedNotes.has(note.noteId)}
                              onCheckedChange={(checked) =>
                                handleRowSelect(note.noteId, !!checked)
                              }
                              aria-label={`Select note ${note.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              <div>
                                <p
                                  className="font-semibold truncate"
                                  title={note.title}
                                >
                                  {note.title}
                                </p>
                                <p
                                  className="text-xs text-muted-foreground truncate"
                                  title={note.description}
                                >
                                  {note.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {note.type_of_file.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {note.users.name}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {note.abbreviation}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger>
                                <span>
                                  {format(
                                    new Date(note.createdAt),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {format(new Date(note.createdAt), "PPP p")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={note.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />{" "}
                                    View File
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setNoteToEdit(note)}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit Note
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                  onClick={() =>
                                    setNoteToDelete({
                                      noteId: note.noteId,
                                      fileId: note.fileId,
                                      title: note.title,
                                    })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                                  Delete Note
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
                  {isFetchingNextPage ? "Loading..." : "Load More Notes"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </main>
      </TooltipProvider>

      {noteToEdit && (
        <EditNotesModal
          open={!!noteToEdit}
          closeModal={() => setNoteToEdit(null)}
          noteId={noteToEdit.noteId}
          title={noteToEdit.title}
          description={noteToEdit.description}
          type_of_file={noteToEdit.type_of_file}
        />
      )}

      <AlertDialog
        open={!!noteToDelete}
        onOpenChange={() => setNoteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note <strong>{noteToDelete?.title}</strong> and its associated
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <strong>{numSelected} selected notes</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleteMultipleNotesMutation.isPending}
            >
              {deleteMultipleNotesMutation.isPending
                ? "Deleting..."
                : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
