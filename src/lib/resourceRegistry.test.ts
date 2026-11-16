import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getResourceMeta, getResourceActions } from "./resourceRegistry"

const POLICY_XML_ONE_ACTION = `<?xml version="1.0" encoding="utf-8"?>
<xacml:Policy xmlns:xacml="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17">
  <xacml:Rule RuleId="r1" Effect="Permit">
    <xacml:Target>
      <xacml:AnyOf>
        <xacml:AllOf>
          <xacml:Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
            <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">read</xacml:AttributeValue>
            <xacml:AttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id" Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false" />
          </xacml:Match>
        </xacml:AllOf>
      </xacml:AnyOf>
    </xacml:Target>
  </xacml:Rule>
</xacml:Policy>`

const POLICY_XML_MULTIPLE_ACTIONS = `<?xml version="1.0" encoding="utf-8"?>
<xacml:Policy xmlns:xacml="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17">
  <xacml:Rule RuleId="r1" Effect="Permit">
    <xacml:Target>
      <xacml:AnyOf>
        <xacml:AllOf>
          <xacml:Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
            <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">read</xacml:AttributeValue>
            <xacml:AttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id" Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false" />
          </xacml:Match>
        </xacml:AllOf>
      </xacml:AnyOf>
    </xacml:Target>
  </xacml:Rule>
  <xacml:Rule RuleId="r2" Effect="Permit">
    <xacml:Target>
      <xacml:AnyOf>
        <xacml:AllOf>
          <xacml:Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
            <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">write</xacml:AttributeValue>
            <xacml:AttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id" Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false" />
          </xacml:Match>
        </xacml:AllOf>
      </xacml:AnyOf>
    </xacml:Target>
  </xacml:Rule>
</xacml:Policy>`

function mockFetchOnce(response: { ok: boolean; status?: number; json?: () => Promise<unknown>; text?: () => Promise<string> }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 500),
      json: response.json ?? (async () => ({})),
      text: response.text ?? (async () => ""),
    }),
  )
}

describe("resourceRegistry", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("getResourceMeta henter title.nb og description.nb", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({
        identifier: "unit-test-resource-meta",
        title: { nb: "Testtjeneste" },
        description: { nb: "En testbeskrivelse" },
      }),
    })

    const meta = await getResourceMeta("unit-test-resource-meta")
    expect(meta.title).toBe("Testtjeneste")
    expect(meta.description).toBe("En testbeskrivelse")
  })

  it("getResourceMeta faller tilbake til identifier hvis title.nb mangler", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({ identifier: "unit-test-resource-fallback" }),
    })

    const meta = await getResourceMeta("unit-test-resource-fallback")
    expect(meta.title).toBe("unit-test-resource-fallback")
    expect(meta.description).toBe("")
  })

  it("getResourceMeta kaster feil ved non-ok respons", async () => {
    mockFetchOnce({ ok: false, status: 404, text: async () => "not found" })
    await expect(getResourceMeta("unit-test-resource-404")).rejects.toThrow(/404/)
  })

  it("getResourceActions parser én handling fra policy-XML", async () => {
    mockFetchOnce({ ok: true, text: async () => POLICY_XML_ONE_ACTION })
    const actions = await getResourceActions("unit-test-policy-one")
    expect(actions).toEqual(["read"])
  })

  it("getResourceActions parser flere handlinger fra policy-XML generisk", async () => {
    mockFetchOnce({ ok: true, text: async () => POLICY_XML_MULTIPLE_ACTIONS })
    const actions = await getResourceActions("unit-test-policy-multi")
    expect(actions).toEqual(["read", "write"])
  })

  it("getResourceActions cacher svaret (kun ett fetch-kall for to oppslag)", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => POLICY_XML_ONE_ACTION,
    })
    vi.stubGlobal("fetch", fetchMock)

    await getResourceActions("unit-test-policy-cache")
    await getResourceActions("unit-test-policy-cache")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
