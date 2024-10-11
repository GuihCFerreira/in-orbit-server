import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import fastify from "fastify";
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createCompletionRoute } from "./routes/create-completion";
import { createGoalRoute } from "./routes/create-goal";
import { getPendingGoalsRoute } from "./routes/get-pending.goals";
import { getWeekSummaryRoute } from "./routes/get-week-summary";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: "*",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getPendingGoalsRoute);
app.register(getWeekSummaryRoute);
app.register(createGoalRoute);
app.register(createCompletionRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP server running on port 3333");
  });
