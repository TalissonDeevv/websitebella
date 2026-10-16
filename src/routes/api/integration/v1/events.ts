import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/integration/v1/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleIngestionRequest } = await import("@/server/public-platform/service.server");
        return handleIngestionRequest(request);
      },
      GET: async () =>
        Response.json(
          { ok: false, error: "method_not_allowed" },
          { status: 405, headers: { allow: "POST", "cache-control": "no-store" } },
        ),
    },
  },
});
