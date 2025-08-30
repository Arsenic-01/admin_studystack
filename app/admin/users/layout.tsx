import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users - Study Stack",
  description: "Manage user accounts, roles, and permissions for Study Stack.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
