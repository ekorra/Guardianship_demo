import { describe, it, expect } from "vitest"
import { getAuthorizedParties } from "./altinn"

const hasCredentials =
  !!process.env.MASKINPORTEN_CLIENT_ID &&
  !!process.env.MASKINPORTEN_PRIVATE_KEY_JWK

const PID = process.env.TEST_PID ?? ""

describe.skipIf(!hasCredentials || !PID)(
  "getAuthorizedParties — integrasjon mot platform.tt02.altinn.no",
  () => {
    it("henter liste (kan være tom) fra Altinn API", async () => {
      const result = await getAuthorizedParties(PID)
      expect(Array.isArray(result)).toBe(true)
    })

    it("hvert element har forventet struktur", async () => {
      const result = await getAuthorizedParties(PID)
      for (const party of result) {
        expect(typeof party.partyUuid).toBe("string")
        expect(typeof party.name).toBe("string")
        expect(["Person", "Organization", "SelfIdentified"]).toContain(
          party.type
        )
        expect(Array.isArray(party.subunits)).toBe(true)
      }
    })
  }
)
