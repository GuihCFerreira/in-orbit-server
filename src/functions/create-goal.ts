import { db } from "../db";
import { goals } from "../db/schema";

interface CreateGoalRequest {
  title: string;
  desiredWeeklyFrequence: number;
}

export async function createGoal({
  title,
  desiredWeeklyFrequence,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredWeeklyFrequence,
    })
    .returning();

  const goal = result[0];

  return {
    goal,
  };
}
