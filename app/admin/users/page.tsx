"use client";

import {
  UpdateUserData,
  UpdateUserDialog,
} from "@/components/admin_components/admin_helper_components/UpdateUserModal";
import { UserLogsDialog } from "@/components/admin_components/admin_helper_components/UserLogDialog";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useAdminUsers, useDeleteUser } from "@/hooks/useAdminData";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Edit,
  FileText,
  MoreHorizontal,
  Search,
  ServerCrash,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// Helper to get initials for the avatar
const getInitials = (name: string) => {
  if (!name) return "??";
  const names = name.split(" ");
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

// New hook for bulk deleting users
const useDeleteMultipleUsers = () => {
  const queryClient = useQueryClient();
  const deleteUserMutation = useDeleteUser(); // Reuse the single delete mutation

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      // Run all delete operations in parallel
      await Promise.all(
        userIds.map((id) => deleteUserMutation.mutateAsync(id))
      );
    },
    onSuccess: () => {
      // Refetch the user list after deletion
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [userToEdit, setUserToEdit] = useState<UpdateUserData | null>(null);
  const [userToViewLogs, setUserToViewLogs] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set<string>());
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useAdminUsers({
    search: debouncedSearch,
    role: roleFilter,
    limit: 15,
  });

  const deleteUserMutation = useDeleteUser();
  const deleteMultipleUsersMutation = useDeleteMultipleUsers();

  const allUsers = useMemo(
    () => data?.pages.flatMap((page) => page.documents) ?? [],
    [data]
  );
  const totalCount = data?.pages[0]?.total ?? 0;

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success(`User "${userToDelete.name}" has been deleted.`);
        setUserToDelete(null);
      },
      onError: (err) => {
        toast.error("Failed to delete user.");
        console.error("Delete user error:", err);
      },
    });
  };

  const handleBulkDelete = () => {
    const userIdsToDelete = Array.from(selectedUsers);
    if (userIdsToDelete.length === 0) return;

    deleteMultipleUsersMutation.mutate(userIdsToDelete, {
      onSuccess: () => {
        toast.success(`${userIdsToDelete.length} users deleted successfully.`);
        setSelectedUsers(new Set());
        setIsBulkDeleteConfirmOpen(false);
      },
      onError: () => {
        toast.error("Failed to delete some or all selected users.");
      },
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(allUsers.map((user) => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleRowSelect = (userId: string, checked: boolean) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (checked) newSelectedUsers.add(userId);
    else newSelectedUsers.delete(userId);
    setSelectedUsers(newSelectedUsers);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ServerCrash className="w-16 h-16 mb-4 text-destructive" />
        <h2 className="text-2xl font-semibold text-destructive">
          Failed to Load Users
        </h2>
        <p className="text-muted-foreground">
          There was an error fetching the user data. Please try again later.
        </p>
      </div>
    );
  }

  const numSelected = selectedUsers.size;

  return (
    <>
      <TooltipProvider>
        <main className="flex-1 space-y-6 p-4 md:p-6 xl:py-8 xl:px-10 mt-1 md:mt-0 mb-20">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Users Management
              </h1>
              <p className="text-muted-foreground">
                Manage and monitor all users in the system.
              </p>
            </div>
            <Button onClick={() => router.push("/admin/register")}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New User
            </Button>
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
                    All Users ({totalCount.toLocaleString()})
                  </CardTitle>
                )}
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                          numSelected === allUsers.length &&
                          allUsers.length > 0
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(!!checked)
                        }
                        aria-label="Select all rows"
                        data-state={
                          numSelected > 0 && numSelected < allUsers.length
                            ? "indeterminate"
                            : numSelected === allUsers.length &&
                              allUsers.length > 0
                            ? "checked"
                            : "unchecked"
                        }
                      />
                    </TableHead>
                    <TableHead className="w-[350px]">User</TableHead>
                    <TableHead>PRN No</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px] text-right">
                      Actions
                    </TableHead>
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
                  ) : allUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="size-7 md:size-10 text-muted-foreground/50" />
                          <p className="font-medium">No Users Found</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/50"
                        data-state={
                          selectedUsers.has(user.id) ? "selected" : "unselected"
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={(checked) =>
                              handleRowSelect(user.id, !!checked)
                            }
                            aria-label={`Select user ${user.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {user.prnNo}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger>
                              <span>
                                {format(
                                  new Date(user.createdAt),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{format(new Date(user.createdAt), "PPP p")}</p>
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
                              <DropdownMenuItem
                                onClick={() =>
                                  setUserToViewLogs({
                                    id: user.id,
                                    name: user.name,
                                  })
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" /> View Logs
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setUserToEdit(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() =>
                                  setUserToDelete({
                                    id: user.id,
                                    name: user.name,
                                  })
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
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
                  {isFetchingNextPage ? "Loading..." : "Load More Users"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </main>
      </TooltipProvider>

      {/* Dialogs */}
      {userToEdit && (
        <UpdateUserDialog
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onUpdate={() => setUserToEdit(null)}
        />
      )}
      <UserLogsDialog
        user={userToViewLogs}
        open={!!userToViewLogs}
        onClose={() => setUserToViewLogs(null)}
      />
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user{" "}
              <strong>{userToDelete?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
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
              This will permanently delete the{" "}
              <strong>{numSelected} selected users</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={deleteMultipleUsersMutation.isPending}
            >
              {deleteMultipleUsersMutation.isPending
                ? "Deleting..."
                : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
