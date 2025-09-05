"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { AlreadyLoggedInCard } from "./AlreadyLoggedInCard";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "admin") {
        router.replace("/admin");
      } else {
        toast.error("You are not authorized to access the admin panel.");
        router.replace("/");
      }
    }
  }, [status, session, router]);

  if (status === "authenticated") {
    return <AlreadyLoggedInCard />;
  }

  return <LoginForm isSessionLoading={status === "loading"} />;
}
