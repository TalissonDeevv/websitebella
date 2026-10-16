import type { PublicActivity, PublicDashboard, PublicPeriod } from "@/lib/public-platform";
import {
  emptyPublicDashboard,
  publicPeriodBounds,
  resolveCharacterState,
  resolveFreshness,
} from "@/lib/public-platform";
import { authenticateIngestionRequest, IngestionAuthError } from "./auth.server";
import { EVENT_SCOPE, integrationEventSchema } from "./contracts";
import { getPublicPlatformRepository, PublicDataStoreUnavailableError } from "./database.server";
import type { PublicPlatformRepository } from "./repository";

const MAX_INGESTION_BODY_BYTES = 256 * 1024;
const INGESTION_RATE_LIMIT_PER_MINUTE = 120;

function operationalMessage(
  state: PublicDashboard["status"]["operational"]["state"],
  freshness: PublicDashboard["status"]["operational"]["freshness"],
) {
  if (freshness === "missing") return "Ainda não recebemos um heartbeat válido da Bella.";
  if (freshness === "stale")
    return "A última atualização está desatualizada; o estado atual não pode ser confirmado.";
  return {
    online: "Bella está conectada e os serviços públicos estão respondendo.",
    away: "Bella está conectada, mas operando em modo de baixa atividade.",
    offline: "Bella está desconectada no momento.",
    maintenance: "Bella está em uma janela de manutenção informada.",
    unknown: "O estado operacional não pôde ser confirmado.",
  }[state];
}

export async function getPublicDashboard(
  period: PublicPeriod,
  options: { repository?: PublicPlatformRepository; now?: Date } = {},
): Promise<PublicDashboard> {
  const now = options.now ?? new Date();
  const bounds = publicPeriodBounds(period, now);
  try {
    const repository = options.repository ?? (await getPublicPlatformRepository());
    const source = await repository.getDashboardSource(bounds);
    const freshness = resolveFreshness(source.heartbeat?.observedAt ?? null, now);
    const reportedState = source.heartbeat?.state ?? "unknown";
    const operationalState = freshness === "fresh" ? reportedState : "unknown";
    const byKind = (kind: PublicDashboard["releases"][number]["kind"]) =>
      source.editorial.filter((item) => item.kind === kind);
    return {
      generatedAt: now.toISOString(),
      period: bounds,
      source: "database",
      status: {
        operational: {
          state: operationalState,
          latencyMs: source.heartbeat?.latencyMs ?? null,
          version: source.heartbeat?.version ?? null,
          observedAt: source.heartbeat?.observedAt ?? null,
          freshness,
          message: operationalMessage(operationalState, freshness),
        },
        character: resolveCharacterState(now),
      },
      availabilityPercent: source.availabilityPercent,
      metrics: source.metrics,
      series: source.series,
      activities: source.activities,
      services: source.services,
      incidents: source.incidents,
      releases: byKind("release"),
      roadmap: byKind("roadmap"),
      milestones: byKind("milestone"),
      achievements: byKind("achievement"),
      dailySummaries: byKind("daily_summary"),
      moderationReports: byKind("moderation_report"),
      commands: source.commands,
      community: source.community,
    };
  } catch (error) {
    if (error instanceof PublicDataStoreUnavailableError) return emptyPublicDashboard(period, now);
    throw error;
  }
}

function jsonError(code: string, status: number, details?: unknown) {
  return Response.json(
    { ok: false, error: code, ...(details === undefined ? {} : { details }) },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function handleIngestionRequest(
  request: Request,
  options: { repository?: PublicPlatformRepository; now?: Date } = {},
) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") return jsonError("unsupported_media_type", 415);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_INGESTION_BODY_BYTES) return jsonError("payload_too_large", 413);
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_INGESTION_BODY_BYTES) {
    return jsonError("payload_too_large", 413);
  }
  try {
    const now = options.now ?? new Date();
    const authenticated = authenticateIngestionRequest(request, rawBody, now);
    let unknownPayload: unknown;
    try {
      unknownPayload = JSON.parse(rawBody);
    } catch {
      return jsonError("invalid_json", 400);
    }
    const parsed = integrationEventSchema.safeParse(unknownPayload);
    if (!parsed.success) {
      return jsonError(
        "invalid_payload",
        422,
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }
    const requiredScope = EVENT_SCOPE[parsed.data.type];
    if (!authenticated.scopes.has(requiredScope)) return jsonError("insufficient_scope", 403);
    const repository = options.repository ?? (await getPublicPlatformRepository());
    const allowed = await repository.consumeRateLimit(
      authenticated.keyId,
      now,
      INGESTION_RATE_LIMIT_PER_MINUTE,
    );
    if (!allowed) return jsonError("rate_limit_exceeded", 429);
    const result = await repository.ingest(parsed.data, {
      keyId: authenticated.keyId,
      nonceHash: authenticated.nonceHash,
      payloadHash: authenticated.payloadHash,
      receivedAt: now.toISOString(),
    });
    if (result === "replay") return jsonError("replayed_request", 409);
    return Response.json(
      {
        ok: true,
        accepted: result === "accepted",
        duplicate: result === "duplicate",
        eventId: parsed.data.eventId,
      },
      { status: result === "accepted" ? 202 : 200, headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof IngestionAuthError) return jsonError(error.code, error.status);
    if (error instanceof PublicDataStoreUnavailableError)
      return jsonError("data_store_unavailable", 503);
    console.error("Bella ingestion failed", error);
    return jsonError("internal_error", 500);
  }
}

export async function listPublicActivities(options: {
  category?: PublicActivity["category"];
  cursor?: string;
  limit: number;
}) {
  try {
    const repository = await getPublicPlatformRepository();
    return await repository.listActivities(options);
  } catch (error) {
    if (error instanceof PublicDataStoreUnavailableError) return { items: [], nextCursor: null };
    throw error;
  }
}

export async function listPublicCommands(options: {
  query?: string;
  category?: string;
  limit: number;
}) {
  try {
    const repository = await getPublicPlatformRepository();
    return await repository.listCommands(options);
  } catch (error) {
    if (error instanceof PublicDataStoreUnavailableError) return [];
    throw error;
  }
}
