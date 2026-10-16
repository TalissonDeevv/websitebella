import type {
  PublicActivity,
  PublicCommand,
  PublicEditorialItem,
  PublicIncident,
  PublicMetric,
  PublicMetricSeriesPoint,
  PublicService,
  PeriodBounds,
  OperationalState,
} from "@/lib/public-platform";
import { METRIC_DEFINITIONS, PUBLIC_METRIC_KEYS } from "@/lib/public-platform";
import type { IntegrationEvent } from "./contracts";

export interface IngestionMetadata {
  keyId: string;
  nonceHash: string;
  payloadHash: string;
  receivedAt: string;
}

export type IngestionResult = "accepted" | "duplicate" | "replay";

export interface DashboardSource {
  heartbeat: {
    state: OperationalState;
    latencyMs: number | null;
    version: string | null;
    observedAt: string;
  } | null;
  availabilityPercent: number | null;
  metrics: PublicMetric[];
  series: PublicMetricSeriesPoint[];
  activities: PublicActivity[];
  services: PublicService[];
  incidents: PublicIncident[];
  editorial: PublicEditorialItem[];
  commands: PublicCommand[];
  community: {
    members: number | null;
    interactions: number | null;
    events: number | null;
    observedAt: string | null;
  };
}

export interface ActivityPage {
  items: PublicActivity[];
  nextCursor: string | null;
}

export interface PublicPlatformRepository {
  consumeRateLimit(keyId: string, now: Date, limit: number): Promise<boolean>;
  ingest(event: IntegrationEvent, metadata: IngestionMetadata): Promise<IngestionResult>;
  getDashboardSource(bounds: PeriodBounds): Promise<DashboardSource>;
  listActivities(options: {
    category?: PublicActivity["category"];
    cursor?: string;
    limit: number;
  }): Promise<ActivityPage>;
  listCommands(options: {
    query?: string;
    category?: string;
    limit: number;
  }): Promise<PublicCommand[]>;
}

interface StoredMetricPoint {
  eventId: string;
  key: PublicMetric["key"];
  value: number;
  unit: "count" | "seconds";
  mode: "delta" | "snapshot";
  periodStart: string;
  periodEnd: string;
}

interface StoredHeartbeat {
  eventId: string;
  state: OperationalState;
  latencyMs: number | null;
  version: string | null;
  observedAt: string;
}

interface StoredCommunity {
  eventId: string;
  observedAt: string;
  members: number | null;
  interactions: number | null;
  events: number | null;
}

export class MemoryPublicPlatformRepository implements PublicPlatformRepository {
  private readonly eventIds = new Set<string>();
  private readonly nonces = new Set<string>();
  private readonly rateLimits = new Map<string, { bucket: number; count: number }>();
  private readonly heartbeats: StoredHeartbeat[] = [];
  private readonly metricPoints: StoredMetricPoint[] = [];
  private readonly activities = new Map<string, PublicActivity>();
  private readonly services = new Map<string, PublicService>();
  private readonly incidents = new Map<string, PublicIncident>();
  private readonly editorial = new Map<string, PublicEditorialItem>();
  private readonly commands = new Map<string, PublicCommand>();
  private readonly community: StoredCommunity[] = [];

