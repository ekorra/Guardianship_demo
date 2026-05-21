import { describe, it, expect } from "vitest"
import { delegateAccessPackages } from "./altinnEnduser"

// Sett disse i .env.local for å kjøre testen:
// ALTINN_ENDUSER_ACCESS_TOKEN — gyldig ID-porten access_token (kort levetid, hent manuelt)
// TEST_PID — fødselsnummer til innlogget bruker
// DELEGATE_TO_PID — fødselsnummer til mottaker
// DELEGATE_TO_LASTNAME — etternavn til mottaker
// DELEGATE_PACKAGE — pakke-ID å delegere (f.eks. vergemal-bank-representasjon-dagligbank)

const hasEnv =
  !!process.env.ALTINN_ENDUSER_ACCESS_TOKEN &&
  !!process.env.TEST_PID &&
  !!process.env.DELEGATE_TO_PID &&
  !!process.env.DELEGATE_TO_LASTNAME &&
  !!process.env.DELEGATE_PACKAGE

describe.skipIf(!hasEnv)("delegateAccessPackages — integrasjon mot tt02", () => {
  it("delegerer tilgangspakke uten feil", async () => {
    await expect(
      delegateAccessPackages(
        process.env.ALTINN_ENDUSER_ACCESS_TOKEN!,
        process.env.TEST_PID!,
        process.env.DELEGATE_TO_PID!,
        process.env.DELEGATE_TO_LASTNAME!,
        [process.env.DELEGATE_PACKAGE!],
      ),
    ).resolves.toBeUndefined()
  }, 20_000)
})
