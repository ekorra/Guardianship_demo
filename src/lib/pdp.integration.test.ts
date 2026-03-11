import { describe, it, expect } from "vitest"
import { checkPdpAccess } from "./pdp"

const hasCredentials =
  !!process.env.MASKINPORTEN_CLIENT_ID &&
  !!process.env.MASKINPORTEN_PRIVATE_KEY_JWK

const SUBJECT_PID = process.env.TEST_PID ?? ""
const RESOURCE_PID = process.env.TEST_PID ?? ""

describe.skipIf(!hasCredentials || !SUBJECT_PID)(
  "checkPdpAccess — integrasjon mot platform.tt02.altinn.no",
  () => {
    it("returnerer gyldig beslutning for seg selv", async () => {
      const result = await checkPdpAccess(SUBJECT_PID, RESOURCE_PID)
      expect(["Permit", "Deny", "NotApplicable"]).toContain(result)
    })
  },
)
