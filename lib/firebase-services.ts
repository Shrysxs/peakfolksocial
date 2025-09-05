import { db, auth, storage, googleProvider, analytics } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  startAfter,
  serverTimestamp,
  runTransaction,
  onSnapshot,
  addDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithPopup,
  RecaptchaVerifier,
  updateProfile as firebaseUpdateProfile,
  type ConfirmationResult,
} from "firebase/auth"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { logEvent } from "firebase/analytics"
import type { User as UserProfile, Post, Plan, Notification, Message, Story, Comment, EmbeddedUser, PlanMessage } from "@/types"
import { handleError, handleFirestoreError, handleAuthError, handleStorageError } from "@/lib/error-handler"

// Extend Window interface for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: any
  }
}

/* -------------------------------------------------------------------------- */
/* Safeguards                                                                 */
/* -------------------------------------------------------------------------- */

const getSafeAuth = () => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set and the app has been redeployed.")
  }
  return auth
}

// Declare getUser function (used as a fallback when embedded data is missing)
const getUser = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

// Helper to convert Firestore Timestamp to Date
export const toDate = (timestamp: any) => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate()
  }
  return null
}

const normalizeArray = (v: any): string[] => (Array.isArray(v) ? v : [])

const fallbackUser = (id: string): UserProfile => ({
  uid: id, // Assuming uid and id are the same for simplicity in fallback
  id,
  email: "unknown@example.com",
  displayName: "Unknown User",
  username: "unknownuser",
  bio: "",
  website: "",
  location: "",
  photoURL: "/placeholder.svg",
  followers: 0,
  following: 0,
  followerIds: [],
  followingIds: [],
  posts: 0,
  plans: 0,
  verified: false,
  isPrivate: false,
  createdAt: serverTimestamp() as any, // Placeholder for Timestamp
  updatedAt: serverTimestamp() as any, // Placeholder for Timestamp
})

/* ------------------------------ Mappers ----------------------------------- */

const mapUserDoc = (id: string, data: any): UserProfile => {
  const followerIds = normalizeArray(data.followerIds)
  const followingIds = normalizeArray(data.followingIds)
  return {
    id,
    uid: id, // Ensure uid is set
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    followers: followerIds.length,
    following: followingIds.length,
    followerIds: followerIds,
    followingIds: followingIds,
    displayName: data.displayName || data.username || "Unknown User",
    name: data.name || data.displayName || data.username || "Unknown User",
    photoURL: data.photoURL || "/placeholder.svg",
  }
}

const mapPostDoc = async (id: string, data: any): Promise<Post> => {
  // Prefer embedded author to avoid redundant queries; fallback to fetching when absent
  let author: EmbeddedUser | undefined = data.author
  if (!author) {
    const authorProfile = await getUser(data.userId)
    author = {
      id: authorProfile?.id || data.userId,
      username: authorProfile?.username || "unknown",
      avatar: authorProfile?.photoURL || "/placeholder.svg",
      name: authorProfile?.displayName || authorProfile?.username || "Unknown User",
    }
  }

  // Map embedded comments; avoid fetching authors if embedded
  const comments = await Promise.all(
    normalizeArray(data.comments).map(async (comment: any) => {
      const commentAuthor: EmbeddedUser = comment.author || {
        id: comment.userId,
        username: "unknown",
        avatar: "/placeholder.svg",
        name: "Unknown User",
      }
      return {
        ...comment,
        createdAt: toDate(comment.createdAt),
        updatedAt: toDate(comment.updatedAt),
        author: commentAuthor,
      }
    }),
  )

  return {
    id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    author: author!,
    likes: normalizeArray(data.likes),
    comments: comments,
    isLiked: false, // This should be determined by client-side logic or a specific query
    isBookmarked: false, // This should be determined by client-side logic or a specific query
    shares: data.shares || 0,
    imageUrl: data.imageUrl || "/placeholder.svg", // Ensure imageUrl is always present
  } as Post
}

const mapPlanDoc = async (id: string, data: any): Promise<Plan> => {
  // Prefer embedded organizer; fallback to fetching when absent
  let organizer: EmbeddedUser | undefined = data.organizer
  if (!organizer) {
    const organizerProfile = await getUser(data.userId)
    organizer = {
      id: organizerProfile?.id || data.userId,
      username: organizerProfile?.username || "unknown",
      avatar: organizerProfile?.photoURL || "/placeholder.svg",
      name: organizerProfile?.displayName || organizerProfile?.username || "Unknown User",
    }
  }
  return {
    id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    dateTime: toDate(data.dateTime),
    date: toDate(data.date), // Assuming 'date' is also a Timestamp
    organizer: organizer!,
    participantIds: normalizeArray(data.participantIds),
    currentParticipants: normalizeArray(data.participantIds).length,
    isJoined: false, // Client-side determined
    isBookmarked: false, // Client-side determined
    imageUrl: data.imageUrl || "/placeholder.svg", // Ensure imageUrl is always present
  } as Plan
}

