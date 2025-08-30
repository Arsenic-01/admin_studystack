import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Subjects - Study Stack",
  description: "Manage subjects for Study Stack.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
