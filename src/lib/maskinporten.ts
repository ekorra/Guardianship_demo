import { SignJWT, importJWK } from "jose"

interface TokenCache {
  token: string
  expiresAt: number
}

let cache: TokenCache | null = null

export async function getMaskinportenToken(scope: string): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.token
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

  const response = await fetch("https://test.maskinporten.no/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(
      `Maskinporten token-forespørsel feilet: ${response.status} ${error}`
    )
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  cache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 10) * 1000,
  }

  return cache.token
}

/** Kun for testing — tilbakestiller in-memory cache */
export function _resetTokenCache() {
  cache = null
}
