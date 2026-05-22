import { describe, it, expect } from "vitest"
import { getPartyByPid } from "./register"

const hasCredentials =
  !!process.env.MASKINPORTEN_CLIENT_ID &&
  !!process.env.MASKINPORTEN_PRIVATE_KEY_JWK

const PID = process.env.TEST_PID ?? ""

describe.skipIf(!hasCredentials || !PID)(
  "getPartyByPid — integrasjon mot platform.tt02.altinn.no",
  () => {
    it("returnerer partyUuid og name for gyldig PID", async () => {
      const result = await getPartyByPid(PID)
      expect(typeof result.partyUuid).toBe("string")
      expect(result.partyUuid.length).toBeGreaterThan(0)
      expect(typeof result.name).toBe("string")
      console.log("partyUuid:", result.partyUuid)
      console.log("name:", result.name)
    }, 15_000)
  }
)
