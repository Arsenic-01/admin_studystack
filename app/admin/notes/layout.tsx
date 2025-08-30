import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Notes - Study Stack",
  description: "Manage notes for Study Stack.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
