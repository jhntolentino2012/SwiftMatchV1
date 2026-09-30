import { sql } from "drizzle-orm";
import { pgTable, integer, text, timestamp, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";

// Trusted database grants only: deliberately no public write API.
export const reportEntitlementsTable = pgTable("report_entitlements", {
  userId: integer("user_id").primaryKey().references(() => usersTable.id, { onDelete: "cascade" }),
  scope: text("scope", { enum: ["applicant", "employer"] }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, table => [
  check("report_entitlements_scope_check", sql`${table.scope} in ('applicant', 'employer')`),
  check("report_entitlements_expiry_check", sql`${table.expiresAt} > CURRENT_TIMESTAMP`),
]);

export const insertReportEntitlementSchema = createInsertSchema(reportEntitlementsTable)
  .refine(value => value.expiresAt.getTime() > Date.now(), {
    message: "expiresAt must be in the future", path: ["expiresAt"],
  });
export type ReportEntitlement = typeof reportEntitlementsTable.$inferSelect;