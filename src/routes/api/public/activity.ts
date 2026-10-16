import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const activityQuerySchema = z.object({
  category: z
    .enum([
      "release",
      "feature",
      "fix",
      "maintenance",
      "milestone",
      "report",
      "restoration",
      "security",
    ])
    .optional(),
  cursor: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const Route = createFileRoute("/api/public/activity")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = activityQuerySchema.safeParse(Object.fromEntries(url.searchParams));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_query" }, { status: 400 });
        }
        const { listPublicActivities } = await import("@/server/public-platform/service.server");
        const page = await listPublicActivities({
          limit: parsed.data.limit,
          ...(parsed.data.category ? { category: parsed.data.category } : {}),
          ...(parsed.data.cursor ? { cursor: parsed.data.cursor } : {}),
        });
        return Response.json(page, {
          headers: {
            "cache-control": "public, max-age=30, s-maxage=60",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