const mapStoryDoc = async (id: string, data: any): Promise<Story> => {
  const authorProfile = await getUser(data.userId) // Fetch full author profile
  const author: EmbeddedUser = {
    id: authorProfile?.id || data.userId,
    username: authorProfile?.username || "unknown",
    avatar: authorProfile?.photoURL || "/placeholder.svg",
    name: authorProfile?.displayName || authorProfile?.username || "Unknown User",
  }
  return {
    id,
    ...data,
    createdAt: toDate(data.createdAt),
    expiresAt: toDate(data.expiresAt),
    author: author,
    viewedBy: normalizeArray(data.viewedBy),
    views: normalizeArray(data.viewedBy).length,
    username: author.username, // Redundant but kept for compatibility
    userDisplayName: author.name, // Redundant but kept for compatibility
    userPhotoURL: author.avatar, // Redundant but kept for compatibility
  } as Story
}

const mapMessageDoc = (id: string, data: any): Message => ({
  id,
  ...data,
  createdAt: toDate(data.createdAt),
  isRead: data.read || data.isRead || false, // Aligning with isRead
})

const mapNotificationDoc = async (id: string, data: any): Promise<Notification> => {
  const fromUserProfile = await getUser(data.fromUserId)
  const fromUser: EmbeddedUser = {
    id: fromUserProfile?.id || data.fromUserId,
    username: fromUserProfile?.username || "unknown",
    avatar: fromUserProfile?.photoURL || "/placeholder.svg",
    name: fromUserProfile?.displayName || fromUserProfile?.username || "Unknown User",
  }
  return {
    id,
    ...data,
    createdAt: toDate(data.createdAt),
    fromUser: fromUser,
    fromUsername: fromUser.username, // Redundant but kept for compatibility
    fromUserName: fromUser.name, // Redundant but kept for compatibility
    fromUserPhotoURL: fromUser.avatar, // Redundant but kept for compatibility
    isRead: data.read || data.isRead || false, // Aligning with isRead
  } as Notification
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

// --- Auth Services ---

export const registerUser = async (email: string, password: string, username: string) => {
  const a = getSafeAuth()
  const userCredential = await createUserWithEmailAndPassword(a, email, password)
  const user = userCredential.user

  // Create user profile in Firestore
  const userRef = doc(db, "users", user.uid)
  await setDoc(userRef, {
    id: user.uid,
    email: user.email,
    username: username,
    displayName: username,
    photoURL: user.photoURL || "",
    bio: "",
    website: "",
    location: "",
    posts: 0,
    followers: 0,
    following: 0,
    isPrivate: false,
    createdAt: serverTimestamp(),
    followerIds: [], // Initialize followerIds array
    followingIds: [], // Initialize followingIds array
    pendingFollowRequests: [], // Users who want to follow this user
    sentFollowRequests: [], // Users this user wants to follow
  })

  if (analytics) logEvent(analytics, "sign_up", { method: "email_password" })
  return user
}

export const loginUser = async (email: string, password: string) => {
  const a = getSafeAuth()
  const userCredential = await signInWithEmailAndPassword(a, email, password)
  if (analytics) logEvent(analytics, "login", { method: "email_password" })
  return userCredential.user
}

export const logoutUser = async () => {
  const a = getSafeAuth()
  await signOut(a)
  if (analytics) logEvent(analytics, "logout")
}

export const signInWithGoogle = async () => {
  const a = getSafeAuth()
  const result = await signInWithPopup(a, googleProvider)
  const user = result.user

  // Check if user exists in Firestore, if not, create profile
  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      username: user.email?.split("@")[0] || user.uid, // Default username
      displayName: user.displayName || user.email?.split("@")[0] || user.uid,
      photoURL: user.photoURL || "",
      bio: "",
      website: "",
      location: "",
      posts: 0,
      followers: 0,
      following: 0,
      isPrivate: false,
      createdAt: serverTimestamp(),
      followerIds: [],
      followingIds: [],
      pendingFollowRequests: [],
      sentFollowRequests: [],
    })
  }
  if (analytics) logEvent(analytics, "login", { method: "google" })
  return user
}

export const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult | null> => {
  // Phone authentication is currently disabled in this project configuration.
  // Returning null allows the UI to handle this gracefully without throwing.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("signInWithPhone called but phone auth is disabled. Returning null.")
  }
  return null

  // To enable:
  // 1) Enable Phone provider in Firebase Console.
  // 2) Implement reCAPTCHA and signInWithPhoneNumber below, then return the ConfirmationResult.
  /*
  if (typeof window !== "undefined" && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" })
  }
  const appVerifier = window.recaptchaVerifier
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  return confirmationResult
  */
}

export const confirmPhoneCode = async (confirmationResult: any, code: string) => {
  const result = await confirmationResult.confirm(code)
  const user = result.user

  // Check if user exists in Firestore, if not, create profile
  const userRef = doc(db, "users", user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email || null,
      username: user.phoneNumber || user.uid, // Default username
      displayName: user.phoneNumber || user.uid,
      photoURL: user.photoURL || "",
      bio: "",
      website: "",
      location: "",
      posts: 0,
      followers: 0,
      following: 0,
      isPrivate: false,
      createdAt: serverTimestamp(),
      followerIds: [],
      followingIds: [],
      pendingFollowRequests: [],
      sentFollowRequests: [],
    })
  }
  if (analytics) logEvent(analytics, "login", { method: "phone" })
  return user
}