  async consumeRateLimit(keyId: string, now: Date, limit: number) {
    const bucket = Math.floor(now.getTime() / 60_000);
    const current = this.rateLimits.get(keyId);
    if (!current || current.bucket !== bucket) {
      this.rateLimits.set(keyId, { bucket, count: 1 });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  }

  async ingest(event: IntegrationEvent, metadata: IngestionMetadata): Promise<IngestionResult> {
    if (this.eventIds.has(event.eventId)) return "duplicate";
    const nonceKey = `${metadata.keyId}:${metadata.nonceHash}`;
    if (this.nonces.has(nonceKey)) return "replay";
    this.eventIds.add(event.eventId);
    this.nonces.add(nonceKey);

    if (event.type === "heartbeat") {
      this.heartbeats.push({
        eventId: event.eventId,
        state: event.payload.state,
        latencyMs: event.payload.latencyMs ?? null,
        version: event.payload.version ?? null,
        observedAt: event.occurredAt,
      });
      for (const service of event.payload.services) {
        const existing = this.services.get(service.key);
        if (!existing || new Date(existing.observedAt ?? 0) <= new Date(event.occurredAt)) {
          this.services.set(service.key, {
            key: service.key,
            label: service.label,
            state: service.state,
            latencyMs: service.latencyMs ?? null,
            observedAt: event.occurredAt,
          });
        }
      }
    } else if (event.type === "metrics") {
      for (const point of event.payload.points) {
        this.metricPoints.push({
          eventId: event.eventId,
          key: point.key,
          value: point.value,
          unit: point.unit,
          mode: event.payload.mode,
          periodStart: event.payload.periodStart,
          periodEnd: event.payload.periodEnd,
        });
      }
    } else if (event.type === "public_activity") {
      this.activities.set(event.eventId, {
        id: event.eventId,
        category: event.payload.category,
        title: event.payload.title,
        description: event.payload.description,
        occurredAt: event.occurredAt,
        origin: event.payload.origin,
        version: event.payload.version ?? null,
        href: event.payload.href ?? null,
      });
    } else if (event.type === "incident") {
      this.incidents.set(event.payload.incidentId, {
        id: event.payload.incidentId,
        serviceKey: event.payload.serviceKey ?? null,
        title: event.payload.title,
        summary: event.payload.summary,
        state: event.payload.state,
        impact: event.payload.impact,
        startedAt: event.payload.startedAt,
        resolvedAt: event.payload.resolvedAt ?? null,
        updatedAt: event.occurredAt,
      });
    } else if (event.type === "editorial") {
      this.editorial.set(event.payload.itemId, {
        id: event.payload.itemId,
        kind: event.payload.kind,
        status: event.payload.status,
        title: event.payload.title,
        summary: event.payload.summary,
        details: event.payload.details,
        version: event.payload.version ?? null,
        publishedAt: event.payload.publishedAt ?? null,
        targetDate: event.payload.targetDate ?? null,
        category: event.payload.category ?? null,
      });
    } else if (event.type === "command_catalog") {
      if (event.payload.replace) this.commands.clear();
      for (const command of event.payload.commands) {
        this.commands.set(command.name, {
          name: command.name,
          description: command.description,
          category: command.category,
          examples: command.examples,
          permissions: command.permissions,
          availability: command.availability,
          restrictions: command.restrictions ?? null,
          updatedAt: event.occurredAt,
        });
      }
    } else if (event.type === "community_snapshot") {
      this.community.push({
        eventId: event.eventId,
        observedAt: event.occurredAt,
        members: event.payload.members ?? null,
        interactions: event.payload.interactions ?? null,
        events: event.payload.events ?? null,
      });
    }
    return "accepted";
  }

  async getDashboardSource(bounds: PeriodBounds): Promise<DashboardSource> {
    const rangeStart = new Date(bounds.start).getTime();
    const rangeEnd = new Date(bounds.end).getTime();
    const inRange = (value: string) => {
      const timestamp = new Date(value).getTime();
      return timestamp >= rangeStart && timestamp <= rangeEnd;
    };
    const orderedHeartbeats = [...this.heartbeats].sort(
      (left, right) => new Date(right.observedAt).getTime() - new Date(left.observedAt).getTime(),
    );
    const heartbeat = orderedHeartbeats[0] ?? null;
    const rangeHeartbeats = orderedHeartbeats.filter((item) => inRange(item.observedAt));
    const availabilityPercent = rangeHeartbeats.length
      ? (rangeHeartbeats.filter((item) => item.state === "online" || item.state === "away").length /
          rangeHeartbeats.length) *
        100
      : null;
    const rangePoints = this.metricPoints.filter(
      (point) =>
        new Date(point.periodEnd).getTime() >= rangeStart &&
        new Date(point.periodStart).getTime() <= rangeEnd,
    );
    const metrics = PUBLIC_METRIC_KEYS.map((key) => {
      const points = rangePoints.filter((point) => point.key === key);
      const snapshots = points
        .filter((point) => point.mode === "snapshot")
        .sort(
          (left, right) => new Date(right.periodEnd).getTime() - new Date(left.periodEnd).getTime(),
        );
      const selectedValue =
        snapshots[0]?.value ?? points.reduce((total, point) => total + point.value, 0);
      const latest = [...points].sort(
        (left, right) => new Date(right.periodEnd).getTime() - new Date(left.periodEnd).getTime(),
      )[0];
      return {
        key,
        ...METRIC_DEFINITIONS[key],
        value: points.length ? selectedValue : null,
        updatedAt: latest?.periodEnd ?? null,
      };
    });
    const daily = new Map<string, PublicMetricSeriesPoint>();
    for (const point of rangePoints.filter((item) => item.mode === "delta")) {
      const date = point.periodEnd.slice(0, 10);
      const current = daily.get(date) ?? {
        date,
        interactions: null,
        commands: null,
        securityActions: null,
      };
      if (point.key === "interactions_processed") {
        current.interactions = (current.interactions ?? 0) + point.value;
      } else if (point.key === "commands_executed") {
        current.commands = (current.commands ?? 0) + point.value;
      } else if (["security_events", "messages_blocked", "automod_actions"].includes(point.key)) {
        current.securityActions = (current.securityActions ?? 0) + point.value;
      }
      daily.set(date, current);
    }
    const editorial = [...this.editorial.values()]
      .filter((item) => item.status !== "draft")
      .sort((left, right) =>
        String(right.publishedAt ?? right.targetDate ?? "").localeCompare(
          String(left.publishedAt ?? left.targetDate ?? ""),
        ),
      );
    const community = [...this.community]
      .filter((item) => inRange(item.observedAt))
      .sort(
        (left, right) => new Date(right.observedAt).getTime() - new Date(left.observedAt).getTime(),
      )[0];
    return {
      heartbeat,
      availabilityPercent,
      metrics,
      series: [...daily.values()].sort((left, right) => left.date.localeCompare(right.date)),
      activities: [...this.activities.values()]
        .filter((item) => inRange(item.occurredAt))
        .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
        .slice(0, 12),
      services: [...this.services.values()].sort((left, right) =>
        left.label.localeCompare(right.label),
      ),
      incidents: [...this.incidents.values()]
        .filter((item) => item.state !== "resolved" || inRange(item.updatedAt))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, 12),
      editorial,
      commands: [...this.commands.values()].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
      community: community
        ? {
            members: community.members,
            interactions: community.interactions,
            events: community.events,
            observedAt: community.observedAt,
          }
        : { members: null, interactions: null, events: null, observedAt: null },
    };
  }

  async listActivities(options: {
    category?: PublicActivity["category"];
    cursor?: string;
    limit: number;
  }): Promise<ActivityPage> {
    const filtered = [...this.activities.values()]
      .filter((item) => !options.category || item.category === options.category)
      .filter((item) => !options.cursor || item.occurredAt < options.cursor)
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
    const items = filtered.slice(0, options.limit);
    return {
      items,
      nextCursor: filtered.length > options.limit ? (items.at(-1)?.occurredAt ?? null) : null,
    };
  }

  async listCommands(options: { query?: string; category?: string; limit: number }) {
    const query = options.query?.toLocaleLowerCase("pt-BR") ?? "";
    return [...this.commands.values()]
      .filter((command) => !options.category || command.category === options.category)
      .filter(
        (command) =>
          !query ||
          command.name.toLocaleLowerCase("pt-BR").includes(query) ||
          command.description.toLocaleLowerCase("pt-BR").includes(query),
      )
      .sort((left, right) => left.name.localeCompare(right.name))
      .slice(0, options.limit);
  }
}
