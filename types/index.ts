import type { Timestamp } from "firebase/firestore"

export interface User {
  uid: string // Firebase Auth UID
  id: string // Firestore document ID
  email: string
  username: string
  displayName: string // For display purposes, can be full name or username
  photoURL?: string // Profile picture URL
  bio?: string
  name?: string // Full name
  website?: string
  location?: string
  isPrivate: boolean
  followers: number // Count of followers
  following: number // Count of users this user follows
  followerIds: string[] // Array of user IDs who follow this user
  followingIds: string[] // Array of user IDs this user is following
  posts: number // Count of posts
  plans: number // Count of plans created or joined
  verified: boolean
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
  avatar?: string // Redundant with photoURL, keeping for compatibility if used elsewhere
  
  // Follow request properties
  sentFollowRequests?: string[]
  pendingFollowRequests?: string[]
  
  // Notification settings
  notificationSettings?: NotificationSettings
  
  // Privacy settings
  privacySettings?: PrivacySettings
  
  // Additional user preferences
  showOnlineStatus?: boolean
  allowTagging?: boolean
  allowStoryResharing?: boolean
  showEmail?: boolean
  showLocation?: boolean
  allowMessages?: "everyone" | "followers" | "none"
  pushNotifications?: boolean
  emailNotifications?: boolean
  likeNotifications?: boolean
  commentNotifications?: boolean
  followNotifications?: boolean
  planNotifications?: boolean
  messageNotifications?: boolean
  storyNotifications?: boolean
  darkMode?: boolean
  showStories?: boolean
  autoplayVideos?: boolean
  highQualityUploads?: boolean
  allowStoryViews?: boolean
  hideStoryFromSpecific?: boolean
  saveStoriesToGallery?: boolean
}

// Simplified Author/Organizer/Sender type for embedded data
export interface EmbeddedUser {
  id: string
  username: string
  avatar?: string
  name?: string // Full name or display name
  photoURL?: string // For compatibility with UI
  displayName?: string // For compatibility with UI
}

export interface Post {
  id: string
  userId: string // ID of the user who created the post
  author: EmbeddedUser // Author's user details
  caption: string
  imageUrl: string // Main image URL for the post
  likes: string[] // Array of user IDs who liked the post
  comments: Comment[] // Array of embedded comment objects
  shares: number // Count of shares
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
  isLiked: boolean // Client-side determined
  isBookmarked: boolean // Client-side determined
  content?: string // Redundant with caption, keeping for compatibility
  imageUrls?: string[] // Additional image URLs, currently not used in createPost
  location?: string
  tags: string[]
  website?: string // Assuming post can have a website link
}

export interface Comment {
  id: string
  postId: string // ID of the post this comment belongs to
  userId: string // ID of the user who made the comment
  author: EmbeddedUser // Author's user details
  content: string
  likes: number
  replies: Comment[] // Nested replies (though current implementation doesn't support nested replies)
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
  isLiked: boolean // Client-side determined
}

export interface Plan {
  id: string
  userId: string // ID of the user who created the plan (organizer)
  organizer: EmbeddedUser // Organizer's user details
  title: string
  description: string
  dateTime: Timestamp | Date // Specific date and time of the plan
  location: string
  costPerHead: number
  participantIds: string[] // Array of user IDs who joined the plan
  currentParticipants: number // Count of participants (derived from participantIds)
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
  isJoined: boolean // Client-side determined
  isBookmarked: boolean // Client-side determined
  maxParticipants?: number // Maximum number of participants
  tags: string[]
  requirements: string[]
  whatToBring: string[]
  currency: string // Currency of the cost (e.g., "INR", "USD")
  isRecurring: boolean
  recurringPattern?: string
  visibility: "public" | "followers" | "private" // Visibility setting
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  imageUrl: string // Main image URL for the plan (required)
  imageUrls?: string[] // Additional image URLs
  city?: string
  state?: string
  country?: string
  category?: string
  date?: Timestamp | Date // Redundant with dateTime, keeping for compatibility
  cost?: number // Redundant with costPerHead, keeping for compatibility
  author?: User // Redundant with organizer, keeping for compatibility
}

export interface Notification {
  id: string
  userId: string // The user who receives the notification
  type: "like" | "comment" | "follow" | "plan_join" | "message" | "follow_request_accepted" | "follow_request" | "plan_message" | "plan_update" | "plan_cancelled" | "plan_announcement"
  fromUserId: string // The user who triggered the notification
  fromUser: EmbeddedUser // Full user object of the sender (simplified to EmbeddedUser)
  fromUsername: string // Redundant with fromUser.username, keeping for compatibility
  fromUserName: string // Redundant with fromUser.name, keeping for compatibility
  fromUserPhotoURL?: string // Redundant with fromUser.avatar, keeping for compatibility
  content?: string // Optional custom message content
  postId?: string // If notification is related to a post
  planId?: string // If notification is related to a plan
  planTitle?: string // If notification is related to a plan, its title
  isRead: boolean // Whether the notification has been read
  read: boolean // For backward compatibility
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface PlanMessage {
  id: string
  planId: string
  senderId: string
  sender: EmbeddedUser
  content: string
  type: "text" | "image" | "announcement"
  createdAt: Timestamp | Date
  isRead: boolean
}

export interface Message {
  id: string
  conversationId: string // A unique ID for the conversation (e.g., sorted user IDs)
  senderId: string
  receiverId: string
  content: string
  type: "text" | "image" | "video" // Type of message content
  createdAt: Timestamp | Date
  isRead: boolean // Whether the message has been read by the receiver
  read: boolean // For backward compatibility
  text?: string // Redundant with content, keeping for compatibility
  author?: EmbeddedUser // Author's user details for display
}

export interface Story {
  id: string
  userId: string // ID of the user who created the story
  author: EmbeddedUser // Full user object of the author (simplified to EmbeddedUser)
  username: string // Redundant with author.username, keeping for compatibility
  userDisplayName: string // Redundant with author.name, keeping for compatibility
  userPhotoURL?: string // Redundant with author.avatar, keeping for compatibility
  imageUrl: string
  caption?: string
  createdAt: Timestamp | Date
  expiresAt: Timestamp | Date // When the story expires (e.g., 24 hours after creation)
  viewedBy: string[] // Array of user IDs who viewed the story
  views: number // Count of views (derived from viewedBy)
}

export interface Follow {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "declined"
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Conversation {
  id: string
  participants: string[] // Array of user IDs in the conversation
  messages: Message[] // Array of messages in the conversation (can be limited for display)
  lastMessage: string
  lastMessageAt: Date
  createdAt: Date
}

export interface AppError {
  code: string
  message: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor?: any
  hasMore: boolean
}

export interface SearchFilters {
  category?: string
  location?: string
  dateRange?: {
    start: Date
    end: Date
  }
  maxParticipants?: number
  tags?: string[]
}

export interface UserStats {
  totalPosts: number
  totalPlans: number
  totalFollowers: number
  totalFollowing: number
  joinedPlans: number
  completedPlans: number
}

export interface PlanStats {
  totalParticipants: number
  averageRating?: number
  completionRate?: number
  repeatParticipants?: number
}

export interface NotificationSettings {
  likes: boolean
  comments: boolean
  follows: boolean
  planUpdates: boolean
  messages: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface PrivacySettings {
  isPrivate: boolean
  showEmail: boolean
  showLocation: boolean
  allowMessages: "everyone" | "followers" | "none"
  allowPlanInvites: "everyone" | "followers" | "none"
}
