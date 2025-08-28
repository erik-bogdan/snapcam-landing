import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const connectionString = process.env.DATABASE_URL!
export const client = neon(connectionString)
export const db = drizzle(client)

