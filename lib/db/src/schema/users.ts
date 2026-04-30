import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").notNull(),
  isConfirmed: boolean("is_confirmed").notNull().default(false),
  confirmationToken: text("confirmation_token"),
  confirmationTokenExpiry: timestamp("confirmation_token_expiry", { withTimezone: true }),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable, {
  email: z.email(),
  phone: z.string().min(7),
}).omit({ id: true, passwordHash: true, isConfirmed: true, confirmationToken: true, confirmationTokenExpiry: true, resetToken: true, resetTokenExpiry: true, createdAt: true });
