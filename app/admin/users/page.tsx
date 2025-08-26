// app/admin/users/page.tsx
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
import { useAdminUsers, useDeleteUser } from "@/hooks/useAdminData";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
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
  const names = name.split(" ");
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`
    : name.substring(0, 2).toUpperCase();
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
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      },
      onError: (err) => {
        toast.error("Failed to delete user.");
        console.error("Delete user error:", err);
      },
    });
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

  return (
    <>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Table */}
          <div className="lg:col-span-3">
            <Card className="mt-3 md:mt-0 rounded-md">
              <CardHeader className="border-b px-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-0">
                  <CardTitle>Users ({totalCount.toLocaleString()})</CardTitle>
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full lg:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 md:size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 md:pl-10 w-full text-sm"
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
                          <TableCell colSpan={5}>
                            <Skeleton className="h-12 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : allUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center">
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
                        <TableRow key={user.id} className="hover:bg-muted/50">
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
                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
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
                                  <FileText className="mr-2 h-4 w-4" /> View
                                  Logs
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setUserToEdit(user)}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    setUserToDelete({
                                      id: user.id,
                                      name: user.name,
                                    })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  User
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
          </div>
        </div>
      </main>

      {/* Dialogs */}
      {userToEdit && (
        <UpdateUserDialog
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setUserToEdit(null);
          }}
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
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
