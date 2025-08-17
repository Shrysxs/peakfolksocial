import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, getAdminDb, FieldValue } from "@/lib/firebase-admin"
import type { Transaction, DocumentData } from "firebase-admin/firestore"

export const runtime = "nodejs"

export async function POST(req: NextRequest, { params }: { params: { planId: string } }) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined
    if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })

    const decoded = await adminAuth.verifyIdToken(token)
    const userId = decoded.uid

    const planId = params?.planId
    if (!planId) return NextResponse.json({ error: "planId is required" }, { status: 400 })

    const planRef = adminDb.collection("plans").doc(planId)
    const userRef = adminDb.collection("users").doc(userId)

    const result = await adminDb.runTransaction(async (tx: Transaction) => {
      const [planSnap, userSnap] = await Promise.all([tx.get(planRef), tx.get(userRef)])
      if (!planSnap.exists) throw new Error("Plan not found")
      if (!userSnap.exists) throw new Error("User not found")

      const planData = planSnap.data() as DocumentData
      const userData = userSnap.data() as DocumentData

      const participantIds: string[] = Array.isArray(planData.participantIds) ? planData.participantIds : []
      const currentParticipants: number = Number(planData.currentParticipants || participantIds.length || 0)
      const maxParticipants: number | null = planData.maxParticipants ?? null

      const alreadyJoined = participantIds.includes(userId)
      if (alreadyJoined) {
        return { joined: true, pending: false }
      }

      // For private plans, add a pending request instead of immediate join
      if (planData.isPrivate) {
        const pendingRequests: string[] = Array.isArray(planData.pendingJoinRequests)
          ? planData.pendingJoinRequests
          : []
        if (!pendingRequests.includes(userId)) {
          tx.update(planRef, {
            pendingJoinRequests: FieldValue.arrayUnion(userId),
          })
          // Notify organizer of join request
          const notifRef = adminDb.collection("notifications").doc()
          tx.set(notifRef, {
            id: notifRef.id,
            toUserId: planData.userId,
            fromUser: {
              id: userId,
              username: userData.username,
              name: userData.displayName || userData.username,
              avatar: userData.photoURL,
            },
            type: "plan_join_request",
            planId,
            content: `${userData.displayName || "Someone"} requested to join your plan "${planData.title}"`,
            isRead: false,
            createdAt: new Date(),
          })
        }
        return { joined: false, pending: true }
      }

      // Public plan - enforce capacity
      if (maxParticipants && currentParticipants >= maxParticipants) {
        throw new Error("Plan is full")
      }

      tx.update(planRef, {
        participantIds: FieldValue.arrayUnion(userId),
        currentParticipants: (currentParticipants || 0) + 1,
        updatedAt: new Date(),
      })

      // Notify organizer of new participant
      if (planData.userId !== userId) {
        const notifRef = adminDb.collection("notifications").doc()
        tx.set(notifRef, {
          id: notifRef.id,
          toUserId: planData.userId,
          fromUser: {
            id: userId,
            username: userData.username,
            name: userData.displayName || userData.username,
            avatar: userData.photoURL,
          },
          type: "plan_join",
          planId,
          content: `${userData.displayName || "Someone"} joined your plan "${planData.title}"`,
          isRead: false,
          createdAt: new Date(),
        })
      }

      return { joined: true, pending: false }
    })

    return NextResponse.json({ ok: true, ...result }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const status = /not found/i.test(message) ? 404 : /full|capacity/i.test(message) ? 409 : 500
    console.error("[API] /api/plans/[planId]/join POST error", err)
    return NextResponse.json({ error: message || "Server error" }, { status })
  }
}
