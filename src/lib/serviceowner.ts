import { getMaskinportenToken } from "./maskinporten"
import type { TraceEntry } from "./trace"

const SCOPE_READ = "altinn:accessmanagement/authorizedparties.serviceowner"
const SCOPE_DELEGATE = "altinn:serviceowner/delegations:accesspackage.write"
const BASE_URL = "https://platform.tt02.altinn.no/accessmanagement/api/v1"

export interface ServiceownerParty {
  partyUuid: string
  name: string
  organizationNumber?: string
  personId?: string
  type: "Person" | "Organization" | "SelfIdentified"
  partyId: number
  authorizedAccessPackages: string[]
}

export async function getServiceownerParties(
  pid: string,
  traces?: TraceEntry[],
): Promise<ServiceownerParty[]> {
  const token = await getMaskinportenToken(SCOPE_READ, traces)

  const url = `${BASE_URL}/serviceowner/authorizedparties`
  const body = { type: "urn:altinn:person:identifier-no", value: pid }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    traces?.push({
      name: "Serviceowner: autoriserte parter",
      group: "tjenesteeier",
      request: { method: "POST", url, body },
      response: { status: response.status, body: error },
      durationMs: Date.now() - t0,
    })
    throw new Error(`Serviceowner authorizedparties feilet: ${response.status} ${error}`)
  }

  const data = (await response.json()) as ServiceownerParty[]
  traces?.push({
    name: "Serviceowner: autoriserte parter",
    group: "tjenesteeier",
    request: { method: "POST", url, body },
    response: { status: response.status, body: data },
    durationMs: Date.now() - t0,
  })

  return data
}

export async function delegateServiceownerPackage(
  fromPid: string,
  toPid: string,
  packageUrn: string,
  traces?: TraceEntry[],
): Promise<void> {
  if (process.env.MOCK_SERVICEOWNER_DELEGATE === "true") {
    traces?.push({
      name: "Serviceowner: deleger tilgangspakke [MOCK]",
      group: "tjenesteeier",
      request: {
        method: "POST",
        url: `${BASE_URL}/serviceowner/connections/accesspackages`,
        body: {
          from: `urn:altinn:person:identifier-no:${fromPid}`,
          to: `urn:altinn:person:identifier-no:${toPid}`,
          packageUrn,
        },
      },
      response: { status: 201, body: { mock: true } },
      durationMs: 0,
    })
    return
  }

  const token = await getMaskinportenToken(SCOPE_DELEGATE, traces)

  const url = `${BASE_URL}/serviceowner/connections/accesspackages`
  const requestBody = {
    from: `urn:altinn:person:identifier-no:${fromPid}`,
    to: `urn:altinn:person:identifier-no:${toPid}`,
    packageUrn,
  }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(requestBody),
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const body = await response.text()
    traces?.push({
      name: "Serviceowner: deleger tilgangspakke",
      group: "tjenesteeier",
      request: { method: "POST", url, body: requestBody },
      response: { status: response.status, body },
      durationMs,
    })
    throw new Error(`Delegering feilet: ${response.status} ${body}`)
  }

  const body = response.status === 204 ? null : await response.json()
  traces?.push({
    name: "Serviceowner: deleger tilgangspakke",
    group: "tjenesteeier",
    request: { method: "POST", url },
    response: { status: response.status, body },
    durationMs,
  })
}
