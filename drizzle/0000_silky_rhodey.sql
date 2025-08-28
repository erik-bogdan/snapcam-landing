CREATE TABLE "referral_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_code" varchar(16) NOT NULL,
	"ip24" varchar(64),
	"ua_hash" varchar(128),
	"cookie_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_code" varchar(16) NOT NULL,
	"email_hash" varchar(128) NOT NULL,
	"visitor_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"referral_code" varchar(16) NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "referral_signups_email_hash_uq" ON "referral_signups" USING btree ("email_hash");