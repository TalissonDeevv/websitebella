import { createFileRoute } from "@tanstack/react-router";
import { periodSchema } from "@/server/public-platform/contracts";

export const Route = createFileRoute("/api/public/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const period = periodSchema.catch("7d").parse(url.searchParams.get("period") ?? "7d");
        const { getPublicDashboard } = await import("@/server/public-platform/service.server");
        const dashboard = await getPublicDashboard(period);
        return Response.json(dashboard, {
          headers: {
            "cache-control": "public, max-age=15, s-maxage=30, stale-while-revalidate=120",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
