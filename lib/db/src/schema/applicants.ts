import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicantsTable = pgTable("applicants", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  suffix: text("suffix"),
  pronoun: text("pronoun"),
  nickname: text("nickname"),
  permanentAddress: text("permanent_address").notNull(),
  currentAddress: text("current_address").notNull(),
  phoneAreaCode: text("phone_area_code").notNull(),
  phoneNumber: text("phone_number").notNull(),
  homePhone: text("home_phone"),
  email: text("email").notNull(),
  skills: text("skills").array().notNull().default([]),
  employmentHistory: jsonb("employment_history").notNull().default([]),
  certificates: jsonb("certificates").notNull().default([]),
  references: jsonb("references").notNull().default([]),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  targetIndustry: text("target_industry"),
  targetRole: text("target_role"),
  expectedSalary: text("expected_salary"),
  salaryNegotiable: boolean("salary_negotiable").notNull().default(true),
  availabilityDate: text("availability_date").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertApplicantSchema = createInsertSchema(applicantsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type Applicant = typeof applicantsTable.$inferSelect;
