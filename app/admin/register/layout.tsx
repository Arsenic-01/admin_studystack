import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Users - Study Stack",
  description: "Register new users for Study Stack.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
