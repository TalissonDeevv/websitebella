import { z } from "zod";
import { PUBLIC_METRIC_KEYS } from "@/lib/public-platform";

const identifier = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9:_-]+$/);
const isoDate = z.string().datetime({ offset: true });
const safeText = (maximum: number) => z.string().trim().min(1).max(maximum);
const publicHttpsUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => new URL(value).protocol === "https:", {
    message: "A URL pública deve utilizar HTTPS",
  });

const serviceState = z.enum([
  "operational",
  "degraded",
  "partial_outage",
  "offline",
  "maintenance",
  "unknown",
]);

const baseEnvelope = {
  contractVersion: z.literal(1),
  eventId: identifier,
  occurredAt: isoDate,
};

export const heartbeatEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("heartbeat"),
    payload: z
      .object({
        state: z.enum(["online", "away", "offline", "maintenance"]),
        latencyMs: z.number().int().min(0).max(120_000).nullable().optional(),
        version: z.string().trim().max(64).nullable().optional(),
        services: z
          .array(
            z
              .object({
                key: z
                  .string()
                  .trim()
                  .min(1)
                  .max(64)
                  .regex(/^[a-z0-9_-]+$/),
                label: safeText(80),
                state: serviceState,
                latencyMs: z.number().int().min(0).max(120_000).nullable().optional(),
              })
              .strict(),
          )
          .max(24)
          .default([]),
      })
      .strict(),
  })
  .strict();

export const metricsEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("metrics"),
    payload: z
      .object({
        mode: z.enum(["delta", "snapshot"]),
        periodStart: isoDate,
        periodEnd: isoDate,
        points: z
          .array(
            z
              .object({
                key: z.enum(PUBLIC_METRIC_KEYS),
                value: z.number().finite().min(0).max(Number.MAX_SAFE_INTEGER),
                unit: z.enum(["count", "seconds"]),
              })
              .strict(),
          )
          .min(1)
          .max(100),
      })
      .strict()
      .refine((payload) => new Date(payload.periodStart) <= new Date(payload.periodEnd), {
        message: "periodStart deve ser anterior ou igual a periodEnd",
      }),
  })
  .strict();

export const publicActivityEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("public_activity"),
    payload: z
      .object({
        category: z.enum([
          "release",
          "feature",
          "fix",
          "maintenance",
          "milestone",
          "report",
          "restoration",
          "security",
        ]),
        title: safeText(120),
        description: safeText(600),
        origin: safeText(80),
        version: z.string().trim().max(64).nullable().optional(),
        href: publicHttpsUrl.nullable().optional(),
      })
      .strict(),
  })
  .strict();

export const incidentEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("incident"),
    payload: z
      .object({
        incidentId: identifier,
        serviceKey: z
          .string()
          .trim()
          .max(64)
          .regex(/^[a-z0-9_-]+$/)
          .nullable()
          .optional(),
        title: safeText(120),
        summary: safeText(600),
        state: z.enum(["investigating", "identified", "monitoring", "resolved", "maintenance"]),
        impact: z.enum(["none", "minor", "major", "critical"]),
        startedAt: isoDate,
        resolvedAt: isoDate.nullable().optional(),
      })
      .strict(),
  })
  .strict();

export const editorialEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("editorial"),
    payload: z
      .object({
        itemId: identifier,
        kind: z.enum([
          "release",
          "roadmap",
          "milestone",
          "achievement",
          "daily_summary",
          "moderation_report",
        ]),
        status: z.enum([
          "draft",
          "planned",
          "in_development",
          "testing",
          "published",
          "completed",
          "postponed",
          "cancelled",
        ]),
        title: safeText(140),
        summary: safeText(1000),
        details: z.array(safeText(500)).max(20).default([]),
        version: z.string().trim().max(64).nullable().optional(),
        category: z.string().trim().max(80).nullable().optional(),
        publishedAt: isoDate.nullable().optional(),
        targetDate: isoDate.nullable().optional(),
      })
      .strict(),
  })
  .strict();

export const commandCatalogEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("command_catalog"),
    payload: z
      .object({
        replace: z.boolean().default(false),
        commands: z
          .array(
            z
              .object({
                name: z
                  .string()
                  .trim()
                  .min(1)
                  .max(64)
                  .regex(/^\/?[a-z0-9_-]+(?: [a-z0-9_-]+)*$/),
                description: safeText(300),
                category: safeText(80),
                examples: z.array(z.string().trim().min(1).max(180)).max(8).default([]),
                permissions: safeText(160),
                availability: safeText(120),
                restrictions: z.string().trim().max(300).nullable().optional(),
              })
              .strict(),
          )
          .max(250),
      })
      .strict(),
  })
  .strict();

export const communitySnapshotEventSchema = z
  .object({
    ...baseEnvelope,
    type: z.literal("community_snapshot"),
    payload: z
      .object({
        communityKey: z
          .string()
          .trim()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9_-]+$/),
        members: z.number().int().min(0).max(10_000_000).nullable().optional(),
        interactions: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable().optional(),
        events: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable().optional(),
      })
      .strict(),
  })
  .strict();

export const integrationEventSchema = z.discriminatedUnion("type", [
  heartbeatEventSchema,
  metricsEventSchema,
  publicActivityEventSchema,
  incidentEventSchema,
  editorialEventSchema,
  commandCatalogEventSchema,
  communitySnapshotEventSchema,
]);

export type IntegrationEvent = z.infer<typeof integrationEventSchema>;
export type IntegrationEventType = IntegrationEvent["type"];

export const EVENT_SCOPE: Record<IntegrationEventType, string> = {
  heartbeat: "status:write",
  metrics: "metrics:write",
  public_activity: "activity:write",
  incident: "infrastructure:write",
  editorial: "editorial:write",
  command_catalog: "commands:write",
  community_snapshot: "community:write",
};

export const periodSchema = z.enum(["today", "7d", "30d", "12m"]);
