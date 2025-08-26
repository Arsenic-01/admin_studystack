// app/admin/links/page.tsx
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

// Static list of all possible link types for the filter
const allLinkTypes = ["youtube", "form"];

export default function AdminLinksPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [linkToDelete, setLinkToDelete] = useState<{
    id: string;
    type: "youtube" | "form";
    title: string;
  } | null>(null);
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

  const allLinks = useMemo(() => {
    return linksData?.pages.flatMap((page) => page.documents) ?? [];
  }, [linksData]);

  const totalCount = linksData?.pages[0]?.total ?? 0;

  const handleDeleteLink = () => {
    if (!linkToDelete) return;

    deleteLinkMutation.mutate(
      { id: linkToDelete.id, type: linkToDelete.type },
      {
        onSuccess: () => {
          toast.success(`Link "${linkToDelete.title}" deleted successfully.`);
          setLinkToDelete(null);
        },
      }
    );
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

  return (
    <>
      <main className="flex-1 space-y-6 p-4 md:p-6 xl:p-10">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Links Management
          </h1>
          <p className="text-muted-foreground">
            Manage YouTube links, forms, and other external resources.
          </p>
        </header>

        <Card className="mt-3 md:mt-0">
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>All Links ({totalCount.toLocaleString()})</CardTitle>
              <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-fit mt-3 md:mt-0">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title..."
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
                      {filterOptions?.teacherOptions.map((teacher) => (
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
                  <TableHead className="w-[400px]">Link Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
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
                ) : allLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
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
                    <TableRow key={link.id} className="hover:bg-muted/50">
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
                        {format(new Date(link.createdAt), "MMM dd, yyyy")}
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
                              onClick={() => setLinkToDelete(link)}
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

      {/* Unified Edit Modal */}
      <EditLinkModal
        link={linkToEdit}
        open={!!linkToEdit}
        onClose={() => setLinkToEdit(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!linkToDelete}
        onOpenChange={() => setLinkToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              link <strong>{linkToDelete?.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
