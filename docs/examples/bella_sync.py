from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from typing import Any


def send_public_event(event: dict[str, Any]) -> dict[str, Any]:
    base_url = os.environ["BELLA_SITE_URL"].rstrip("/")
    key_id = os.environ["BELLA_SITE_KEY_ID"]
    secret = os.environ["BELLA_SITE_SECRET"]
    raw_body = json.dumps(event, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    timestamp = str(int(time.time()))
    nonce = secrets.token_urlsafe(24)
    canonical = b".".join((timestamp.encode(), nonce.encode(), raw_body))
    signature = hmac.new(secret.encode(), canonical, hashlib.sha256).hexdigest()
    request = urllib.request.Request(
        f"{base_url}/api/integration/v1/events",
        data=raw_body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Bella-Key-Id": key_id,
            "X-Bella-Timestamp": timestamp,
            "X-Bella-Nonce": nonce,
            "X-Bella-Signature": f"sha256={signature}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Bella site rejected event ({error.code}): {body}") from error


def heartbeat_event(latency_ms: int, version: str) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        "contractVersion": 1,
        "eventId": f"heartbeat:{uuid.uuid4()}",
        "occurredAt": now,
        "type": "heartbeat",
        "payload": {
            "state": "online",
            "latencyMs": max(0, latency_ms),
            "version": version,
            "services": [
                {
                    "key": "discord",
                    "label": "Bot Discord",
                    "state": "operational",
                    "latencyMs": max(0, latency_ms),
                }
            ],
        },
    }


if __name__ == "__main__":
    print(send_public_event(heartbeat_event(int(os.environ["BELLA_DISCORD_LATENCY_MS"]), os.environ["BELLA_VERSION"])))
