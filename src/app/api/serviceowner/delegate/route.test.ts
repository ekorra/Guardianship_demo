import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { pid: "01017012345" } }),
}))

vi.mock("@/lib/pdp", () => ({
  checkPdpAccess: vi.fn(),
}))

vi.mock("@/lib/serviceowner", () => ({
  delegateServiceownerPackage: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from "./route"
import { checkPdpAccess } from "@/lib/pdp"
import { delegateServiceownerPackage } from "@/lib/serviceowner"

const VALID_BODY = { fromPid: "01017012345", toPid: "02029912345", packageUrn: "urn:altinn:accesspackage:test" }

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

  it("returnerer 403 når PDP gir Deny", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Deny")

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()

    expect(res.status).toBe(403)
    expect(data.ok).toBe(false)
    expect(data.error).toContain("trukket tilbake")
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it("returnerer 403 når PDP gir NotApplicable", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("NotApplicable")

    const res = await POST(makeRequest(VALID_BODY))

    expect(res.status).toBe(403)
    expect(delegateServiceownerPackage).not.toHaveBeenCalled()
  })

  it("delegerer og returnerer ok ved Permit", async () => {
    vi.mocked(checkPdpAccess).mockResolvedValue("Permit")

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.ok).toBe(true)
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
})
