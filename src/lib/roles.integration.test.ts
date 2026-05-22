import { describe, it, expect } from "vitest"
import { getRoleMetaMap } from "./roles"

// Kjent rolle-ID fra tt02 (Privatperson, Altinn 3)
const KNOWN_ROLE_ID = "1c6eeec1-fe70-4fc5-8b45-df4a2255dea6"

describe("getRoleMetaMap — integrasjon mot platform.tt02.altinn.no", () => {
  it("returnerer name og provider for kjent rolle-ID", async () => {
    const map = await getRoleMetaMap([KNOWN_ROLE_ID])

    expect(map.has(KNOWN_ROLE_ID)).toBe(true)
    const meta = map.get(KNOWN_ROLE_ID)!

    expect(typeof meta.name).toBe("string")
    expect(meta.name.length).toBeGreaterThan(0)
    expect(typeof meta.provider?.code).toBe("string")
    expect(typeof meta.provider?.name).toBe("string")
    console.log("name:", meta.name)
    console.log("provider:", meta.provider?.code, "/", meta.provider?.name)
  }, 10_000)

  it("returnerer tomt map for ukjent ID", async () => {
    const map = await getRoleMetaMap(["00000000-0000-0000-0000-000000000000"])
    expect(map.size).toBe(0)
  }, 10_000)
})
