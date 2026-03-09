import { describe, it, expect, vi } from "vitest"

// Hoisted mocks — settes opp før auth.ts importeres
vi.mock("next-auth", () => ({
  default: () => ({ handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() }),
}))
vi.mock("@auth/core", () => ({
  customFetch: Symbol("custom-fetch"),
}))

// IDPORTEN_PRIVATE_KEY_JWK ikke satt → ingen crypto.subtle-kall ved import
import { config } from "@/lib/auth"

// Hjelper: hent provider-config
const provider = config.providers[0] as {
  profile: (p: Record<string, unknown>) => Record<string, unknown>
}
const callbacks = config.callbacks!

// ---------------------------------------------------------------------------
// jwt-callback
// ---------------------------------------------------------------------------
describe("jwt-callback", () => {
  it("lagrer idToken fra account.id_token", async () => {
    const token = await callbacks.jwt!({
      token: {},
      account: { id_token: "test-id-token" } as never,
      trigger: "signIn",
    })
    expect(token.idToken).toBe("test-id-token")
  })

  it("lagrer pid, given_name, family_name fra profile", async () => {
    const token = await callbacks.jwt!({
      token: {},
      profile: { pid: "12345678901", given_name: "OLA", family_name: "NORDMANN" } as never,
      trigger: "signIn",
    })
    expect(token.pid).toBe("12345678901")
    expect(token.given_name).toBe("OLA")
    expect(token.family_name).toBe("NORDMANN")
  })

  it("beholder eksisterende token-felt når account og profile mangler", async () => {
    const token = await callbacks.jwt!({
      token: { pid: "existing", idToken: "existing-token" },
      trigger: "update",
    })
    expect(token.pid).toBe("existing")
    expect(token.idToken).toBe("existing-token")
  })

  it("overskriver ikke token om profile-felt er tomme", async () => {
    const token = await callbacks.jwt!({
      token: { pid: "old-pid" },
      profile: {} as never,
      trigger: "signIn",
    })
    expect(token.pid).toBe("old-pid")
  })
})

// ---------------------------------------------------------------------------
// session-callback
// ---------------------------------------------------------------------------
describe("session-callback", () => {
  it("kopierer pid, given_name, family_name til session.user", async () => {
    const session = await callbacks.session!({
      session: { user: {}, expires: "" } as never,
      token: { pid: "12345678901", given_name: "OLA", family_name: "NORDMANN" },
    })
    expect((session.user as Record<string, unknown>).pid).toBe("12345678901")
    expect((session.user as Record<string, unknown>).given_name).toBe("OLA")
    expect((session.user as Record<string, unknown>).family_name).toBe("NORDMANN")
  })

  it("kopierer idToken til session.idToken", async () => {
    const session = await callbacks.session!({
      session: { user: {}, expires: "" } as never,
      token: { idToken: "eyJtest" },
    })
    expect((session as Record<string, unknown>).idToken).toBe("eyJtest")
  })

  it("setter ikke felt om token mangler dem", async () => {
    const session = await callbacks.session!({
      session: { user: {}, expires: "" } as never,
      token: {},
    })
    expect((session.user as Record<string, unknown>).pid).toBeUndefined()
    expect((session as Record<string, unknown>).idToken).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// profile()-funksjonen
// ---------------------------------------------------------------------------
describe("profile()", () => {
  it("bruker profile.name som fullt navn hvis det finnes", () => {
    const result = provider.profile({
      sub: "sub123",
      pid: "12345678901",
      name: "OLA NORDMANN",
      given_name: "OLA",
      family_name: "NORDMANN",
      email: "ola@example.com",
    })
    expect(result.name).toBe("OLA NORDMANN")
  })

  it("konstruerer navn fra given_name + family_name når name mangler", () => {
    const result = provider.profile({
      sub: "sub123",
      pid: "12345678901",
      given_name: "OLA",
      family_name: "NORDMANN",
    })
    expect(result.name).toBe("OLA NORDMANN")
  })

  it("bruker pid som id og eksponerer pid-felt", () => {
    const result = provider.profile({ sub: "sub123", pid: "12345678901" })
    expect(result.id).toBe("12345678901")
    expect(result.pid).toBe("12345678901")
  })

  it("faller tilbake til sub om pid mangler", () => {
    const result = provider.profile({ sub: "sub123" })
    expect(result.id).toBe("sub123")
    expect(result.pid).toBeUndefined()
  })

  it("setter given_name, family_name, email til null om de mangler", () => {
    const result = provider.profile({ sub: "sub123" })
    expect(result.given_name).toBeNull()
    expect(result.family_name).toBeNull()
    expect(result.email).toBeNull()
  })

  it("setter name til null om verken name, given_name eller family_name finnes", () => {
    const result = provider.profile({ sub: "sub123" })
    expect(result.name).toBeNull()
  })
})
