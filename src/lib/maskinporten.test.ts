import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { generateKeyPair, exportJWK } from "jose"
import { getMaskinportenToken, _resetTokenCache, decodeOrgnr } from "./maskinporten"

async function makeTestJwk() {
  const { privateKey } = await generateKeyPair("RS256", { extractable: true })
  return JSON.stringify(await exportJWK(privateKey))
}

describe("getMaskinportenToken", () => {
  const SCOPE = "altinn:instances.read"
  let privateKeyJwk: string

  beforeEach(async () => {
    privateKeyJwk = await makeTestJwk()
    vi.stubEnv("MASKINPORTEN_CLIENT_ID", "test-client-id")
    vi.stubEnv("MASKINPORTEN_PRIVATE_KEY_JWK", privateKeyJwk)
    _resetTokenCache()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    _resetTokenCache()
  })

  it("returnerer access_token fra Maskinporten", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: "test-token-123", expires_in: 120 }),
      })
    )

    const token = await getMaskinportenToken(SCOPE)
    expect(token).toBe("test-token-123")
  })

  it("sender korrekt grant_type og assertion til Maskinporten", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "tok", expires_in: 120 }),
    })
    vi.stubGlobal("fetch", fetchMock)

    await getMaskinportenToken(SCOPE)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("https://test.maskinporten.no/token")
    expect(options.method).toBe("POST")

    const body = new URLSearchParams(options.body)
    expect(body.get("grant_type")).toBe(
      "urn:ietf:params:oauth:grant-type:jwt-bearer"
    )
    expect(body.get("assertion")).toBeTruthy()
  })

  it("cacher tokenet og gjør ikke ny fetch ved andre kall", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "cached-token", expires_in: 120 }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const first = await getMaskinportenToken(SCOPE)
    const second = await getMaskinportenToken(SCOPE)

    expect(first).toBe("cached-token")
    expect(second).toBe("cached-token")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("gjør ny fetch når cache er utløpt", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "first-token", expires_in: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "second-token", expires_in: 120 }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const first = await getMaskinportenToken(SCOPE)
    const second = await getMaskinportenToken(SCOPE)

    expect(first).toBe("first-token")
    expect(second).toBe("second-token")
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("kaster feil hvis Maskinporten returnerer ikke-ok svar", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "invalid_client",
      })
    )

    await expect(getMaskinportenToken(SCOPE)).rejects.toThrow(
      "Maskinporten token-forespørsel feilet: 401"
    )
  })

  it("kaster feil hvis miljøvariabler mangler", async () => {
    vi.unstubAllEnvs()

    await expect(getMaskinportenToken(SCOPE)).rejects.toThrow(
      "MASKINPORTEN_CLIENT_ID og MASKINPORTEN_PRIVATE_KEY_JWK må være satt"
    )
  })
})

describe("decodeOrgnr", () => {
  function makeJwt(payload: Record<string, unknown>): string {
    const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString("base64url")
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
    return `${header}.${body}.fakesignature`
  }

  it("returnerer orgnr fra consumer.ID med 0192-prefix", () => {
    const token = makeJwt({
      consumer: { authority: "iso6523-actorid-upis", ID: "0192:991825827" },
    })
    expect(decodeOrgnr(token)).toBe("991825827")
  })

  it("returnerer null hvis consumer mangler", () => {
    const token = makeJwt({ iss: "https://test.maskinporten.no/" })
    expect(decodeOrgnr(token)).toBeNull()
  })

  it("returnerer null hvis token er ugyldig base64", () => {
    expect(decodeOrgnr("ikke.et.jwt")).toBeNull()
  })

  it("returnerer ID uendret hvis prefix ikke er 0192:", () => {
    const token = makeJwt({
      consumer: { authority: "iso6523-actorid-upis", ID: "0184:991825827" },
    })
    expect(decodeOrgnr(token)).toBe("0184:991825827")
  })
})
