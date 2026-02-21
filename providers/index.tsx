"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
} from "next-auth/react";
import { UserProvider } from "@/hooks/useUser";
import { PostHogProvider } from "./PostHogProvider";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Watcher component to detect logout events from other tabs
function CrossTabLogoutSync() {
  const { status } = useSession();
  const router = useRouter();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (
      prevStatus.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      router.push("/");
      router.refresh();
    }
    prevStatus.current = status;
  }, [status, router]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <CrossTabLogoutSync />
      <UserProvider>
        <PostHogProvider>
          <HeroUIProvider>
            <NextThemesProvider attribute="class" enableSystem>
              {children}
            </NextThemesProvider>
          </HeroUIProvider>
        </PostHogProvider>
      </UserProvider>
    </NextAuthSessionProvider>
  );
}
