ALTER TABLE "theme_settings" ADD COLUMN "background" text;--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN "surface" text;--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN "foreground" text;--> statement-breakpoint
ALTER TABLE "theme_settings" ADD COLUMN "border" text;--> statement-breakpoint
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_background_hex" CHECK ("theme_settings"."background" is null or "theme_settings"."background" ~ '^#[0-9A-Fa-f]{6}$');--> statement-breakpoint
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_surface_hex" CHECK ("theme_settings"."surface" is null or "theme_settings"."surface" ~ '^#[0-9A-Fa-f]{6}$');--> statement-breakpoint
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_foreground_hex" CHECK ("theme_settings"."foreground" is null or "theme_settings"."foreground" ~ '^#[0-9A-Fa-f]{6}$');--> statement-breakpoint
ALTER TABLE "theme_settings" ADD CONSTRAINT "theme_border_hex" CHECK ("theme_settings"."border" is null or "theme_settings"."border" ~ '^#[0-9A-Fa-f]{6}$');