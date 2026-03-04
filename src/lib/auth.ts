import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

export const config: NextAuthConfig = {
  providers: [
    {
      id: "idporten",
      name: "ID-porten",
      type: "oidc",
      issuer: "https://test.idporten.no",
      clientId: process.env.IDPORTEN_CLIENT_ID,
      clientSecret: process.env.IDPORTEN_CLIENT_SECRET,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
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
