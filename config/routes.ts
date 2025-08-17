export const routes = {
  // Public
  home: "/",
  explore: "/explore",
  feed: "/feed",
  login: "/login",
  register: "/register",
  offline: "/offline",

  // App
  create: "/create",
  messages: "/messages",
  notifications: "/notifications",

  // Dynamic
  profile: (userId: string) => `/profile/${userId}`,
  plan: (planId: string) => `/plans/${planId}`,
} as const

export type Routes = typeof routes
