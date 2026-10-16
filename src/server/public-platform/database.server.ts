import postgres from "postgres";
import { z } from "zod";
import { METRIC_DEFINITIONS, PUBLIC_METRIC_KEYS } from "@/lib/public-platform";
import type {
  PublicActivity,
  PublicCommand,
  PublicEditorialItem,
  PublicIncident,
  PublicMetric,
  PublicMetricSeriesPoint,
  PublicService,
  PeriodBounds,
} from "@/lib/public-platform";
import type { IntegrationEvent } from "./contracts";
import {
  MemoryPublicPlatformRepository,
  type ActivityPage,
  type DashboardSource,
  type IngestionMetadata,
  type IngestionResult,
  type PublicPlatformRepository,
} from "./repository";

export class PublicDataStoreUnavailableError extends Error {}

const dateValue = z
  .union([z.string(), z.date()])
  .transform((value) =>
    typeof value === "string" ? new Date(value).toISOString() : value.toISOString(),
  );
const nullableDateValue = z
  .union([z.string(), z.date(), z.null()])
  .transform((value) =>
    value === null
      ? null
      : typeof value === "string"
        ? new Date(value).toISOString()
        : value.toISOString(),
  );
const nullableNumber = z
  .union([z.number(), z.string(), z.null()])
  .transform((value) => (value === null ? null : Number(value)));

const heartbeatRowSchema = z.object({
  operational_state: z.enum(["online", "away", "offline", "maintenance"]),
  latency_ms: nullableNumber,
  version: z.string().nullable(),
  observed_at: dateValue,
});
const availabilityRowSchema = z.object({ availability_percent: nullableNumber });
const metricRowSchema = z.object({
  metric_key: z.enum(PUBLIC_METRIC_KEYS),
  value: nullableNumber,
  updated_at: nullableDateValue,
});
const seriesRowSchema = z.object({
  date: z
    .union([z.string(), z.date()])
    .transform((value) => (typeof value === "string" ? value : value.toISOString()).slice(0, 10)),
  interactions: nullableNumber,
  commands: nullableNumber,
  security_actions: nullableNumber,
});
const activityRowSchema = z.object({
  activity_id: z.string(),
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
  title: z.string(),
  description: z.string(),
  occurred_at: dateValue,
  origin: z.string(),
  version: z.string().nullable(),
  href: z.string().nullable(),
});
const serviceRowSchema = z.object({
  service_key: z.string(),
  label: z.string(),
  state: z.enum(["operational", "degraded", "partial_outage", "offline", "maintenance", "unknown"]),
  latency_ms: nullableNumber,
  observed_at: nullableDateValue,
});
const incidentRowSchema = z.object({
  incident_id: z.string(),
  service_key: z.string().nullable(),
  title: z.string(),
  summary: z.string(),
  state: z.enum(["investigating", "identified", "monitoring", "resolved", "maintenance"]),
  impact: z.enum(["none", "minor", "major", "critical"]),
  started_at: dateValue,
  resolved_at: nullableDateValue,
  updated_at: dateValue,
});
const editorialRowSchema = z.object({
  item_id: z.string(),
  kind: z.enum([
    "release",
    "roadmap",
    "milestone",
    "achievement",
    "daily_summary",
    "moderation_report",
  ]),
  status: z.string(),
  title: z.string(),
  summary: z.string(),
  details: z.array(z.string()),
  version: z.string().nullable(),
  category: z.string().nullable(),
  published_at: nullableDateValue,
  target_date: nullableDateValue,
});
const commandRowSchema = z.object({
  command_name: z.string(),
  description: z.string(),
  category: z.string(),
  examples: z.array(z.string()),
  permissions: z.string(),
  availability: z.string(),
  restrictions: z.string().nullable(),
  updated_at: dateValue,
});
const communityRowSchema = z.object({
  members: nullableNumber,
  interactions: nullableNumber,
  events: nullableNumber,
  observed_at: nullableDateValue,
});

class PostgresPublicPlatformRepository implements PublicPlatformRepository {
  constructor(private readonly sql: ReturnType<typeof postgres>) {}

  async consumeRateLimit(keyId: string, now: Date, limit: number) {
    const minuteBucket = new Date(Math.floor(now.getTime() / 60_000) * 60_000).toISOString();
    const rows = await this.sql`
      INSERT INTO bella_ingestion_rate_limits (key_id, minute_bucket, request_count)
      VALUES (${keyId}, ${minuteBucket}, 1)
      ON CONFLICT (key_id, minute_bucket) DO UPDATE
      SET request_count = bella_ingestion_rate_limits.request_count + 1
      WHERE bella_ingestion_rate_limits.request_count < ${limit}
      RETURNING request_count
    `;
    return rows.length === 1;
  }

