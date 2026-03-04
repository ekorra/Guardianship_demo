import { describe, it, expect, beforeEach } from "vitest"
import { _resetTokenCache, getMaskinportenToken } from "./maskinporten"

const SCOPE = "altinn:instances.read"

const hasCredentials =
  !!process.env.MASKINPORTEN_CLIENT_ID &&
  !!process.env.MASKINPORTEN_PRIVATE_KEY_JWK

describe.skipIf(!hasCredentials)(
  "getMaskinportenToken — integrasjon mot test.maskinporten.no",
  () => {
    beforeEach(() => _resetTokenCache())

    it("henter et gyldig access_token fra Maskinporten", async () => {
      const token = await getMaskinportenToken(SCOPE)
      expect(typeof token).toBe("string")
      expect(token.length).toBeGreaterThan(10)
    })

    it("tokenet er en gyldig JWT (tre deler separert med punktum)", async () => {
      const token = await getMaskinportenToken(SCOPE)
      const parts = token.split(".")
      expect(parts).toHaveLength(3)
    })

    it("andre kall bruker cache og returnerer samme token", async () => {
      const first = await getMaskinportenToken(SCOPE)
      const second = await getMaskinportenToken(SCOPE)
      expect(first).toBe(second)
    })
  }
)
