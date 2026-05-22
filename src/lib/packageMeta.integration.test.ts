import { describe, it, expect } from "vitest"
import { getPackageMetaMap } from "./packageMeta"

const KNOWN_UUID = "1886712b-e077-445a-ab3f-8c8bdebccc67" // "Revisorattesterer"

describe("getPackageMetaMap — integrasjon mot platform.tt02.altinn.no", () => {
  it("finner gyldig pakke og verifiserer responsskjema", async () => {
    const map = await getPackageMetaMap([KNOWN_UUID])
    expect(map.has(KNOWN_UUID)).toBe(true)
    const meta = map.get(KNOWN_UUID)!
    expect(typeof meta.name).toBe("string")
    expect(meta.name.length).toBeGreaterThan(0)
  }, 10_000)

  it("returnerer tomt map for ukjent ID", async () => {
    const map = await getPackageMetaMap(["00000000-0000-0000-0000-000000000000"])
    expect(map.size).toBe(0)
  }, 10_000)
})
