import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { pid: "01017012345" } }),
}))

vi.mock("@/lib/pdp", () => ({
  checkPdpAccess: vi.fn(),
}))

vi.mock("@/lib/serviceowner", () => ({
  delegateServiceownerPackage: vi.fn().mockResolvedValue(undefined),
  delegateServiceownerResource: vi.fn().mockResolvedValue(undefined),
  AltinnRequestError: class AltinnRequestError extends Error {
    constructor(
      message: string,
      readonly status: number,
      readonly problem?: unknown,
    ) {
      super(message)
    }
  },
}))

import { POST } from "./route"
import { checkPdpAccess } from "@/lib/pdp"
import { AltinnRequestError, delegateServiceownerPackage, delegateServiceownerResource } from "@/lib/serviceowner"

const VALID_BODY = { fromPid: "01017012345", toPid: "02029912345", packageUrn: "urn:altinn:accesspackage:test" }
const SKRANKEPUNKT_BODY = { ...VALID_BODY, skrankepunkt: true }

function makeRequest(body: object) {
  return new Request("http://localhost/api/serviceowner/delegate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/serviceowner/delegate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // TODO: fjern .skip når PDP-sjekk gjenaktiveres i ruten
  it.skip("returnerer 403 når PDP gir Deny", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Deny")

    const res = await POST(makeRequest(SKRANKEPUNKT_BODY))
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.ok).toBe(false)
    expect(data.error).toContain("trukket tilbake")
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it.skip("returnerer 403 når PDP gir NotApplicable", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("NotApplicable")

    const res = await POST(makeRequest(SKRANKEPUNKT_BODY))

    expect(res.status).toBe(403)
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it.skip("delegerer og returnerer ok ved Permit", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Permit")

    const res = await POST(makeRequest(SKRANKEPUNKT_BODY))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(checkPdpAccess).toHaveBeenCalledWith(
      "01017012345",
      "01017012345",
      undefined,
      "ttd-skrankepunkt",
      "write",
    )
    expect(delegateServiceownerPackage).toHaveBeenCalledWith(
      VALID_BODY.fromPid,
      VALID_BODY.toPid,
      VALID_BODY.packageUrn,
      undefined,
    )
  })

  it("returnerer 401 uten session", async () => {
    const { auth } = await import("@/lib/auth")
    vi.mocked(auth).mockResolvedValueOnce(null)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it("returnerer 400 ved manglende felt", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Permit")

    const res = await POST(makeRequest({ fromPid: "01017012345" }))
    expect(res.status).toBe(400)
  })

  it("delegerer enkelttjeneste med resourceId og rightKeys", async () => {
    const res = await POST(
      makeRequest({ fromPid: "01017012345", toPid: "02029912345", resourceId: "ttd-vergemalsdemo", rightKeys: ["read"] }),
    )

    expect(res.status).toBe(200)
    expect(delegateServiceownerResource).toHaveBeenCalledWith(
      "01017012345",
      "02029912345",
      "ttd-vergemalsdemo",
      ["read"],
      undefined,
    )
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it("returnerer Altinns status og problem ved valideringsfeil", async () => {
    const problem = { validationErrors: [{ code: "AMSO.VLD-00006" }] }
    vi.mocked(delegateServiceownerResource).mockRejectedValueOnce(new AltinnRequestError("feil", 400, problem))

    const res = await POST(
      makeRequest({ fromPid: "01017012345", toPid: "02029912345", resourceId: "eno-forbruker-fullmakt", rightKeys: ["write"] }),
    )
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.problem).toEqual(problem)
  })
})
