export const runtime = "edge"

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { launchSubscriptions } from "@/db/schema"

function normalizeEmailForDedup(email: string): string {
  const trimmed = email.trim().toLowerCase()
  const atIndex = trimmed.indexOf("@")
  if (atIndex === -1) return trimmed
  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)
  const plusIndex = local.indexOf("+")
  const localWithoutPlus = plusIndex === -1 ? local : local.slice(0, plusIndex)
  return `${localWithoutPlus}@${domain}`
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(req: NextRequest) {
  try {
    const { email, eventType, eventDate } = await req.json()
    if (!email || !eventType || !eventDate) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
    }

    const normalized = normalizeEmailForDedup(email)
    const emailHash = await sha256Hex(normalized)

    // Upsert-like insert ignore by email hash
    const inserted = await db
      .insert(launchSubscriptions)
      .values({
        email,
        emailHash,
        eventType,
        eventDate: new Date(eventDate),
      })
      .onConflictDoNothing({ target: launchSubscriptions.emailHash })
      .returning({ id: launchSubscriptions.id })

    const awarded = inserted.length > 0
    return NextResponse.json({ ok: true, created: awarded })
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 })
  }
}