export const sendPasswordResetEmail = async (email: string) => {
  const a = getSafeAuth()
  await firebaseSendPasswordResetEmail(a, email)
  if (analytics) logEvent(analytics, "password_reset_request")
}

// --- User Services ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile
  }
  return null
}

export const getUsers = async (
  searchQuery?: string,
  lastVisible?: any,
  limitCount = 10,
): Promise<{ users: UserProfile[]; lastVisible: any }> => {
  let usersQuery = query(collection(db, "users"), orderBy("username"), limit(limitCount))

  if (searchQuery) {
    const lowerCaseQuery = searchQuery.toLowerCase()
    usersQuery = query(
      collection(db, "users"),
      where("username", ">=", lowerCaseQuery),
      where("username", "<=", lowerCaseQuery + "\uf8ff"),
      orderBy("username"),
      limit(limitCount),
    )
  }

  if (lastVisible) {
    usersQuery = query(usersQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(usersQuery)
  const users = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UserProfile)
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { users, lastVisible: newLastVisible }
}

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, "users")
  const q = query(usersRef, where("username", "==", username))
  const querySnapshot = await getDocs(q)
  return !querySnapshot.empty
}

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>,
  profileImageFile?: File,
): Promise<void> => {
  const userRef = doc(db, "users", userId)
  let photoURL = data.photoURL

  if (profileImageFile) {
    const storageRef = ref(storage, `profile_pictures/${userId}/${profileImageFile.name}`)
    const snapshot = await uploadBytes(storageRef, profileImageFile)
    photoURL = await getDownloadURL(snapshot.ref)
  }

  await updateDoc(userRef, { ...data, photoURL })

  // Update Firebase Auth profile if display name or photo URL changed
  if (auth.currentUser && auth.currentUser.uid === userId) {
    await firebaseUpdateProfile(auth.currentUser, {
      displayName: data.displayName,
      photoURL: photoURL || auth.currentUser.photoURL,
    })
  }
  if (analytics) logEvent(analytics, "user_profile_updated", { userId })
}

/* ------------------------------- Follows ---------------------------------- */

export const getFollowStatus = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  if (!currentUserId || !targetUserId) return false
  const currentUserRef = doc(db, "users", currentUserId)
  const currentUserSnap = await getDoc(currentUserRef)
  if (currentUserSnap.exists()) {
    const userData = currentUserSnap.data() as UserProfile
    return userData.followingIds?.includes(targetUserId) || false
  }
  return false
}

export const getFollowerCount = async (userId: string): Promise<number> => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists()) {
    const userData = userSnap.data() as UserProfile
    return userData.followerIds?.length || 0
  }
  return 0
}

export const toggleFollowUser = async (
  followerId: string,
  followingId: string,
): Promise<{ following: boolean }> => {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself.")
  }

  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch("/api/follows/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ followingId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to toggle follow")
  }
  const data = (await res.json()) as { ok: true; following: boolean }
  return { following: data.following }
}

export const getFollowRequests = async (userId: string): Promise<UserProfile[]> => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return []

  const userData = userSnap.data() as UserProfile
  const pendingRequests = userData.pendingFollowRequests || []

  if (pendingRequests.length === 0) return []

  const usersQuery = query(collection(db, "users"), where("id", "in", pendingRequests))
  const querySnapshot = await getDocs(usersQuery)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UserProfile)
}

export const handleFollowRequest = async (
  requesterId: string,
  targetUserId: string,
  accept: boolean,
): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const requesterRef = doc(db, "users", requesterId)
    const targetUserRef = doc(db, "users", targetUserId)

    const requesterSnap = await transaction.get(requesterRef)
    const targetUserSnap = await transaction.get(targetUserRef)

    if (!requesterSnap.exists() || !targetUserSnap.exists()) {
      throw new Error("User not found.")
    }

    const requesterData = requesterSnap.data() as UserProfile
    const targetUserData = targetUserSnap.data() as UserProfile

    // Remove from pending requests of target user
    transaction.update(targetUserRef, {
      pendingFollowRequests: arrayRemove(requesterId),
    })
    // Remove from sent requests of requester
    transaction.update(requesterRef, {
      sentFollowRequests: arrayRemove(targetUserId),
    })

    if (accept) {
      // Add to followers of target user
      transaction.update(targetUserRef, {
        followerIds: arrayUnion(requesterId),
        followers: (targetUserData.followers || 0) + 1,
      })
      // Add to following of requester
      transaction.update(requesterRef, {
        followingIds: arrayUnion(targetUserId),
        following: (requesterData.following || 0) + 1,
      })

      // Add notification for the requester
      await addDoc(collection(db, "notifications"), {
        toUserId: requesterId,
        fromUser: {
          id: targetUserId,
          username: targetUserData.username,
          name: targetUserData.displayName,
          avatar: targetUserData.photoURL,
        },
        type: "follow_request_accepted",
        content: `${targetUserData.displayName} accepted your follow request.`,
        isRead: false,
        createdAt: serverTimestamp(),
      })
      if (analytics) logEvent(analytics, "follow_request_accepted", { requesterId, targetUserId })
    } else {
      if (analytics) logEvent(analytics, "follow_request_rejected", { requesterId, targetUserId })
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Posts                                                                      */
/* -------------------------------------------------------------------------- */

export const createPost = async (userId: string, caption: string, imageFile: File): Promise<string> => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error("User not found.")
  }
  const userData = userSnap.data() as UserProfile

  const imageRef = ref(storage, `posts/${userId}/${imageFile.name}_${Date.now()}`)
  const snapshot = await uploadBytes(imageRef, imageFile)
  const imageUrl = await getDownloadURL(snapshot.ref)

  const newPostRef = doc(collection(db, "posts"))
  await setDoc(newPostRef, {
    id: newPostRef.id,
    userId: userId,
    author: {
      id: userData.id,
      username: userData.username,
      name: userData.displayName,
      avatar: userData.photoURL,
    },
    caption: caption,
    imageUrl: imageUrl,
    likes: [],
    createdAt: serverTimestamp(),
  })

  // Increment user's post count
  await updateDoc(userRef, {
    posts: (userData.posts || 0) + 1,
  })

  if (analytics) logEvent(analytics, "post_created", { postId: newPostRef.id, userId })
  return newPostRef.id
}

