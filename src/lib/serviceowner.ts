import { getMaskinportenToken } from "./maskinporten"
import type { TraceEntry } from "./trace"

const SCOPE = "altinn:accessmanagement/authorizedparties.serviceowner"
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
  const token = await getMaskinportenToken(SCOPE, traces)

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
