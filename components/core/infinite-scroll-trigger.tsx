import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { LoaderSpinner } from "./loader-spinner";

interface InfiniteScrollTriggerProps {
  ref: React.RefObject<HTMLDivElement | null>;
  handleLoadNextPage: () => void;
  canLoadMore: boolean;
  isLoadingNextPage: boolean;
  className?: string;
}

function InfiniteScrollTrigger({
  ref,
  handleLoadNextPage,
  isLoadingNextPage,
  canLoadMore,
  className,
}: InfiniteScrollTriggerProps) {
  return (
    <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLoadNextPage}
        disabled={isLoadingNextPage || !canLoadMore}
      >
        {isLoadingNextPage ? (
          <LoaderSpinner />
        ) : !canLoadMore ? (
          "No more data"
        ) : (
          "Load more"
        )}
      </Button>
    </div>
  );
}

export default InfiniteScrollTrigger;
