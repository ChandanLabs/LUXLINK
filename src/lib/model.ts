export type Risk = "safe" | "caution" | "danger";

export type Expiry = "ONE_VIEW" | "ONE_HOUR" | "ONE_DAY" | "SEVEN_DAYS";

export const EXPIRY_OPTIONS: { id: Expiry; label: string; hint: string }[] = [
  { id: "SEVEN_DAYS", label: "7 days", hint: "Deleted after a week" },
  { id: "ONE_DAY", label: "1 day", hint: "Gone tomorrow" },
  { id: "ONE_HOUR", label: "1 hour", hint: "For a live chat" },
  { id: "ONE_VIEW", label: "One opening", hint: "Burns after continue" },
];

export type Fail = { ok: false; error: string };

export type ScanPayload = {
  ok: true;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  hostname: string;
  path: string;
  finalUrl: string;
  chain: string[];
  trackerCount: number;
  risk: Risk;
  reasons: string[];
  summary: string;
  unverified: boolean;
};

export type CreatePayload = {
  ok: true;
  code: string;
  ownerSecret: string;
  expiryAt: string;
  expiry: Expiry;
  hasPassword: boolean;
  oneTime: boolean;
  hideBrand: boolean;
  title: string;
  hostname: string;
  description: string;
  image: string | null;
  risk: Risk;
};

export type GatewayReady = {
  ok: true;
  status: "ready";
  code: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  hostname: string;
  path: string;
  chain: string[];
  trackerCount: number;
  risk: Risk;
  reasons: string[];
  summary: string;
  hasPassword: boolean;
  oneTime: boolean;
  hideBrand: boolean;
  expiryAt: string;
  clicks: number;
  unverified: boolean;
  demo: "safe" | "risk" | null;
};

export type GatewayLocked = {
  ok: true;
  status: "locked";
  code: string;
  hostname: string;
  oneTime: boolean;
  hideBrand: boolean;
  expiryAt: string;
  clicks: number;
};

export type GatewayGone = {
  ok: true;
  status: "gone";
  reason: "expired" | "opened";
};

export type GatewayResult = GatewayReady | GatewayLocked | GatewayGone | { ok: false; status: "missing" };

export type ContinuePayload = { ok: true; url: string; blocked: boolean } | Fail;

export type AnalyticsPayload = {
  ok: true;
  clicks: number;
  countries: { name: string; count: number }[];
  devices: { name: string; count: number }[];
};

export type VaultLink = {
  code: string;
  ownerSecret: string;
  title: string;
  hostname: string;
  createdAt: string;
  expiryAt: string;
  expiry: Expiry;
  hasPassword: boolean;
  oneTime: boolean;
  hideBrand: boolean;
  risk: Risk;
};