export const getPosts = async (lastVisible?: any, limitCount = 10): Promise<{ posts: Post[]; lastVisible: any }> => {
  let postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount))

  if (lastVisible) {
    postsQuery = query(postsQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(postsQuery)
  const posts = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post)
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { posts, lastVisible: newLastVisible }
}

// Real-time version for feed posts
export const getPostsRealtime = (callback: (posts: Post[]) => void, limitCount = 20) => {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(limitCount))
  
  const unsubscribe = onSnapshot(postsQuery, (snapshot: any) => {
    const posts = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Post)
    callback(posts)
  })
  
  return unsubscribe
}

export const getUserPosts = async (
  userId: string,
  lastVisible?: any,
  limitCount = 10,
): Promise<{ posts: Post[]; lastVisible: any }> => {
  let postsQuery = query(
    collection(db, "posts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  if (lastVisible) {
    postsQuery = query(postsQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(postsQuery)
  const posts = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post)
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { posts, lastVisible: newLastVisible }
}

export const toggleLike = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(db, "posts", postId)
  const postSnap = await getDoc(postRef)

  if (!postSnap.exists()) {
    throw new Error("Post not found.")
  }

  const postData = postSnap.data() as Post
  const isLiked = postData.likes.includes(userId)

  if (isLiked) {
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
    })
    if (analytics) logEvent(analytics, "post_unlike", { postId, userId })
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
    })
    // Add notification for the post author
    if (postData.userId !== userId) {
      const likerUser = await getUserProfile(userId)
      if (likerUser) {
        await addDoc(collection(db, "notifications"), {
          toUserId: postData.userId,
          fromUser: {
            id: likerUser.id,
            username: likerUser.username,
            name: likerUser.displayName,
            avatar: likerUser.photoURL,
          },
          type: "like",
          content: `${likerUser.displayName} liked your post.`,
          postId: postId,
          isRead: false,
          createdAt: serverTimestamp(),
        })
      }
    }
    if (analytics) logEvent(analytics, "post_like", { postId, userId })
  }
}

export const deletePost = async (postId: string, imageUrl: string): Promise<void> => {
  const postRef = doc(db, "posts", postId)
  const postSnap = await getDoc(postRef)

  if (!postSnap.exists()) {
    throw new Error("Post not found.")
  }

  const postData = postSnap.data() as Post
  const userId = postData.userId
  const userRef = doc(db, "users", userId)

  await runTransaction(db, async (transaction) => {
    // Delete post document
    transaction.delete(postRef)

    // Decrement user's post count
    const userSnap = await transaction.get(userRef)
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile
      transaction.update(userRef, {
        posts: Math.max(0, (userData.posts || 0) - 1),
      })
    }

    // Delete associated comments
    const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId))
    const commentsSnapshot = await getDocs(commentsQuery)
    commentsSnapshot.docs.forEach((commentDoc) => {
      transaction.delete(commentDoc.ref)
    })

    // Delete associated image from storage
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
    }
  })
  if (analytics) logEvent(analytics, "post_deleted", { postId, userId })
}

// --- Comment Services ---

export const getComments = (postId: string, callback: (comments: Comment[]) => void) => {
  const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"))
  const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Comment)
    callback(comments)
  })
  return unsubscribe
}

