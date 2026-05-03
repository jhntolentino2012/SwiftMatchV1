import { pgTable, text, serial, timestamp, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type CustomAnswer = {
  questionId: string;
  answer: string;
  correct: boolean;
};

export const jobApplicationsTable = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull(),
  jobId: integer("job_id").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  status: text("status").notNull().default("applied"),
  keScore: real("ke_score"),
  customScore: real("custom_score"),
  customCorrectCount: integer("custom_correct_count"),
  customTotalCount: integer("custom_total_count"),
  customAnswers: jsonb("custom_answers").$type<CustomAnswer[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplicationsTable).omit({ id: true, createdAt: true });
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplicationsTable.$inferSelect;
