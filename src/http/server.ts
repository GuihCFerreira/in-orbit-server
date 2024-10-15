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

var port = 3333;
const host = "RENDER" in process.env ? `0.0.0.0` : `localhost`;

if (process.env.PORT != null) port = Number(process.env.PORT);

console.log(port);

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
    host: host,
    port: port,
  })
  .then(() => {
    console.log(`HTTP server running on port ${port}`);
  });
