import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined
    if (!token) return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 })

    const decoded = await adminAuth.verifyIdToken(token)
    const userId = decoded.uid

    const body = await req.json()
    const {
      title,
      description,
      imageUrl,
      location,
      dateTime,
      maxParticipants,
      costPerHead,
      currency,
      isPrivate = false,
    } = body || {}

    // Validation
    if (!title || typeof title !== "string" || title.trim().length < 3 || title.length > 120) {
      return NextResponse.json({ error: "Invalid title (3-120 chars)" }, { status: 400 })
    }
    if (!location || typeof location !== "string" || location.trim().length < 2) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 })
    }
    if (!dateTime) {
      return NextResponse.json({ error: "dateTime is required" }, { status: 400 })
    }
    const dt = new Date(dateTime)
    if (isNaN(dt.getTime()) || dt.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: "dateTime must be a future date" }, { status: 400 })
    }
    if (!currency || typeof currency !== "string") {
      return NextResponse.json({ error: "currency is required" }, { status: 400 })
    }
    if (costPerHead != null && (typeof costPerHead !== "number" || costPerHead < 0)) {
      return NextResponse.json({ error: "costPerHead must be a non-negative number" }, { status: 400 })
    }
    if (maxParticipants != null) {
      if (typeof maxParticipants !== "number" || maxParticipants < 1 || maxParticipants > 1000) {
        return NextResponse.json({ error: "maxParticipants must be between 1 and 1000" }, { status: 400 })
      }
    }

    const userSnap = await adminDb.collection("users").doc(userId).get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: "Organizer user not found" }, { status: 404 })
    }
    const userData = userSnap.data() || {}

    const planRef = adminDb.collection("plans").doc()
    const payload = {
      id: planRef.id,
      userId,
      organizer: {
        id: userId,
        username: userData.username || "unknown",
        name: userData.displayName || userData.username || "Unknown User",
        avatar: userData.photoURL || "/placeholder.svg",
      },
      title: title.trim(),
      description: (description || "").toString(),
      imageUrl: imageUrl || "",
      location: location.trim(),
      dateTime: dt,
      maxParticipants: maxParticipants ?? null,
      participantIds: [userId], // Organizer is first participant
      currentParticipants: 1,
      costPerHead: Number(costPerHead ?? 0),
      currency,
      isPrivate: !!isPrivate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const batch = adminDb.batch()
    batch.set(planRef, payload)
    // optional: increment organizer's plans count if tracked
    const userRef = adminDb.collection("users").doc(userId)
    batch.update(userRef, { plans: (userData.plans || 0) + 1 })
    await batch.commit()
    return NextResponse.json({ id: planRef.id }, { status: 201 })
  } catch (err: unknown) {
    console.error("[API] /api/plans POST error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
