import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  observerEnabled?: boolean;
}

export const useInfiniteScroll = ({
  hasNextPage,
  fetchNextPage,
  observerEnabled = true,
}: UseInfiniteScrollProps) => {
  const topElementRef = useRef<HTMLDivElement>(null);

  const handleLoadNextPage = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    const topElement = topElementRef.current;
    if (!(topElement && observerEnabled)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleLoadNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topElement);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadNextPage, observerEnabled]);

  return {
    topElementRef,
    handleLoadNextPage,
  };
};
