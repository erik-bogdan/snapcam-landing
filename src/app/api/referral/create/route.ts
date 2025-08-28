export const runtime = "edge"

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

function randomCode(len = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  let out = ""
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length]
  return out
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 })
  }

  // existing user by email
  const existing = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing.length) {
    return NextResponse.json({ ok: true, code: existing[0].referralCode, existing: true })
  }

  // generate unique code
  let code = randomCode(8)
  for (let i = 0; i < 5; i++) {
    const dup = await db.select({ x: users.referralCode }).from(users).where(eq(users.referralCode, code)).limit(1)
    if (!dup.length) break
    code = randomCode(8)
  }

  await db.insert(users).values({ email, referralCode: code }).onConflictDoNothing({ target: users.email })

  // TODO: send email with the link using Edge-compatible provider

  return NextResponse.json({ ok: true, code })
}

