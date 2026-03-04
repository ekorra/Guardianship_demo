import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getAuthorizedParties } from "./altinn"

vi.mock("./maskinporten", () => ({
  getMaskinportenToken: vi.fn().mockResolvedValue("mock-maskinporten-token"),
}))

const PID = "01017012345"

const mockParty = {
  partyUuid: "uuid-1",
  name: "Ola Nordmann",
  personId: "02020212345",
  type: "Person",
  partyId: 1001,
  authorizedRoles: [],
  subunits: [],
}

describe("getAuthorizedParties", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returnerer liste over autoriserte parter", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [mockParty],
      })
    )

    const result = await getAuthorizedParties(PID)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("Ola Nordmann")
    expect(result[0].personId).toBe("02020212345")
  })

  it("returnerer tomt array når ingen parter finnes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      })
    )

    const result = await getAuthorizedParties(PID)
    expect(result).toEqual([])
  })

  it("sender korrekt forespørsel til Altinn API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    vi.stubGlobal("fetch", fetchMock)

    await getAuthorizedParties(PID)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain(
      "platform.tt02.altinn.no/accessmanagement/api/v1/resourceowner/authorizedparties"
    )
    expect(url).toContain("includeAltinn3=true")
    expect(url).toContain("includeAltinn2=false")
    expect(options.method).toBe("POST")
    expect(options.headers["Authorization"]).toBe(
      "Bearer mock-maskinporten-token"
    )

    const body = JSON.parse(options.body)
    expect(body.type).toBe("urn:altinn:person:identifier-no")
    expect(body.value).toBe(PID)
  })

  it("kaster feil ved HTTP-feil fra Altinn", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      })
    )

    await expect(getAuthorizedParties(PID)).rejects.toThrow(
      "Altinn Authorized Parties feilet: 403"
    )
  })
})
