import { pgTable, text, serial, timestamp, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assessmentsTable = pgTable("assessments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  questions: jsonb("questions").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentResultsTable = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull(),
  assessmentId: integer("assessment_id").notNull(),
  assessmentTitle: text("assessment_title").notNull(),
  score: real("score").notNull(),
  passed: boolean("passed").notNull(),
  feedback: text("feedback").notNull(),
  jobId: integer("job_id"),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({ id: true, createdAt: true });
export const insertAssessmentResultSchema = createInsertSchema(assessmentResultsTable).omit({ id: true, completedAt: true });

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessmentsTable.$inferSelect;
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;
export type AssessmentResult = typeof assessmentResultsTable.$inferSelect;
