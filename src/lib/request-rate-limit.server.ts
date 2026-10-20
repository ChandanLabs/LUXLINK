const buckets = new Map<string, number[]>();

export async function requestClientKey() {
  const { createHash } = await import("node:crypto");
  let ip = "local";
  const { getRequestIP } = await import("@tanstack/react-start/server");
  ip = getRequestIP({ xForwardedFor: true }) || ip;
  return createHash("sha256").update(ip).digest("hex").slice(0, 20);
}

export async function allowRateLimitedRequest(bucket: string, limit: number) {
  const key = `${bucket}:${await requestClientKey()}`;
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 4000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return true;
}
