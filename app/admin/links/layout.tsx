import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Links - Study Stack",
  description: "Manage links for Study Stack.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
