import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined
    if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })

    const decoded = await adminAuth.verifyIdToken(token)
    const followerId = decoded.uid

    const body = await req.json()
    const { followingId } = body || {}
    if (!followingId) return NextResponse.json({ error: "followingId is required" }, { status: 400 })
    if (followerId === followingId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })

    const followerRef = adminDb.collection("users").doc(followerId)
    const followingRef = adminDb.collection("users").doc(followingId)

    const [followerSnap, followingSnap] = await Promise.all([followerRef.get(), followingRef.get()])
    if (!followerSnap.exists || !followingSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const followerData = followerSnap.data() || {}
    const followingData = followingSnap.data() || {}

    const isFollowing = Array.isArray(followerData.followingIds) && followerData.followingIds.includes(followingId)

    const batch = adminDb.batch()

    // Since we need FieldValue, use standard admin import
    const { FieldValue } = await import("firebase-admin/firestore")

    if (isFollowing) {
      batch.update(followerRef, {
        followingIds: FieldValue.arrayRemove(followingId),
        following: Math.max(0, (followerData.following || 0) - 1),
      })
      batch.update(followingRef, {
        followerIds: FieldValue.arrayRemove(followerId),
        followers: Math.max(0, (followingData.followers || 0) - 1),
      })
    } else {
      if (followingData.isPrivate) {
        // Send follow request
        batch.update(followingRef, {
          pendingFollowRequests: FieldValue.arrayUnion(followerId),
        })
        batch.update(followerRef, {
          sentFollowRequests: FieldValue.arrayUnion(followingId),
        })
        // Notification for recipient
        const notifRef = adminDb.collection("notifications").doc()
        batch.set(notifRef, {
          id: notifRef.id,
          toUserId: followingId,
          fromUser: {
            id: followerId,
            username: followerData.username,
            name: followerData.displayName,
            avatar: followerData.photoURL,
          },
          type: "follow_request",
          content: `${followerData.displayName || "Someone"} sent you a follow request.`,
          isRead: false,
          createdAt: new Date(),
        })
      } else {
        // Direct follow
        batch.update(followerRef, {
          followingIds: FieldValue.arrayUnion(followingId),
          following: (followerData.following || 0) + 1,
        })
        batch.update(followingRef, {
          followerIds: FieldValue.arrayUnion(followerId),
          followers: (followingData.followers || 0) + 1,
        })
        const notifRef = adminDb.collection("notifications").doc()
        batch.set(notifRef, {
          id: notifRef.id,
          toUserId: followingId,
          fromUser: {
            id: followerId,
            username: followerData.username,
            name: followerData.displayName,
            avatar: followerData.photoURL,
          },
          type: "follow",
          content: `${followerData.displayName || "Someone"} started following you.`,
          isRead: false,
          createdAt: new Date(),
        })
      }
    }

    await batch.commit()

    return NextResponse.json({ ok: true, following: !isFollowing }, { status: 200 })
  } catch (err: any) {
    console.error("[API] /api/follows/toggle POST error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
