export const featureFlags = {
  // Toggle experimental or staged features here
  stories: true,
  messages: true,
  notifications: true,
  explore: true,
  // Example staged feature
  newExploreFilters: false,
} as const

export type FeatureFlags = typeof featureFlags