  async ingest(event: IntegrationEvent, metadata: IngestionMetadata): Promise<IngestionResult> {
    return this.sql.begin(async (transaction) => {
      const inserted = await transaction`
        INSERT INTO bella_ingestion_events
          (event_id, contract_version, event_type, key_id, nonce_hash, payload_hash, occurred_at, received_at)
        VALUES
          (${event.eventId}, ${event.contractVersion}, ${event.type}, ${metadata.keyId}, ${metadata.nonceHash}, ${metadata.payloadHash}, ${event.occurredAt}, ${metadata.receivedAt})
        ON CONFLICT DO NOTHING
        RETURNING event_id
      `;
      if (inserted.length === 0) {
        const duplicate = await transaction`
          SELECT event_id FROM bella_ingestion_events WHERE event_id = ${event.eventId} LIMIT 1
        `;
        return duplicate.length ? "duplicate" : "replay";
      }

      if (event.type === "heartbeat") {
        await transaction`
          INSERT INTO bella_heartbeat_history
            (event_id, operational_state, latency_ms, version, observed_at, received_at)
          VALUES
            (${event.eventId}, ${event.payload.state}, ${event.payload.latencyMs ?? null}, ${event.payload.version ?? null}, ${event.occurredAt}, ${metadata.receivedAt})
        `;
        for (const service of event.payload.services) {
          await transaction`
            INSERT INTO bella_service_history
              (source_event_id, service_key, state, latency_ms, observed_at)
            VALUES
              (${event.eventId}, ${service.key}, ${service.state}, ${service.latencyMs ?? null}, ${event.occurredAt})
          `;
          await transaction`
            INSERT INTO bella_public_services
              (service_key, label, state, latency_ms, observed_at, source_event_id)
            VALUES
              (${service.key}, ${service.label}, ${service.state}, ${service.latencyMs ?? null}, ${event.occurredAt}, ${event.eventId})
            ON CONFLICT (service_key) DO UPDATE SET
              label = EXCLUDED.label,
              state = EXCLUDED.state,
              latency_ms = EXCLUDED.latency_ms,
              observed_at = EXCLUDED.observed_at,
              source_event_id = EXCLUDED.source_event_id
            WHERE bella_public_services.observed_at <= EXCLUDED.observed_at
          `;
        }
      } else if (event.type === "metrics") {
        for (const point of event.payload.points) {
          await transaction`
            INSERT INTO bella_metric_points
              (source_event_id, metric_key, value, unit, mode, period_start, period_end, received_at)
            VALUES
              (${event.eventId}, ${point.key}, ${point.value}, ${point.unit}, ${event.payload.mode}, ${event.payload.periodStart}, ${event.payload.periodEnd}, ${metadata.receivedAt})
          `;
        }
      } else if (event.type === "public_activity") {
        await transaction`
          INSERT INTO bella_public_activities
            (activity_id, category, title, description, occurred_at, origin, version, href, source_event_id)
          VALUES
            (${event.eventId}, ${event.payload.category}, ${event.payload.title}, ${event.payload.description}, ${event.occurredAt}, ${event.payload.origin}, ${event.payload.version ?? null}, ${event.payload.href ?? null}, ${event.eventId})
        `;
      } else if (event.type === "incident") {
        await transaction`
          INSERT INTO bella_public_incidents
            (incident_id, service_key, title, summary, state, impact, started_at, resolved_at, updated_at, source_event_id)
          VALUES
            (${event.payload.incidentId}, ${event.payload.serviceKey ?? null}, ${event.payload.title}, ${event.payload.summary}, ${event.payload.state}, ${event.payload.impact}, ${event.payload.startedAt}, ${event.payload.resolvedAt ?? null}, ${event.occurredAt}, ${event.eventId})
          ON CONFLICT (incident_id) DO UPDATE SET
            service_key = EXCLUDED.service_key,
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            state = EXCLUDED.state,
            impact = EXCLUDED.impact,
            started_at = EXCLUDED.started_at,
            resolved_at = EXCLUDED.resolved_at,
            updated_at = EXCLUDED.updated_at,
            source_event_id = EXCLUDED.source_event_id
          WHERE bella_public_incidents.updated_at <= EXCLUDED.updated_at
        `;
      } else if (event.type === "editorial") {
        await transaction`
          INSERT INTO bella_editorial_items
            (item_id, kind, status, title, summary, details, version, category, published_at, target_date, updated_at, source_event_id)
          VALUES
            (${event.payload.itemId}, ${event.payload.kind}, ${event.payload.status}, ${event.payload.title}, ${event.payload.summary}, ${JSON.stringify(event.payload.details)}::jsonb, ${event.payload.version ?? null}, ${event.payload.category ?? null}, ${event.payload.publishedAt ?? null}, ${event.payload.targetDate ?? null}, ${event.occurredAt}, ${event.eventId})
          ON CONFLICT (item_id) DO UPDATE SET
            kind = EXCLUDED.kind,
            status = EXCLUDED.status,
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            details = EXCLUDED.details,
            version = EXCLUDED.version,
            category = EXCLUDED.category,
            published_at = EXCLUDED.published_at,
            target_date = EXCLUDED.target_date,
            updated_at = EXCLUDED.updated_at,
            source_event_id = EXCLUDED.source_event_id
          WHERE bella_editorial_items.updated_at <= EXCLUDED.updated_at
        `;
      } else if (event.type === "command_catalog") {
        if (event.payload.replace) await transaction`DELETE FROM bella_public_commands`;
        for (const command of event.payload.commands) {
          await transaction`
            INSERT INTO bella_public_commands
              (command_name, description, category, examples, permissions, availability, restrictions, updated_at, source_event_id)
            VALUES
              (${command.name}, ${command.description}, ${command.category}, ${JSON.stringify(command.examples)}::jsonb, ${command.permissions}, ${command.availability}, ${command.restrictions ?? null}, ${event.occurredAt}, ${event.eventId})
            ON CONFLICT (command_name) DO UPDATE SET
              description = EXCLUDED.description,
              category = EXCLUDED.category,
              examples = EXCLUDED.examples,
              permissions = EXCLUDED.permissions,
              availability = EXCLUDED.availability,
              restrictions = EXCLUDED.restrictions,
              updated_at = EXCLUDED.updated_at,
              source_event_id = EXCLUDED.source_event_id
            WHERE bella_public_commands.updated_at <= EXCLUDED.updated_at
          `;
        }
      } else if (event.type === "community_snapshot") {
        await transaction`
          INSERT INTO bella_community_snapshots
            (source_event_id, community_key, members, interactions, events, observed_at)
          VALUES
            (${event.eventId}, ${event.payload.communityKey}, ${event.payload.members ?? null}, ${event.payload.interactions ?? null}, ${event.payload.events ?? null}, ${event.occurredAt})
        `;
      }
      return "accepted";
    });
  }

