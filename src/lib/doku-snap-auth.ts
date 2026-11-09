
import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createPrivateKey, createSign } from "node:crypto";

interface DokuTokenResponse {
  responseCode?: string;
  responseMessage?: string;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number | string;
}

let cachedToken:
  | { accessToken: string; tokenType: string; expiresAt: number }
  | undefined;

export async function getDokuAccessToken(): Promise<{
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return {
      accessToken: cachedToken.accessToken,
      tokenType: cachedToken.tokenType,
      expiresIn: Math.floor((cachedToken.expiresAt - Date.now()) / 1000),
    };
  }

  const clientId = process.env.DOKU_CLIENT_ID;
  const baseUrl = process.env.DOKU_BASE_URL?.replace(/\/+$/, "");
  const keyPath = process.env.DOKU_PRIVATE_KEY_PATH;
  const passphrase = process.env.DOKU_PRIVATE_KEY_PASSPHRASE;

  if (!clientId || !baseUrl || !keyPath) {
    throw new Error("Konfigurasi DOKU SNAP belum lengkap");
  }

  const apiUrl = new URL(baseUrl);
  if (
    apiUrl.protocol !== "https:" ||
    !["api.doku.com", "api-sandbox.doku.com"].includes(apiUrl.hostname)
  ) {
    throw new Error("DOKU_BASE_URL harus menggunakan host API DOKU resmi");
  }

  const absoluteKeyPath = path.resolve(process.cwd(), keyPath);
  const privateKeyContent = fs.readFileSync(absoluteKeyPath);

  const privateKey = createPrivateKey({
    key: privateKeyContent,
    ...(passphrase ? { passphrase } : {}),
  });

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const stringToSign = `${clientId}|${timestamp}`;

  const signer = createSign("RSA-SHA256");
  signer.update(stringToSign);
  signer.end();

  const signature = signer.sign(privateKey, "base64");

  const response = await fetch(`${baseUrl}/authorization/v1/access-token/b2b`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CLIENT-KEY": clientId,
      "X-TIMESTAMP": timestamp,
      "X-SIGNATURE": signature,
    },
    body: JSON.stringify({ grantType: "client_credentials" }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  let result: DokuTokenResponse;
  try {
    result = (await response.json()) as DokuTokenResponse;
  } catch {
    throw new Error(`DOKU B2B token request returned invalid JSON (${response.status})`);
  }

  if (!response.ok || typeof result.accessToken !== "string" || !result.accessToken) {
    const reason = [result.responseCode, result.responseMessage].filter(Boolean).join(" ");
    throw new Error(
      `DOKU B2B authentication failed (${response.status})${reason ? `: ${reason}` : ""}`,
    );
  }

  const expiresIn = Number(result.expiresIn) || 900;
  const tokenType = result.tokenType || "Bearer";
  cachedToken = {
    accessToken: result.accessToken,
    tokenType,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return {
    accessToken: result.accessToken,
    tokenType,
    expiresIn,
  };
}
