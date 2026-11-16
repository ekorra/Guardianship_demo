import { describe, it, expect } from "vitest"
import { getResourceMeta, getResourceActions } from "./resourceRegistry"

describe("resourceRegistry — integrasjon mot platform.tt02.altinn.no", () => {
  it("henter metadata for ttd-vergemalsdemo", async () => {
    const meta = await getResourceMeta("ttd-vergemalsdemo")
    expect(meta.title).toBe("Verge- og fullmaktsdemo")
  }, 10_000)

  it("henter metadata for eno-forbruker-fullmakt", async () => {
    const meta = await getResourceMeta("eno-forbruker-fullmakt")
    expect(meta.title).toBe("Enova støttetilbud for forbrukere")
  }, 10_000)

  it("henter kun handlingen 'read' for ttd-vergemalsdemo", async () => {
    const actions = await getResourceActions("ttd-vergemalsdemo")
    expect(actions).toEqual(["read"])
  }, 10_000)

  it("henter kun handlingen 'write' for eno-forbruker-fullmakt", async () => {
    const actions = await getResourceActions("eno-forbruker-fullmakt")
    expect(actions).toEqual(["write"])
  }, 10_000)
})
