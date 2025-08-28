import { pgTable, serial, varchar, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique(),
  referralCode: varchar("referral_code", { length: 16 }).unique().notNull(),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const referralClicks = pgTable("referral_clicks", {
  id: serial("id").primaryKey(),
  refCode: varchar("ref_code", { length: 16 }).notNull(),
  ip24: varchar("ip24", { length: 64 }),
  uaHash: varchar("ua_hash", { length: 128 }),
  cookieId: varchar("cookie_id", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const referralSignups = pgTable("referral_signups", {
  id: serial("id").primaryKey(),
  refCode: varchar("ref_code", { length: 16 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  emailHash: varchar("email_hash", { length: 128 }).notNull(),
  visitorId: varchar("visitor_id", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailHashUnique: uniqueIndex("referral_signups_email_hash_uq").on(t.emailHash),
}))

export const launchSubscriptions = pgTable("launch_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  emailHash: varchar("email_hash", { length: 128 }).notNull(),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailHashUnique: uniqueIndex("launch_subscriptions_email_hash_uq").on(t.emailHash),
}))

