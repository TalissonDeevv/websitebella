import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const keyConfigSchema = z.record(
  z.string().min(1),
  z
    .object({
      secret: z.string().min(32),
      scopes: z.array(z.string().min(1)).min(1),
    })
    .strict(),
);

export class IngestionAuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
  }
}

export interface AuthenticatedService {
  keyId: string;
  scopes: ReadonlySet<string>;
  nonceHash: string;
  payloadHash: string;
}

function readServiceKeys() {
  const raw = process.env["BELLA_INGESTION_KEYS"];
  if (!raw) throw new IngestionAuthError("integration_not_configured", 503);
  try {
    return keyConfigSchema.parse(JSON.parse(raw));
  } catch {
    throw new IngestionAuthError("integration_not_configured", 503);
  }
}

export function createIngestionSignature(
  secret: string,
  timestamp: string,
  nonce: string,
  body: string,
) {
  return createHmac("sha256", secret).update(`${timestamp}.${nonce}.${body}`, "utf8").digest("hex");
}

function secureHexEquals(expected: string, provided: string) {
  if (!/^[a-f0-9]{64}$/i.test(provided)) return false;
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(provided, "hex");
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export function authenticateIngestionRequest(
  request: Request,
  rawBody: string,
  now = new Date(),
): AuthenticatedService {
  const keyId = request.headers.get("x-bella-key-id")?.trim() ?? "";
  const timestamp = request.headers.get("x-bella-timestamp")?.trim() ?? "";
  const nonce = request.headers.get("x-bella-nonce")?.trim() ?? "";
  const signatureHeader = request.headers.get("x-bella-signature")?.trim() ?? "";
  if (!keyId || !timestamp || !nonce || !signatureHeader) {
    throw new IngestionAuthError("authentication_required", 401);
  }
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(keyId) || !/^[a-zA-Z0-9_-]{16,128}$/.test(nonce)) {
    throw new IngestionAuthError("invalid_authentication", 401);
  }
  const timestampSeconds = Number(timestamp);
  if (!Number.isSafeInteger(timestampSeconds)) {
    throw new IngestionAuthError("invalid_authentication", 401);
  }
  const ageSeconds = Math.abs(Math.floor(now.getTime() / 1000) - timestampSeconds);
  if (ageSeconds > 300) throw new IngestionAuthError("expired_request", 401);

  const key = readServiceKeys()[keyId];
  if (!key) throw new IngestionAuthError("invalid_authentication", 401);
  const providedSignature = signatureHeader.replace(/^sha256=/i, "");
  const expectedSignature = createIngestionSignature(key.secret, timestamp, nonce, rawBody);
  if (!secureHexEquals(expectedSignature, providedSignature)) {
    throw new IngestionAuthError("invalid_authentication", 401);
  }
  return {
    keyId,
    scopes: new Set(key.scopes),
    nonceHash: createHash("sha256").update(nonce, "utf8").digest("hex"),
    payloadHash: createHash("sha256").update(rawBody, "utf8").digest("hex"),
  };
}
