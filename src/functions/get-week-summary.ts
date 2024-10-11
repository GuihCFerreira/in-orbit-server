import dayjs from "dayjs";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";

type GoalsPerDay = Record<
  string,
  {
    id: string;
    title: string;
    completedAt: string;
  }[]
>;

export async function getWeekSummary() {
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

  const goalsCompletedInWeek = db.$with("goals_completed_in_week").as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`
        DATE(${goalCompletions.createdAt})`.as("completedAtDate"),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  );

  const goalsCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql`
                JSON_AGG (
                    JSON_BUILD_OBJECT (
                        'id', ${goalsCompletedInWeek.id},
                        'title', ${goalsCompletedInWeek.title},
                        'completedAt', ${goalsCompletedInWeek.completedAt}
                    )
                )
            `.as("completions"),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
  );

  const result = await db
    .with(goalsCreatedUpWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`
        (SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(Number),
      total: sql`
        (SELECT SUM(${goalsCreatedUpWeek.desiredWeeklyFrequence}) FROM ${goalsCreatedUpWeek})`.mapWith(
        Number
      ),
      goalsPerDay: sql<GoalsPerDay>`
            JSON_OBJECT_AGG(
                ${goalsCompletedByWeekDay.completedAtDate},
                ${goalsCompletedByWeekDay.completions}
            )
        `,
    })
    .from(goalsCompletedByWeekDay);

  return {
    summary: result[0],
  };
}
