import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type CustomQuestion = {
  id: string;
  text: string;
  type: "multiple_choice" | "text";
  options?: string[];
  correctAnswers: string[];
  points?: number;
};

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array().notNull().default([]),
  salaryRange: text("salary_range").notNull(),
  industry: text("industry").notNull(),
  companyDescription: text("company_description").notNull().default(""),
  customQuestions: jsonb("custom_questions").$type<CustomQuestion[]>().notNull().default([]),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
