"use client";

import {
  EditLinkModal,
  LinkForEdit,
} from "@/components/link_components/EditLinkModal";
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
  useAdminLinks,
  useDeleteLink,
  useLinksFilterOptions,
} from "@/hooks/useAdminData";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import {
  Edit,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  MoreHorizontal,
  Search,
  ServerCrash,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// NOTE: A new hook to handle multiple deletions.
// You would replace this with your actual API call logic.
const useDeleteMultipleLinks = () => {
  const queryClient = useQueryClient();
  const deleteLinkMutation = useDeleteLink(); // Reuse the single delete mutation

  return useMutation({
    mutationFn: async (links: { id: string; type: "youtube" | "form" }[]) => {
      // Use Promise.all to run deletions in parallel for better performance
      await Promise.all(
        links.map((link) =>
          deleteLinkMutation.mutateAsync({ id: link.id, type: link.type })
        )
      );
    },
    onSuccess: () => {
      // Invalidate queries to refetch the links list
      queryClient.invalidateQueries({ queryKey: ["adminLinks"] });
    },
  });
};

// Static list of all possible link types for the filter
const allLinkTypes = ["youtube", "form"];

export default function AdminLinksPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");

  // State for single link deletion
  const [linkToDelete, setLinkToDelete] = useState<{
    id: string;
    type: "youtube" | "form";
    title: string;
  } | null>(null);

  // State for bulk selection and deletion
  const [selectedLinks, setSelectedLinks] = useState(new Set<string>());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [linkToEdit, setLinkToEdit] = useState<LinkForEdit | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: linksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useAdminLinks({
    search: debouncedSearch,
    typeFilter,
    teacherFilter,
    limit: 15,
  });

  const { data: filterOptions } = useLinksFilterOptions();
  const deleteLinkMutation = useDeleteLink();
  const deleteMultipleLinksMutation = useDeleteMultipleLinks();

  const allLinks = useMemo(() => {
    return linksData?.pages.flatMap((page) => page.documents) ?? [];
  }, [linksData]);

  const totalCount = linksData?.pages[0]?.total ?? 0;

  // Handle single link deletion
  const handleDeleteLink = () => {
    if (!linkToDelete) return;
    deleteLinkMutation.mutate(
      { id: linkToDelete.id, type: linkToDelete.type },
      {
        onSuccess: () => {
          toast.success(`Link "${linkToDelete.title}" deleted successfully.`);
          setLinkToDelete(null);
        },
        onError: () => {
          toast.error(`Failed to delete link "${linkToDelete.title}".`);
        },
      }
    );
  };

  // Handle bulk link deletion
  const handleBulkDelete = () => {
    const linksToDelete = Array.from(selectedLinks)
      .map((id) => {
        const link = allLinks.find((l) => l.id === id);
        return link
          ? { id: link.id, type: link.type, title: link.title }
          : null;
      })
      .filter(Boolean) as {
      id: string;
      type: "youtube" | "form";
      title: string;
    }[];

    if (linksToDelete.length === 0) return;

    deleteMultipleLinksMutation.mutate(linksToDelete, {
      onSuccess: () => {
        toast.success(`${linksToDelete.length} links deleted successfully.`);
        setSelectedLinks(new Set());
        setIsBulkDeleteConfirmOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete some or all of the selected links.");
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLinks(new Set(allLinks.map((link) => link.id)));
    } else {
      setSelectedLinks(new Set());
    }
  };

  const handleRowSelect = (linkId: string, checked: boolean) => {
    const newSelectedLinks = new Set(selectedLinks);
    if (checked) {
      newSelectedLinks.add(linkId);
    } else {
      newSelectedLinks.delete(linkId);
    }
    setSelectedLinks(newSelectedLinks);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ServerCrash className="w-16 h-16 mb-4 text-destructive" />
        <h2 className="text-2xl font-semibold text-destructive">
          Failed to Load Links
        </h2>
        <p className="text-muted-foreground">
          There was an error fetching the links data. Please try again later.
        </p>
      </div>
    );
  }

  const numSelected = selectedLinks.size;

  return (
    <>
      <TooltipProvider>
        <main className="flex-1 space-y-6 p-4 md:p-6 xl:py-8 xl:px-10 mt-1 md:mt-0 mb-20">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Links Management
            </h1>
            <p className="text-muted-foreground">
              Manage YouTube links, forms, and other external resources.
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
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </Button>
                  </div>
                ) : (
                  <CardTitle>
                    All Links ({totalCount.toLocaleString()})
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
                        {allLinkTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
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
                        {filterOptions?.teacherOptions.map(
                          (teacher: string) => (
                            <SelectItem key={teacher} value={teacher}>
                              {teacher}
                            </SelectItem>
                          )
                        )}
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
                          numSelected === allLinks.length &&
                          allLinks.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                        // Handle indeterminate state
                        data-state={
                          numSelected > 0 && numSelected < allLinks.length
                            ? "indeterminate"
                            : numSelected === allLinks.length &&
                              allLinks.length > 0
                            ? "checked"
                            : "unchecked"
                        }
                        className=""
                      />
                    </TableHead>
                    <TableHead className="w-[400px]">Link Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
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
                  ) : allLinks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <LinkIcon className="h-12 w-12 text-muted-foreground/50" />
                          <p className="font-medium">No Links Found</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allLinks.map((link) => (
                      <TableRow
                        key={link.id}
                        className="hover:bg-muted/50"
                        data-state={selectedLinks.has(link.id) && "selected"}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedLinks.has(link.id)}
                            onCheckedChange={(checked) =>
                              handleRowSelect(link.id, !!checked)
                            }
                            aria-label={`Select link ${link.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                              {link.type === "youtube" ? (
                                <FaYoutube className="h-5 w-5 text-red-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <p
                              className="font-semibold truncate"
                              title={link.title}
                            >
                              {link.title}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge
                              variant={
                                link.type === "youtube"
                                  ? "destructive"
                                  : "default"
                              }
                              className="capitalize"
                            >
                              {link.type}
                            </Badge>
                            {link.formType && (
                              <Badge variant="outline" className="capitalize">
                                {link.formType.replace(
                                  "googleForm",
                                  "Google Form"
                                )}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {link.createdBy}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {link.abbreviation}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger>
                              <span>
                                {format(
                                  new Date(link.createdAt),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{format(new Date(link.createdAt), "PPP p")}</p>
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
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" /> Open
                                  Link
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setLinkToEdit(link)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() =>
                                  setLinkToDelete({
                                    id: link.id,
                                    type: link.type,
                                    title: link.title,
                                  })
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Link
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
                  {isFetchingNextPage ? "Loading..." : "Load More Links"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </main>
      </TooltipProvider>

      {/* Unified Edit Modal */}
      <EditLinkModal
        link={linkToEdit}
        open={!!linkToEdit}
        onClose={() => setLinkToEdit(null)}
      />

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog
        open={!!linkToDelete}
        onOpenChange={(open) => !open && setLinkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              link <strong>&quot;{linkToDelete?.title}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              disabled={deleteLinkMutation.isPending}
            >
              {deleteLinkMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <strong> {numSelected} selected links</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleteMultipleLinksMutation.isPending}
            >
              {deleteMultipleLinksMutation.isPending
                ? "Deleting..."
                : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
