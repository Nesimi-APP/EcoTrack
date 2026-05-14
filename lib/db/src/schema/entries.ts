import { pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";

export const carbonEntriesTable = pgTable("carbon_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  transport: real("transport").notNull().default(0),
  energy: real("energy").notNull().default(0),
  food: real("food").notNull().default(0),
  total: real("total").notNull().default(0),
  date: timestamp("date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertCarbonEntrySchema = createInsertSchema(
  carbonEntriesTable
).omit({ createdAt: true });

export type InsertCarbonEntry = z.infer<typeof insertCarbonEntrySchema>;
export type CarbonEntry = typeof carbonEntriesTable.$inferSelect;