export const addComment = async (postId: string, userId: string, content: string): Promise<void> => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error("User not found.")
  }
  const userData = userSnap.data() as UserProfile

  const postRef = doc(db, "posts", postId)
  const postSnap = await getDoc(postRef)
  if (!postSnap.exists()) {
    throw new Error("Post not found.")
  }
  const postData = postSnap.data() as Post

  await addDoc(collection(db, "comments"), {
    postId: postId,
    userId: userId,
    author: {
      id: userData.id,
      username: userData.username,
      name: userData.displayName,
      avatar: userData.photoURL,
    },
    content: content,
    createdAt: serverTimestamp(),
  })

  // Add notification for the post author
  if (postData.userId !== userId) {
    await addDoc(collection(db, "notifications"), {
      toUserId: postData.userId,
      fromUser: {
        id: userData.id,
        username: userData.username,
        name: userData.displayName,
        avatar: userData.photoURL,
      },
      type: "comment",
      content: `${userData.displayName} commented on your post: "${content}"`,
      postId: postId,
      isRead: false,
      createdAt: serverTimestamp(),
    })
  }
  if (analytics) logEvent(analytics, "comment_added", { postId, userId })
}

// --- Plan Services ---

export const getCreatedPlans = async (
  userId: string,
  lastVisible?: any,
  limitCount = 10,
): Promise<{ plans: Plan[]; lastVisible: any }> => {
  let plansQuery = query(
    collection(db, "plans"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  if (lastVisible) {
    plansQuery = query(plansQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(plansQuery)
  const plans = documentSnapshots.docs.map((doc) => {
    const data = doc.data() || {}
    return { id: doc.id, ...data } as Plan
  })
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { plans, lastVisible: newLastVisible }
}

export const getPlanPosts = async (
  planId: string,
  lastVisible?: any,
  limitCount = 10,
): Promise<{ posts: Post[]; lastVisible: any }> => {
  let postsQuery = query(
    collection(db, "posts"),
    where("planId", "==", planId),
    orderBy("createdAt", "asc"),
    limit(limitCount),
  )

  if (lastVisible) {
    postsQuery = query(postsQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(postsQuery)
  const posts = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post)
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { posts, lastVisible: newLastVisible }
}

export const createPlan = async (
  userId: string,
  planData: {
    title: string
    description: string
    imageUrl?: string
    location: string
    dateTime: Date
    maxParticipants?: number
    costPerHead: number
    currency: string
    isPrivate?: boolean
  },
  imageFile?: File,
): Promise<string> => {
  // Upload image client-side if provided, then call secure API to create the plan server-side
  let imageUrl = planData.imageUrl || ""
  if (imageFile) {
    const imageRef = ref(storage, `plans/${userId}/${imageFile.name}_${Date.now()}`)
    const snapshot = await uploadBytes(imageRef, imageFile)
    imageUrl = await getDownloadURL(snapshot.ref)
  }

  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch("/api/plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: planData.title,
      description: planData.description,
      imageUrl,
      location: planData.location,
      dateTime: planData.dateTime,
      maxParticipants: planData.maxParticipants,
      costPerHead: planData.costPerHead,
      currency: planData.currency,
      isPrivate: !!planData.isPrivate,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to create plan")
  }
  const data = await res.json()
  if (analytics) logEvent(analytics, "plan_created", { planId: data?.id, userId })
  return data.id as string
}

export const getPlans = async (
  limitCount = 10,
  filters?: { location?: string; category?: string },
  lastVisible?: any,
): Promise<{ plans: Plan[]; lastVisible: any }> => {
  let plansQuery: any = collection(db, "plans")

  if (filters?.location && filters.location !== "All Locations") {
    plansQuery = query(plansQuery, where("location", "==", filters.location))
  }
  // Assuming 'category' is a field in your plan documents. If not, this filter won't work.
  if (filters?.category && filters.category !== "All Categories") {
    plansQuery = query(plansQuery, where("category", "==", filters.category))
  }

  plansQuery = query(plansQuery, orderBy("createdAt", "desc"), limit(limitCount))

  if (lastVisible) {
    plansQuery = query(plansQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(plansQuery)
  const plans = documentSnapshots.docs.map((doc) => {
    const data = doc.data() || {}
    return { id: doc.id, ...data } as Plan
  })
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { plans, lastVisible: newLastVisible }
}

// Real-time version for plans
export const getPlansRealtime = (
  callback: (plans: Plan[]) => void, 
  limitCount = 20,
  filters?: { location?: string; category?: string }
) => {
  let plansQuery: any = collection(db, "plans")

  if (filters?.location && filters.location !== "All Locations") {
    plansQuery = query(plansQuery, where("location", "==", filters.location))
  }
  if (filters?.category && filters.category !== "All Categories") {
    plansQuery = query(plansQuery, where("category", "==", filters.category))
  }

  plansQuery = query(plansQuery, orderBy("createdAt", "desc"), limit(limitCount))
  
  const unsubscribe = onSnapshot(plansQuery, (snapshot: any) => {
    const plans = snapshot.docs.map((doc: any) => {
      const data = doc.data() || {}
      return { id: doc.id, ...data } as Plan
    })
    callback(plans)
  })
  
  return unsubscribe
}

export const getJoinedPlans = async (
  userId: string,
  lastVisible?: any,
  limitCount = 10,
): Promise<{ plans: Plan[]; lastVisible: any }> => {
  let plansQuery = query(
    collection(db, "plans"),
    where("participantIds", "array-contains", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )

  if (lastVisible) {
    plansQuery = query(plansQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(plansQuery)
  const plans = documentSnapshots.docs.map((doc) => {
    const data = doc.data() || {}
    return { id: doc.id, ...data } as Plan
  })
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { plans, lastVisible: newLastVisible }
}

export const getPlan = async (planId: string): Promise<Plan | null> => {
  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)
  if (!planSnap.exists()) return null
  const data = planSnap.data() || {}
  const plan = await mapPlanDoc(planSnap.id, data)
  return plan
}

export const joinPlan = async (
  planId: string,
): Promise<{ ok: true; joined: boolean; pending: boolean }> => {
  const user = auth.currentUser
  if (!user) throw new Error("Not authenticated")
  const token = await user.getIdToken()

  const res = await fetch(`/api/plans/${encodeURIComponent(planId)}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to join plan")
  }
  const data = (await res.json()) as { ok: true; joined: boolean; pending: boolean }
  if (analytics) {
    // Log attempt and outcome
    logEvent(analytics, "plan_join_result", { planId, joined: data.joined, pending: data.pending })
  }
  return data
}

export const leavePlan = async (planId: string, userId: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const planRef = doc(db, "plans", planId)
    const planSnap = await transaction.get(planRef)

    if (!planSnap.exists()) {
      throw new Error("Plan not found.")
    }

    const planData = planSnap.data() as Plan
    const isJoined = planData.participantIds.includes(userId)

    if (!isJoined) {
      throw new Error("Not a participant of this plan.")
    }

    if (planData.userId === userId) {
      throw new Error("Organizer cannot leave their own plan.")
    }

    transaction.update(planRef, {
      participantIds: arrayRemove(userId),
      currentParticipants: Math.max(0, (planData.currentParticipants || 0) - 1),
    })
  })
  if (analytics) logEvent(analytics, "plan_left", { planId, userId })
}

// --- Plan Chat Services ---

export const sendPlanMessage = async (
  planId: string,
  senderId: string,
  content: string,
  type: "text" | "image" | "announcement" = "text"
): Promise<string> => {
  const senderUser = await getUserProfile(senderId)
  if (!senderUser) {
    throw new Error("Sender user not found.")
  }

  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)
  if (!planSnap.exists()) {
    throw new Error("Plan not found.")
  }

  const planData = planSnap.data() as Plan
  if (!planData.participantIds.includes(senderId)) {
    throw new Error("You must be a participant to send messages in this plan.")
  }

  const messageRef = doc(collection(db, "planMessages"))
  await setDoc(messageRef, {
    id: messageRef.id,
    planId: planId,
    senderId: senderId,
    sender: {
      id: senderUser.id,
      username: senderUser.username,
      name: senderUser.displayName,
      avatar: senderUser.photoURL,
    },
    content: content,
    type: type,
    createdAt: serverTimestamp(),
    isRead: false,
  })

  // Add notification for all other participants
  const otherParticipants = planData.participantIds.filter(id => id !== senderId)
  for (const participantId of otherParticipants) {
    await addDoc(collection(db, "notifications"), {
      toUserId: participantId,
      fromUser: {
        id: senderUser.id,
        username: senderUser.username,
        name: senderUser.displayName,
        avatar: senderUser.photoURL,
      },
      type: "plan_message",
      content: `${senderUser.displayName} sent a message in "${planData.title}".`,
      planId: planId,
      isRead: false,
      createdAt: serverTimestamp(),
    })
  }

  if (analytics) logEvent(analytics, "plan_message_sent", { planId, senderId, messageType: type })
  return messageRef.id
}

export const getPlanMessages = async (
  planId: string,
  limitCount = 50,
  lastVisible?: any
): Promise<{ messages: PlanMessage[]; lastVisible: any }> => {
  let messagesQuery = query(
    collection(db, "planMessages"),
    where("planId", "==", planId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  )

  if (lastVisible) {
    messagesQuery = query(messagesQuery, startAfter(lastVisible))
  }

  const documentSnapshots = await getDocs(messagesQuery)
  const messages = documentSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as PlanMessage)
  const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]

  return { messages: messages.reverse(), lastVisible: newLastVisible }
}

// --- Plan Management Services ---

export const updatePlan = async (
  planId: string,
  userId: string,
  updates: {
    title?: string
    description?: string
    location?: string
    dateTime?: Date
    maxParticipants?: number
    costPerHead?: number
    currency?: string
    tags?: string[]
    requirements?: string[]
    whatToBring?: string[]
    imageUrl?: string
  }
): Promise<void> => {
  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)

  if (!planSnap.exists()) {
    throw new Error("Plan not found.")
  }

  const planData = planSnap.data() as Plan
  if (planData.userId !== userId) {
    throw new Error("Only the organizer can update this plan.")
  }

  await updateDoc(planRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })

  // Send announcement to all participants about the update
  const participants = planData.participantIds.filter(id => id !== userId)
  const organizerUser = await getUserProfile(userId)
  
  for (const participantId of participants) {
    await addDoc(collection(db, "notifications"), {
      toUserId: participantId,
      fromUser: {
        id: organizerUser?.id || userId,
        username: organizerUser?.username || "Organizer",
        name: organizerUser?.displayName || "Organizer",
        avatar: organizerUser?.photoURL,
      },
      type: "plan_update",
      content: `The plan "${planData.title}" has been updated.`,
      planId: planId,
      isRead: false,
      createdAt: serverTimestamp(),
    })
  }

  if (analytics) logEvent(analytics, "plan_updated", { planId, userId })
}

export const cancelPlan = async (planId: string, userId: string, reason?: string): Promise<void> => {
  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)

  if (!planSnap.exists()) {
    throw new Error("Plan not found.")
  }

  const planData = planSnap.data() as Plan
  if (planData.userId !== userId) {
    throw new Error("Only the organizer can cancel this plan.")
  }

  await updateDoc(planRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  })

  // Send cancellation notification to all participants
  const participants = planData.participantIds.filter(id => id !== userId)
  const organizerUser = await getUserProfile(userId)
  
  for (const participantId of participants) {
    await addDoc(collection(db, "notifications"), {
      toUserId: participantId,
      fromUser: {
        id: organizerUser?.id || userId,
        username: organizerUser?.username || "Organizer",
        name: organizerUser?.displayName || "Organizer",
        avatar: organizerUser?.photoURL,
      },
      type: "plan_cancelled",
      content: `The plan "${planData.title}" has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      planId: planId,
      isRead: false,
      createdAt: serverTimestamp(),
    })
  }

  if (analytics) logEvent(analytics, "plan_cancelled", { planId, userId })
}

export const deletePlan = async (planId: string, userId: string): Promise<void> => {
  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)

  if (!planSnap.exists()) {
    throw new Error("Plan not found.")
  }

  const planData = planSnap.data() as Plan
  if (planData.userId !== userId) {
    throw new Error("Only the organizer can delete this plan.")
  }

  // Delete all plan messages
  const messagesQuery = query(collection(db, "planMessages"), where("planId", "==", planId))
  const messagesSnap = await getDocs(messagesQuery)
  const deletePromises = messagesSnap.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)

  // Delete the plan
  await deleteDoc(planRef)

  if (analytics) logEvent(analytics, "plan_deleted", { planId, userId })
}

export const sendPlanAnnouncement = async (
  planId: string,
  organizerId: string,
  content: string
): Promise<string> => {
  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)

  if (!planSnap.exists()) {
    throw new Error("Plan not found.")
  }

  const planData = planSnap.data() as Plan
  if (planData.userId !== organizerId) {
    throw new Error("Only the organizer can send announcements.")
  }

  const organizerUser = await getUserProfile(organizerId)
  if (!organizerUser) {
    throw new Error("Organizer user not found.")
  }

  // Send announcement message
  const messageId = await sendPlanMessage(planId, organizerId, content, "announcement")

  // Send notification to all participants
  const participants = planData.participantIds.filter(id => id !== organizerId)
  for (const participantId of participants) {
    await addDoc(collection(db, "notifications"), {
      toUserId: participantId,
      fromUser: {
        id: organizerUser.id,
        username: organizerUser.username,
        name: organizerUser.displayName,
        avatar: organizerUser.photoURL,
      },
      type: "plan_announcement",
      content: `${organizerUser.displayName} made an announcement in "${planData.title}".`,
      planId: planId,
      isRead: false,
      createdAt: serverTimestamp(),
    })
  }

  if (analytics) logEvent(analytics, "plan_announcement_sent", { planId, organizerId })
  return messageId
}

export const getPlanMembers = async (planId: string): Promise<UserProfile[]> => {
  const planRef = doc(db, "plans", planId)
  const planSnap = await getDoc(planRef)
  if (!planSnap.exists()) return []

  const planData = planSnap.data() as Plan
  const participantIds = planData.participantIds || []

  if (participantIds.length === 0) return []

  // Fetch each user individually since Firestore has a limit of 10 items in "in" queries
  const userPromises = participantIds.map(async (userId) => {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserProfile
    }
    return null
  })

  const users = await Promise.all(userPromises)
  return users.filter((user): user is UserProfile => user !== null)
}

// --- Message Services ---

export const getConversationList = (userId: string, callback: (conversations: Message[]) => void) => {
  const messagesQuery = query(
    collection(db, "messages"),
    where("participants", "array-contains", userId),
    orderBy("createdAt", "desc"),
  )

  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const conversationsMap = new Map<string, Message>()
    const unreadCountMap = new Map<string, number>()
    
    snapshot.docs.forEach((doc) => {
      const message = { id: doc.id, ...doc.data() } as Message
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId
      const conversationKey = [userId, otherUserId].sort().join("_")

      // Count unread messages for this conversation
      if (message.receiverId === userId && !message.isRead) {
        unreadCountMap.set(conversationKey, (unreadCountMap.get(conversationKey) || 0) + 1)
      }

      // Only keep the latest message for each conversation
      if (
        !conversationsMap.has(conversationKey) ||
        message.createdAt > conversationsMap.get(conversationKey)!.createdAt
      ) {
        const messageWithUnreadCount = {
          ...message,
          unreadCount: unreadCountMap.get(conversationKey) || 0
        }
        conversationsMap.set(conversationKey, messageWithUnreadCount)
      }
    })
    
    // Update unread counts for existing conversations
    conversationsMap.forEach((message, key) => {
      message.unreadCount = unreadCountMap.get(key) || 0
    })
    
    callback(Array.from(conversationsMap.values()).sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() || 0
      const bTime = toDate(b.createdAt)?.getTime() || 0
      return bTime - aTime
    }))
  })
  return unsubscribe
}

