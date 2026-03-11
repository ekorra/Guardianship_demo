import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { checkPdpAccess } from "./pdp"

vi.mock("./maskinporten", () => ({
  getMaskinportenToken: vi.fn().mockResolvedValue("mock-maskinporten-token"),
}))

const SUBJECT_PID = "01017012345"
const RESOURCE_PID = "02020212345"

/** Mocker fetch: første kall = token-innveksling (returnerer altinn-token), andre kall = PDP-svar */
function mockFetch(decision: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "mock-altinn-token",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: [{ decision }] }),
      }),
  )
}

describe("checkPdpAccess", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returnerer Permit ved Permit-svar", async () => {
    mockFetch("Permit")
    const result = await checkPdpAccess(SUBJECT_PID, RESOURCE_PID)
    expect(result).toBe("Permit")
  })

  it("returnerer Deny ved Deny-svar", async () => {
    mockFetch("Deny")
    const result = await checkPdpAccess(SUBJECT_PID, RESOURCE_PID)
    expect(result).toBe("Deny")
  })

  it("returnerer NotApplicable ved NotApplicable-svar", async () => {
    mockFetch("NotApplicable")
    const result = await checkPdpAccess(SUBJECT_PID, RESOURCE_PID)
    expect(result).toBe("NotApplicable")
  })

  it("returnerer NotApplicable ved tomt response-array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, text: async () => "mock-altinn-token" })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ response: [] }) }),
    )
    const result = await checkPdpAccess(SUBJECT_PID, RESOURCE_PID)
    expect(result).toBe("NotApplicable")
  })

  it("sender korrekt XACML-forespørsel til Altinn PDP", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => "mock-altinn-token" })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: [{ decision: "Permit" }] }),
      })
    vi.stubGlobal("fetch", fetchMock)

    await checkPdpAccess(SUBJECT_PID, RESOURCE_PID)

    // Andre kall er PDP-kallet
    const [url, options] = fetchMock.mock.calls[1]
    expect(url).toContain("platform.tt02.altinn.no/authorization/api/v1/authorize")
    expect(options.method).toBe("POST")
    expect(options.headers["Authorization"]).toBe("Bearer mock-altinn-token")

    const body = JSON.parse(options.body)
    const req = body.Request
    expect(req.AccessSubject[0].Attribute[0].AttributeId).toBe(
      "urn:altinn:person:identifier-no",
    )
    expect(req.AccessSubject[0].Attribute[0].Value).toBe(SUBJECT_PID)
    expect(req.Action[0].Attribute[0].AttributeId).toBe("urn:oasis:names:tc:xacml:1.0:action:action-id")
    expect(req.Action[0].Attribute[0].Value).toBe("read")
    expect(req.Action[0].Attribute[0].DataType).toBe("http://www.w3.org/2001/XMLSchema#string")
    expect(req.Resource[0].Attribute[0].Value).toBe("ttd-vergemalsdemo")
    expect(req.Resource[0].Attribute[1].Value).toBe(RESOURCE_PID)
  })

  it("kaster feil ved HTTP-feil fra token-innveksling", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "",
      }),
    )
    await expect(checkPdpAccess(SUBJECT_PID, RESOURCE_PID)).rejects.toThrow(
      "Altinn token-innveksling feilet: 401",
    )
  })

  it("kaster feil ved HTTP-feil fra PDP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, text: async () => "mock-altinn-token" })
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          text: async () => "Forbidden",
        }),
    )
    await expect(checkPdpAccess(SUBJECT_PID, RESOURCE_PID)).rejects.toThrow(
      "Altinn PDP feilet: 403",
    )
  })

  it("legger trace-entry ved vellykket kall", async () => {
    mockFetch("Permit")
    const traces: import("./trace").TraceEntry[] = []
    await checkPdpAccess(SUBJECT_PID, RESOURCE_PID, traces)
    expect(traces).toHaveLength(2)
    expect(traces[0].name).toBe("Altinn token-innveksling")
    expect(traces[1].name).toBe("Altinn PDP")
    expect(traces[1].request.method).toBe("POST")
  })
})
