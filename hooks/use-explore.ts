"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { getPosts, getPlans, getUsers } from "@/lib/firebase-services"

interface ExploreFilters {
  location?: string
  category?: string
  searchQuery?: string
}

export default function useExplore(filters: ExploreFilters) {
  // Fetch posts
  const {
    data: postsData,
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPostsPage,
    isFetchingNextPage: isFetchingNextPostsPage,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = useInfiniteQuery({
    queryKey: ["explorePosts", filters.searchQuery],
    queryFn: async ({ pageParam }) => {
      const { posts, lastVisible } = await getPosts(10, typeof pageParam === "number" ? pageParam : undefined)
      // Client-side filter for posts based on search query
      const filteredPosts = posts.filter(
        (post) =>
          !filters.searchQuery ||
          post.caption.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          post.author?.username?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          post.author?.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()),
      )
      return { posts: filteredPosts, lastVisible }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 60, // 1 minute
  })
  const posts = postsData?.pages.flatMap((page) => page.posts) || []

  // Fetch plans
  const {
    data: plansData,
    fetchNextPage: fetchNextPlansPage,
    hasNextPage: hasNextPlansPage,
    isFetchingNextPage: isFetchingNextPlansPage,
    isLoading: isLoadingPlans,
    isError: isErrorPlans,
  } = useInfiniteQuery({
    queryKey: ["explorePlans", filters.location, filters.category, filters.searchQuery],
    queryFn: async ({ pageParam }) => {
      const { plans, lastVisible } = await getPlans(
        10,
        { location: filters.location, category: filters.category },
        pageParam,
      )
      // Client-side filter for plans based on search query
      const filteredPlans = plans.filter(
        (plan) =>
          !filters.searchQuery ||
          plan.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          plan.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          plan.organizer?.username?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          plan.organizer?.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()),
      )
      return { plans: filteredPlans, lastVisible }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 60, // 1 minute
  })
  const plans = plansData?.pages.flatMap((page) => page.plans) || []

  // Fetch users (people)
  const {
    data: usersData,
    fetchNextPage: fetchNextUsersPage,
    hasNextPage: hasNextUsersPage,
    isFetchingNextPage: isFetchingNextUsersPage,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useInfiniteQuery({
    queryKey: ["exploreUsers", filters.searchQuery],
    queryFn: async ({ pageParam }) => {
      const { users, lastVisible } = await getUsers(filters.searchQuery, pageParam, 10)
      return { users, lastVisible }
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastVisible,
    staleTime: 1000 * 60, // 1 minute
  })
  const people = usersData?.pages.flatMap((page) => page.users) || []

  return {
    people: {
      data: people,
      isLoading: isLoadingUsers,
      isError: isErrorUsers,
      fetchNextPage: fetchNextUsersPage,
      hasNextPage: hasNextUsersPage,
      isFetchingNextPage: isFetchingNextUsersPage,
    },
    plans: {
      data: plans,
      isLoading: isLoadingPlans,
      isError: isErrorPlans,
      fetchNextPage: fetchNextPlansPage,
      hasNextPage: hasNextPlansPage,
      isFetchingNextPage: isFetchingNextPlansPage,
    },
    content: {
      data: posts,
      isLoading: isLoadingPosts,
      isError: isErrorPosts,
      fetchNextPage: fetchNextPostsPage,
      hasNextPage: hasNextPostsPage,
      isFetchingNextPage: isFetchingNextPostsPage,
    },
  }
}
