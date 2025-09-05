import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { ThemeToggle } from "@/components/core/ThemeSwitcher";
import ProfileCard from "@/components/core/ProfileCard";
import { getCurrentUser } from "@/lib/auth";

export async function AdminHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 px-4 sticky top-0 z-10 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DynamicBreadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileCard serverUser={user} />
      </div>
    </header>
  );
}
