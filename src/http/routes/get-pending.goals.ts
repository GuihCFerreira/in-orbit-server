import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getWeeklyPendingGoals } from "../../functions/get-weekly-pending-goals";

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/pending-goals", async () => {
    const { pendingGoals } = await getWeeklyPendingGoals();
    return pendingGoals;
  });
};