  async getDashboardSource(bounds: PeriodBounds): Promise<DashboardSource> {
    const [
      heartbeatRows,
      availabilityRows,
      metricRows,
      seriesRows,
      activityRows,
      serviceRows,
      incidentRows,
      editorialRows,
      commandRows,
      communityRows,
    ] = await Promise.all([
      this
        .sql`SELECT operational_state, latency_ms, version, observed_at FROM bella_heartbeat_history ORDER BY observed_at DESC LIMIT 1`,
      this.sql`
        SELECT CASE WHEN COUNT(*) = 0 THEN NULL ELSE
          100.0 * COUNT(*) FILTER (WHERE operational_state IN ('online', 'away')) / COUNT(*)
        END AS availability_percent
        FROM bella_heartbeat_history
        WHERE observed_at BETWEEN ${bounds.start} AND ${bounds.end}
      `,
      this.sql`
        WITH range_points AS (
          SELECT * FROM bella_metric_points
          WHERE period_end >= ${bounds.start} AND period_start <= ${bounds.end}
        ), latest_snapshots AS (
          SELECT DISTINCT ON (metric_key) metric_key, value, period_end
          FROM range_points WHERE mode = 'snapshot'
          ORDER BY metric_key, period_end DESC, received_at DESC
        ), deltas AS (
          SELECT metric_key, SUM(value) AS value, MAX(period_end) AS period_end
          FROM range_points WHERE mode = 'delta' GROUP BY metric_key
        ), metric_keys AS (
          SELECT metric_key FROM latest_snapshots UNION SELECT metric_key FROM deltas
        )
        SELECT keys.metric_key,
          COALESCE(snapshots.value, deltas.value) AS value,
          GREATEST(snapshots.period_end, deltas.period_end) AS updated_at
        FROM metric_keys keys
        LEFT JOIN latest_snapshots snapshots USING (metric_key)
        LEFT JOIN deltas USING (metric_key)
      `,
      this.sql`
        SELECT (period_end AT TIME ZONE 'America/Recife')::date AS date,
          SUM(value) FILTER (WHERE metric_key = 'interactions_processed') AS interactions,
          SUM(value) FILTER (WHERE metric_key = 'commands_executed') AS commands,
          SUM(value) FILTER (WHERE metric_key IN ('security_events', 'messages_blocked', 'automod_actions')) AS security_actions
        FROM bella_metric_points
        WHERE mode = 'delta' AND period_end >= ${bounds.start} AND period_start <= ${bounds.end}
        GROUP BY date ORDER BY date
      `,
      this.sql`
        SELECT activity_id, category, title, description, occurred_at, origin, version, href
        FROM bella_public_activities
        WHERE occurred_at BETWEEN ${bounds.start} AND ${bounds.end}
        ORDER BY occurred_at DESC LIMIT 12
      `,
      this
        .sql`SELECT service_key, label, state, latency_ms, observed_at FROM bella_public_services ORDER BY label`,
      this.sql`
        SELECT incident_id, service_key, title, summary, state, impact, started_at, resolved_at, updated_at
        FROM bella_public_incidents
        WHERE state <> 'resolved' OR updated_at BETWEEN ${bounds.start} AND ${bounds.end}
        ORDER BY updated_at DESC LIMIT 12
      `,
      this.sql`
        SELECT item_id, kind, status, title, summary, details, version, category, published_at, target_date
        FROM bella_editorial_items WHERE status <> 'draft'
        ORDER BY COALESCE(published_at, target_date) DESC NULLS LAST LIMIT 100
      `,
      this.sql`
        SELECT command_name, description, category, examples, permissions, availability, restrictions, updated_at
        FROM bella_public_commands ORDER BY command_name LIMIT 250
      `,
      this.sql`
        SELECT members, interactions, events, observed_at
        FROM bella_community_snapshots
        WHERE observed_at BETWEEN ${bounds.start} AND ${bounds.end}
        ORDER BY observed_at DESC LIMIT 1
      `,
    ]);

    const heartbeat = heartbeatRows[0] ? heartbeatRowSchema.parse(heartbeatRows[0]) : null;
    const availability = availabilityRowSchema.parse(
      availabilityRows[0] ?? { availability_percent: null },
    );
    const parsedMetrics = z.array(metricRowSchema).parse(metricRows);
    const metrics: PublicMetric[] = PUBLIC_METRIC_KEYS.map((key) => {
      const metric = parsedMetrics.find((item) => item.metric_key === key);
      return {
        key,
        ...METRIC_DEFINITIONS[key],
        value: metric?.value ?? null,
        updatedAt: metric?.updated_at ?? null,
      };
    });
    const series: PublicMetricSeriesPoint[] = z
      .array(seriesRowSchema)
      .parse(seriesRows)
      .map((row) => ({
        date: row.date,
        interactions: row.interactions,
        commands: row.commands,
        securityActions: row.security_actions,
      }));
    const activities: PublicActivity[] = z
      .array(activityRowSchema)
      .parse(activityRows)
      .map((row) => ({
        id: row.activity_id,
        category: row.category,
        title: row.title,
        description: row.description,
        occurredAt: row.occurred_at,
        origin: row.origin,
        version: row.version,
        href: row.href,
      }));
    const services: PublicService[] = z
      .array(serviceRowSchema)
      .parse(serviceRows)
      .map((row) => ({
        key: row.service_key,
        label: row.label,
        state: row.state,
        latencyMs: row.latency_ms,
        observedAt: row.observed_at,
      }));
    const incidents: PublicIncident[] = z
      .array(incidentRowSchema)
      .parse(incidentRows)
      .map((row) => ({
        id: row.incident_id,
        serviceKey: row.service_key,
        title: row.title,
        summary: row.summary,
        state: row.state,
        impact: row.impact,
        startedAt: row.started_at,
        resolvedAt: row.resolved_at,
        updatedAt: row.updated_at,
      }));
    const editorial: PublicEditorialItem[] = z
      .array(editorialRowSchema)
      .parse(editorialRows)
      .map((row) => ({
        id: row.item_id,
        kind: row.kind,
        status: row.status,
        title: row.title,
        summary: row.summary,
        details: row.details,
        version: row.version,
        publishedAt: row.published_at,
        targetDate: row.target_date,
        category: row.category,
      }));
    const commands: PublicCommand[] = z
      .array(commandRowSchema)
      .parse(commandRows)
      .map((row) => ({
        name: row.command_name,
        description: row.description,
        category: row.category,
        examples: row.examples,
        permissions: row.permissions,
        availability: row.availability,
        restrictions: row.restrictions,
        updatedAt: row.updated_at,
      }));
    const communityRow = communityRows[0] ? communityRowSchema.parse(communityRows[0]) : null;
    return {
      heartbeat: heartbeat
        ? {
            state: heartbeat.operational_state,
            latencyMs: heartbeat.latency_ms,
            version: heartbeat.version,
            observedAt: heartbeat.observed_at,
          }
        : null,
      availabilityPercent: availability.availability_percent,
      metrics,
      series,
      activities,
      services,
      incidents,
      editorial,
      commands,
      community: communityRow
        ? {
            members: communityRow.members,
            interactions: communityRow.interactions,
            events: communityRow.events,
            observedAt: communityRow.observed_at,
          }
        : { members: null, interactions: null, events: null, observedAt: null },
    };
  }

