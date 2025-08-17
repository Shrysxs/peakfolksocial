export const siteConfig = {
  name: "Peakfolk",
  description:
    "Peakfolk is a modern social platform to create, join, and share adventure plans with friends and communities.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://peakfolk.app",
  ogImage: 
    process.env.NEXT_PUBLIC_OG_IMAGE || 
    `${process.env.NEXT_PUBLIC_SITE_URL || "https://peakfolk.app"}/placeholder-logo.png`,
  links: {
    github: "https://github.com/Shrysxs/peakfolksocial",
    twitter: "https://twitter.com",
  },
} as const

export type SiteConfig = typeof siteConfig
