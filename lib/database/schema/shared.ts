import { sql } from "drizzle-orm";
import { check, pgEnum, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";

export const publicationStatus = pgEnum("publication_status", ["draft", "published", "archived"]);
export const contentSlot = pgEnum("content_slot", ["draft", "published"]);
export const mediaKind = pgEnum("media_kind", ["image", "document"]);
export const mediaAccess = pgEnum("media_access", ["public", "private"]);
export const mediaAvailability = pgEnum("media_availability", ["pending", "ready", "failed"]);
export const mediaRole = pgEnum("media_role", ["cover", "gallery", "figure", "body", "social"]);

export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export const nonBlank = (name: string, column: AnyPgColumn) =>
  check(name, sql`length(trim(${column})) > 0`);

export const slugFormat = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`);

export const preciseDate = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} is null or (
    ${column} ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)?$'
    and case when length(${column}) = 10
      then to_char(to_date(${column}, 'YYYY-MM-DD'), 'YYYY-MM-DD') = ${column}
      else true end
  )`);

export const dateRange = (name: string, start: AnyPgColumn, end: AnyPgColumn) =>
  check(name, sql`${start} is null or ${end} is null or
    left(${end}, least(length(${start}), length(${end}))) >=
    left(${start}, least(length(${start}), length(${end})))`);

export const httpsUrl = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} is null or ${column} ~ '^https://[^[:space:]]+$'`);

export const draftShape = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} is null or coalesce((
    jsonb_typeof(${column}) = 'object' and ${column}->'version' = '1'::jsonb
    and jsonb_typeof(${column}->'title') = 'string'
    and length(trim(${column}->>'title')) > 0
  ), false)`);
