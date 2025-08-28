CREATE TABLE IF NOT EXISTS "launch_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL,
  "email_hash" varchar(128) NOT NULL,
  "event_type" varchar(64) NOT NULL,
  "event_date" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "launch_subscriptions_email_hash_uq" ON "launch_subscriptions" USING btree ("email_hash");

