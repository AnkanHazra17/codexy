"use client";
import { useState } from "react";
import { useRepositories } from "../hooks/use-repositories";
import type { Repository } from "@/types/repository.types";
import SearchInput from "@/components/core/search-input";
import RepositoryCard from "../components/repository-card";
import InfiniteScrollTrigger from "@/components/core/infinite-scroll-trigger";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { LoaderSpinner } from "@/components/core/loader-spinner";

function Repository() {
  const {
    data: repositories,
    isLoading,
    isError,
    error,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useRepositories();
  const [searchQuery, setSearchQuery] = useState("");
  const allRepositories = repositories?.pages.flatMap((page) => page) || [];
  const filteredRepositories = allRepositories?.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { topElementRef, handleLoadNextPage } = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
  });

  if(isLoading){
    return (
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
            <LoaderSpinner size={20}/>
        </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="shrink-0">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredRepositoriescount={filteredRepositories.length}
        />
      </div>
      <div className="space-y-3">
        {filteredRepositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} />
        ))}
        <InfiniteScrollTrigger
          ref={topElementRef}
          handleLoadNextPage={handleLoadNextPage}
          canLoadMore={hasNextPage}
          isLoadingNextPage={isFetchingNextPage}
        />
      </div>
    </div>
  );
}

export default Repository;