export const getMessages = (userId1: string, userId2: string, callback: (messages: Message[]) => void) => {
  const conversationId = [userId1, userId2].sort().join("_")
  const messagesQuery = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
  )
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Message)
    callback(messages)
  })
  return unsubscribe
}

export const sendMessage = async (senderId: string, receiverId: string, content: string): Promise<void> => {
  const conversationId = [senderId, receiverId].sort().join("_")
  const senderUser = await getUserProfile(senderId)
  const receiverUser = await getUserProfile(receiverId)

  if (!senderUser || !receiverUser) {
    throw new Error("Sender or receiver user not found.")
  }

  await addDoc(collection(db, "messages"), {
    conversationId: conversationId,
    senderId: senderId,
    receiverId: receiverId,
    content: content,
    type: "text",
    createdAt: serverTimestamp(),
    isRead: false,
    participants: [senderId, receiverId],
  })

  // Add notification for the receiver
  await addDoc(collection(db, "notifications"), {
    toUserId: receiverId,
    fromUser: {
      id: senderUser.id,
      username: senderUser.username,
      name: senderUser.displayName,
      avatar: senderUser.photoURL,
    },
    type: "message",
    content: `${senderUser.displayName} sent you a message.`,
    isRead: false,
    createdAt: serverTimestamp(),
  })
  if (analytics) logEvent(analytics, "message_sent", { senderId, receiverId })
}

