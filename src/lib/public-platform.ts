export const PUBLIC_PERIODS = ["today", "7d", "30d", "12m"] as const;

export type PublicPeriod = (typeof PUBLIC_PERIODS)[number];

export const PUBLIC_METRIC_KEYS = [
  "commands_executed",
  "interactions_processed",
  "tickets_opened",
  "tickets_completed",
  "security_events",
  "messages_blocked",
  "automod_actions",
  "analyses_completed",
  "community_interactions",
  "community_events",
  "operation_seconds",
] as const;

export type PublicMetricKey = (typeof PUBLIC_METRIC_KEYS)[number];
export type OperationalState = "online" | "away" | "offline" | "maintenance" | "unknown";
export type ServiceState =
  "operational" | "degraded" | "partial_outage" | "offline" | "maintenance" | "unknown";

export type CharacterState = "awake" | "sleeping";
export type DataFreshness = "fresh" | "stale" | "missing";

export interface PeriodBounds {
  period: PublicPeriod;
  start: string;
  end: string;
  label: string;
}

export interface PublicMetric {
  key: PublicMetricKey;
  label: string;
  value: number | null;
  unit: "count" | "seconds" | "percent";
  updatedAt: string | null;
}

export interface PublicMetricSeriesPoint {
  date: string;
  interactions: number | null;
  commands: number | null;
  securityActions: number | null;
}

export interface PublicActivity {
  id: string;
  category:
    | "release"
    | "feature"
    | "fix"
    | "maintenance"
    | "milestone"
    | "report"
    | "restoration"
    | "security";
  title: string;
  description: string;
  occurredAt: string;
  origin: string;
  version: string | null;
  href: string | null;
}

export interface PublicService {
  key: string;
  label: string;
  state: ServiceState;
  latencyMs: number | null;
  observedAt: string | null;
}

export interface PublicIncident {
  id: string;
  serviceKey: string | null;
  title: string;
  summary: string;
  state: "investigating" | "identified" | "monitoring" | "resolved" | "maintenance";
  impact: "none" | "minor" | "major" | "critical";
  startedAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface PublicEditorialItem {
  id: string;
  kind: "release" | "roadmap" | "milestone" | "achievement" | "daily_summary" | "moderation_report";
  status: string;
  title: string;
  summary: string;
  details: string[];
  version: string | null;
  publishedAt: string | null;
  targetDate: string | null;
  category: string | null;
}

export interface PublicCommand {
  name: string;
  description: string;
  category: string;
  examples: string[];
  permissions: string;
  availability: string;
  restrictions: string | null;
  updatedAt: string;
}

export interface PublicDashboard {
  generatedAt: string;
  period: PeriodBounds;
  source: "database" | "empty";
  status: {
    operational: {
      state: OperationalState;
      latencyMs: number | null;
      version: string | null;
      observedAt: string | null;
      freshness: DataFreshness;
      message: string;
    };
    character: {
      state: CharacterState;
      message: string;
      timezone: "America/Recife";
      nextChangeAt: string;
    };
  };
  availabilityPercent: number | null;
  metrics: PublicMetric[];
  series: PublicMetricSeriesPoint[];
  activities: PublicActivity[];
  services: PublicService[];
  incidents: PublicIncident[];
  releases: PublicEditorialItem[];
  roadmap: PublicEditorialItem[];
  milestones: PublicEditorialItem[];
  achievements: PublicEditorialItem[];
  dailySummaries: PublicEditorialItem[];
  moderationReports: PublicEditorialItem[];
  commands: PublicCommand[];
  community: {
    members: number | null;
    interactions: number | null;
    events: number | null;
    observedAt: string | null;
  };
}

export const METRIC_DEFINITIONS: Record<
  PublicMetricKey,
  { label: string; unit: PublicMetric["unit"] }
> = {
  commands_executed: { label: "Comandos executados", unit: "count" },
  interactions_processed: { label: "Interações processadas", unit: "count" },
  tickets_opened: { label: "Atendimentos iniciados", unit: "count" },
  tickets_completed: { label: "Atendimentos concluídos", unit: "count" },
  security_events: { label: "Eventos de segurança processados", unit: "count" },
  messages_blocked: { label: "Mensagens bloqueadas", unit: "count" },
  automod_actions: { label: "Ações de moderação automatizadas", unit: "count" },
  analyses_completed: { label: "Análises concluídas", unit: "count" },
  community_interactions: { label: "Interações comunitárias", unit: "count" },
  community_events: { label: "Atividades comunitárias", unit: "count" },
  operation_seconds: { label: "Tempo de operação", unit: "seconds" },
};

function zonedParts(date: Date, timezoneName: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezoneName,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values["year"]),
    month: Number(values["month"]),
    day: Number(values["day"]),
    hour: Number(values["hour"]),
    minute: Number(values["minute"]),
    second: Number(values["second"]),
  };
}

