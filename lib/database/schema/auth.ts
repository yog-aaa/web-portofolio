import { sql } from "drizzle-orm";
import { boolean, check, index, pgTable, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "./shared";

// Better Auth 1.7.2 core schema. Keep model/property names expected by its adapter.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  ...timestamps(),
}, (t) => [index("session_user_idx").on(t.userId), index("session_expiry_idx").on(t.expiresAt)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  issuer: text("issuer").notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps(),
}, (t) => [
  index("account_user_idx").on(t.userId),
  uniqueIndex("account_issuer_account_unique").on(t.issuer, t.accountId),
]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps(),
}, (t) => [index("verification_identifier_idx").on(t.identifier), index("verification_expiry_idx").on(t.expiresAt)]);

// A single binding, not another user record. Provisioning/auth work owns this table.
export const ownerBinding = pgTable("owner_binding", {
  id: smallint("id").primaryKey().default(1),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "restrict" }),
  ...timestamps(),
}, (t) => [check("owner_binding_singleton", sql`${t.id} = 1`)]);
