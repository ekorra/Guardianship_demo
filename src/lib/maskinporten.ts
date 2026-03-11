import { SignJWT, importJWK } from "jose"
import type { TraceEntry } from "./trace"

interface TokenCache {
  token: string
  expiresAt: number
}

const cache = new Map<string, TokenCache>()

export async function getMaskinportenToken(
  scope: string,
  traces?: TraceEntry[],
): Promise<string> {
  const cached = cache.get(scope)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token
  }

  const clientId = process.env.MASKINPORTEN_CLIENT_ID
  const privateKeyJwk = process.env.MASKINPORTEN_PRIVATE_KEY_JWK

  if (!clientId || !privateKeyJwk) {
    throw new Error(
      "MASKINPORTEN_CLIENT_ID og MASKINPORTEN_PRIVATE_KEY_JWK må være satt"
    )
  }

  const jwkObject = JSON.parse(privateKeyJwk) as { kid?: string }
  const privateKey = await importJWK(jwkObject, "RS256")

  const now = Math.floor(Date.now() / 1000)
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: "RS256", kid: jwkObject.kid })
    .setIssuedAt(now)
    .setIssuer(clientId)
    .setAudience("https://test.maskinporten.no/")
    .setExpirationTime(now + 120)
    .setJti(crypto.randomUUID())
    .sign(privateKey)

  const tokenUrl = "https://test.maskinporten.no/token"
  const t0 = Date.now()
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Maskinporten token",
      request: {
        method: "POST",
        url: tokenUrl,
        body: { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", scope },
      },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(
      `Maskinporten token-forespørsel feilet: ${response.status} ${errorBody}`
    )
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  traces?.push({
    name: "Maskinporten token",
    request: {
      method: "POST",
      url: tokenUrl,
      body: { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", scope },
    },
    response: {
      status: response.status,
      body: { access_token: "[REDACTED]", expires_in: data.expires_in },
    },
    durationMs,
  })

  const entry: TokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 10) * 1000,
  }
  cache.set(scope, entry)

  return entry.token
}

/** Kun for testing — tilbakestiller in-memory cache */
export function _resetTokenCache() {
  cache.clear()
}
