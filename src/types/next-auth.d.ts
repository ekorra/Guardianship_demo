import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      pid?: string
      given_name?: string
      family_name?: string
    } & DefaultSession["user"]
    idToken?: string
  }
}
