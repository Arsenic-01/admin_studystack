// app/admin/layout.tsx
import { AdminHeader } from "@/app/admin/_components/_header/AdminHeader";
import { AdminSidebar } from "@/app/admin/_components/_sidebar/AdminSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin - Study Stack",
  description:
    "Admin Dashboard for Study Stack - Manage Users, Content, and Analytics",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col gap-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
