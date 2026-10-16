import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const publicPeriodSchema = z.enum(["today", "7d", "30d", "12m"]);

export const getPublicDashboardServer = createServerFn({ method: "GET" })
  .validator(publicPeriodSchema)
  .handler(async ({ data }) => {
    const { getPublicDashboard } = await import("@/server/public-platform/service.server");
    return getPublicDashboard(data);
  });
