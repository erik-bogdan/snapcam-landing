export const runtime = "edge"

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { referralClicks, users } from "@/db/schema"
import { and, eq, or, gte, sql } from "drizzle-orm"

function ipTo24(ip: string | null): string {
  if (!ip) return "unknown"
  if (ip.includes(":")) return "v6-or-unknown"
  const parts = ip.split(".")
  if (parts.length < 3) return "unknown"
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function getIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null
  )
}

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin

  // ensure vid cookie
  let vid = req.cookies.get("vid")?.value
  if (!vid) vid = crypto.randomUUID()

  const ua = req.headers.get("user-agent") || ""
  const uaHash = await sha256Hex(ua)
  const ip = getIp(req)
  const ip24 = ipTo24(ip)

  // daily dedup and cap 30
  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const countRows = await db
    .select({ countToday: sql<number>`count(*)` })
    .from(referralClicks)
    .where(and(eq(referralClicks.refCode, code), gte(referralClicks.createdAt, startOfDay)))

  const isOverCap = ((countRows[0]?.countToday ?? 0) as number) >= 30

  const dupRows = await db
    .select({ id: referralClicks.id })
    .from(referralClicks)
    .where(
      and(
        eq(referralClicks.refCode, code),
        gte(referralClicks.createdAt, startOfDay),
        or(
          eq(referralClicks.cookieId, vid),
          eq(referralClicks.ip24, ip24),
          eq(referralClicks.uaHash, uaHash)
        )
      )
    )
    .limit(1)

  const existsDup = dupRows.length > 0

  if (!existsDup) {
    await db.insert(referralClicks).values({ refCode: code, ip24, uaHash, cookieId: vid })
    if (!isOverCap) {
      await db
        .update(users)
        .set({ points: sql`${users.points} + 1` })
        .where(eq(users.referralCode, code))
    }
  }

  const res = NextResponse.redirect(`${baseUrl}/?ref=${encodeURIComponent(code)}`, 302)
  res.cookies.set({ name: "vid", value: vid, httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 })
  return res
}

