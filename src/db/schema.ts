import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const goals = pgTable("goals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  desiredWeeklyFrequence: integer("desired_weekly_frequence").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const goalCompletions = pgTable("goal_completions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  goalId: text("goal_id")
    .references(() => goals.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
