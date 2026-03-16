import type { Env } from "./types";
import { runCycle } from "./runtime";

export default {
  async scheduled(_: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runCycle(env));
  },
  async fetch(_: Request, env: Env): Promise<Response> {
    const result = await runCycle(env);
    return Response.json(result);
  },
};