export const markMessagesAsRead = async (senderId: string, receiverId: string): Promise<void> => {
  const messagesQuery = query(
    collection(db, "messages"),
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("isRead", "==", false),
  )
  const snapshot = await getDocs(messagesQuery)
  const batch = writeBatch(db)
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true })
  })
  await batch.commit()
}

// --- Notification Services ---

export const getNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("toUserId", "==", userId),
    orderBy("createdAt", "desc"),
  )
  const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification)
    callback(notifications)
  })
  return unsubscribe
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, "notifications", notificationId)
  await updateDoc(notificationRef, { isRead: true })
  if (analytics) logEvent(analytics, "notification_read", { notificationId })
}

// --- Story Services ---

export const createStory = async (userId: string, imageFile: File): Promise<string> => {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    throw new Error("User not found.")
  }
  const userData = userSnap.data() as UserProfile

  const imageRef = ref(storage, `stories/${userId}/${imageFile.name}_${Date.now()}`)
  const snapshot = await uploadBytes(imageRef, imageFile)
  const imageUrl = await getDownloadURL(snapshot.ref)

  const newStoryRef = doc(collection(db, "stories"))
  await setDoc(newStoryRef, {
    id: newStoryRef.id,
    userId: userId,
    author: {
      id: userData.id,
      username: userData.username,
      name: userData.displayName,
      avatar: userData.photoURL,
    },
    imageUrl: imageUrl,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
  })
  if (analytics) logEvent(analytics, "story_created", { storyId: newStoryRef.id, userId })
  return newStoryRef.id
}

