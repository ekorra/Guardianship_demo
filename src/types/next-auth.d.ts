import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      pid?: string
    } & DefaultSession["user"]
    idToken?: string
  }
}
