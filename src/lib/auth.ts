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
        return {
          id: profile.pid ?? profile.sub,
          pid: profile.pid,
          name: profile.name ?? null,
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
      if (profile?.pid) {
        token.pid = profile.pid as string
      }
      return token
    },
    session({ session, token }) {
      if (token.pid) {
        session.user.pid = token.pid as string
      }
      if (token.idToken) {
        session.idToken = token.idToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