function zonedDateToUtc(
  values: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    minute?: number;
    second?: number;
  },
  timezoneName: string,
) {
  const intendedUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour ?? 0,
    values.minute ?? 0,
    values.second ?? 0,
  );
  let candidate = intendedUtc;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const rendered = zonedParts(new Date(candidate), timezoneName);
    const renderedUtc = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second,
    );
    candidate += intendedUtc - renderedUtc;
  }
  return new Date(candidate);
}

function shiftLocalDate(values: { year: number; month: number; day: number }, days: number) {
  const shifted = new Date(Date.UTC(values.year, values.month - 1, values.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function resolveCharacterState(now = new Date()) {
  const timezone = "America/Recife" as const;
  const local = zonedParts(now, timezone);
  const sleeping = local.hour >= 21 || local.hour < 7;
  const nextDate = local.hour >= 21 ? shiftLocalDate(local, 1) : shiftLocalDate(local, 0);
  const nextChangeAt = sleeping
    ? zonedDateToUtc({ ...nextDate, hour: 7 }, timezone)
    : zonedDateToUtc({ ...shiftLocalDate(local, 0), hour: 21 }, timezone);
  return {
    state: sleeping ? ("sleeping" as const) : ("awake" as const),
    message: sleeping
      ? "Zzz... tô descansando um pouquinho. Volto às 07h."
      : "Tô por aqui cuidando de tudo e aprendendo coisinhas novas, hihihi.",
    timezone,
    nextChangeAt: nextChangeAt.toISOString(),
  };
}

export function resolveFreshness(
  observedAt: string | null,
  now = new Date(),
  staleAfterSeconds = 180,
): DataFreshness {
  if (!observedAt) return "missing";
  const observed = new Date(observedAt);
  if (Number.isNaN(observed.getTime())) return "missing";
  return now.getTime() - observed.getTime() <= staleAfterSeconds * 1000 ? "fresh" : "stale";
}

export function publicPeriodBounds(period: PublicPeriod, now = new Date()): PeriodBounds {
  const timezone = "America/Recife";
  const local = zonedParts(now, timezone);
  let startDate = shiftLocalDate(local, 0);
  let label = "Hoje";
  if (period === "7d") {
    startDate = shiftLocalDate(local, -6);
    label = "Últimos 7 dias";
  } else if (period === "30d") {
    startDate = shiftLocalDate(local, -29);
    label = "Últimos 30 dias";
  } else if (period === "12m") {
    const monthStart = new Date(Date.UTC(local.year, local.month - 12, 1));
    startDate = {
      year: monthStart.getUTCFullYear(),
      month: monthStart.getUTCMonth() + 1,
      day: 1,
    };
    label = "Últimos 12 meses";
  }
  return {
    period,
    start: zonedDateToUtc(startDate, timezone).toISOString(),
    end: now.toISOString(),
    label,
  };
}

export function emptyPublicDashboard(period: PublicPeriod, now = new Date()): PublicDashboard {
  const character = resolveCharacterState(now);
  return {
    generatedAt: now.toISOString(),
    period: publicPeriodBounds(period, now),
    source: "empty",
    status: {
      operational: {
        state: "unknown",
        latencyMs: null,
        version: null,
        observedAt: null,
        freshness: "missing",
        message: "Ainda não recebemos um heartbeat válido da Bella.",
      },
      character,
    },
    availabilityPercent: null,
    metrics: PUBLIC_METRIC_KEYS.map((key) => ({
      key,
      ...METRIC_DEFINITIONS[key],
      value: null,
      updatedAt: null,
    })),
    series: [],
    activities: [],
    services: [],
    incidents: [],
    releases: [],
    roadmap: [],
    milestones: [],
    achievements: [],
    dailySummaries: [],
    moderationReports: [],
    commands: [],
    community: { members: null, interactions: null, events: null, observedAt: null },
  };
}

export function formatPublicMetric(metric: PublicMetric) {
  if (metric.value === null) return "Indisponível";
  if (metric.unit === "seconds") {
    const hours = metric.value / 3600;
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(hours)} h`;
  }
  if (metric.unit === "percent") {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(metric.value)}%`;
  }
  return new Intl.NumberFormat("pt-BR").format(metric.value);
}
