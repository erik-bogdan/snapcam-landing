export const runtime = "edge"

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 })

  const all = (await db.execute(sql`
    SELECT referral_code, points, created_at
    FROM ${users}
    ORDER BY points DESC, created_at ASC
  `)) as unknown as { referral_code: string; points: number; created_at: string }[]

  const rank = all.findIndex((u) => u.referral_code === code)
  if (rank === -1) return NextResponse.json({ rank: null, total: all.length })
  return NextResponse.json({ rank: rank + 1, total: all.length, points: all[rank].points })
}