  async listActivities(options: {
    category?: PublicActivity["category"];
    cursor?: string;
    limit: number;
  }): Promise<ActivityPage> {
    const rows = await this.sql`
      SELECT activity_id, category, title, description, occurred_at, origin, version, href
      FROM bella_public_activities
      WHERE (${options.category ?? null}::text IS NULL OR category = ${options.category ?? null})
        AND (${options.cursor ?? null}::timestamptz IS NULL OR occurred_at < ${options.cursor ?? null})
      ORDER BY occurred_at DESC LIMIT ${options.limit + 1}
    `;
    const parsed = z.array(activityRowSchema).parse(rows);
    const hasMore = parsed.length > options.limit;
    const items = parsed.slice(0, options.limit).map((row) => ({
      id: row.activity_id,
      category: row.category,
      title: row.title,
      description: row.description,
      occurredAt: row.occurred_at,
      origin: row.origin,
      version: row.version,
      href: row.href,
    }));
    return { items, nextCursor: hasMore ? (items.at(-1)?.occurredAt ?? null) : null };
  }

  async listCommands(options: { query?: string; category?: string; limit: number }) {
    const query = options.query ? `%${options.query}%` : null;
    const rows = await this.sql`
      SELECT command_name, description, category, examples, permissions, availability, restrictions, updated_at
      FROM bella_public_commands
      WHERE (${options.category ?? null}::text IS NULL OR category = ${options.category ?? null})
        AND (${query}::text IS NULL OR command_name ILIKE ${query} OR description ILIKE ${query})
      ORDER BY command_name LIMIT ${options.limit}
    `;
    return z
      .array(commandRowSchema)
      .parse(rows)
      .map((row) => ({
        name: row.command_name,
        description: row.description,
        category: row.category,
        examples: row.examples,
        permissions: row.permissions,
        availability: row.availability,
        restrictions: row.restrictions,
        updatedAt: row.updated_at,
      }));
  }
}

type RepositoryGlobal = typeof globalThis & {
  __bellaPublicRepository?: PublicPlatformRepository;
  __bellaPublicSql?: ReturnType<typeof postgres>;
};

export async function getPublicPlatformRepository(): Promise<PublicPlatformRepository> {
  const globalState = globalThis as RepositoryGlobal;
  if (globalState.__bellaPublicRepository) return globalState.__bellaPublicRepository;
  const databaseUrl = process.env["DATABASE_URL"];
  if (databaseUrl) {
    globalState.__bellaPublicSql ??= postgres(databaseUrl, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: process.env["DATABASE_SSL"] === "disable" ? false : "require",
    });
    globalState.__bellaPublicRepository = new PostgresPublicPlatformRepository(
      globalState.__bellaPublicSql,
    );
    return globalState.__bellaPublicRepository;
  }
  if (
    process.env["NODE_ENV"] !== "production" ||
    process.env["BELLA_ALLOW_MEMORY_STORE"] === "true"
  ) {
    globalState.__bellaPublicRepository = new MemoryPublicPlatformRepository();
    return globalState.__bellaPublicRepository;
  }
  throw new PublicDataStoreUnavailableError("DATABASE_URL não configurada");
}