export const getActiveStories = (callback: (stories: any[]) => void) => {
  try {
    const storiesQuery = query(
      collection(db, "stories"),
      where("expiresAt", ">", new Date()),
      orderBy("expiresAt", "desc"),
    )
    const unsubscribe = onSnapshot(storiesQuery, (snapshot) => {
      const storiesMap = new Map<string, any[]>() // userId -> array of stories
      snapshot.docs.forEach((doc) => {
        const story = { id: doc.id, ...doc.data() } as any
        // Defensive: Only include stories with a valid expiresAt
        if (!story.expiresAt || isNaN(new Date(story.expiresAt).getTime())) return
        if (!storiesMap.has(story.userId)) {
          storiesMap.set(story.userId, [])
        }
        storiesMap.get(story.userId)?.push(story)
      })
      callback(Array.from(storiesMap.values()))
    }, (error) => {
      console.error("Error in getActiveStories Firestore listener:", error)
      callback([])
    })
    return unsubscribe
  } catch (err) {
    console.error("Error setting up getActiveStories Firestore query:", err)
    callback([])
    return () => {}
  }
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path)
    const snap = await uploadBytes(storageRef, file)
    return await getDownloadURL(snap.ref)
  } catch (err) {
    // ErrorHandler.handleStorageError(err, "Failed to upload file")
    // Use generic error handler instead
    // If ErrorHandler is not used elsewhere, remove its import
    // Otherwise, use ErrorHandler.handle(err, "storage")
    // Or just log the error
    // Storage upload error handled
    throw err
  }
}

/* -------------------------------------------------------------------------- */
/* Auth helpers                                                               */
/* -------------------------------------------------------------------------- */

export const getCurrentUser = () => auth.currentUser
// signOutUser is not used, logout is handled by auth-context
