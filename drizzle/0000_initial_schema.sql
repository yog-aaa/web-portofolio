CREATE TYPE "public"."content_slot" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."media_access" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."media_availability" AS ENUM('pending', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'document');--> statement-breakpoint
CREATE TYPE "public"."media_role" AS ENUM('cover', 'gallery', 'figure', 'body', 'social');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner_binding" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owner_binding_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "owner_binding_singleton" CHECK ("owner_binding"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint NOT NULL,
	"title" text NOT NULL,
	"issuer_name" text NOT NULL,
	"credential_type" text NOT NULL,
	"issue_date" text,
	"expiry_date" text,
	"public_identifier" text,
	"description" text,
	"verification_url" text,
	"preview_media_id" uuid,
	"is_visible" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credential_title_nonempty" CHECK (length(trim("credentials"."title")) > 0),
	CONSTRAINT "credential_issuer_nonempty" CHECK (length(trim("credentials"."issuer_name")) > 0),
	CONSTRAINT "credential_type_nonempty" CHECK (length(trim("credentials"."credential_type")) > 0),
	CONSTRAINT "credential_issue_date" CHECK ("credentials"."issue_date" is null or (
    "credentials"."issue_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("credentials"."issue_date") = 10
      then to_char(to_date("credentials"."issue_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "credentials"."issue_date"
      else true end
  )),
	CONSTRAINT "credential_expiry_date" CHECK ("credentials"."expiry_date" is null or (
    "credentials"."expiry_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("credentials"."expiry_date") = 10
      then to_char(to_date("credentials"."expiry_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "credentials"."expiry_date"
      else true end
  )),
	CONSTRAINT "credential_date_range" CHECK ("credentials"."issue_date" is null or "credentials"."expiry_date" is null or
    left("credentials"."expiry_date", least(length("credentials"."issue_date"), length("credentials"."expiry_date"))) >=
    left("credentials"."issue_date", least(length("credentials"."issue_date"), length("credentials"."expiry_date")))),
	CONSTRAINT "credential_verification_https" CHECK ("credentials"."verification_url" is null or "credentials"."verification_url" ~ '^https://[^[:space:]]+$'),
	CONSTRAINT "credential_order_nonnegative" CHECK ("credentials"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint NOT NULL,
	"institution_name" text NOT NULL,
	"qualification_or_program" text NOT NULL,
	"field_of_study" text,
	"start_date" text,
	"end_date" text,
	"is_current" boolean,
	"description" text,
	"institution_url" text,
	"institution_media_id" uuid,
	"gpa_value" numeric(6, 3),
	"gpa_scale" numeric(6, 3),
	"is_visible" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "education_institution_nonempty" CHECK (length(trim("education"."institution_name")) > 0),
	CONSTRAINT "education_program_nonempty" CHECK (length(trim("education"."qualification_or_program")) > 0),
	CONSTRAINT "education_start_date" CHECK ("education"."start_date" is null or (
    "education"."start_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("education"."start_date") = 10
      then to_char(to_date("education"."start_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "education"."start_date"
      else true end
  )),
	CONSTRAINT "education_end_date" CHECK ("education"."end_date" is null or (
    "education"."end_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("education"."end_date") = 10
      then to_char(to_date("education"."end_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "education"."end_date"
      else true end
  )),
	CONSTRAINT "education_date_range" CHECK ("education"."start_date" is null or "education"."end_date" is null or
    left("education"."end_date", least(length("education"."start_date"), length("education"."end_date"))) >=
    left("education"."start_date", least(length("education"."start_date"), length("education"."end_date")))),
	CONSTRAINT "education_institution_https" CHECK ("education"."institution_url" is null or "education"."institution_url" ~ '^https://[^[:space:]]+$'),
	CONSTRAINT "education_current_no_end" CHECK ("education"."is_current" is not true or "education"."end_date" is null),
	CONSTRAINT "education_order_nonnegative" CHECK ("education"."sort_order" >= 0),
	CONSTRAINT "education_gpa_pair" CHECK (("education"."gpa_value" is null and "education"."gpa_scale" is null) or
    ("education"."gpa_value" is not null and "education"."gpa_scale" is not null and "education"."gpa_scale" > 0 and "education"."gpa_value" >= 0 and "education"."gpa_value" <= "education"."gpa_scale"))
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"display_name" text NOT NULL,
	"focus_line" text,
	"short_biography" text,
	"biography_markdown" text,
	"location" text,
	"availability_text" text,
	"resume_url" text,
	"portrait_media_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_singleton" CHECK ("profile"."id" = 1),
	CONSTRAINT "profile_name_nonempty" CHECK (length(trim("profile"."display_name")) > 0),
	CONSTRAINT "profile_resume_https" CHECK ("profile"."resume_url" is null or "profile"."resume_url" ~ '^https://[^[:space:]]+$')
);
--> statement-breakpoint
CREATE TABLE "site_page_settings" (
	"route" text PRIMARY KEY NOT NULL,
	"site_settings_id" smallint NOT NULL,
	"intro" text,
	"empty_state_copy" text,
	"seo_title" text,
	"seo_description" text,
	"social_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_page_known_route" CHECK ("site_page_settings"."route" in ('/', '/work', '/experience', '/research', '/thoughts', '/about', '/credentials'))
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"profile_id" smallint NOT NULL,
	"theme_settings_id" smallint NOT NULL,
	"brand_name" text NOT NULL,
	"site_title" text,
	"default_seo_description" text,
	"content_language" text,
	"hero_headline" text,
	"hero_intro" text,
	"hero_explore_label" text,
	"hero_supporting_copy" text,
	"contact_cta_heading" text,
	"contact_cta_label" text,
	"contact_supporting_copy" text,
	"footer_copy" text,
	"section_copy" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"primary_contact_link_id" uuid,
	"default_social_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_profile_id_unique" UNIQUE("profile_id"),
	CONSTRAINT "site_settings_theme_settings_id_unique" UNIQUE("theme_settings_id"),
	CONSTRAINT "site_settings_singleton" CHECK ("site_settings"."id" = 1),
	CONSTRAINT "site_brand_nonempty" CHECK (length(trim("site_settings"."brand_name")) > 0),
	CONSTRAINT "site_section_copy_keys" CHECK (jsonb_typeof("site_settings"."section_copy") = 'object'
    and "site_settings"."section_copy" - array['hero','selectedWork','experienceHighlight','featuredResearch','latestThoughts','shortAbout','contact','footer']::text[] = '{}'::jsonb)
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint NOT NULL,
	"label" text NOT NULL,
	"destination" text NOT NULL,
	"purpose" text NOT NULL,
	"platform_key" text,
	"is_visible" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "social_link_label_nonempty" CHECK (length(trim("social_links"."label")) > 0),
	CONSTRAINT "social_link_purpose" CHECK ("social_links"."purpose" in ('social', 'contact')),
	CONSTRAINT "social_link_destination" CHECK ("social_links"."destination" ~ '^https://[^[:space:]]+$'
    or ("social_links"."purpose" = 'contact' and "social_links"."destination" ~ '^mailto:[^[:space:]@]+@[^[:space:]@]+$')),
	CONSTRAINT "social_link_order_nonnegative" CHECK ("social_links"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "theme_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"accent" text,
	"accent_foreground" text,
	"accent_soft" text,
	"accent_secondary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "theme_singleton" CHECK ("theme_settings"."id" = 1),
	CONSTRAINT "theme_accent_hex" CHECK ("theme_settings"."accent" is null or "theme_settings"."accent" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "theme_accent_foreground_hex" CHECK ("theme_settings"."accent_foreground" is null or "theme_settings"."accent_foreground" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "theme_accent_soft_hex" CHECK ("theme_settings"."accent_soft" is null or "theme_settings"."accent_soft" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "theme_accent_secondary_hex" CHECK ("theme_settings"."accent_secondary" is null or "theme_settings"."accent_secondary" ~ '^#[0-9A-Fa-f]{6}$')
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"provider_id" text,
	"kind" "media_kind" NOT NULL,
	"access" "media_access" DEFAULT 'private' NOT NULL,
	"availability" "media_availability" DEFAULT 'pending' NOT NULL,
	"url" text,
	"secure_url" text,
	"filename" text NOT NULL,
	"mime_type" text,
	"format" text,
	"width" integer,
	"height" integer,
	"bytes" bigint,
	"alt_text" text,
	"caption" text,
	"credit" text,
	"source_url" text,
	"is_decorative" boolean DEFAULT false NOT NULL,
	"focal_x" integer,
	"focal_y" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_provider_nonempty" CHECK (length(trim("media_assets"."provider")) > 0),
	CONSTRAINT "media_filename_nonempty" CHECK (length(trim("media_assets"."filename")) > 0),
	CONSTRAINT "media_provider_id_nonempty" CHECK (length(trim("media_assets"."provider_id")) > 0),
	CONSTRAINT "media_mime_nonempty" CHECK (length(trim("media_assets"."mime_type")) > 0),
	CONSTRAINT "media_secure_url_https" CHECK ("media_assets"."secure_url" is null or "media_assets"."secure_url" ~ '^https://[^[:space:]]+$'),
	CONSTRAINT "media_source_https" CHECK ("media_assets"."source_url" is null or "media_assets"."source_url" ~ '^https://[^[:space:]]+$'),
	CONSTRAINT "media_url_protocol" CHECK ("media_assets"."url" is null or "media_assets"."url" ~ '^https?://[^[:space:]]+$'),
	CONSTRAINT "media_dimensions_positive" CHECK (("media_assets"."width" is null or "media_assets"."width" > 0) and ("media_assets"."height" is null or "media_assets"."height" > 0)),
	CONSTRAINT "media_bytes_safe" CHECK ("media_assets"."bytes" is null or "media_assets"."bytes" between 0 and 9007199254740991),
	CONSTRAINT "media_focal_pair" CHECK (("media_assets"."focal_x" is null and "media_assets"."focal_y" is null) or
    ("media_assets"."focal_x" is not null and "media_assets"."focal_y" is not null and "media_assets"."focal_x" between 0 and 100 and "media_assets"."focal_y" between 0 and 100)),
	CONSTRAINT "media_ready_metadata" CHECK ("media_assets"."availability" <> 'ready' or (
    "media_assets"."provider_id" is not null and "media_assets"."secure_url" is not null and "media_assets"."mime_type" is not null
    and "media_assets"."bytes" is not null and ("media_assets"."kind" <> 'image' or ("media_assets"."width" is not null and "media_assets"."height" is not null))
  ))
);
--> statement-breakpoint
CREATE TABLE "project_slugs" (
	"slug" varchar(160) PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_slug_owner_unique" UNIQUE("project_id","slug"),
	CONSTRAINT "project_slug_format" CHECK ("project_slugs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(160),
	"body_markdown" text,
	"body_format" text DEFAULT 'markdown' NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"draft_content" jsonb,
	"revision" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"public_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"summary" text,
	"role_or_contribution" text,
	"start_date" text,
	"end_date" text,
	"collaborators" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_title_nonempty" CHECK (length(trim("projects"."title")) > 0),
	CONSTRAINT "projects_slug_format" CHECK ("projects"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "projects_draft_shape" CHECK ("projects"."draft_content" is null or coalesce((
    jsonb_typeof("projects"."draft_content") = 'object' and "projects"."draft_content"->'version' = '1'::jsonb
    and jsonb_typeof("projects"."draft_content"->'title') = 'string'
    and length(trim("projects"."draft_content"->>'title')) > 0
  ), false)),
	CONSTRAINT "projects_markdown_only" CHECK ("projects"."body_format" = 'markdown'),
	CONSTRAINT "projects_revision_nonnegative" CHECK ("projects"."revision" >= 0),
	CONSTRAINT "projects_public_dates" CHECK (("projects"."published_at" is null and "projects"."public_updated_at" is null) or
    ("projects"."published_at" is not null and "projects"."public_updated_at" is not null and "projects"."public_updated_at" >= "projects"."published_at")),
	CONSTRAINT "projects_publication_required" CHECK ("projects"."status" <> 'published' or (
    "projects"."slug" is not null and "projects"."body_markdown" is not null and length(trim("projects"."body_markdown")) > 0
    and "projects"."published_at" is not null and "projects"."public_updated_at" is not null
  )),
	CONSTRAINT "projects_sort_nonnegative" CHECK ("projects"."sort_order" >= 0),
	CONSTRAINT "projects_featured_order" CHECK ((not "projects"."is_featured" and "projects"."featured_order" is null) or
    ("projects"."is_featured" and "projects"."featured_order" is not null and "projects"."featured_order" >= 0)),
	CONSTRAINT "projects_required_summary_role" CHECK ("projects"."status" <> 'published' or (
    "projects"."summary" is not null and length(trim("projects"."summary")) > 0
    and "projects"."role_or_contribution" is not null and length(trim("projects"."role_or_contribution")) > 0)),
	CONSTRAINT "projects_value_arrays" CHECK (jsonb_typeof("projects"."collaborators") = 'array' and jsonb_typeof("projects"."links") = 'array'),
	CONSTRAINT "projects_start_date" CHECK ("projects"."start_date" is null or (
    "projects"."start_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("projects"."start_date") = 10
      then to_char(to_date("projects"."start_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "projects"."start_date"
      else true end
  )),
	CONSTRAINT "projects_end_date" CHECK ("projects"."end_date" is null or (
    "projects"."end_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("projects"."end_date") = 10
      then to_char(to_date("projects"."end_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "projects"."end_date"
      else true end
  )),
	CONSTRAINT "projects_date_range" CHECK ("projects"."start_date" is null or "projects"."end_date" is null or
    left("projects"."end_date", least(length("projects"."start_date"), length("projects"."end_date"))) >=
    left("projects"."start_date", least(length("projects"."start_date"), length("projects"."end_date"))))
);
--> statement-breakpoint
CREATE TABLE "research" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(160),
	"body_markdown" text,
	"body_format" text DEFAULT 'markdown' NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"draft_content" jsonb,
	"revision" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"public_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"summary" text,
	"research_type" text,
	"research_stage" text,
	"role_or_contribution" text,
	"research_date" text,
	"academic_published_date" text,
	"institution" text,
	"venue" text,
	"citation_text" text,
	"doi" text,
	"collaborators" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "research_slug_unique" UNIQUE("slug"),
	CONSTRAINT "research_title_nonempty" CHECK (length(trim("research"."title")) > 0),
	CONSTRAINT "research_slug_format" CHECK ("research"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "research_draft_shape" CHECK ("research"."draft_content" is null or coalesce((
    jsonb_typeof("research"."draft_content") = 'object' and "research"."draft_content"->'version' = '1'::jsonb
    and jsonb_typeof("research"."draft_content"->'title') = 'string'
    and length(trim("research"."draft_content"->>'title')) > 0
  ), false)),
	CONSTRAINT "research_markdown_only" CHECK ("research"."body_format" = 'markdown'),
	CONSTRAINT "research_revision_nonnegative" CHECK ("research"."revision" >= 0),
	CONSTRAINT "research_public_dates" CHECK (("research"."published_at" is null and "research"."public_updated_at" is null) or
    ("research"."published_at" is not null and "research"."public_updated_at" is not null and "research"."public_updated_at" >= "research"."published_at")),
	CONSTRAINT "research_publication_required" CHECK ("research"."status" <> 'published' or (
    "research"."slug" is not null and "research"."body_markdown" is not null and length(trim("research"."body_markdown")) > 0
    and "research"."published_at" is not null and "research"."public_updated_at" is not null
  )),
	CONSTRAINT "research_sort_nonnegative" CHECK ("research"."sort_order" >= 0),
	CONSTRAINT "research_featured_order" CHECK ((not "research"."is_featured" and "research"."featured_order" is null) or
    ("research"."is_featured" and "research"."featured_order" is not null and "research"."featured_order" >= 0)),
	CONSTRAINT "research_required_fields" CHECK ("research"."status" <> 'published' or (
    "research"."summary" is not null and length(trim("research"."summary")) > 0
    and "research"."research_type" is not null and length(trim("research"."research_type")) > 0
    and "research"."role_or_contribution" is not null and length(trim("research"."role_or_contribution")) > 0)),
	CONSTRAINT "research_value_arrays" CHECK (jsonb_typeof("research"."collaborators") = 'array' and jsonb_typeof("research"."links") = 'array'),
	CONSTRAINT "research_known_date" CHECK ("research"."research_date" is null or (
    "research"."research_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("research"."research_date") = 10
      then to_char(to_date("research"."research_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "research"."research_date"
      else true end
  )),
	CONSTRAINT "research_academic_date" CHECK ("research"."academic_published_date" is null or (
    "research"."academic_published_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("research"."academic_published_date") = 10
      then to_char(to_date("research"."academic_published_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "research"."academic_published_date"
      else true end
  ))
);
--> statement-breakpoint
CREATE TABLE "research_slugs" (
	"slug" varchar(160) PRIMARY KEY NOT NULL,
	"research_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "research_slug_owner_unique" UNIQUE("research_id","slug"),
	CONSTRAINT "research_slug_format" CHECK ("research_slugs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "thought_slugs" (
	"slug" varchar(160) PRIMARY KEY NOT NULL,
	"thought_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "thought_slug_owner_unique" UNIQUE("thought_id","slug"),
	CONSTRAINT "thought_slug_format" CHECK ("thought_slugs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "thoughts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint DEFAULT 1 NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(160),
	"body_markdown" text,
	"body_format" text DEFAULT 'markdown' NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"draft_content" jsonb,
	"revision" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"public_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"excerpt" text,
	"references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "thoughts_slug_unique" UNIQUE("slug"),
	CONSTRAINT "thoughts_title_nonempty" CHECK (length(trim("thoughts"."title")) > 0),
	CONSTRAINT "thoughts_slug_format" CHECK ("thoughts"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "thoughts_draft_shape" CHECK ("thoughts"."draft_content" is null or coalesce((
    jsonb_typeof("thoughts"."draft_content") = 'object' and "thoughts"."draft_content"->'version' = '1'::jsonb
    and jsonb_typeof("thoughts"."draft_content"->'title') = 'string'
    and length(trim("thoughts"."draft_content"->>'title')) > 0
  ), false)),
	CONSTRAINT "thoughts_markdown_only" CHECK ("thoughts"."body_format" = 'markdown'),
	CONSTRAINT "thoughts_revision_nonnegative" CHECK ("thoughts"."revision" >= 0),
	CONSTRAINT "thoughts_public_dates" CHECK (("thoughts"."published_at" is null and "thoughts"."public_updated_at" is null) or
    ("thoughts"."published_at" is not null and "thoughts"."public_updated_at" is not null and "thoughts"."public_updated_at" >= "thoughts"."published_at")),
	CONSTRAINT "thoughts_publication_required" CHECK ("thoughts"."status" <> 'published' or (
    "thoughts"."slug" is not null and "thoughts"."body_markdown" is not null and length(trim("thoughts"."body_markdown")) > 0
    and "thoughts"."published_at" is not null and "thoughts"."public_updated_at" is not null
  )),
	CONSTRAINT "thoughts_required_excerpt" CHECK ("thoughts"."status" <> 'published' or ("thoughts"."excerpt" is not null and length(trim("thoughts"."excerpt")) > 0)),
	CONSTRAINT "thoughts_references_array" CHECK (jsonb_typeof("thoughts"."references") = 'array')
);
--> statement-breakpoint
CREATE TABLE "experience_projects" (
	"experience_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experience_projects_experience_id_project_id_pk" PRIMARY KEY("experience_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" smallint NOT NULL,
	"role_title" text NOT NULL,
	"organization_name" text NOT NULL,
	"description" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_current" boolean DEFAULT false NOT NULL,
	"context_label" text,
	"location" text,
	"organization_url" text,
	"organization_media_id" uuid,
	"is_visible" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experience_role_nonempty" CHECK (length(trim("experiences"."role_title")) > 0),
	CONSTRAINT "experience_organization_nonempty" CHECK (length(trim("experiences"."organization_name")) > 0),
	CONSTRAINT "experience_description_nonempty" CHECK (length(trim("experiences"."description")) > 0),
	CONSTRAINT "experience_start_date" CHECK ("experiences"."start_date" is null or (
    "experiences"."start_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("experiences"."start_date") = 10
      then to_char(to_date("experiences"."start_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "experiences"."start_date"
      else true end
  )),
	CONSTRAINT "experience_end_date" CHECK ("experiences"."end_date" is null or (
    "experiences"."end_date" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length("experiences"."end_date") = 10
      then to_char(to_date("experiences"."end_date", 'YYYY-MM-DD'), 'YYYY-MM-DD') = "experiences"."end_date"
      else true end
  )),
	CONSTRAINT "experience_date_range" CHECK ("experiences"."start_date" is null or "experiences"."end_date" is null or
    left("experiences"."end_date", least(length("experiences"."start_date"), length("experiences"."end_date"))) >=
    left("experiences"."start_date", least(length("experiences"."start_date"), length("experiences"."end_date")))),
	CONSTRAINT "experience_organization_https" CHECK ("experiences"."organization_url" is null or "experiences"."organization_url" ~ '^https://[^[:space:]]+$'),
	CONSTRAINT "experience_current_no_end" CHECK (not "experiences"."is_current" or "experiences"."end_date" is null),
	CONSTRAINT "experience_order_nonnegative" CHECK ("experiences"."sort_order" >= 0),
	CONSTRAINT "experience_featured_visible" CHECK (not "experiences"."is_featured" or "experiences"."is_visible"),
	CONSTRAINT "experience_featured_order" CHECK ((not "experiences"."is_featured" and "experiences"."featured_order" is null) or
    ("experiences"."is_featured" and "experiences"."featured_order" is not null and "experiences"."featured_order" >= 0))
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key" varchar(80) NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_categories_key_unique" UNIQUE("key"),
	CONSTRAINT "category_name_nonempty" CHECK (length(trim("project_categories"."name")) > 0),
	CONSTRAINT "category_key_format" CHECK ("project_categories"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "category_order_nonnegative" CHECK ("project_categories"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_category_assignments" (
	"project_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"slot" "content_slot" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_category_assignments_project_id_category_id_slot_pk" PRIMARY KEY("project_id","category_id","slot")
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"project_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"slot" "content_slot" DEFAULT 'draft' NOT NULL,
	"role" "media_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"alt_text" text,
	"caption" text,
	"is_decorative" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_media_order_nonnegative" CHECK ("project_media"."sort_order" >= 0),
	CONSTRAINT "project_media_roles" CHECK ("project_media"."role" in ('cover', 'gallery', 'body', 'social'))
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	"slot" "content_slot" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_technologies_project_id_technology_id_slot_pk" PRIMARY KEY("project_id","technology_id","slot")
);
--> statement-breakpoint
CREATE TABLE "research_media" (
	"research_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"slot" "content_slot" DEFAULT 'draft' NOT NULL,
	"role" "media_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"alt_text" text,
	"caption" text,
	"is_decorative" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "research_media_order_nonnegative" CHECK ("research_media"."sort_order" >= 0),
	CONSTRAINT "research_media_roles" CHECK ("research_media"."role" in ('cover', 'figure', 'body', 'social'))
);
--> statement-breakpoint
CREATE TABLE "research_technologies" (
	"research_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	"slot" "content_slot" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "research_technologies_research_id_technology_id_slot_pk" PRIMARY KEY("research_id","technology_id","slot")
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key" varchar(80) NOT NULL,
	"reference_url" text,
	"icon_key" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "technologies_key_unique" UNIQUE("key"),
	CONSTRAINT "technology_name_nonempty" CHECK (length(trim("technologies"."name")) > 0),
	CONSTRAINT "technology_key_format" CHECK ("technologies"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "technology_reference_https" CHECK ("technologies"."reference_url" is null or "technologies"."reference_url" ~ '^https://[^[:space:]]+$'),
	CONSTRAINT "technology_order_nonnegative" CHECK ("technologies"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "thought_media" (
	"thought_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"slot" "content_slot" DEFAULT 'draft' NOT NULL,
	"role" "media_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"alt_text" text,
	"caption" text,
	"is_decorative" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "thought_media_order_nonnegative" CHECK ("thought_media"."sort_order" >= 0),
	CONSTRAINT "thought_media_roles" CHECK ("thought_media"."role" in ('cover', 'body', 'social'))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_binding" ADD CONSTRAINT "owner_binding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_preview_media_id_media_assets_id_fk" FOREIGN KEY ("preview_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_institution_media_id_media_assets_id_fk" FOREIGN KEY ("institution_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_portrait_media_id_media_assets_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_settings" ADD CONSTRAINT "site_page_settings_site_settings_id_site_settings_id_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_settings" ADD CONSTRAINT "site_page_settings_social_image_id_media_assets_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_theme_settings_id_theme_settings_id_fk" FOREIGN KEY ("theme_settings_id") REFERENCES "public"."theme_settings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_primary_contact_link_id_social_links_id_fk" FOREIGN KEY ("primary_contact_link_id") REFERENCES "public"."social_links"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_social_image_id_media_assets_id_fk" FOREIGN KEY ("default_social_image_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_slugs" ADD CONSTRAINT "project_slugs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_reserved_slug_fk" FOREIGN KEY ("id","slug") REFERENCES "public"."project_slugs"("project_id","slug") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research" ADD CONSTRAINT "research_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research" ADD CONSTRAINT "research_reserved_slug_fk" FOREIGN KEY ("id","slug") REFERENCES "public"."research_slugs"("research_id","slug") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_slugs" ADD CONSTRAINT "research_slugs_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thought_slugs" ADD CONSTRAINT "thought_slugs_thought_id_thoughts_id_fk" FOREIGN KEY ("thought_id") REFERENCES "public"."thoughts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thoughts" ADD CONSTRAINT "thoughts_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thoughts" ADD CONSTRAINT "thoughts_reserved_slug_fk" FOREIGN KEY ("id","slug") REFERENCES "public"."thought_slugs"("thought_id","slug") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_organization_media_id_media_assets_id_fk" FOREIGN KEY ("organization_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_category_assignments" ADD CONSTRAINT "project_category_assignments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_category_assignments" ADD CONSTRAINT "project_category_assignments_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_media" ADD CONSTRAINT "research_media_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_media" ADD CONSTRAINT "research_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_technologies" ADD CONSTRAINT "research_technologies_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_technologies" ADD CONSTRAINT "research_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thought_media" ADD CONSTRAINT "thought_media_thought_id_thoughts_id_fk" FOREIGN KEY ("thought_id") REFERENCES "public"."thoughts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thought_media" ADD CONSTRAINT "thought_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_account_unique" ON "account" USING btree ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expiry_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_expiry_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "credentials_profile_order_idx" ON "credentials" USING btree ("profile_id","sort_order","id");--> statement-breakpoint
CREATE INDEX "education_profile_order_idx" ON "education" USING btree ("profile_id","sort_order","id");--> statement-breakpoint
CREATE INDEX "social_links_profile_order_idx" ON "social_links" USING btree ("profile_id","sort_order","id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_provider_identity_unique" ON "media_assets" USING btree ("provider","provider_id");--> statement-breakpoint
CREATE INDEX "media_library_idx" ON "media_assets" USING btree ("created_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "projects_archive_idx" ON "projects" USING btree ("sort_order","published_at" DESC NULLS LAST,"id") WHERE "projects"."status" = 'published';--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured_order","id") WHERE "projects"."status" = 'published' and "projects"."is_featured";--> statement-breakpoint
CREATE INDEX "projects_profile_idx" ON "projects" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "research_archive_idx" ON "research" USING btree ("sort_order","published_at" DESC NULLS LAST,"id") WHERE "research"."status" = 'published';--> statement-breakpoint
CREATE INDEX "research_featured_idx" ON "research" USING btree ("featured_order","id") WHERE "research"."status" = 'published' and "research"."is_featured";--> statement-breakpoint
CREATE INDEX "research_profile_idx" ON "research" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "thoughts_latest_idx" ON "thoughts" USING btree ("published_at" DESC NULLS LAST,"id") WHERE "thoughts"."status" = 'published';--> statement-breakpoint
CREATE INDEX "thoughts_profile_idx" ON "thoughts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "experience_project_reverse_idx" ON "experience_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "experience_profile_order_idx" ON "experiences" USING btree ("profile_id","sort_order","id");--> statement-breakpoint
CREATE UNIQUE INDEX "experience_single_highlight" ON "experiences" USING btree ("is_featured") WHERE "experiences"."is_featured";--> statement-breakpoint
CREATE INDEX "project_category_reverse_idx" ON "project_category_assignments" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_media_position_unique" ON "project_media" USING btree ("project_id","slot","role","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "project_media_single_cover_social" ON "project_media" USING btree ("project_id","slot","role") WHERE "project_media"."role" in ('cover', 'social');--> statement-breakpoint
CREATE INDEX "project_media_asset_idx" ON "project_media" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "project_technology_reverse_idx" ON "project_technologies" USING btree ("technology_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_media_position_unique" ON "research_media" USING btree ("research_id","slot","role","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "research_media_single_cover_social" ON "research_media" USING btree ("research_id","slot","role") WHERE "research_media"."role" in ('cover', 'social');--> statement-breakpoint
CREATE INDEX "research_media_asset_idx" ON "research_media" USING btree ("media_asset_id");--> statement-breakpoint
CREATE INDEX "research_technology_reverse_idx" ON "research_technologies" USING btree ("technology_id");--> statement-breakpoint
CREATE UNIQUE INDEX "thought_media_position_unique" ON "thought_media" USING btree ("thought_id","slot","role","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "thought_media_single_cover_social" ON "thought_media" USING btree ("thought_id","slot","role") WHERE "thought_media"."role" in ('cover', 'social');--> statement-breakpoint
CREATE INDEX "thought_media_asset_idx" ON "thought_media" USING btree ("media_asset_id");
