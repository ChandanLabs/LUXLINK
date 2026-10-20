import { createServerFn } from "@tanstack/react-start";
import type {
  AnalyticsPayload,
  ContinuePayload,
  CreatePayload,
  Expiry,
  Fail,
  GatewayReady,
  GatewayResult,
  ScanPayload,
} from "@/lib/model";

function record(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("Invalid request");
  return input as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export const scanLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = record(input);
    return { url: text(body.url) };
  })
  .handler(async ({ data }): Promise<ScanPayload | Fail> => {
    const { scan } = await import("./gateway.server");
    return scan(data.url);
  });

export const createLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = record(input);
    return {
      url: text(body.url),
      customCode: text(body.customCode),
      password: text(body.password),
      expiry: text(body.expiry) as Expiry | "",
      hideBrand: body.hideBrand === true,
    };
  })
  .handler(async ({ data }): Promise<CreatePayload | Fail> => {
    const { create } = await import("./gateway.server");
    return create(data);
  });

export const resolveCode = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ code: text(record(input).code) }))
  .handler(async ({ data }) => {
    const { resolve } = await import("./gateway.server");
    return resolve(data.code);
  });

export const getGateway = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({ code: text(record(input).code) }))
  .handler(async ({ data }): Promise<GatewayResult> => {
    const { gateway } = await import("./gateway.server");
    return gateway(data.code);
  });

export const unlockGateway = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = record(input);
    return { code: text(body.code), password: text(body.password) };
  })
  .handler(async ({ data }): Promise<{ ok: true; view: GatewayReady } | Fail> => {
    const { unlock } = await import("./gateway.server");
    return unlock(data.code, data.password);
  });

export const continueGateway = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = record(input);
    return { code: text(body.code), password: text(body.password) };
  })
  .handler(async ({ data }): Promise<ContinuePayload> => {
    const { openGateway } = await import("./gateway.server");
    return openGateway(data.code, data.password);
  });

export const linkAnalytics = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = record(input);
    return { code: text(body.code), ownerSecret: text(body.ownerSecret) };
  })
  .handler(async ({ data }): Promise<AnalyticsPayload | Fail> => {
    const { analytics } = await import("./gateway.server");
    return analytics(data.code, data.ownerSecret);
  });

export const destroyLink = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = record(input);
    return { code: text(body.code), ownerSecret: text(body.ownerSecret) };
  })
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const { destroy } = await import("./gateway.server");
    return destroy(data.code, data.ownerSecret);
  });
