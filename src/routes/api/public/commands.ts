import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const commandQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(250).default(100),
});

export const Route = createFileRoute("/api/public/commands")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = commandQuerySchema.safeParse(Object.fromEntries(url.searchParams));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_query" }, { status: 400 });
        }
        const { listPublicCommands } = await import("@/server/public-platform/service.server");
        const commands = await listPublicCommands({
          limit: parsed.data.limit,
          ...(parsed.data.q ? { query: parsed.data.q } : {}),
          ...(parsed.data.category ? { category: parsed.data.category } : {}),
        });
        return Response.json(
          { items: commands },
          {
            headers: {
              "cache-control": "public, max-age=60, s-maxage=300",
              "x-content-type-options": "nosniff",
            },
          },
        );
      },
    },
  },
});
