import type { VaultLink } from "@/lib/model";

const DATA = "luxlink.vault";
const KEY = "luxlink.vault.k";

function bytesToB64(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64ToBytes(value: string) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function vaultKey() {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Encrypted vault storage requires a secure browser context, such as HTTPS or localhost.",
    );
  }
  const existing = localStorage.getItem(KEY);
  if (existing) {
    return crypto.subtle.importKey("raw", b64ToBytes(existing), "AES-GCM", false, [
      "encrypt",
      "decrypt",
    ]);
  }
  const created = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", created));
  localStorage.setItem(KEY, bytesToB64(raw));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function isVaultLink(value: unknown): value is VaultLink {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<VaultLink>;
  return (
    typeof row.code === "string" &&
    typeof row.ownerSecret === "string" &&
    typeof row.hostname === "string" &&
    typeof row.title === "string"
  );
}

export async function loadVault(): Promise<VaultLink[]> {
  const blob = localStorage.getItem(DATA);
  if (!blob) return [];
  const [ivB64, dataB64] = blob.split(".");
  if (!ivB64 || !dataB64) throw new Error("Vault is unreadable");
  const key = await vaultKey();
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(ivB64) },
    key,
    b64ToBytes(dataB64),
  );
  const parsed = JSON.parse(new TextDecoder().decode(plain)) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isVaultLink);
}

export async function saveVault(items: VaultLink[]) {
  const key = await vaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(items.slice(0, 200)));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded));
  localStorage.setItem(DATA, `${bytesToB64(iv)}.${bytesToB64(cipher)}`);
}

export async function upsertVault(item: VaultLink) {
  const items = await loadVault();
  const next = [item, ...items.filter((row) => row.code !== item.code)].slice(0, 200);
  await saveVault(next);
  return next;
}

export async function removeVault(code: string) {
  const items = await loadVault();
  const next = items.filter((row) => row.code !== code);
  await saveVault(next);
  return next;
}

export function resetVault() {
  localStorage.removeItem(DATA);
  localStorage.removeItem(KEY);
}

export function downloadVault(items: VaultLink[]) {
  const blob = new Blob([JSON.stringify({ luxlink: 1, links: items }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "luxlink-vault.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function parseVaultImport(text: string): VaultLink[] {
  const parsed = JSON.parse(text) as { links?: unknown } | unknown[];
  const rows = Array.isArray(parsed) ? parsed : parsed.links;
  if (!Array.isArray(rows)) throw new Error("That file is not a Luxlink vault.");
  const links = rows.filter(isVaultLink);
  if (!links.length) throw new Error("No gateways were found in that file.");
  return links;
}
