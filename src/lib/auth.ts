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
          scope: "openid profile",
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
    jwt({ token, account, profile }) {
      if (account?.id_token) {
        token.idToken = account.id_token
      }
      if (profile?.pid) token.pid = profile.pid as string
      if (profile?.given_name) token.given_name = profile.given_name as string
      if (profile?.family_name) token.family_name = profile.family_name as string
      return token
    },
    session({ session, token }) {
      if (token.pid) session.user.pid = token.pid as string
      if (token.given_name) session.user.given_name = token.given_name as string
      if (token.family_name) session.user.family_name = token.family_name as string
      if (token.idToken) session.idToken = token.idToken as string
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
