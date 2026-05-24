import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import type { PrivateKey } from "oauth4webapi"
import { customFetch } from "@auth/core"

// Importer privatnøkkel for ID-porten (private_key_jwt) — krever top-level await (module: "esnext")
const idportenJwkEnv = process.env.IDPORTEN_PRIVATE_KEY_JWK
const idportenJwk = idportenJwkEnv
  ? (JSON.parse(idportenJwkEnv) as JsonWebKey & { kid?: string })
  : null
const idportenPrivateKey: PrivateKey | null = idportenJwk
  ? {
      key: await crypto.subtle.importKey(
        "jwk",
        idportenJwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"],
      ),
      kid: idportenJwk.kid,
    }
  : null

// oauth4webapi setter aud som [issuer, token_endpoint], men ID-porten krever kun issuer som string.
// Vi intercepter token-requesten og re-signerer client_assertion med korrekt aud.
// Bruker Web Crypto API (fungerer i Edge Runtime og Node.js).
async function fixClientAssertionAud(jwt: string, signingKey: CryptoKey): Promise<string> {
  const parts = jwt.split(".")
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as {
    aud: string | string[]
    [k: string]: unknown
  }
  if (Array.isArray(payload.aud)) {
    payload.aud = payload.aud[0] // Ta kun issuer (første element)
  }
  const signingInput = `${parts[0]}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`
  const rawSignature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    signingKey,
    Buffer.from(signingInput),
  )
  return `${signingInput}.${Buffer.from(rawSignature).toString("base64url")}`
}

const TOKEN_ENDPOINT = "https://test.idporten.no/token"
const REFRESH_BUFFER_SECONDS = 30

async function createClientAssertion(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: "RS256", kid: idportenPrivateKey!.kid, typ: "JWT" }
  const payload = {
    iss: process.env.IDPORTEN_CLIENT_ID,
    sub: process.env.IDPORTEN_CLIENT_ID,
    aud: "https://test.idporten.no",
    iat: now,
    exp: now + 60,
    jti: crypto.randomUUID(),
  }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const rawSignature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", idportenPrivateKey!.key, Buffer.from(signingInput))
  return `${signingInput}.${Buffer.from(rawSignature).toString("base64url")}`
}

async function refreshIdPortenToken(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token?: string; expires_in: number } | null> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.IDPORTEN_CLIENT_ID!,
  })
  if (idportenPrivateKey) {
    params.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer")
    params.set("client_assertion", await createClientAssertion())
  } else if (process.env.IDPORTEN_CLIENT_SECRET) {
    params.set("client_secret", process.env.IDPORTEN_CLIENT_SECRET)
  }
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  })
  if (!res.ok) {
    console.error("Token refresh feilet:", res.status, await res.text())
    return null
  }
  return res.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number }>
}

export const config: NextAuthConfig = {
  providers: [
    {
      id: "idporten",
      name: "ID-porten",
      type: "oidc",
      issuer: "https://test.idporten.no",
      clientId: process.env.IDPORTEN_CLIENT_ID,
      ...(idportenPrivateKey
        ? {
            client: { token_endpoint_auth_method: "private_key_jwt" },
            token: { clientPrivateKey: idportenPrivateKey },
          }
        : {
            clientSecret: process.env.IDPORTEN_CLIENT_SECRET,
            client: { token_endpoint_auth_method: "client_secret_post" },
          }),
      // Intercepter token-requester for å fikse aud i client_assertion
      ...(idportenPrivateKey
        ? {
            [customFetch]: async (
              url: Parameters<typeof fetch>[0],
              init?: Parameters<typeof fetch>[1],
            ): Promise<Response> => {
              if (init?.body instanceof URLSearchParams) {
                const assertion = init.body.get("client_assertion")
                if (assertion) {
                  init.body.set(
                    "client_assertion",
                    await fixClientAssertionAud(assertion, idportenPrivateKey.key),
                  )
                }
              }
              return fetch(url, init)
            },
          }
        : {}),
      authorization: {
        params: {
          scope: "openid profile altinn:accessmanagement/enduser:connections:toothers.write altinn:accessmanagement/enduser:connections:toothers.read altinn:accessmanagement/enduser:connections:fromothers.read altinn:accessmanagement/authorizedparties altinn:accessmanagement/enduser:requests.read altinn:accessmanagement/enduser:requests.write",
          ui_locales: "nb",
          acr_values: "idporten-loa-substantial",
        },
      },
      profile(profile) {
        const givenName = profile.given_name as string | undefined
        const familyName = profile.family_name as string | undefined
        const fullName =
          (profile.name as string | undefined) ??
          ([givenName, familyName].filter(Boolean).join(" ") || null)
        return {
          id: profile.pid ?? profile.sub,
          pid: profile.pid,
          given_name: givenName ?? null,
          family_name: familyName ?? null,
          name: fullName,
          email: profile.email ?? null,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (profile?.pid) token.pid = profile.pid as string
      if (profile?.given_name) token.given_name = profile.given_name as string
      if (profile?.family_name) token.family_name = profile.family_name as string
      if (account) {
        token.idToken = account.id_token
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        return token
      }
      const expiresAt = token.expiresAt as number | undefined
      if (!expiresAt || Date.now() / 1000 < expiresAt - REFRESH_BUFFER_SECONDS) {
        return token
      }
      const refreshToken = token.refreshToken as string | undefined
      if (!refreshToken) return token
      const refreshed = await refreshIdPortenToken(refreshToken)
      if (!refreshed) return token
      token.accessToken = refreshed.access_token
      token.refreshToken = refreshed.refresh_token ?? refreshToken
      token.expiresAt = Math.floor(Date.now() / 1000) + refreshed.expires_in
      return token
    },
    session({ session, token }) {
      if (token.pid) session.user.pid = token.pid as string
      if (token.given_name) session.user.given_name = token.given_name as string
      if (token.family_name) session.user.family_name = token.family_name as string
      if (token.idToken) session.idToken = token.idToken as string
      if (token.accessToken) session.accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
