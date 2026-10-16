import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  emptyPublicDashboard,
  publicPeriodBounds,
  resolveCharacterState,
  resolveFreshness,
} from "@/lib/public-platform";
import { createIngestionSignature } from "@/server/public-platform/auth.server";
import { MemoryPublicPlatformRepository } from "@/server/public-platform/repository";
import {
  getPublicDashboard,
  handleIngestionRequest,
} from "@/server/public-platform/service.server";

const secret = "test-secret-with-at-least-thirty-two-characters";
const keyId = "bella-test";
const scopes = [
  "status:write",
  "metrics:write",
  "activity:write",
  "infrastructure:write",
  "editorial:write",
  "commands:write",
  "community:write",
];

function signedRequest(
  body: unknown,
  options: { nonce?: string; now?: Date; signature?: string } = {},
) {
  const rawBody = JSON.stringify(body);
  const now = options.now ?? new Date("2026-10-15T12:00:00.000Z");
  const timestamp = String(Math.floor(now.getTime() / 1000));
  const nonce = options.nonce ?? "nonce-value-1234567890";
  const signature =
    options.signature ?? createIngestionSignature(secret, timestamp, nonce, rawBody);
  return new Request("https://bella.example/api/integration/v1/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-bella-key-id": keyId,
      "x-bella-timestamp": timestamp,
      "x-bella-nonce": nonce,
      "x-bella-signature": `sha256=${signature}`,
    },
    body: rawBody,
  });
}

function heartbeat(overrides: Record<string, unknown> = {}) {
  return {
    contractVersion: 1,
    eventId: "heartbeat:2026-10-15:001",
    occurredAt: "2026-10-15T11:59:30.000Z",
    type: "heartbeat",
    payload: {
      state: "online",
      latencyMs: 82,
      version: "2026.10.15",
      services: [{ key: "discord", label: "Bot Discord", state: "operational", latencyMs: 82 }],
    },
    ...overrides,
  };
}

describe("public platform time and empty states", () => {
  it("separates Bella's sleeping schedule from operational state", () => {
    expect(resolveCharacterState(new Date("2026-10-15T09:59:00.000Z")).state).toBe("sleeping");
    expect(resolveCharacterState(new Date("2026-10-15T10:00:00.000Z")).state).toBe("awake");
    expect(resolveCharacterState(new Date("2026-10-16T00:00:00.000Z")).state).toBe("sleeping");
  });

  it("uses America/Recife boundaries for today", () => {
    const bounds = publicPeriodBounds("today", new Date("2026-10-15T12:30:00.000Z"));
    expect(bounds.start).toBe("2026-10-15T03:00:00.000Z");
    expect(bounds.end).toBe("2026-10-15T12:30:00.000Z");
  });

  it("marks missing and expired heartbeats without pretending they are offline", () => {
    const now = new Date("2026-10-15T12:00:00.000Z");
    expect(resolveFreshness(null, now)).toBe("missing");
    expect(resolveFreshness("2026-10-15T11:59:00.000Z", now)).toBe("fresh");
    expect(resolveFreshness("2026-10-15T11:50:00.000Z", now)).toBe("stale");
  });

  it("never converts unavailable production indicators to fake zeroes", () => {
    const dashboard = emptyPublicDashboard("7d", new Date("2026-10-15T12:00:00.000Z"));
    expect(dashboard.source).toBe("empty");
    expect(dashboard.availabilityPercent).toBeNull();
    expect(dashboard.metrics.every((metric) => metric.value === null)).toBe(true);
  });
});

describe("authenticated ingestion", () => {
  let repository: MemoryPublicPlatformRepository;
  const now = new Date("2026-10-15T12:00:00.000Z");

  beforeEach(() => {
    repository = new MemoryPublicPlatformRepository();
    process.env["BELLA_INGESTION_KEYS"] = JSON.stringify({ [keyId]: { secret, scopes } });
  });

  afterEach(() => {
    delete process.env["BELLA_INGESTION_KEYS"];
  });

  it("accepts a signed heartbeat and projects only public fields", async () => {
    const response = await handleIngestionRequest(signedRequest(heartbeat()), { repository, now });
    expect(response.status).toBe(202);
    const dashboard = await getPublicDashboard("today", { repository, now });
    expect(dashboard.status.operational.state).toBe("online");
    expect(dashboard.status.character.state).toBe("awake");
    expect(dashboard.services).toEqual([
      expect.objectContaining({ key: "discord", state: "operational", latencyMs: 82 }),
    ]);
  });

  it("is idempotent for repeated event IDs", async () => {
    const first = await handleIngestionRequest(
      signedRequest(heartbeat(), { nonce: "nonce-first-123456789" }),
      { repository, now },
    );
    const second = await handleIngestionRequest(
      signedRequest(heartbeat(), { nonce: "nonce-second-12345678" }),
      { repository, now },
    );
    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual(
      expect.objectContaining({ accepted: false, duplicate: true }),
    );
  });

  it("rejects nonce replay for a different event", async () => {
    const nonce = "nonce-replay-123456789";
    await handleIngestionRequest(signedRequest(heartbeat(), { nonce }), { repository, now });
    const replayed = heartbeat({ eventId: "heartbeat:2026-10-15:002" });
    const response = await handleIngestionRequest(signedRequest(replayed, { nonce }), {
      repository,
      now,
    });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ ok: false, error: "replayed_request" });
  });

  it("rejects invalid signatures without exposing key details", async () => {
    const response = await handleIngestionRequest(
      signedRequest(heartbeat(), { signature: "0".repeat(64) }),
      { repository, now },
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "invalid_authentication" });
  });

  it("rejects unexpected fields that could carry private identifiers", async () => {
    const event = heartbeat();
    event.payload = { ...event.payload, userId: "private-user" } as typeof event.payload;
    const response = await handleIngestionRequest(signedRequest(event), { repository, now });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual(
      expect.objectContaining({ ok: false, error: "invalid_payload" }),
    );
  });

  it("rejects unsafe public activity links", async () => {
    const event = {
      contractVersion: 1,
      eventId: "activity:unsafe-link",
      occurredAt: "2026-10-15T11:59:30.000Z",
      type: "public_activity",
      payload: {
        category: "release",
        title: "Nova versão",
        description: "Resumo público da atualização.",
        origin: "Bella",
        href: "javascript:alert(1)",
      },
    };
    const response = await handleIngestionRequest(
      signedRequest(event, { nonce: "nonce-unsafe-link-123456" }),
      { repository, now },
    );
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual(
      expect.objectContaining({ ok: false, error: "invalid_payload" }),
    );
  });

  it("rejects a valid key without the required event scope", async () => {
    process.env["BELLA_INGESTION_KEYS"] = JSON.stringify({
      [keyId]: { secret, scopes: ["metrics:write"] },
    });
    const response = await handleIngestionRequest(signedRequest(heartbeat()), { repository, now });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "insufficient_scope" });
  });

  it("turns a stale operational heartbeat into unknown while preserving the character schedule", async () => {
    const oldHeartbeat = heartbeat({ occurredAt: "2026-10-15T10:00:00.000Z" });
    await handleIngestionRequest(signedRequest(oldHeartbeat), { repository, now });
    const dashboard = await getPublicDashboard("today", { repository, now });
    expect(dashboard.status.operational.state).toBe("unknown");
    expect(dashboard.status.operational.freshness).toBe("stale");
    expect(dashboard.status.character.state).toBe("awake");
  });
});
