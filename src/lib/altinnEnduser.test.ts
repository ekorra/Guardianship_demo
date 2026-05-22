import { describe, it, expect, vi, beforeEach } from "vitest"
import { delegateAccessPackages } from "./altinnEnduser"
import type { TraceEntry } from "./trace"

const ACCESS_TOKEN = "mock-access-token"
const PID = "01017012345"
const TO_PID = "02020212345"
const TO_LAST_NAME = "Testesen"
const PACKAGE_ID = "urn:altinn:accesspackage:innbygger-stotte-tilskudd"
const ALTINN_TOKEN = "mock-altinn-token"
const PARTY_UUID = "party-uuid-123"
const CONNECTION_ID = "conn-id-456"
const TO_PARTY_UUID = "to-party-uuid-789"

function makeOkResponse(body: unknown, status = 200) {
  return {
    ok: true,
    status,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    json: async () => body,
  }
}

function makeErrorResponse(status: number, body: string) {
  return {
    ok: false,
    status,
    text: async () => body,
    json: async () => { throw new Error("not json") },
  }
}

describe("delegateAccessPackages — traces", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("fyller traces med entry for hvert API-kall ved suksess", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeOkResponse(ALTINN_TOKEN))
      .mockResolvedValueOnce(makeOkResponse({ data: [{ partyUuid: PARTY_UUID, personIdentifier: PID }] }))
      .mockResolvedValueOnce(makeOkResponse({ id: CONNECTION_ID, toId: TO_PARTY_UUID }))
      .mockResolvedValueOnce(makeOkResponse("", 200))
    vi.stubGlobal("fetch", fetchMock)

    const traces: TraceEntry[] = []
    await delegateAccessPackages(ACCESS_TOKEN, PID, TO_PID, TO_LAST_NAME, [PACKAGE_ID], traces)

    expect(traces).toHaveLength(4)
    expect(traces[0].name).toBe("ID-porten token-innveksling")
    expect(traces[1].name).toBe("Altinn authorizedparties")
    expect(traces[2].name).toBe("Altinn opprett kobling")
    expect(traces[3].name).toContain("Altinn deleger pakke")
  })

  it("fyller traces med feil-entry og kaster når token-innveksling feiler", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(makeErrorResponse(401, "Unauthorized")))

    const traces: TraceEntry[] = []
    await expect(
      delegateAccessPackages(ACCESS_TOKEN, PID, TO_PID, TO_LAST_NAME, [PACKAGE_ID], traces)
    ).rejects.toThrow("401")

    expect(traces).toHaveLength(1)
    expect(traces[0].name).toBe("ID-porten token-innveksling")
    expect(traces[0].response.status).toBe(401)
  })

  it("fyller traces med feil-entry og kaster når authorizedparties feiler", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeOkResponse(ALTINN_TOKEN))
      .mockResolvedValueOnce(makeErrorResponse(403, "Forbidden"))
    vi.stubGlobal("fetch", fetchMock)

    const traces: TraceEntry[] = []
    await expect(
      delegateAccessPackages(ACCESS_TOKEN, PID, TO_PID, TO_LAST_NAME, [PACKAGE_ID], traces)
    ).rejects.toThrow("403")

    expect(traces).toHaveLength(2)
    expect(traces[1].name).toBe("Altinn authorizedparties")
    expect(traces[1].response.status).toBe(403)
  })

  it("fyller traces med feil-entry og kaster når kobling-oppretting feiler", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeOkResponse(ALTINN_TOKEN))
      .mockResolvedValueOnce(makeOkResponse({ data: [{ partyUuid: PARTY_UUID, personIdentifier: PID }] }))
      .mockResolvedValueOnce(makeErrorResponse(422, "Conflict"))
    vi.stubGlobal("fetch", fetchMock)

    const traces: TraceEntry[] = []
    await expect(
      delegateAccessPackages(ACCESS_TOKEN, PID, TO_PID, TO_LAST_NAME, [PACKAGE_ID], traces)
    ).rejects.toThrow("422")

    expect(traces).toHaveLength(3)
    expect(traces[2].name).toBe("Altinn opprett kobling")
    expect(traces[2].response.status).toBe(422)
  })

  it("alle trace-entries har påkrevde felter", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeOkResponse(ALTINN_TOKEN))
      .mockResolvedValueOnce(makeOkResponse({ data: [{ partyUuid: PARTY_UUID, personIdentifier: PID }] }))
      .mockResolvedValueOnce(makeOkResponse({ id: CONNECTION_ID, toId: TO_PARTY_UUID }))
      .mockResolvedValueOnce(makeOkResponse("", 200))
    vi.stubGlobal("fetch", fetchMock)

    const traces: TraceEntry[] = []
    await delegateAccessPackages(ACCESS_TOKEN, PID, TO_PID, TO_LAST_NAME, [PACKAGE_ID], traces)

    for (const entry of traces) {
      expect(entry.name).toBeTruthy()
      expect(entry.request.method).toBeTruthy()
      expect(entry.request.url).toBeTruthy()
      expect(entry.response.status).toBeTypeOf("number")
      expect(entry.durationMs).toBeTypeOf("number")
    }
  })

  it("samler traces fra flere pakker i parallell", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeOkResponse(ALTINN_TOKEN))
      .mockResolvedValueOnce(makeOkResponse({ data: [{ partyUuid: PARTY_UUID, personIdentifier: PID }] }))
      .mockResolvedValueOnce(makeOkResponse({ id: CONNECTION_ID, toId: TO_PARTY_UUID }))
      .mockResolvedValue(makeOkResponse("", 200))
    vi.stubGlobal("fetch", fetchMock)

    const pkg2 = "urn:altinn:accesspackage:other"
    const traces: TraceEntry[] = []
    await delegateAccessPackages(ACCESS_TOKEN, PID, TO_PID, TO_LAST_NAME, [PACKAGE_ID, pkg2], traces)

    // 3 faste kall + 2 pakke-kall
    expect(traces).toHaveLength(5)
  })
})
