import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchRepositories } from "../actions/repository.actions"
import { DEFAULT_PER_PAGE } from "@/constants/data"


export const useRepositories = () => {
    return useInfiniteQuery({
        queryKey: ["repositories"],
        queryFn: async({ pageParam = 1 }) => await fetchRepositories(pageParam, DEFAULT_PER_PAGE),
        getNextPageParam: (lastPage, allpage) => {
            if(lastPage.length < 10) return undefined;
            return allpage.length + 1;
        },
        initialPageParam: 1
    })
}