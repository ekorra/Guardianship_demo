import { describe, it, expect } from "vitest"

describe("ID-porten OIDC discovery", () => {
  it("discovery-endepunkt er tilgjengelig og returnerer gyldig konfigurasjon", async () => {
    const res = await fetch(
      "https://test.idporten.no/.well-known/openid-configuration",
    )
    expect(res.ok).toBe(true)

    const meta = (await res.json()) as Record<string, unknown>
    expect(meta.issuer).toBe("https://test.idporten.no")
    expect(typeof meta.authorization_endpoint).toBe("string")
    expect(typeof meta.token_endpoint).toBe("string")
    expect(typeof meta.jwks_uri).toBe("string")
    expect(Array.isArray(meta.scopes_supported)).toBe(true)
    expect((meta.scopes_supported as string[]).includes("openid")).toBe(true)
  })
})
