import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";

dayjs.extend(weekOfYear);

export async function getWeeklyPendingGoals() {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();
  const currentWeek = dayjs().week();

  const goalsCreatedUpWeek = db.$with("goals_created_up_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequence: goals.desiredWeeklyFrequence,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  );

  const goalCompletionCounts = db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as("completionCount"),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const pendingGoals = await db
    .with(goalsCreatedUpWeek, goalCompletionCounts)
    .select({
      id: goalsCreatedUpWeek.id,
      title: goalsCreatedUpWeek.title,
      desiredWeeklyFrequence: goalsCreatedUpWeek.desiredWeeklyFrequence,
      completionCount: sql`
        COALESCE(${goalCompletionCounts.completionCount},0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpWeek)
    .leftJoin(
      goalCompletionCounts,
      eq(goalCompletionCounts.goalId, goalsCreatedUpWeek.id)
    );

  return {
    pendingGoals,
  };
}
