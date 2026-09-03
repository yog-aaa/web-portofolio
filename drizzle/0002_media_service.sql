CREATE TABLE "media_deletions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"provider_id" text NOT NULL,
	"secure_url" text NOT NULL,
	"access" "media_access" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "category" text;--> statement-breakpoint
CREATE UNIQUE INDEX "media_deletion_provider_unique" ON "media_deletions" USING btree ("provider","provider_id");--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_category_allowed" CHECK ("media_assets"."category" is null or "media_assets"."category" in ('profile', 'project', 'research', 'thought', 'credential', 'social'));