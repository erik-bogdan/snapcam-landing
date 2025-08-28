export const runtime = "edge"

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { referralSignups, users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

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

export async function POST(req: NextRequest) {
  const { code, email, visitorId } = await req.json()
  if (!code || !email) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  const normalized = normalizeEmailForDedup(email)
  const emailHash = await sha256Hex(normalized)

  // Prevent using the same email as the code owner (after normalization)
  const ownerRows = await db
    .select({ ownerEmail: users.email })
    .from(users)
    .where(eq(users.referralCode, code))
    .limit(1)

  const ownerEmail = ownerRows[0]?.ownerEmail as string | undefined
  if (ownerEmail) {
    const ownerNormalized = normalizeEmailForDedup(ownerEmail)
    if (ownerNormalized === normalized) {
      return NextResponse.json(
        { ok: false, error: "Szép trükk, a saját emailodat nem használhatod :D" },
        { status: 400 }
      )
    }
  }

  // insert if not exists (global unique by email_hash)
  const insertedRows = await db
    .insert(referralSignups)
    .values({ refCode: code, email, emailHash, visitorId: visitorId ?? null })
    .onConflictDoNothing({ target: referralSignups.emailHash })
    .returning({ id: referralSignups.id })

  const inserted = insertedRows.length > 0
  if (inserted) {
    await db
      .update(users)
      .set({ points: sql`${users.points} + 10` })
      .where(eq(users.referralCode, code))
  }
  return NextResponse.json({ ok: true, awarded: inserted })
}

