"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const RefreshButton = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant="outline"
      id="refresh"
      disabled={isPending}
    >
      <RefreshCcw className={isPending ? "animate-spin" : ""} />
    </Button>
  );
};

export default RefreshButton;
